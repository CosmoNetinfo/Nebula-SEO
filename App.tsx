
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArticleInput } from './components/ArticleInput';
import { SeoOutput } from './components/SeoOutput';
import { optimizeArticleForSeo, enrichArticleDepth } from './services/geminiService';
import { SeoResult, SavedSeoResult, BatchItem } from './types';
import { SparklesIcon, ArchiveBoxIcon, TrashIcon } from './components/IconComponents';
import { LoadModal } from './components/LoadModal';
import { saveArticleToDb, loadArticlesFromDb, deleteArticleFromDb, supabase } from './services/supabaseService';
import { Login } from './components/Login';

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

    const handleSaveArticle = useCallback((finalHtml?: string) => {
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
    }, [selectedBatchId, batchQueue]); // Removed savedArticles dependency to avoid loop

    const handleLoadArticle = useCallback((article: SavedSeoResult) => {
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
    }, []);

    const handleDeleteArticle = useCallback((id: string) => {
        setSavedArticles(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem('seo-optimizer-saved-articles', JSON.stringify(updated));
            return updated;
        });
        
        if (supabase) {
            deleteArticleFromDb(id).catch(console.error);
        }
    }, []);

    // Dummy handlers for now
    const handleExport = useCallback(() => {}, []);
    const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {}, []);

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans pb-20">
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-10 h-10 text-indigo-400" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                            Nebula SEO
                        </h1>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => setIsLoadModalOpen(true)}
                            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase border border-slate-700 transition-all"
                        >
                            Archivio ({savedArticles.length})
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold uppercase border border-red-500/20 transition-all"
                        >
                            Esci
                        </button>
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

                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                                    <ArchiveBoxIcon className="w-4 h-4" /> Coda di Elaborazione
                                </h3>
                                {batchQueue.some(b => b.status === 'pending') && (
                                    <button 
                                        onClick={processBatch}
                                        disabled={isLoading}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
                                    >
                                        {isLoading ? 'In corso...' : 'OTTIMIZZA TUTTI (x4)'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {batchQueue.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic text-center py-4">Aggiungi articoli alla coda per iniziare.</p>
                                ) : (
                                    batchQueue.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => setSelectedBatchId(item.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                                                selectedBatchId === item.id 
                                                ? 'bg-indigo-600/20 border-indigo-500' 
                                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex-1 truncate mr-4">
                                                <p className="text-xs font-bold text-slate-200 truncate">
                                                    {item.result?.title || item.text.substring(0, 40) + '...'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold uppercase ${
                                                        item.status === 'completed' ? 'text-green-400' : 
                                                        item.status === 'processing' ? 'text-indigo-400 animate-pulse' : 
                                                        item.status === 'error' ? 'text-red-400' : 'text-slate-500'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
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
        </div>
    );
};

export default App;
