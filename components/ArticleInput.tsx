
import React, { useRef } from 'react';
import { SparklesIcon, ArchiveBoxIcon, CheckCircleIcon, CloudArrowDownIcon, CloudArrowUpIcon, BookmarkIcon } from './IconComponents';

interface ArticleInputProps {
    value: string;
    onChange: (value: string) => void;
    onOptimize: () => void;
    isLoading: boolean;
    savedCount: number;
    onLoadClick: () => void;
    lastAutoSave: Date | null;
    onExportDB: () => void;
    onImportDB: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({ 
    value, 
    onChange, 
    onOptimize, 
    isLoading, 
    savedCount, 
    onLoadClick, 
    lastAutoSave,
    onExportDB,
    onImportDB
}) => {
    return (
        <div className="flex flex-col gap-5 glass-card-intense p-7 rounded-3xl shadow-xl relative slide-in-up">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 animate-pulse"></div>
                    <h2 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                        Nuovo Articolo
                    </h2>
                </div>
                <div className="flex gap-3">
                     <button className="text-slate-500 hover:text-indigo-400 transition-all hover:scale-110" title="Backup">
                        <CloudArrowDownIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="relative group">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Incolla qui l'articolo da ottimizzare (es. da Perplexity)..."
                    className="w-full h-80 p-5 bg-slate-950/60 border border-slate-700/50 rounded-2xl 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 
                             transition-all duration-300 text-slate-200 text-sm leading-relaxed 
                             custom-scrollbar resize-none
                             hover:bg-slate-950/80 hover:border-slate-600/50
                             placeholder:text-slate-600"
                    disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <button
                onClick={onOptimize}
                disabled={isLoading || !value.trim()}
                className="btn-primary flex items-center justify-center gap-3 w-full 
                         bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500
                         hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-5 px-6 rounded-2xl 
                         transition-all duration-300 
                         shadow-xl shadow-indigo-600/30
                         hover:shadow-2xl hover:shadow-indigo-500/40
                         relative overflow-hidden group"
            >
                <SparklesIcon className={`w-5 h-5 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} />
                <span className="relative z-10 tracking-wide">
                    {isLoading ? 'ELABORAZIONE IN CORSO...' : 'AGGIUNGI ALLA CODA BATCH'}
                </span>
            </button>
            
            <p className="text-xs text-slate-500/80 text-center font-medium flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></span>
                L'IA elaborerà fino a 4 testi simultaneamente dalla coda
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></span>
            </p>
        </div>
    );
};
