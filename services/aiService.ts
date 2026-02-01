import { SeoResult, GroundingSource } from '../types';
import DebugLogger from '../components/DebugPanel';

const getGeminiKey = () => localStorage.getItem('user_gemini_key') || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
const getGroqKey = () => localStorage.getItem('user_groq_key') || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || (import.meta as any).env?.VITE_GROQ_API_KEY;

const extractJSON = (text: string): string => {
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        return text.substring(firstOpen, lastClose + 1);
    }
    return text;
};

// --- GEMINI ENGINE (Zero-Loss Specialist) ---
const callGemini = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const key = getGeminiKey();
    if (!key) {
        throw new Error("GEMINI_API_KEY mancante. Configurala nelle impostazioni dell'app.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.9, // Higher temperature for better expansion
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Errore Gemini: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

// --- GROQ ENGINE (Fallback) ---
const callGroq = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const key = getGroqKey();
    if (!key) throw new Error("GROQ_API_KEY mancante nelle impostazioni.");
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
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

    const prompt = `CRITICAL OBJECTIVE: TRANSFORM ${wordCount} WORDS INTO 1800+ WORDS.
    
    SOURCE STATS:
    - Current Words: ${wordCount}
    - Current Chars: ${articleText.length}
    - FAILURE THRESHOLD: Any output under ${wordCount} words is an immediate rejection.

    REQUIRED EXECUTION:
    1. EXHAUSTIVE EXPANSION: Take every paragraph from the source and expand it. Add depth, expert insights, and technical clarity. Preserve 100% of facts.
    2. THE 95+ READABILITY RULE: Rewrite the text to be crystal clear. Use short sentences (max 15-20 words). Use many H2 and H3 subsections. The goal is to make a complex topic accessible to everyone.
    3. ZERO LOSS POLICY: Every name, number, brand, and date MUST remain.
    
    JSON SCHEMA (STRICT):
    {
      "keyPhrase": "...",
      "title": "...",
      "description": "...",
      "slug": "...",
      "htmlContent": "MASSIVE EXPANDED ARTICLE (Target: ${Math.round(wordCount * 1.25)} words). Use H2, H3, p, strong tags.",
      "tags": "...",
      "categories": "...",
      "socialMediaPost": "...",
      "seoChecklist": [ { "item": "...", "status": "pass", "details": "..." } ],
      "readability": [
        { "criteria": "Sentence Structure", "score": "98%", "status": "good", "message": "Optimized for high-speed reading." },
        { "criteria": "Paragraph Density", "score": "95%", "status": "good", "message": "Short paragraphs improve mobile experience." },
        { "criteria": "Vocabulary Simplicity", "score": "92%", "status": "good", "message": "Clear and professional Italian." },
        { "criteria": "Subheading Frequency", "score": "96%", "status": "good", "message": "Frequent H2/H3 tags guide the user." },
        { "criteria": "Passive Voice Usage", "score": "94%", "status": "good", "message": "Active voice used for engagement." }
      ]
    }

    SOURCE ARTICLE (ITALIAN):
    ${articleText}
    
    FINAL CHECK: Compare your output length with the source. If it's shorter or just 800 words, you failed. EXPAND MORE.`;

    const systemPrompt = `You are the "Zero-Loss Ultra-Expander". 
    Your mission is to expand Italian articles.
    ABSULUTE RULES:
    1. NO DELETING: Forbidden from removing any sentence/fact.
    2. CHARACTER GOAL: Input has ${articleText.length} chars. Your 'htmlContent' MUST have AT LEAST ${Math.round(articleText.length * 1.25)} chars.
    3. EXPANSE: If word count is ${wordCount}, target is ${Math.round(wordCount * 1.3)}.`;

    try {
        DebugLogger.log('info', `Optimization started with Gemini: Input ${wordCount} words.`);
        const jsonText = await callGemini(systemPrompt, prompt);
        return JSON.parse(extractJSON(jsonText));
    } catch (error: any) {
        DebugLogger.log('error', 'Optimization failed with Gemini, trying Groq fallback', { error: error.message });
        try {
            const jsonText = await callGroq(systemPrompt, prompt);
            return JSON.parse(extractJSON(jsonText));
        } catch (groqError: any) {
            DebugLogger.log('error', 'Groq fallback also failed', { error: groqError.message });
            throw error;
        }
    }
};

export const enrichArticleDepth = async (currentResult: SeoResult, originalText: string): Promise<SeoResult> => {
    const prompt = `SEO ANALYST TASK: Add <a href="..."> tags into the provided HTML content.
    CRITICAL: You must NOT remove or modify a single word of the existing text. 
    Only wrap existing mentions of software, brands, or sources with appropriate links.
    If you shorten the article, you FAIL.
    
    HTML CONTENT TO PRESERVE (ZERO WORD LOSS):
    ${currentResult.htmlContent}`;

    const systemPrompt = "You are a Link Enrichment Expert. Add links without removing any original text.";

    try {
        DebugLogger.log('info', 'Enriching with Gemini (Zero-Loss Mode)');
        const jsonText = await callGemini(systemPrompt, prompt);
        const result = JSON.parse(extractJSON(jsonText));
        return { ...currentResult, ...result };
    } catch (error: any) {
        DebugLogger.log('error', 'Enrichment failed with Gemini, trying Groq fallback', { error: error.message });
        try {
            const jsonText = await callGroq(systemPrompt, prompt);
            const result = JSON.parse(extractJSON(jsonText));
            return { ...currentResult, ...result };
        } catch (groqError: any) {
            throw error;
        }
    }
};
