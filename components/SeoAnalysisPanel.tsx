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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 border-green-500/50';
        if (score >= 60) return 'text-yellow-500 border-yellow-500/50';
        return 'text-red-500 border-red-500/50';
    };
    
    const getBarColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'good' || s === 'ottimo') return <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />;
        if (s === 'average' || s === 'medio') return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />;
        return <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />;
    };

    return (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden group mb-6">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Analisi SEO Tecnica</h4>
                <div className={`px-3 py-1 rounded-full border ${getScoreColor(score)} bg-opacity-10 backdrop-blur-sm font-black text-sm`}>
                    SEO: {score}/100
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full mb-6 relative z-10 overflow-hidden">
                 <div 
                    className={`h-full ${getBarColor(score)} transition-all duration-1000 ease-out`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {items && items.map((r, i) => (
                     <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                        {getStatusIcon(r.status)}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">{r.item}</p>
                            <p className="text-[10px] text-slate-300 leading-tight mt-1">{r.details}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-10 ${getBarColor(score)}`}></div>
        </div>
    );
};
