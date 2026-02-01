

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
    const prompt = `Sei un Senior Editor e SEO Specialist per il mercato ITALIANO. Formatta il testo seguente in HTML mantenendo la LUNGHEZZA ORIGINALE e correggendo gli errori SEO.

**REGOLE MANDATORIE**:
1. **LINGUA**: Tutto l'output (inclusi analisi leggibilità, messaggi, criteri) DEVE ESSERE IN ITALIANO.
2. **INTEGRITÀ AL 100%**: Non riassumere. Non tagliare. Non omettere nomi, link, dati o dettagli tecnici. L'articolo deve contenere TUTTE le informazioni fornite nell'input.
3. **ERRORE SEO: FRASI CONSECUTIVE**: Analizza il testo per trovare 2 o più frasi consecutive che iniziano con la stessa parola. Riscrivi SOLO l'attacco di una delle frasi per variare la struttura.
4. **HTML SEMANTICO**: Usa H2, H3, p, strong, ul, li.
5. **ZERO COMMENTI IA**: L'output deve essere SOLO il JSON richiesto.
6. **ANALISI LEGGIBILITÀ (ITALIANO)**:
   - "Flesch Reading Ease" -> "Facilità di Lettura"
   - "Sentence Length" -> "Lunghezza Frasi"
   - "Paragraph Length" -> "Lunghezza Paragrafi"
   - "Use of Transition Words" -> "Parole di Transizione"
   - I messaggi di dettaglio devono essere in italiano perfetto.

Testo Sorgente:
${articleText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        let jsonText = response.text.trim();
        
        // Try to parse the JSON response
        let result: SeoResult;
        try {
            result = JSON.parse(jsonText);
        } catch (parseError) {
            // If parsing fails, try to clean the response
            DebugLogger.log('warn', 'Initial JSON parse failed, attempting to clean response...', parseError);
            
            // Remove markdown code blocks if present
            jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
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
            },
        });

        let jsonText = response.text.trim();
        // Clean markdown code blocks if present
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

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
