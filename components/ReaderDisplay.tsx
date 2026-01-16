import React, { useMemo } from 'react';
import { getOptimalRecognitionPoint } from '../utils/rsvp';
import { WordPart } from '../types';

interface ReaderDisplayProps {
  word: string;
  isActive: boolean;
}

export const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ word, isActive }) => {
  const parts: WordPart = useMemo(() => getOptimalRecognitionPoint(word), [word]);

  if (!isActive && !word) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xl font-medium tracking-wide">
        Ready to read
      </div>
    );
  }

  return (
    <div className="h-48 relative flex items-center justify-center bg-surface rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden select-none px-4">
      {/* Visual Guides */}
      <div className="absolute top-4 bottom-4 left-1/2 w-0.5 -ml-[1px] bg-slate-800/50" />
      <div className="absolute top-1/2 left-4 right-4 h-0.5 -mt-[1px] bg-slate-800/30" />
      
      {/* ORP Alignment Container */}
      <div className="flex w-full items-baseline text-5xl md:text-6xl font-mono leading-none whitespace-nowrap">
        
        {/* Left Part - Pushes towards center */}
        <span className="flex-1 text-right text-slate-200">
          {parts.left}
        </span>

        {/* Pivot - Exact Center */}
        <span className="shrink-0 text-accent font-bold w-[1ch] text-center">
          {parts.pivot}
        </span>

        {/* Right Part - Pushes away from center */}
        <span className="flex-1 text-left text-slate-200">
          {parts.right}
        </span>
        
      </div>
    </div>
  );
};