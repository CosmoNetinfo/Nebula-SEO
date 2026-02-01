

import { GoogleGenAI, Type } from "@google/genai";
import { SeoResult, GroundingSource } from '../types';
import DebugLogger from '../components/DebugPanel';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const optimizeArticleForSeo = async (articleText: string): Promise<SeoResult> => {
    try {
    const prompt = `SEO Editor per mercato ITALIANO. Formatta in HTML mantenendo TUTTA la lunghezza originale.

REGOLE:
1. LINGUA: Output 100% ITALIANO
2. INTEGRITÀ: Non riassumere/tagliare. Mantieni TUTTI i dettagli tecnici, nomi, link, dati
3. HTML: H2, H3, p, strong, ul, li
4. ZERO testo extra: SOLO JSON

5. READABILITY (7 criteri, output ITALIANO):
   - Parole transizione (>30%)
   - Inizio frasi consecutive (<10%)
   - Complessità lessicale
   - Lunghezza paragrafi (<150 parole)
   - Distribuzione sottotitoli (<300 parole per sezione)
   - Lunghezza frasi (<20% oltre 20 parole)
   - Forma passiva (<10%)
   - Liste (almeno 1)
   
   Format: {status: "good"/"average"/"poor", score: "X%", message: "consiglio pratico"}

6. SEO CHECKLIST (10 punti):
   - Keyword in ALT img, Link interni/esterni, Keyword in Intro
   - Keyword Density (0.5-2.5%), Keyword in Title SEO
   - Meta Desc (120-156 char), Keyword in Slug
   - Keyword in H2/H3, Lunghezza (>300 parole), H1 singolo
   
   Format: {item: "nome", status: "good"/"average"/"poor", details: "msg ITA"}

Testo:
${articleText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                maxOutputTokens: 8192,
            },
        });

        let jsonText = response.text.trim();
        
        // Helper to extract JSON
        const extractJSON = (text: string): string => {
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                return text.substring(firstOpen, lastClose + 1);
            }
            return text;
        };

        // Try to parse the JSON response
        let result: SeoResult;
        try {
            result = JSON.parse(jsonText);
        } catch (parseError) {
            // First attempt failed, try rigorous cleaning
            DebugLogger.log('warn', 'Initial JSON parse failed, attempting to clean response...', parseError);
            
            jsonText = extractJSON(jsonText);
            
            // Try parsing again
            try {
                result = JSON.parse(jsonText);
                DebugLogger.log('info', 'JSON successfully parsed after cleaning');
            } catch (secondError) {
                DebugLogger.log('error', 'JSON Parse Error (second attempt)', {
                    error: secondError,
                    problematicJSON: jsonText.substring(0, 500)
                });
                throw new Error(`Impossibile parsare la risposta dell'IA. L'IA potrebbe aver restituito un formato non valido.`);
            }
        }
        
        // Extract sources if available (though unlikely without tools)
        result.groundingSources = extractSources(response);
        return result;
    } catch (error: any) {
        DebugLogger.log('error', 'Gemini API Error', {
            message: error.message,
            fullError: error
        });
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(`Errore API: ${errorMsg}`);
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    try {
        const prompt = `Agisci come un SEO Specialist. Il tuo obiettivo è aggiungere LINK ipertestuali (<a>) verso fonti ufficiali, documentazione o siti di download pertinenti all'interno del contenuto HTML fornito.

**REGOLE**:
1. **NON TAGLIARE IL TESTO**: Il contenuto deve rimanere identico in lunghezza, aggiungi solo i tag <a> dove opportuno.
2. **FONTI REALI**: Usa Google Search per trovare i link corretti ai software, servizi o notizie citate.
3. **MANTIENI TUTTO**: Non toccare i tag H2, H3 o la struttura esistente.
4. **FORMATO JSON**: Restituisci STRETTAMENTE un oggetto JSON valido che rispetta lo schema dei dati precedente. NON aggiungere markdown o testo prima/dopo.

CONTENUTO HTML ATTUALE:
${currentResult.htmlContent}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // responseMimeType: "application/json", // Removed to allow tools
                // responseSchema: responseSchema,      // Removed to allow tools
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
            },
        });

        let jsonText = response.text.trim();
        
        // Helper to extract JSON
        const extractJSON = (text: string): string => {
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                return text.substring(firstOpen, lastClose + 1);
            }
            return text;
        };

        // Aggressive cleaning for the enrich step which is prone to conversational output
        jsonText = extractJSON(jsonText);

        const result: SeoResult = JSON.parse(jsonText);
        
        const newSources = extractSources(response);
        const allSources = [...(currentResult.groundingSources || []), ...newSources];
        result.groundingSources = Array.from(new Map(allSources.map(s => [s.uri, s])).values());
        
        return result;
    } catch (error: any) {
        console.error("Dettaglio Errore Gemini:", error);
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(`Errore API Arricchimento: ${errorMsg}`);
    }
};

const extractSources = (response: any): GroundingSource[] => {
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push({
                    title: chunk.web.title || "Fonte Ufficiale",
                    uri: chunk.web.uri
                });
            }
        });
    }
    return Array.from(new Map(sources.map(s => [s.uri, s])).values());
};
