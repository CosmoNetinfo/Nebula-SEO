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
        className="fixed bottom-4 right-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-lg shadow-lg border border-zinc-800 text-xs font-bold z-50 transition-all font-mono uppercase tracking-wider"
        title="Open Debug Panel"
      >
        🐛 Debug ({logs.filter(l => l.level === 'error').length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[500px] bg-black/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-zinc-900/80 p-3 flex justify-between items-center border-b border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-wider font-mono">
          System Logs
          <span className="bg-red-950/30 text-red-500 border border-red-900/30 px-2 py-0.5 rounded text-[9px]">
            {logs.filter(l => l.level === 'error').length} Errors
          </span>
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => DebugLogger.clear()}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/50 flex-1">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
             <p className="text-xs font-mono">System normal.</p>
             <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">No logs recorded</p>
          </div>
        ) : (
          logs.slice().reverse().map((log, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                log.level === 'error' 
                  ? 'bg-red-950/10 border-red-900/20 text-red-400' 
                  : log.level === 'warn'
                  ? 'bg-amber-950/10 border-amber-900/20 text-amber-500'
                  : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-400'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5 opacity-70">
                <span className="font-bold uppercase text-[9px] tracking-wider">
                  {log.level === 'error' ? 'CRITICAL' : log.level === 'warn' ? 'WARNING' : 'INFO'}
                </span>
                <span className="text-[9px]">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
              <p className="leading-relaxed break-words text-[11px]">{log.message}</p>
              {log.details && (
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-300 transition-colors list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▸</span> Details
                  </summary>
                  <pre className="mt-2 text-[9px] bg-black p-2 rounded border border-zinc-800 overflow-x-auto text-zinc-500">
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
