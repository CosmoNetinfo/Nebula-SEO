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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-fade-in-up">
        {/* Effetti decorativi */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-2xl mb-4 border border-slate-700 shadow-lg">
                <SparklesIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text mb-2">
                CosmoNet
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Portale di Accesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 ml-1">Codice di Accesso</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`w-full bg-slate-900/80 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'} rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600 font-mono text-center tracking-widest`}
                    placeholder="••••••••"
                    autoFocus
                />
            </div>

            {error && (
                <div className="text-red-400 text-[10px] font-bold text-center bg-red-400/10 py-2 rounded-lg animate-pulse border border-red-400/20">
                    ACCESSO NEGATO: CODICE NON VALIDO
                </div>
            )}

            <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-wider"
            >
                Entra nel Sistema
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-600">
                Sistema protetto da crittografia end-to-end.<br/>
                Tutti i tentativi di accesso sono monitorati.
            </p>
        </div>
      </div>
    </div>
  );
};
