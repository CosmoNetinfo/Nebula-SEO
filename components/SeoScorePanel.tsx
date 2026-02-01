
import React, { useMemo } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './IconComponents';

interface SeoScorePanelProps {
    htmlContent: string;
    focusKeyword: string;
}

export const SeoScorePanel: React.FC<SeoScorePanelProps> = ({ htmlContent, focusKeyword }) => {

    const metrics = useMemo(() => {
        // Rimuovi tag HTML per analisi testo
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = textContent.split(' ').length;
        
        // Count keyword
        const escapedKeyword = focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const keywordRegex = new RegExp(escapedKeyword, 'gi');
        const keywordCount = (textContent.match(keywordRegex) || []).length;
        
        // Density
        const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
        
        // Struttura
        const h2Count = (htmlContent.match(/<h2/gi) || []).length;
        const h3Count = (htmlContent.match(/<h3/gi) || []).length;
        const boldCount = (htmlContent.match(/<strong|<b\s/gi) || []).length;
        const listCount = (htmlContent.match(/<ul|<ol/gi) || []).length;
        
        // Calcolo Score (0-100)
        let score = 0;
        
        // Fattore Densità (max 30pt) - Ideale tra 0.5% e 2.5%
        if (density >= 0.5 && density <= 2.5) score += 30;
        else if (density > 0 && density < 0.5) score += 15;
        else if (density > 2.5 && density < 4) score += 10;
        
        // Fattore Lunghezza (max 20pt) - Ideale > 600
        if (wordCount >= 600) score += 20;
        else if (wordCount >= 300) score += 10;
        
        // Fattore Struttura H2 (max 20pt)
        if (h2Count >= 2) score += 20;
        else if (h2Count === 1) score += 10;
        
        // Fattore Formattazione (max 15pt)
        if (boldCount > 2) score += 15;
        
        // Fattore Liste (max 15pt)
        if (listCount > 0) score += 15;
        
        return {
            score: Math.min(100, score),
            wordCount,
            density: density.toFixed(2),
            keywordCount,
            h2Count,
            hasLists: listCount > 0,
            hasBold: boldCount > 0
        };
    }, [htmlContent, focusKeyword]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 border-green-500/50';
        if (score >= 50) return 'text-yellow-500 border-yellow-500/50';
        return 'text-red-500 border-red-500/50';
    };
    
    const getBarColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white dark:bg-zinc-950/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 shadow-lg relative overflow-hidden group transition-colors duration-300">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="text-xs uppercase font-bold text-zinc-600 dark:text-zinc-500 tracking-wider">Analisi SEO Real-Time</h4>
                <div className={`px-3 py-1 rounded-full border ${getScoreColor(metrics.score)} bg-opacity-10 backdrop-blur-sm font-black text-sm`}>
                    TOP SCORE: {metrics.score}/100
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full mb-6 relative z-10 overflow-hidden transition-colors">
                 <div 
                    className={`h-full ${getBarColor(metrics.score)} transition-all duration-1000 ease-out`} 
                    style={{ width: `${metrics.score}%` }}
                ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
                {/* Keyword Density */}
                <div className="flex items-start gap-2">
                    {Number(metrics.density) >= 0.5 && Number(metrics.density) <= 2.5 
                        ? <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                        : <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    }
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Keyword Density</p>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{metrics.density}% ({metrics.keywordCount} volte)</p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-600">Target: 0.5% - 2.5%</p>
                    </div>
                </div>
                
                {/* Word Count */}
                <div className="flex items-start gap-2">
                    {metrics.wordCount >= 600 
                        ? <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                        : <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    }
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Lunghezza</p>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{metrics.wordCount} parole</p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-600">Target: &gt;600</p>
                    </div>
                </div>
                
                {/* Headings */}
                <div className="flex items-start gap-2">
                    {metrics.h2Count >= 2 
                        ? <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                        : <XCircleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                    }
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Struttura H2</p>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{metrics.h2Count} sottotitoli</p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-600">Minimo 2 sezioni</p>
                    </div>
                </div>
                
                {/* Rich Content */}
                <div className="flex items-start gap-2">
                    {metrics.hasLists && metrics.hasBold
                        ? <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                        : <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    }
                    <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Leggibilità</p>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                            {metrics.hasLists ? 'Liste OK' : 'No Liste'} • {metrics.hasBold ? 'Grassetti OK' : 'No Grassetti'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Background Glow */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[50px] opacity-10 ${getBarColor(metrics.score)}`}></div>
        </div>
    );
};
