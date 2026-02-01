
import React, { useState, useEffect, useRef } from 'react';
import { ArticleInput } from './components/ArticleInput';
import { SeoOutput } from './components/SeoOutput';
import { optimizeArticleForSeo, enrichArticleDepth } from './services/aiService';
import { SeoResult, SavedSeoResult, BatchItem } from './types';
import { SparklesIcon, ArchiveBoxIcon, TrashIcon, SunIcon, MoonIcon, Cog6ToothIcon } from './components/IconComponents';
import { LoadModal } from './components/LoadModal';
import { SettingsModal } from './components/SettingsModal';
import { saveArticleToDb, loadArticlesFromDb, deleteArticleFromDb, supabase } from './services/supabaseService';
import { Login } from './components/Login';
import { DebugPanel } from './components/DebugPanel';
import DebugLogger from './components/DebugPanel';

const App: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    // Theme State
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    
    // App State
    const [articleText, setArticleText] = useState<string>('');
    const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEnriching, setIsEnriching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [savedArticles, setSavedArticles] = useState<SavedSeoResult[]>([]);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
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
        
        // Load Theme
        const storedTheme = localStorage.getItem('cosmonet_theme') as 'dark' | 'light';
        if (storedTheme) {
            setTheme(storedTheme);
            if (storedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else {
            document.documentElement.classList.add('dark');
        }

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

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('cosmonet_theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogin = (pwd: string) => {
        if (pwd === APP_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('cosmonet_auth', 'true');
            // Use a simple identifier for the account (hash of password)
            localStorage.setItem('cosmonet_user_id', btoa(pwd).substring(0, 10));
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
    
    // ... (rest of logic methods stay same)

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

    const handleExport = () => {};
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {};

    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen text-black dark:text-zinc-300 font-sans pb-12 relative selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6 relative z-10">
                <header className="glass-card px-6 py-4 rounded-xl mb-6 shadow-xl slide-in-up border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative bg-white dark:bg-zinc-950/80 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <SparklesIcon className="w-5 h-5 text-black dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-black dark:text-white font-display">
                                    Nebula<span className="text-zinc-400 dark:text-zinc-500">SEO</span>
                                </h1>
                                <p className="text-[10px] text-black dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Professional AI Workbench</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                             <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800
                                         bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400
                                         hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white
                                         transition-all duration-300 shadow-sm"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? (
                                    <SunIcon className="w-4 h-4" />
                                ) : (
                                    <MoonIcon className="w-4 h-4" />
                                )}
                            </button>

                            <button
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800
                                         bg-white dark:bg-zinc-950 text-black dark:text-white
                                         hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm group"
                            >
                                <Cog6ToothIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Impostazioni API</span>
                            </button>
                            
                            <button 
                                onClick={() => setIsLoadModalOpen(true)}
                                className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50
                                         text-black dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800
                                         transition-all duration-300
                                         flex items-center gap-2 group shadow-sm hover:shadow-md"
                            >
                                <ArchiveBoxIcon className="w-4 h-4 text-black dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                Archive
                                <span className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-300 px-1.5 py-0.5 rounded text-[9px]">
                                    {savedArticles.length}
                                </span>
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase
                                         border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 dark:hover:border-red-900/50
                                         text-black hover:text-red-500 dark:hover:text-red-400
                                         hover:bg-red-50 dark:hover:bg-red-950/10
                                         bg-white dark:bg-transparent
                                         transition-all duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                        <div className="glass-card-intense p-5 rounded-xl shadow-xl slide-in-up border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/40 transition-colors duration-300" style={{animationDelay: '0.1s'}}>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse"></div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-zinc-400">
                                        Processing Queue
                                    </h3>
                                </div>
                                {batchQueue.some(b => b.status === 'pending') && (
                                    <button 
                                        onClick={processBatch}
                                        disabled={isLoading}
                                        className="btn-primary px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                                 shadow-lg
                                                 transition-all duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 hover:-translate-y-0.5 flex items-center gap-2
                                                 bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white"
                                    >
                                        {isLoading ? 'Processing...' : 'Run Batch'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                {batchQueue.length === 0 ? (
                                    <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                                        <div className="inline-block p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-3 text-zinc-500 dark:text-zinc-700">
                                            <ArchiveBoxIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-xs text-black dark:text-zinc-500 font-bold uppercase tracking-wider">Queue Empty</p>
                                        <p className="text-[10px] text-black dark:text-zinc-600 mt-1">Waiting for input...</p>
                                    </div>
                                ) : (
                                    batchQueue.map((item, index) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => setSelectedBatchId(item.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${
                                                selectedBatchId === item.id 
                                                ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-md' 
                                                : 'bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-800'
                                            }`}
                                            style={{animationDelay: `${index * 0.05}s`}}
                                        >   
                                            {selectedBatchId === item.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-white"></div>
                                            )}
                                            
                                            <div className="flex-1 truncate pl-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                                                        item.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                                        item.status === 'processing' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 animate-pulse' :
                                                        item.status === 'pending' ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-400' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">#{item.id.slice(-4)}</span>
                                                </div>
                                                <p className={`text-xs font-medium truncate ${selectedBatchId === item.id ? 'text-black dark:text-white' : 'text-black dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                                                    {item.result?.title || (item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text)}
                                                </p>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-md
                                                         text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20
                                                         transition-all duration-200"
                                                title="Remove"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 h-full">
                        <SeoOutput
                            result={currentResult}
                            isLoading={isLoading && batchQueue.find(b => b.id === selectedBatchId)?.status === 'processing'}
                            isEnriching={isEnriching}
                            onIncreaseDepth={handleEnrich}
                            error={currentError}
                            onSave={handleSaveArticle}
                            originalText={batchQueue.find(b => b.id === selectedBatchId)?.text}
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

            <SettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
            
            <DebugPanel />
        </div>
    );
};

export default App;
