
import React, { useState, useEffect, useRef } from 'react';
import { ArticleInput } from './components/ArticleInput';
import { SeoOutput } from './components/SeoOutput';
import { optimizeArticleForSeo, enrichArticleDepth } from './services/geminiService';
import { SeoResult, SavedSeoResult, BatchItem } from './types';
import { SparklesIcon, ArchiveBoxIcon, TrashIcon } from './components/IconComponents';
import { LoadModal } from './components/LoadModal';
import { saveArticleToDb, loadArticlesFromDb, deleteArticleFromDb, supabase } from './services/supabaseService';
import { Login } from './components/Login';
import { DebugPanel } from './components/DebugPanel';
import DebugLogger from './components/DebugPanel';

const App: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    // App State
    const [articleText, setArticleText] = useState<string>('');
    const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEnriching, setIsEnriching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [savedArticles, setSavedArticles] = useState<SavedSeoResult[]>([]);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    
    const CONCURRENCY_LIMIT = 4;
    // @ts-ignore
    const APP_PASSWORD = process.env.VITE_APP_PASSWORD || import.meta.env.VITE_APP_PASSWORD; 

    const currentResult = selectedBatchId ? batchQueue.find(b => b.id === selectedBatchId)?.result || null : null;
    const currentError = selectedBatchId ? batchQueue.find(b => b.id === selectedBatchId)?.error || null : error;

    useEffect(() => {
        // Check auth
        const auth = localStorage.getItem('cosmonet_auth');
        if (auth === 'true') setIsAuthenticated(true);

        // Load saved local
        const stored = localStorage.getItem('seo-optimizer-saved-articles');
        if (stored) setSavedArticles(JSON.parse(stored));

        // Sync with DB if available
        if (supabase) {
            loadArticlesFromDb().then(dbArticles => {
                if (dbArticles.length > 0) {
                    setSavedArticles(prev => {
                        const uniqueMap = new Map();
                        [...prev, ...dbArticles].forEach(a => uniqueMap.set(a.id, a));
                        return Array.from(uniqueMap.values());
                    });
                }
            });
        }
    }, []);

    const handleLogin = (pwd: string) => {
        if (pwd === APP_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('cosmonet_auth', 'true');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('cosmonet_auth');
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    const addToQueue = () => {
        if (!articleText.trim()) return;
        const newItem: BatchItem = {
            id: Date.now().toString(),
            text: articleText,
            status: 'pending'
        };
        setBatchQueue(prev => [...prev, newItem]);
        setArticleText('');
        if (!selectedBatchId) setSelectedBatchId(newItem.id);
    };

    const processBatch = async () => {
        setIsLoading(true);
        const queueCopy = [...batchQueue];
        const pending = queueCopy.filter(item => item.status === 'pending');
        
        for (let i = 0; i < pending.length; i += CONCURRENCY_LIMIT) {
            const chunk = pending.slice(i, i + CONCURRENCY_LIMIT);
            
            await Promise.all(chunk.map(async (item) => {
                setBatchQueue(prev => prev.map(b => b.id === item.id ? { ...b, status: 'processing' } : b));
                try {
                    const result = await optimizeArticleForSeo(item.text);
                    setBatchQueue(prev => prev.map(b => b.id === item.id ? { ...b, status: 'completed', result } : b));
                } catch (e: any) {
                    setBatchQueue(prev => prev.map(b => b.id === item.id ? { ...b, status: 'error', error: e.message || "Errore sconosciuto" } : b));
                }
            }));
        }
        setIsLoading(false);
    };

    const handleEnrich = async () => {
        if (!selectedBatchId || !currentResult) return;
        setIsEnriching(true);
        try {
            const enrichedResult = await enrichArticleDepth(currentResult, "");
            setBatchQueue(prev => prev.map(b => b.id === selectedBatchId ? { ...b, result: enrichedResult } : b));
        } catch (e) {
            console.error(e);
            setError("Errore durante la ricerca delle fonti.");
        } finally {
            setIsEnriching(false);
        }
    };

    const removeFromQueue = (id: string) => {
        setBatchQueue(prev => prev.filter(b => b.id !== id));
        if (selectedBatchId === id) setSelectedBatchId(null);
    };

    const handleSaveArticle = (finalHtml?: string) => {
        const item = batchQueue.find(b => b.id === selectedBatchId);
        if (!item || !item.result) return;
        
        const internalSave = async () => {
            const newSavedArticle: SavedSeoResult = {
                ...item.result!,
                htmlContent: finalHtml || item.result!.htmlContent,
                id: Date.now().toString(),
                originalArticleText: item.text,
            };
            
            // Local Update
            setSavedArticles(prev => {
                const updated = [...prev, newSavedArticle];
                localStorage.setItem('seo-optimizer-saved-articles', JSON.stringify(updated));
                return updated;
            });
            
            // Remote Update
            if (supabase) {
                await saveArticleToDb(newSavedArticle);
            }
        };

        internalSave();
    };

    const handleLoadArticle = (article: SavedSeoResult) => {
        const { id, originalArticleText, ...resultData } = article;
        const newItem: BatchItem = {
            id: Date.now().toString(),
            text: originalArticleText,
            status: 'completed',
            result: resultData
        };
        setBatchQueue(prev => [...prev, newItem]);
        setSelectedBatchId(newItem.id);
        setIsLoadModalOpen(false);
    };

    const handleDeleteArticle = (id: string) => {
        setSavedArticles(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem('seo-optimizer-saved-articles', JSON.stringify(updated));
            return updated;
        });
        
        if (supabase) {
            deleteArticleFromDb(id).catch(console.error);
        }
    };

    // Dummy handlers for now
    const handleExport = () => {};
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {};

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans pb-20 relative">
            <div className="container mx-auto p-4 md:p-8 relative z-10">
                <header className="glass-card p-6 rounded-3xl mb-10 shadow-2xl slide-in-up">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-indigo-600 to-cyan-600 p-3 rounded-xl shadow-xl">
                                    <SparklesIcon className="w-8 h-8 text-white breathe-animation" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight">
                                    <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                                        Nebula SEO
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-500 mt-1 font-medium">AI-Powered Content Optimizer</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button 
                                onClick={() => setIsLoadModalOpen(true)}
                                className="glass-card px-5 py-3 rounded-xl text-sm font-bold uppercase border border-slate-600/50
                                         hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20
                                         transition-all duration-300 hover:-translate-y-0.5
                                         flex items-center gap-2 group"
                            >
                                <ArchiveBoxIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-slate-300 group-hover:text-white">Archivio</span>
                                <span className="ml-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full text-xs font-black">
                                    {savedArticles.length}
                                </span>
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="glass-card px-4 py-3 rounded-xl text-sm font-bold uppercase
                                         border border-red-500/30 hover:border-red-500/50
                                         text-red-400 hover:text-red-300
                                         hover:shadow-lg hover:shadow-red-500/20
                                         transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Esci
                            </button>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-6">
                        <ArticleInput
                            value={articleText}
                            onChange={setArticleText}
                            onOptimize={addToQueue}
                            isLoading={isLoading}
                            onLoadClick={() => setIsLoadModalOpen(true)}
                            savedCount={savedArticles.length}
                            lastAutoSave={null}
                            onExportDB={handleExport}
                            onImportDB={handleImport}
                        />

                        <div className="glass-card-intense p-7 rounded-3xl shadow-xl slide-in-up" style={{animationDelay: '0.1s'}}>
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 animate-pulse"></div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                                        Coda di Elaborazione
                                    </h3>
                                </div>
                                {batchQueue.some(b => b.status === 'pending') && (
                                    <button 
                                        onClick={processBatch}
                                        disabled={isLoading}
                                        className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold
                                                 text-white shadow-lg shadow-indigo-600/30
                                                 hover:shadow-xl hover:shadow-indigo-500/40
                                                 transition-all duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 hover:-translate-y-0.5"
                                    >
                                        {isLoading ? '⚡ In corso...' : '🚀 OTTIMIZZA TUTTI (x4)'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {batchQueue.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block p-4 rounded-2xl bg-slate-900/50 mb-3">
                                            <ArchiveBoxIcon className="w-12 h-12 text-slate-600" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Nessuna analisi attiva</p>
                                        <p className="text-xs text-slate-600 mt-1">Il tuo output ottimizzato apparirà qui quando è pronto</p>
                                    </div>
                                ) : (
                                    batchQueue.map((item, index) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => setSelectedBatchId(item.id)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                                                selectedBatchId === item.id 
                                                ? 'bg-gradient-to-r from-indigo-600/20 to-cyan-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                                                : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-900/60'
                                            }`}
                                            style={{animationDelay: `${index * 0.05}s`}}
                                        >
                                            <div className="flex-1 truncate mr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {selectedBatchId === item.id && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                                                    )}
                                                    <p className="text-sm font-bold text-slate-100 truncate">
                                                        {item.result?.title || item.text.substring(0, 45) + '...'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                                        item.status === 'processing' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 
                                                        item.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                                                        'bg-slate-700/50 text-slate-400'
                                                    }`}>
                                                        {item.status === 'completed' ? '✓ Completato' :
                                                         item.status === 'processing' ? '⚡ Elaborazione' :
                                                         item.status === 'error' ? '✕ Errore' :
                                                         '⏱ In attesa'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg
                                                         text-slate-500 hover:text-red-400 hover:bg-red-500/10
                                                         transition-all duration-200 hover:scale-110"
                                                title="Rimuovi dalla coda"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <SeoOutput
                            result={currentResult}
                            isLoading={isLoading && batchQueue.find(b => b.id === selectedBatchId)?.status === 'processing'}
                            isEnriching={isEnriching}
                            onIncreaseDepth={handleEnrich}
                            error={currentError}
                            onSave={handleSaveArticle}
                        />
                    </div>
                </main>
            </div>
            
            <LoadModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                articles={savedArticles}
                onLoad={handleLoadArticle}
                onDelete={handleDeleteArticle}
            />
            
            <DebugPanel />
        </div>
    );
};

export default App;
