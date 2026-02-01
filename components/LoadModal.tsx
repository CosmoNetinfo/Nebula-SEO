import React from 'react';
import { SavedSeoResult } from '../types';
import { TrashIcon, XMarkIcon, ArchiveBoxIcon, KeyIcon } from './IconComponents';

interface LoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    articles: SavedSeoResult[];
    onLoad: (article: SavedSeoResult) => void;
    onDelete: (articleId: string) => void;
}

export const LoadModal: React.FC<LoadModalProps> = ({ isOpen, onClose, articles, onLoad, onDelete }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                             <ArchiveBoxIcon className="w-5 h-5 text-black dark:text-white" />
                         </div>
                         <div>
                            <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Saved Articles</h2>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Local Archive</p>
                         </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Close modal">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-black/40">
                    {articles.length === 0 ? (
                        <div className="text-center py-16 flex flex-col items-center">
                            <ArchiveBoxIcon className="w-12 h-12 text-zinc-800 mb-4" />
                            <p className="text-zinc-500 font-medium">No saved articles found.</p>
                            <p className="text-xs text-zinc-600 mt-2">Articles you save will appear here.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {Array.isArray(articles) && articles.slice().reverse().map((article) => (
                                <li key={article.id} className="bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all group">
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-bold text-black dark:text-zinc-200 truncate pr-4 text-sm mb-1" title={article.title}>{article.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                                                <KeyIcon className="w-3 h-3" />
                                                <span className="font-mono text-zinc-400">{article.keyPhrase}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                                {new Date(parseInt(article.id)).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onLoad(article)}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors border-none shadow-sm"
                                        >
                                            Load
                                        </button>
                                        <button 
                                            onClick={() => onDelete(article.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                                            title="Delete article"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
