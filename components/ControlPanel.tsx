import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Settings2, Clock } from 'lucide-react';
import { ReaderStatus } from '../types';

interface ControlPanelProps {
  status: ReaderStatus;
  wpm: number;
  progress: number;
  total: number;
  onTogglePlay: () => void;
  onSpeedChange: (wpm: number) => void;
  onProgressChange: (index: number) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  wpm,
  progress,
  total,
  onTogglePlay,
  onSpeedChange,
  onProgressChange,
  onReset,
}) => {
  const isPlaying = status === ReaderStatus.PLAYING;

  // Calculate time
  const secondsPerWord = 60 / Math.max(wpm, 1);
  const elapsedSeconds = progress * secondsPerWord;
  const totalSeconds = total * secondsPerWord;

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface p-6 rounded-xl border border-slate-700 space-y-6">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        {/* Info Row */}
        <div className="flex justify-between items-end text-xs font-mono">
          <div className="space-y-1">
             <div className="text-slate-400">
               {progress + 1} / {Math.max(total, 1)} words
             </div>
             <div className="flex items-center gap-1.5 text-primary/80">
               <Clock size={12} />
               <span>
                 {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
               </span>
             </div>
          </div>
          <span className="text-slate-500">{Math.round(((progress + 1) / Math.max(total, 1)) * 100)}%</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max={Math.max(total - 1, 0)}
          value={progress}
          onChange={(e) => onProgressChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-blue-400 transition-all"
        />
      </div>

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={() => onProgressChange(Math.max(0, progress - 10))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Back 10 words"
          >
            <Rewind size={20} />
          </button>

          <button
            onClick={onTogglePlay}
            className={`
              flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95
              ${isPlaying ? 'bg-amber-500 hover:bg-amber-400' : 'bg-primary hover:bg-blue-400'}
            `}
          >
            {isPlaying ? (
              <Pause size={32} className="text-white fill-current" />
            ) : (
              <Play size={32} className="text-white fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => onProgressChange(Math.min(total - 1, progress + 10))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Forward 10 words"
          >
            <FastForward size={20} />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 w-full md:w-auto">
          <Settings2 size={18} className="text-slate-400" />
          <div className="flex flex-col flex-1 md:w-48">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400 font-medium">Speed</span>
              <span className="text-xs text-accent font-bold font-mono">{wpm} WPM</span>
            </div>
            <input
              type="range"
              min="60"
              max="1000"
              step="10"
              value={wpm}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent hover:accent-rose-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};