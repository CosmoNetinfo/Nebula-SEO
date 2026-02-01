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
        <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">{label}</label>
            <div className="flex justify-between items-center gap-2">
                <p className={`text-zinc-300 text-sm truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
                <button onClick={handleCopy} className="text-zinc-600 hover:text-white p-1 transition-colors">
                    {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
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

    if (isLoading) return <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full flex items-center justify-center transition-colors duration-300"><Loader /></div>;
    if (error) return <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center text-center font-mono text-xs transition-colors duration-300">{error}</div>;
    if (!result) return (
        <div className="bg-zinc-100 dark:bg-zinc-900/10 p-12 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 h-full flex flex-col items-center justify-center text-center text-zinc-600 transition-colors duration-300">
            <div className="p-4 bg-zinc-200 dark:bg-zinc-900/50 rounded-full mb-4 border border-zinc-300 dark:border-zinc-800">
                <SparklesIcon className="w-8 h-8 opacity-20 text-zinc-900 dark:text-white" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">No active analysis</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2 font-mono">Select an item from the queue to view details</p>
        </div>
    );

    return (
        <div className="glass-card rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden bg-white dark:bg-black/40 transition-colors duration-300">
            <div className="flex bg-zinc-50 dark:bg-zinc-950/50 p-1 border-b border-zinc-200 dark:border-zinc-800">
                {[
                    { id: 'seo', icon: DocumentMagnifyingGlassIcon, label: 'SEO Metrics' },
                    { id: 'readability', icon: SparklesIcon, label: 'Readability' },
                    { id: 'content', icon: EyeIcon, label: 'Content Preview' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                            activeTab === tab.id 
                                ? 'bg-white dark:bg-zinc-100 text-zinc-900 dark:text-black shadow-lg shadow-zinc-200/50 dark:shadow-white/5 border border-zinc-200 dark:border-transparent' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {activeTab === 'seo' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        
                        <div className="mb-6">
                            <SeoAnalysisPanel items={result.seoChecklist} />
                        </div>

                        <div className="flex justify-end">
                             <button
                                onClick={onIncreaseDepth}
                                disabled={isEnriching}
                                className="text-[10px] px-4 py-2 rounded-lg font-bold uppercase transition-all bg-zinc-100 text-black hover:bg-zinc-300 shadow-sm flex items-center gap-2 tracking-wider"
                            >
                                <SparklesIcon className="w-3.5 h-3.5" />
                                {isEnriching ? 'Enriching...' : 'Deep Research & Enrich'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-2 tracking-wider">Editorial Categories</label>
                                <p className="text-sm text-zinc-300 font-mono">{result.categories}</p>
                            </div>
                            
                            <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">SEO Tags (CSV)</label>
                                    <button onClick={handleCopyTagsCSV} className="text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 font-bold transition-colors">
                                        {tagsCopied ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                                        COPY CSV
                                    </button>
                                </div>
                                <div className="bg-black/50 p-3 rounded-lg border border-zinc-800/80 font-mono text-[10px] text-zinc-400 break-all cursor-pointer hover:border-zinc-600 transition-all hover:text-zinc-200" onClick={handleCopyTagsCSV}>
                                    {result.tags}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SeoDataItem label="Focus Keyword" value={result.keyPhrase} mono />
                            <SeoDataItem label="URL Slug" value={result.slug} mono />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SeoDataItem label="SEO Title (Snippet)" value={result.title} />
                            <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50 flex flex-col justify-center">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 tracking-wider">Optimized Word Count</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-white">
                                        {result.htmlContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Words</span>
                                </div>
                            </div>
                        </div>
                        <SeoDataItem label="Meta Description" value={result.description} />
                    </div>
                )}

                {activeTab === 'readability' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        <ReadabilityScorePanel items={result.readability} />

                        <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Social Media Caption</span>
                                <button onClick={handleCopySocial} className="text-zinc-500 hover:text-white transition-colors p-1 bg-black/40 rounded border border-zinc-800 hover:border-zinc-600">
                                    {socialCopied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed italic font-serif border-l-2 border-zinc-700 pl-4">"{result.socialMediaPost}"</p>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-200 text-zinc-900 dark:text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}>Preview</button>
                                <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'code' ? 'bg-white dark:bg-zinc-200 text-zinc-900 dark:text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}>HTML</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onSave()} className="bg-zinc-900 text-white dark:bg-white dark:text-black p-2 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors border border-transparent shadow-sm" title="Save Draft"><BookmarkIcon className="w-4 h-4" /></button>
                                <button onClick={() => window.print()} className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors" title="Print"><PrinterIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-black rounded-xl overflow-hidden min-h-[600px] border border-zinc-200 dark:border-zinc-800 shadow-inner relative transition-colors duration-300">
                            {isEnriching && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
                                    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-pulse border border-zinc-200 dark:border-zinc-800">
                                        <SparklesIcon className="w-5 h-5" />
                                        <span className="text-xs font-bold tracking-widest uppercase">Refining Content...</span>
                                    </div>
                                </div>
                            )}
                            {viewMode === 'preview' ? (
                                <iframe 
                                    srcDoc={`<html><head><style>
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
                                        body{font-family:'Inter', sans-serif; line-height:1.8; color:#334155; padding:40px 30px; max-width:800px; margin:0 auto; font-size: 16px; background: #fff;} 
                                        h1,h2,h3{color:#09090b; margin-top:1.6em; margin-bottom: 0.8em; font-family: 'Playfair Display', serif;} 
                                        h1{font-size: 2.6em; border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 1.1em;}
                                        h2{font-size: 1.7em; color: #18181b; border-left: 4px solid #000; padding-left: 15px;}
                                        h3{font-size: 1.3em; color: #3f3f46;}
                                        p{margin-bottom: 1.4em;}
                                        a{color:#000; text-decoration:underline; font-weight:700;}
                                        a:hover{text-decoration:none;}
                                        ul, ol{margin-bottom: 1.4em; padding-left: 2em;}
                                        li{margin-bottom: 0.6em;}
                                        blockquote{border-left: 3px solid #e4e4e7; margin-left: 0; padding-left: 1.5em; font-style: italic; color: #52525b;}
                                    </style></head><body>
                                        <h1>${result.title}</h1>
                                        ${result.htmlContent}
                                    </body></html>`}
                                    className="w-full h-[600px] bg-white border-0"
                                />
                            ) : (
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-950 h-[600px] overflow-auto font-mono text-[10px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap relative leading-relaxed transition-colors duration-300">
                                    <div className="text-zinc-400 dark:text-zinc-600 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4 block">
                                        &lt;!-- SEO METADATA --&gt;<br/>
                                        &lt;!-- CATEGORY: {result.categories} --&gt;<br/>
                                        &lt;!-- TAGS: {result.tags} --&gt;
                                    </div>
                                    {result.htmlContent}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const fullCode = `<!-- INFO SEO BLOG -->\n<!-- CATEGORIA: ${result.categories} -->\n<!-- TAG: ${result.tags} -->\n\n` + result.htmlContent;
                                                navigator.clipboard.writeText(fullCode);
                                                alert("HTML copied!");
                                            }}
                                            className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 px-3 py-2 rounded-lg text-[10px] font-bold shadow-lg uppercase tracking-wider transition-colors"
                                        >
                                            Copy Code
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
