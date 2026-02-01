import { SeoResult, GroundingSource } from '../types';
import DebugLogger from '../components/DebugPanel';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const extractJSON = (text: string): string => {
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        return text.substring(firstOpen, lastClose + 1);
    }
    return text;
};

// --- GROQ ENGINE ---
const callGroq = async (prompt: string): Promise<string> => {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY mancante. Configurala su Vercel o nel file .env.local");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: "Sei un Editor SEO che lavora su testi di valore. Il tuo compito è formattare e ottimizzare, MAI riassumere. La tua metrica di successo è il mantenimento del 100% delle parole originali." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 8192,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Errore Groq: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// --- FUNZIONA PRINCIPALE ---

export const optimizeArticleForSeo = async (articleText: string): Promise<SeoResult> => {
    const prompt = `COMPITO: Ottimizza SEO e formatta in HTML l'articolo seguente.
    
    DIRETTIVA DI FERRO (NON VIOLABILE): 
    - NON RIASSUMERE. 
    - NON TRASFORMARE PARAGRAFI IN ELENCHI PUNTATI BREVI.
    - Se l'articolo originale ha 15 pararafi, l'output deve avere 15 (o più) paragrafi ottimizzati.
    - Mantieni ogni singolo dato, citazione, nome e spiegazione tecnica.
    - L'OUTPUT DEVE ESSERE LUNGO QUANTO O PIÙ DELL'INPUT.

    REGOLE TECNICHE:
    1. HTML: Usa H2 per i titoli, strong per le parole chiave, p per i paragrafi.
    2. SEO: Migliora il ritmo e la leggibilità senza rimuovere informazioni.
    3. JSON: Restituisci esclusivamente un oggetto JSON con i campi: keyPhrase, title, description, slug, htmlContent, tags, categories, socialMediaPost, seoChecklist, readability.

    TESTO ORIGINALE DA LAVORARE (MANTIENI TUTTE LE PAROLE):
    ${articleText}`;

    try {
        DebugLogger.log('info', 'Processing with Groq Llama 3.3 (High-Integrity Mode)');
        const jsonText = await callGroq(prompt);
        return JSON.parse(extractJSON(jsonText));
    } catch (error: any) {
        DebugLogger.log('error', 'Optimization failed', { error: error.message });
        throw error;
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    const prompt = `Analista SEO: Aggiungi tag <a href="..."> nel testo HTML fornito per collegare fonti o software citati.
    ATTENZIONE: Non rimuovere né modificare una singola parola del testo esistente. Aggiungi solo i link.
    
    HTML DA NON ACCORCIARE:
    ${currentResult.htmlContent}`;

    try {
        DebugLogger.log('info', 'Enriching with Groq (Zero-Loss Mode)');
        const jsonText = await callGroq(prompt);
        const result = JSON.parse(extractJSON(jsonText));
        return { ...currentResult, ...result };
    } catch (error: any) {
        DebugLogger.log('error', 'Enrichment failed', { error: error.message });
        throw error;
    }
};
