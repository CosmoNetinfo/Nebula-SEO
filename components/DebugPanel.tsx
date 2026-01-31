import React, { useState } from 'react';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

class DebugLogger {
  private static logs: DebugLog[] = [];
  private static listeners: Array<(logs: DebugLog[]) => void> = [];

  static log(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    
    this.logs.push(log);
    if (this.logs.length > 100) this.logs.shift(); // Keep last 100 logs
    
    // Console output
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${log.timestamp}] ${message}`, details || '');
    
    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  static subscribe(listener: (logs: DebugLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static getLogs() {
    return [...this.logs];
  }

  static clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>(DebugLogger.getLogs());

  React.useEffect(() => {
    const unsubscribe = DebugLogger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600 text-xs font-bold z-50"
        title="Apri Debug Panel"
      >
        🐛 Debug ({logs.filter(l => l.level === 'error').length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          🐛 Debug Panel
          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px]">
            {logs.filter(l => l.level === 'error').length} errori
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => DebugLogger.clear()}
            className="text-slate-400 hover:text-white text-xs"
          >
            Pulisci
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80 p-3 space-y-2 bg-slate-950">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-4">Nessun log disponibile</p>
        ) : (
          logs.slice().reverse().map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded text-xs border ${
                log.level === 'error' 
                  ? 'bg-red-900/20 border-red-500/30 text-red-300' 
                  : log.level === 'warn'
                  ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold uppercase text-[10px]">
                  {log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : 'ℹ️'} {log.level}
                </span>
                <span className="text-[9px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString('it-IT')}
                </span>
              </div>
              <p className="font-mono text-[11px] leading-tight">{log.message}</p>
              {log.details && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-[10px] text-slate-400 hover:text-slate-200">
                    Dettagli
                  </summary>
                  <pre className="mt-1 text-[9px] bg-black/30 p-2 rounded overflow-x-auto">
                    {typeof log.details === 'string' 
                      ? log.details 
                      : JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugLogger;
