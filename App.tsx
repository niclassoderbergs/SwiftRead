import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReaderDisplay } from './components/ReaderDisplay';
import { ControlPanel } from './components/ControlPanel';
import { TextInput } from './components/TextInput';
import { AdminDashboard } from './components/AdminDashboard';
import { processTextToWords, calculateDelay } from './utils/rsvp';
import { logReadSession } from './utils/analytics';
import { ReaderStatus } from './types';
import { Zap, LockKeyhole } from 'lucide-react';

// Default English text for demonstration
const DEFAULT_TEXT = "Welcome to SwiftRead. This is an example of how speed reading works. Paste your own text below to get started. Rapid Serial Visual Presentation helps you focus on one word at a time, eliminating eye movements and dramatically increasing reading speed.";

export default function App() {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [words, setWords] = useState<string[]>([]);
  const [status, setStatus] = useState<ReaderStatus>(ReaderStatus.IDLE);
  const [index, setIndex] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(500);
  const [useORP, setUseORP] = useState<boolean>(true); // Optimal Recognition Point toggle
  const [isAdminView, setIsAdminView] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const hasLoggedRef = useRef<boolean>(false);

  // Process text whenever it changes
  useEffect(() => {
    const processedWords = processTextToWords(text);
    setWords(processedWords);
    hasLoggedRef.current = false; // Reset logging flag
    // Reset index if it goes out of bounds (e.g. text deleted)
    if (index >= processedWords.length) {
      setIndex(0);
      setStatus(ReaderStatus.IDLE);
    }
  }, [text]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTick = useCallback(() => {
    setIndex((prevIndex) => {
      if (prevIndex >= words.length - 1) {
        setStatus(ReaderStatus.IDLE);
        return 0; // Or stay at end: words.length - 1
      }
      return prevIndex + 1;
    });
  }, [words.length]);

  // Main playback loop
  useEffect(() => {
    if (status === ReaderStatus.PLAYING) {
      // Analytics: Log session if this is the first time playing this specific text block
      if (!hasLoggedRef.current && words.length > 5) {
        logReadSession(words.length, wpm);
        hasLoggedRef.current = true;
      }

      const delay = calculateDelay(wpm);
      
      // Recursive timeout for better precision than setInterval
      const loop = () => {
        timerRef.current = window.setTimeout(() => {
          handleTick();
          loop();
        }, delay);
      };

      loop();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [status, wpm, handleTick, stopTimer, words.length]);

  const togglePlay = () => {
    if (words.length === 0) return;
    
    if (status === ReaderStatus.PLAYING) {
      setStatus(ReaderStatus.PAUSED);
    } else {
      // If finished, restart
      if (index >= words.length - 1) {
        setIndex(0);
      }
      setStatus(ReaderStatus.PLAYING);
    }
  };

  const handleProgressChange = (newIndex: number) => {
    setIndex(Math.min(Math.max(0, newIndex), words.length - 1));
  };

  const handleReset = () => {
    setStatus(ReaderStatus.IDLE);
    setIndex(0);
  };

  const handleClearText = () => {
    setText("");
    setWords([]);
    setIndex(0);
    setStatus(ReaderStatus.IDLE);
  };

  // View Switching
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-background text-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
           <AdminDashboard onExit={() => setIsAdminView(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 selection:bg-primary/30">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SwiftRead</h1>
            <p className="text-slate-400 text-sm">RSVP Speed Reader</p>
          </div>
        </header>

        {/* Main Display Area */}
        <section aria-label="Reading Area">
          <ReaderDisplay 
            word={words[index] || ""} 
            isActive={words.length > 0}
            useORP={useORP}
          />
        </section>

        {/* Controls */}
        <section aria-label="Controls">
          <ControlPanel 
            status={status}
            wpm={wpm}
            progress={index}
            total={words.length}
            useORP={useORP}
            onTogglePlay={togglePlay}
            onSpeedChange={setWpm}
            onProgressChange={handleProgressChange}
            onReset={handleReset}
            onToggleORP={() => setUseORP(!useORP)}
          />
        </section>

        {/* Input */}
        <section aria-label="Text Input">
          <TextInput 
            text={text}
            onTextChange={setText}
            onClear={handleClearText}
          />
        </section>

        {/* Footer info */}
        <footer className="flex flex-col items-center justify-center text-slate-600 text-xs pt-8 gap-4">
          <p>Rapid Serial Visual Presentation (RSVP) technique</p>
          
          <button 
            onClick={() => setIsAdminView(true)}
            className="flex items-center gap-1 opacity-50 hover:opacity-100 hover:text-primary transition-all"
            title="Admin Login"
          >
            <LockKeyhole size={12} />
            <span>Admin</span>
          </button>
        </footer>

      </div>
    </div>
  );
}