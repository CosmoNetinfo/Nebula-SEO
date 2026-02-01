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
                    content: `You are the "Expansion Engine" SEO Copywriter. 
                    MISSION: Transform input text into a World-Class SEO Masterpiece.
                    STRICT RULES:
                    1. ZERO CONTENT LOSS: Every single fact, name, number, and nuance must be preserved.
                    2. EXPANSION ONLY: Your goal is to EXPAND the content. Add professional depth, context, and clear explanations.
                    3. READABILITY EXCELLENCE: The generated 'htmlContent' MUST be optimized for a 90/100 readability score. Use short sentences, clear Italian transitions, and H2/H3 headings.
                    4. OUTPUT LENGTH: If input is X words, output 'htmlContent' MUST be at least X + 10% words. Summarizing is a fatal failure.` 
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

    const prompt = `URGENT COMMAND: ENHANCE AND EXPAND ARTICLE.
    
    SOURCE WORD COUNT: ${wordCount} words.
    TARGET MINIMUM OUTPUT: ${Math.round(wordCount * 1.1)} words.

    EXECUTION PLAN:
    1. READABILITY OVERHAUL: Rewrite the article in professional Italian, optimizing for maximum clarity. Use short paragraphs and explicit transition words. Every readability metric MUST be "good" (90%+).
    2. DETAIL PRESERVATION: Do not omit any original information. If the source mentions a specific detail, the output must discuss it in more depth.
    3. HTML STRUCTURE: Use H2 for main sections, H3 for sub-points, and <strong> for key concepts.
    4. NO SUMMARIZATION: If the output is shorter than the input, you have FAILED the mission.

    OBJECTIVE JSON SCHEMA:
    {
      "keyPhrase": "string",
      "title": "SEO Optimized Title",
      "description": "Compelling Meta Description",
      "slug": "url-slug",
      "htmlContent": "FULL EXPANDED ARTICLE IN HTML (Min ${Math.round(wordCount * 1.1)} words)",
      "tags": "CSV format",
      "categories": "comma separated",
      "socialMediaPost": "Captivating social caption",
      "seoChecklist": [
        { "item": "Focus Keyword in H1", "status": "pass", "details": "The keyword is perfectly placed." },
        ... (min 6 items)
      ],
      "readability": [
        { "criteria": "Sentence Length", "score": "95%", "status": "good", "message": "Perfectly balanced for web reading." },
        ... (min 5 items, all status MUST be 'good')
      ]
    }

    SOURCE CONTENT (ITALIAN):
    ${articleText}
    
    VERIFICATION: Ensure 'htmlContent' is at least ${Math.round(wordCount * 1.1)} words. If you feel like summarizing, EXPAND instead.`;

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
