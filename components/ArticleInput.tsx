
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
        <div className="flex flex-col gap-3 glass-card-intense p-5 rounded-xl shadow-xl relative slide-in-up border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/40 transition-colors duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse"></div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        New Article
                    </h2>
                </div>
                <div className="flex gap-2">
                     <button className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white transition-all transform hover:scale-105" title="Backup to Cloud">
                        <CloudArrowDownIcon className="w-4 h-4" />
                    </button>
                    <button className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white transition-all transform hover:scale-105" title="Import from Cloud">
                        <CloudArrowUpIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="relative group">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste your content here for optimization..."
                    className="w-full h-48 p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg 
                             focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 
                             focus:bg-white dark:focus:bg-zinc-950
                             transition-all duration-300 text-zinc-900 dark:text-zinc-300 text-xs leading-relaxed 
                             custom-scrollbar resize-none
                             placeholder:text-zinc-500 dark:placeholder:text-zinc-600 font-mono"
                    disabled={isLoading}
                />
            </div>
            
            <button
                onClick={onOptimize}
                disabled={isLoading || !value.trim()}
                className="btn-primary flex items-center justify-center gap-2 w-full 
                         bg-zinc-900 text-white dark:bg-white dark:text-black
                         hover:bg-zinc-700 dark:hover:bg-zinc-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-bold py-3 px-4 rounded-lg 
                         transition-all duration-300 
                         shadow-lg shadow-zinc-200 dark:shadow-white/5
                         relative overflow-hidden group text-[11px] tracking-widest uppercase border border-zinc-900 dark:border-white"
            >
                <SparklesIcon className={`w-4 h-4 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">
                    {isLoading ? 'Processing...' : 'Add to Queue'}
                </span>
            </button>
            
            <div className="flex justify-between items-center pt-2 px-1">
                <div className="flex gap-4 items-center">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold tracking-tighter uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse"></span>
                        Threads: 4
                    </span>
                    <span className="text-[10px] text-zinc-900 dark:text-zinc-200 font-black tracking-tight uppercase bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10">
                        {value.trim().split(/\s+/).filter(w => w.length > 0).length} Words Count
                    </span>
                </div>
                {lastAutoSave && (
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-zinc-500" />
                        SAVED {lastAutoSave.toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
};
