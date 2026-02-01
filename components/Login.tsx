import React, { useState } from 'react';
import { SparklesIcon } from './IconComponents';

interface LoginProps {
  onLogin: (password: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
        setError(false);
    } else {
        setError(true);
        setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full glass-card p-10 rounded-2xl border border-zinc-800/60 shadow-2xl relative overflow-hidden animate-fade-in-up">
        
        {/* Minimal Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800"></div>
        
        <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-zinc-900/50 rounded-2xl mb-6 border border-zinc-800 shadow-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3 font-display">
                Nebula
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">Secure Access Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="group">
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2 ml-1 tracking-wider group-focus-within:text-white transition-colors">Access Code</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`w-full bg-zinc-950/50 border ${error ? 'border-red-900/50 focus:border-red-800' : 'border-zinc-800/80 focus:border-white/20'} rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder-zinc-800 font-mono text-center tracking-[0.5em] text-lg shadow-inner`}
                    placeholder="••••••••"
                    autoFocus
                />
            </div>

            {error && (
                <div className="text-red-400 text-[10px] font-bold text-center bg-red-950/10 py-3 rounded-lg border border-red-900/20 animate-pulse font-mono tracking-wide">
                    ⚠ INVALID CREDENTIALS
                </div>
            )}

            <button 
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl shadow-lg shadow-white/5 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase text-[11px] tracking-widest border-none"
            >
                Authenticate
            </button>
        </form>

        <div className="mt-10 text-center border-t border-zinc-900 pt-6">
            <p className="text-[9px] text-zinc-600 font-mono">
                ENCRYPTED SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
        </div>
      </div>
    </div>
  );
};
