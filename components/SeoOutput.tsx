import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SeoResult, SeoChecklistItem, ReadabilityItem, GroundingSource } from '../types';
import { Loader } from './Loader';
import { SeoScorePanel } from './SeoScorePanel';
import { SeoAnalysisPanel } from './SeoAnalysisPanel';
import { ReadabilityScorePanel } from './ReadabilityScorePanel';
import { ClipboardIcon, CheckIcon, EyeIcon, CodeBracketIcon, CheckCircleIcon, ExclamationTriangleIcon, BookmarkIcon, PhotoIcon, SparklesIcon, DocumentMagnifyingGlassIcon, PrinterIcon, ArchiveBoxIcon } from './IconComponents';

interface SeoOutputProps {
    result: SeoResult | null;
    isLoading: boolean;
    isEnriching?: boolean;
    onIncreaseDepth?: () => void;
    error: string | null;
    onSave: (finalHtml?: string) => void;
}

const SeoDataItem: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono = false }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/30 group">
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">{label}</label>
            <div className="flex justify-between items-center gap-2">
                <p className={`text-zinc-200 text-sm truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
                <button onClick={handleCopy} className="text-zinc-500 hover:text-indigo-400 p-1">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

export const SeoOutput: React.FC<SeoOutputProps> = ({ result, isLoading, isEnriching, onIncreaseDepth, error, onSave }) => {
    const [activeTab, setActiveTab] = useState<'seo' | 'readability' | 'content'>('seo');
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [socialCopied, setSocialCopied] = useState(false);
    const [tagsCopied, setTagsCopied] = useState(false);

    const handleCopySocial = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.socialMediaPost).then(() => {
            setSocialCopied(true);
            setTimeout(() => setSocialCopied(false), 2000);
        });
    };

    const handleCopyTagsCSV = () => {
        if (!result) return;
        const cleanTags = result.tags.split(',').map(t => t.trim()).join(', ');
        navigator.clipboard.writeText(cleanTags).then(() => {
            setTagsCopied(true);
            setTimeout(() => setTagsCopied(false), 2000);
        });
    };

    if (isLoading) return <div className="bg-black/50 p-6 rounded-2xl border border-zinc-800 h-full flex items-center justify-center"><Loader /></div>;
    if (error) return <div className="bg-black/50 p-6 rounded-2xl border border-red-900/20 text-red-400 flex items-center justify-center text-center">{error}</div>;
    if (!result) return (
        <div className="bg-black/20 p-12 rounded-2xl border border-zinc-800/50 h-full flex flex-col items-center justify-center text-center text-zinc-600">
            <SparklesIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nessuna analisi attiva</p>
            <p className="text-sm">Il testo verrà ottimizzato mantenendo la lunghezza originale.</p>
        </div>
    );

    return (
        <div className="glass-card rounded-2xl shadow-2xl border border-zinc-800/30 flex flex-col h-full overflow-hidden">
            <div className="flex bg-black/40 p-1 border-b border-zinc-800/50">
                {[
                    { id: 'seo', icon: DocumentMagnifyingGlassIcon, label: 'SEO' },
                    { id: 'readability', icon: SparklesIcon, label: 'Qualità' },
                    { id: 'content', icon: EyeIcon, label: 'Articolo' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase transition-all rounded-xl ${
                            activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'seo' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        
                        {/* Punteggio SEO Tecnico (IA) */}
                        <div className="mb-6">
                            <SeoAnalysisPanel items={result.seoChecklist} />
                        </div>

                        <div className="flex justify-end">
                             <button
                                onClick={onIncreaseDepth}
                                disabled={isEnriching}
                                className="text-[10px] px-4 py-2 rounded-xl font-bold uppercase transition-all bg-indigo-600 text-white hover:bg-indigo-500 shadow-md flex items-center gap-2"
                            >
                                <SparklesIcon className="w-3 h-3" />
                                {isEnriching ? 'Arricchimento...' : 'Cerca Fonti & Approfondimenti'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/30 p-4 rounded-xl border border-zinc-800/50">
                                <label className="text-[10px] uppercase font-bold text-indigo-400 block mb-2">Categorie Editoriali</label>
                                <p className="text-sm text-zinc-300">{result.categories}</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[10px] uppercase font-bold text-indigo-400">Tag SEO (CSV)</label>
                                    <button onClick={handleCopyTagsCSV} className="text-[10px] text-zinc-400 hover:text-indigo-400 flex items-center gap-1 font-bold">
                                        {tagsCopied ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                                        Copia CSV
                                    </button>
                                </div>
                                <div className="bg-black/50 p-3 rounded-lg border border-zinc-800 font-mono text-[10px] text-indigo-300/90 break-all cursor-pointer hover:border-indigo-500/30 transition-all" onClick={handleCopyTagsCSV}>
                                    {result.tags}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SeoDataItem label="Parola Chiave" value={result.keyPhrase} mono />
                            <SeoDataItem label="URL Slug" value={result.slug} mono />
                        </div>
                        <SeoDataItem label="Titolo SEO (Snippet)" value={result.title} />
                        <SeoDataItem label="Meta Descrizione" value={result.description} />
                    </div>
                )}

                {activeTab === 'readability' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        
                        {/* Punteggio Leggibilità Grafico */}
                        <ReadabilityScorePanel items={result.readability} />

                        <div className="bg-indigo-900/5 p-5 rounded-xl border border-indigo-500/10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">Post per Social Media</span>
                                <button onClick={handleCopySocial} className="text-zinc-500 hover:text-indigo-400 transition-colors p-1 bg-black/40 rounded">
                                    {socialCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed italic">"{result.socialMediaPost}"</p>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex bg-black/60 p-1 rounded-lg border border-zinc-800">
                                <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>ANTEPRIMA</button>
                                <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>HTML</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onSave()} className="bg-emerald-600 p-2.5 rounded-xl text-white hover:bg-emerald-500 transition-colors" title="Salva bozza"><BookmarkIcon className="w-5 h-5" /></button>
                                <button onClick={() => window.print()} className="bg-zinc-800 p-2.5 rounded-xl text-white hover:bg-zinc-700 border border-zinc-700" title="Stampa"><PrinterIcon className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl overflow-hidden min-h-[600px] border-8 border-slate-900 shadow-inner relative ring-1 ring-slate-700/50">
                            {isEnriching && (
                                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
                                    <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-pulse border border-indigo-400/30">
                                        <SparklesIcon className="w-6 h-6" />
                                        <span className="text-sm font-bold tracking-tight">Perfezionamento articolo...</span>
                                    </div>
                                </div>
                            )}
                            {viewMode === 'preview' ? (
                                <iframe 
                                    srcDoc={`<html><head><style>
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
                                        body{font-family:'Inter', sans-serif; line-height:1.8; color:#334155; padding:40px 30px; max-width:800px; margin:0 auto; font-size: 16px; background: #fff;} 
                                        h1,h2,h3{color:#0f172a; margin-top:1.6em; margin-bottom: 0.8em; font-family: 'Playfair Display', serif;} 
                                        h1{font-size: 2.6em; border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 1.1em;}
                                        h2{font-size: 1.7em; color: #4338ca; border-left: 5px solid #6366f1; padding-left: 15px;}
                                        h3{font-size: 1.3em; color: #1e293b;}
                                        p{margin-bottom: 1.4em;}
                                        a{color:#4f46e5; text-decoration:none; font-weight:700; border-bottom: 1px solid transparent;}
                                        a:hover{border-bottom-color: #4f46e5;}
                                        ul, ol{margin-bottom: 1.4em; padding-left: 2em;}
                                        li{margin-bottom: 0.6em;}
                                    </style></head><body>
                                        <h1>${result.title}</h1>
                                        ${result.htmlContent}
                                    </body></html>`}
                                    className="w-full h-[600px]"
                                />
                            ) : (
                                <div className="p-6 bg-slate-950 h-[600px] overflow-auto font-mono text-[11px] text-cyan-400/90 whitespace-pre-wrap relative leading-relaxed">
                                    {`<!-- INFO SEO BLOG -->\n<!-- CATEGORIA: ${result.categories} -->\n<!-- TAG: ${result.tags} -->\n\n` + result.htmlContent}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const fullCode = `<!-- INFO SEO BLOG -->\n<!-- CATEGORIA: ${result.categories} -->\n<!-- TAG: ${result.tags} -->\n\n` + result.htmlContent;
                                                navigator.clipboard.writeText(fullCode);
                                                alert("Codice HTML copiato!");
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-lg"
                                        >
                                            COPIA CODICE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
