import React, { useMemo } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './IconComponents';

interface SeoAnalysisItem {
    item: string;
    status: 'good' | 'average' | 'poor' | string;
    details: string;
}

interface SeoAnalysisPanelProps {
    items: SeoAnalysisItem[];
}

export const SeoAnalysisPanel: React.FC<SeoAnalysisPanelProps> = ({ items }) => {

    const score = useMemo(() => {
        if (!items || items.length === 0) return 0;
        
        const totalPoints = items.reduce((acc, item) => {
            const s = item.status.toLowerCase();
            if (s === 'good' || s === 'ottimo') return acc + 100;
            if (s === 'average' || s === 'medio') return acc + 60;
            return acc + 30; // poor
        }, 0);
        
        return Math.round(totalPoints / items.length);
    }, [items]);

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'good' || s === 'ottimo') return <CheckCircleIcon className="w-4 h-4 text-zinc-200 mt-0.5 shrink-0" />;
        if (s === 'average' || s === 'medio') return <ExclamationTriangleIcon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />;
        return <XCircleIcon className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />;
    };

    return (
        <div className="bg-zinc-950/30 p-5 rounded-2xl border border-zinc-800/50 shadow-lg relative overflow-hidden group mb-6">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Technical Analysis</h4>
                <div className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm font-black text-sm text-zinc-300">
                    SCORE: {score}/100
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-900 rounded-full mb-6 relative z-10 overflow-hidden border border-zinc-800/30">
                 <div 
                    className="h-full bg-zinc-200 transition-all duration-1000 ease-out" 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {items && items.map((r, i) => (
                     <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/30 bg-black/20 hover:bg-zinc-900/40 transition-colors group/item">
                        {getStatusIcon(r.status)}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-500 group-hover/item:text-zinc-400 transition-colors">{r.item}</p>
                            <p className="text-[10px] text-zinc-400 leading-tight mt-1 font-mono">{r.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
