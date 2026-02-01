
import { GoogleGenAI, Type } from "@google/genai";
import { SeoResult, GroundingSource } from '../types';
import DebugLogger from '../components/DebugPanel';

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Schema for Gemini (fallback)
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        keyPhrase: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        slug: { type: Type.STRING },
        htmlContent: { type: Type.STRING },
        tags: { type: Type.STRING },
        categories: { type: Type.STRING },
        socialMediaPost: { type: Type.STRING },
        seoChecklist: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING },
                    status: { type: Type.STRING },
                    details: { type: Type.STRING }
                },
                required: ["item", "status", "details"]
            }
        },
        readability: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    criteria: { type: Type.STRING },
                    status: { type: Type.STRING },
                    score: { type: Type.STRING },
                    message: { type: Type.STRING }
                },
                required: ["criteria", "status", "score", "message"]
            }
        }
    },
    required: ["keyPhrase", "title", "description", "slug", "htmlContent", "tags", "categories", "seoChecklist", "socialMediaPost", "readability"],
};

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
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
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
    const prompt = `Sei un Senior SEO Editor. Il tuo compito è ottimizzare l'articolo fornito senza MAI ridurne la lunghezza.
    
    REGOLE MANDATORIE:
    1. INTEGRITÀ: Se l'input ha 2000 parole, l'output deve avere ALMENO 2000 parole. Non riassumere, non tagliare paragrafi.
    2. OTTIMIZZAZIONE: Migliora la leggibilità, correggi la grammatica e aggiungi tag HTML (H2, H3, p, strong, ul, li).
    3. LINGUA: Tutto l'output deve essere in ITALIANO.
    4. FORMATO: Restituisci STRETTAMENTE un oggetto JSON.
    
    STRUTTURA JSON:
    {
        "keyPhrase": "parola chiave principale",
        "title": "titolo SEO accattivante",
        "description": "meta descrizione di 120-156 caratteri",
        "slug": "url-amichevole",
        "htmlContent": "L'ARTICOLO COMPLETO IN HTML. NON TAGLIARE NULLA.",
        "tags": "tag separati da virgola",
        "categories": "categorie",
        "socialMediaPost": "post per i social",
        "seoChecklist": [{"item": "nome controllo", "status": "good/average/poor", "details": "spiegazione"}],
        "readability": [{"criteria": "nome criterio", "status": "good/average/poor", "score": "valore", "message": "consiglio"}]
    }

    TESTO DA OTTIMIZZARE:
    ${articleText}`;

    try {
        let jsonText: string;

        if (GROQ_API_KEY) {
            DebugLogger.log('info', 'Using Groq for Optimization', { model: 'llama-3.3-70b' });
            jsonText = await callGroq(prompt);
        } else {
            DebugLogger.log('info', 'Using Gemini for Optimization (Fallback)');
            const response = await genAI.models.generateContent({ 
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            jsonText = response.text;
        }

        const cleanJson = extractJSON(jsonText);
        return JSON.parse(cleanJson);
    } catch (error: any) {
        DebugLogger.log('error', 'AI Optimization Error', { message: error.message });
        throw error;
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    const prompt = `Analista SEO: Il tuo compito è UNICAMENTE aggiungere tag <a href="..."> nel testo HTML fornito per collegare fonti ufficiali, documentazione o siti di download.
    
    REGOLE CRITICHE:
    1. NON TOCCARE IL TESTO: La lunghezza e il contenuto devono rimanere IDENTICI. Aggiungi solo i tag <a>.
    2. FONTI REALI: Inserisci link reali e pertinenti ai software o servizi citati.
    3. STRUTTURA: Mantieni tutti i tag H2, H3, p, strong, ul, li esistenti.
    4. FORMATO: Restituisci il JSON aggiornato con gli stessi campi dell'input.

    CONTENUTO HTML:
    ${currentResult.htmlContent}`;

    try {
        let jsonText: string;

        if (GROQ_API_KEY) {
            DebugLogger.log('info', 'Using Groq for Enrichment');
            const groqPrompt = `${prompt}\n\nReturn EXACT SAME JSON structure as input but with <a> tags in htmlContent.`;
            jsonText = await callGroq(groqPrompt);
            const result = JSON.parse(extractJSON(jsonText));
            return { ...currentResult, ...result };
        } else {
            DebugLogger.log('info', 'Using Gemini for Enrichment (Fallback)');
            const response = await genAI.models.generateContent({ 
                model: "gemini-2.0-flash",
                contents: prompt
            });
            jsonText = response.text;
            const parsed = JSON.parse(extractJSON(jsonText));
            return { ...currentResult, ...parsed };
        }
    } catch (error: any) {
        DebugLogger.log('error', 'AI Enrichment Error', { message: error.message });
        throw error;
    }
};
