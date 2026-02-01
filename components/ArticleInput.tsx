
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
        <div className="flex flex-col gap-3 glass-card-intense p-4 rounded-xl shadow-lg relative slide-in-up">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 animate-pulse"></div>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                        Nuovo Articolo
                    </h2>
                </div>
                <div className="flex gap-2">
                     <button className="text-slate-500 hover:text-indigo-400 transition-all hover:scale-110" title="Backup">
                        <CloudArrowDownIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            
            <div className="relative group">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Incolla qui l'articolo da ottimizzare..."
                    className="w-full h-48 p-3 bg-slate-950/60 border border-slate-700/50 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 
                             transition-all duration-300 text-slate-200 text-xs leading-relaxed 
                             custom-scrollbar resize-none
                             hover:bg-slate-950/80 hover:border-slate-600/50
                             placeholder:text-slate-600"
                    disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <button
                onClick={onOptimize}
                disabled={isLoading || !value.trim()}
                className="btn-primary flex items-center justify-center gap-2 w-full 
                         bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500
                         hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3 px-4 rounded-lg 
                         transition-all duration-300 
                         shadow-lg shadow-indigo-600/30
                         hover:shadow-xl hover:shadow-indigo-500/40
                         relative overflow-hidden group text-xs"
            >
                <SparklesIcon className={`w-4 h-4 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} />
                <span className="relative z-10 tracking-wide">
                    {isLoading ? 'ELABORAZIONE...' : 'AGGIUNGI ALLA CODA'}
                </span>
            </button>
            
            <p className="text-[10px] text-slate-500/80 text-center font-medium">
                L'IA elaborerà fino a 4 testi simultaneamente
            </p>
        </div>
    );
};
