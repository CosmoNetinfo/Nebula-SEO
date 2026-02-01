

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
    const prompt = `SEO Editor per mercato ITALIANO. 

CRITICO: L'articolo deve essere LUNGO e COMPLETO. Se l'input è di 2000 parole, l'output DEVE essere di 2000 parole. Non riassumere MAI.

REGOLE:
1. LINGUA: Output 100% ITALIANO
2. INTEGRITÀ: Mantieni TUTTI i dettagli, nomi, dati, paragrafi. 
3. HTML: Usa tags semantici (H2, H3, p, strong, ul, li).
4. FORMATO: JSON con i campi: keyPhrase, title, description, slug, htmlContent, tags, categories, socialMediaPost, seoChecklist, readability.

Testo:
${articleText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 8192,
                temperature: 0.2,
            },
        });

        let jsonText = response.text.trim();
        
        // DETAILED DEBUG LOGGING
        DebugLogger.log('info', 'API Response Received', {
            inputLength: articleText.length,
            inputWords: articleText.split(/\s+/).length,
            responseLength: jsonText.length,
            responseFirst500: jsonText.substring(0, 500),
            responseLast500: jsonText.substring(Math.max(0, jsonText.length - 500)),
            hasOpenBrace: jsonText.includes('{'),
            hasCloseBrace: jsonText.includes('}'),
            braceBalance: (jsonText.match(/{/g) || []).length - (jsonText.match(/}/g) || []).length,
        });
        
        // Helper to extract JSON
        const extractJSON = (text: string): string => {
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                const extracted = text.substring(firstOpen, lastClose + 1);
                DebugLogger.log('info', 'JSON Extraction', {
                    originalLength: text.length,
                    extractedLength: extracted.length,
                    trimmedChars: text.length - extracted.length
                });
                return extracted;
            }
            return text;
        };

        // Try to parse the JSON response
        let result: SeoResult;
        try {
            result = JSON.parse(jsonText);
            DebugLogger.log('info', 'JSON parsed successfully on first attempt');
        } catch (parseError) {
            // First attempt failed, try rigorous cleaning
            DebugLogger.log('warn', 'Initial JSON parse failed, attempting to clean response...', {
                error: parseError,
                jsonLength: jsonText.length,
                firstChars: jsonText.substring(0, 200),
                lastChars: jsonText.substring(Math.max(0, jsonText.length - 200))
            });
            
            jsonText = extractJSON(jsonText);
            
            // Try parsing again
            try {
                result = JSON.parse(jsonText);
                DebugLogger.log('info', 'JSON successfully parsed after cleaning');
            } catch (secondError) {
                DebugLogger.log('error', 'JSON Parse Error (second attempt)', {
                    error: secondError,
                    jsonLength: jsonText.length,
                    first500: jsonText.substring(0, 500),
                    last500: jsonText.substring(Math.max(0, jsonText.length - 500)),
                    isTruncated: !jsonText.trim().endsWith('}')
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
        const prompt = `SEO Specialist: aggiungi LINK (<a>) a fonti ufficiali/download nel HTML fornito.

REGOLE:
1. NON TAGLIARE: Lunghezza identica, aggiungi solo <a>
2. FONTI REALI: Usa Google Search
3. STRUTTURA: Mantieni H2, H3, p
4. FORMATO: JSON identico allo schema originale.

HTML:
${currentResult.htmlContent}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                candidateCount: 1,
                temperature: 0.1,
            },
        });

        let jsonText = response.text.trim();
        
        DebugLogger.log('info', 'Enrich Step Response', {
            originalLength: currentResult.htmlContent.length,
            responseLength: jsonText.length,
            isTruncated: !jsonText.trim().endsWith('}')
        });
        
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
        DebugLogger.log('info', 'Enrich Step Parsed Successfully');
        
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
