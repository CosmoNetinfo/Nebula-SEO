
import React from 'react';

export const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 animate-pulse">Processing Request...</p>
    </div>
);
