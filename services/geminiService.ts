
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

// --- GROQ INTEGRATION ---
const callGroq = async (prompt: string): Promise<string> => {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY non configurata. Aggiungila alle variabili di ambiente.");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1, // Lower temperature for maximum precision
            max_tokens: 8192,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Groq Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// --- MAIN FUNCTIONS ---

export const optimizeArticleForSeo = async (articleText: string): Promise<SeoResult> => {
    const prompt = `Sei un Senior SEO Editor. Il tuo compito è ottimizzare l'articolo fornito SENZA MAI RIDURNE LA LUNGHEZZA. 

    DIRETTIVA CRITICA DI INTEGRITÀ: 
    - NON RIASSUMERE MAI. 
    - NON TAGLIARE PARAGRAFI O DETTAGLI. 
    - L'output deve essere un ESPANSIONE o una REDAZIONE identica in lunghezza. 
    - Se ricevi 1600 parole, devi restituire 1600+ parole.
    - Mantieni ogni singola informazione, dato tecnico e concetto.

    COMPITI:
    1. OTTIMIZZAZIONE SEO: Inserisci la keyword in modo naturale.
    2. LEGGIBILITÀ: Migliora la prosa senza eliminare contenuti.
    3. FORMATTAZIONE: HTML semantico (H2, H3, p, strong, ul, li).
    4. LINGUA: 100% ITALIANO.

    STRUTTURA JSON:
    {
        "keyPhrase": "string",
        "title": "string",
        "description": "string",
        "slug": "string",
        "htmlContent": "HTML INTEGRALE - NON TAGLIATO",
        "tags": "string",
        "categories": "string",
        "socialMediaPost": "string",
        "seoChecklist": [{"item": "string", "status": "good/average/poor", "details": "string"}],
        "readability": [{"criteria": "string", "status": "good/average/poor", "score": "string", "message": "string"}]
    }

    TESTO ORIGINALE (MANTIENI TUTTO):
    ${articleText}`;

    try {
        DebugLogger.log('info', 'Optimizing with Groq (Llama 3.3 70B)');
        const jsonText = await callGroq(prompt);
        const cleanJson = extractJSON(jsonText);
        return JSON.parse(cleanJson);
    } catch (error: any) {
        DebugLogger.log('error', 'Groq optimization failed', { message: error.message });
        throw error;
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    const prompt = `Analista SEO: aggiungi tag <a href="..."> nel testo HTML fornito per collegare fonti ufficiali o download.
    REGOLE:
    1. NON TOCCARE IL TESTO: Lunghezza IDENTICA.
    2. LINK REALI: Solo link pertinenti.
    3. FORMATO: JSON identico all'input.

    HTML:
    ${currentResult.htmlContent}`;

    try {
        DebugLogger.log('info', 'Enriching with Groq (Llama 3.3 70B)');
        const jsonText = await callGroq(prompt);
        const parsed = JSON.parse(extractJSON(jsonText));
        return { ...currentResult, ...parsed };
    } catch (error: any) {
        DebugLogger.log('error', 'Groq enrichment failed', { message: error.message });
        throw error;
    }
};
