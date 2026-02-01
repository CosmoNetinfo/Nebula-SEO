import React, { useMemo } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './IconComponents';
import { ReadabilityItem } from '../types';

interface ReadabilityScorePanelProps {
    items: ReadabilityItem[];
}

export const ReadabilityScorePanel: React.FC<ReadabilityScorePanelProps> = ({ items }) => {

    const score = useMemo(() => {
        if (!Array.isArray(items) || items.length === 0) return 0;
        
        const totalPoints = items.reduce((acc, item) => {
            if (!item) return acc + 30;
            if (item.status === 'good') return acc + 100;
            if (item.status === 'average') return acc + 60;
            return acc + 30;
        }, 0);
        
        return Math.round(totalPoints / items.length);
    }, [items]);

    return (
        <div className="bg-white dark:bg-zinc-950/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 shadow-lg relative overflow-hidden group mb-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="text-xs uppercase font-bold text-zinc-800 dark:text-zinc-500 tracking-wider">Readability Score</h4>
                <div className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 backdrop-blur-sm font-black text-sm text-black dark:text-zinc-300 transition-colors">
                    SCORE: {score}/100
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full mb-6 relative z-10 overflow-hidden border border-zinc-200 dark:border-zinc-800/30 transition-colors">
                 <div 
                    className="h-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-1000 ease-out" 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {Array.isArray(items) && items.map((r, i) => (
                     <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/30 bg-zinc-50 dark:bg-black/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors group/item">
                        <div className="mt-0.5 shrink-0">
                            {r.status === 'good' && <CheckCircleIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-300" />}
                            {r.status === 'average' && <ExclamationTriangleIcon className="w-4 h-4 text-zinc-500" />}
                            {r.status === 'poor' && <XCircleIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="text-[10px] uppercase font-bold text-black dark:text-zinc-500 group-hover/item:text-black dark:group-hover/item:text-zinc-400 transition-colors">{r.criteria}</p>
                                <span className="text-[10px] font-bold text-black dark:text-zinc-300 font-mono bg-zinc-200 dark:bg-zinc-900/50 px-1.5 rounded transition-colors">{r.score}</span>
                            </div>
                            <p className="text-[10px] text-zinc-800 dark:text-zinc-400 leading-tight font-mono">{r.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
