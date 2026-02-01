import React, { useState, useEffect } from 'react';
import { XMarkIcon, KeyIcon } from './IconComponents';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGeminiKey(localStorage.getItem('user_gemini_key') || '');
            setGroqKey(localStorage.getItem('user_groq_key') || '');
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('user_gemini_key', geminiKey);
        localStorage.setItem('user_groq_key', groqKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                            <KeyIcon className="w-5 h-5 text-black dark:text-white" />
                        </div>
                        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">API Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        Personalizza la tua esperienza inserendo le tue chiavi API. Le chiavi verranno salvate localmente nel tuo browser.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 ml-1">Google Gemini Key</label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all dark:text-white font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 ml-1">Groq API Key</label>
                            <input
                                type="password"
                                value={groqKey}
                                onChange={(e) => setGroqKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all ${
                            saved 
                            ? 'bg-green-500 text-white' 
                            : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                        }`}
                    >
                        {saved ? 'Chiavi Salvate!' : 'Salva Impostazioni'}
                    </button>
                    
                    <div className="text-center">
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Get Gemini Key (Free)
                        </a>
                        <span className="mx-2 text-zinc-800">|</span>
                        <a 
                            href="https://console.groq.com/keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Get Groq Key
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
