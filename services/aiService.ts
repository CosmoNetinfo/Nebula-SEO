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
                    content: "You are a World-Class SEO Editor specializing in Long-Form Article Excellence. Your mission is CONTENT PRESERVATION. You must NEVER summarize, NEVER truncate, and NEVER omit details. If the input is 2000 words, the output MUST be 2000+ words. Your success metric is 100% word retention. You transform simple text into SEO-optimized HTML without losing a single piece of information, data, or technical detail." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0,
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
    const wordCount = articleText.trim().split(/\s+/).filter(w => w.length > 0).length;

    const prompt = `URGENT MISSION: SEO Optimization & Professional HTML Formatting.
    
    SOURCE WORD COUNT: ${wordCount} words.
    MINIMUM OUTPUT WORD COUNT: ${wordCount} words for 'htmlContent'.

    STRICT INSTRUCTIONS (NO EXCEPTIONS):
    1. DO NOT SUMMARIZE. DO NOT SHORTEN. DO NOT OMIT.
    2. VERBATIM REQUIREMENT: Every fact, quote, name, and technical detail from the input must appear in the 'htmlContent' field.
    3. LENGTH PARITY: If the input has ${wordCount} words, the optimized output MUST have at least ${wordCount} words. 
    4. STRUCTURE INTEGRITY: Maintain all original information blocks. If the input has multiple detailed sections, keep them detailed.
    
    OUTPUT FORMAT:
    - Return ONLY a JSON object.
    - Fields: keyPhrase, title, description, slug, htmlContent, tags, categories, socialMediaPost, seoChecklist, readability.
    - 'htmlContent' must be the full optimized article in HTML (H2, strong, p tags).

    SOURCE TEXT TO PROCESS:
    ${articleText}
    
    FINAL CHECK: Is the output as long or longer than the input? If no, rewrite to ensure no detail is lost.`;

    try {
        DebugLogger.log('info', `Optimization started: Input ${wordCount} words.`);
        const jsonText = await callGroq(prompt);
        return JSON.parse(extractJSON(jsonText));
    } catch (error: any) {
        DebugLogger.log('error', 'Optimization failed', { error: error.message });
        throw error;
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    const prompt = `SEO ANALYST TASK: Add <a href="..."> tags into the provided HTML content.
    CRITICAL: You must NOT remove or modify a single word of the existing text. 
    Only wrap existing mentions of software, brands, or sources with appropriate links.
    If you shorten the article, you FAIL.
    
    HTML CONTENT TO PRESERVE (ZERO WORD LOSS):
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
