
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
    const prompt = `SEO Editor ITALIANO. Output JSON strictly.
    CRITICAL: Keep FULL length of input. No summarizing.
    
    Format:
    {
        "keyPhrase": "...",
        "title": "...",
        "description": "...",
        "slug": "...",
        "htmlContent": "HTML using H2, H3, p, strong, ul, li. MUST BE FULL LENGTH.",
        "tags": "...",
        "categories": "...",
        "socialMediaPost": "...",
        "seoChecklist": [{"item": "...", "status": "good/average/poor", "details": "..."}],
        "readability": [{"criteria": "...", "status": "good/average/poor", "score": "...", "message": "..."}]
    }

    Source:
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
    const prompt = `SEO Linker: Add <a> tags to official sources/downloads in the HTML.
    Don't change content length. Use real URLs.
    
    HTML:
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
