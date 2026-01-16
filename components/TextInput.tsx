import React, { useState } from 'react';
import { BookOpen, X, Loader2, Link, Download } from 'lucide-react';
import { fetchTextFromUrl } from '../utils/url';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({ text, onTextChange, onClear }) => {
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleUrlFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    setIsProcessing(true);
    setStatusMessage('Fetching content from URL...');
    try {
      const urlText = await fetchTextFromUrl(urlInput);
      if (urlText.length < 50) {
        setStatusMessage("Warning: Very little text found. The site might be blocking scrapers.");
      } else {
        setStatusMessage(null);
      }
      onTextChange(urlText);
    } catch (error: any) {
      setStatusMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Tools */}
      <div className="flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <BookOpen size={18} />
            <h2 className="font-medium">Source Text</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {text.length > 0 && (
              <button 
                onClick={() => {
                  onClear();
                  setUrlInput("");
                  setStatusMessage(null);
                }}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <X size={14} /> 
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Import Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 bg-surface p-3 rounded-lg border border-slate-700/50">
          
          {/* URL Input Form */}
          <form onSubmit={handleUrlFetch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link size={14} className="text-slate-500" />
              </div>
              <input 
                type="url" 
                placeholder="https://example.com/article" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-primary placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !urlInput}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors flex items-center gap-2"
            >
              {isProcessing && urlInput ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Fetch
            </button>
          </form>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`text-xs px-3 py-2 rounded-md ${statusMessage.includes('Warning') ? 'bg-amber-900/30 text-amber-200 border border-amber-800' : 'bg-red-900/20 text-red-200 border border-red-900/50'}`}>
            {statusMessage}
          </div>
        )}
      </div>
      
      <textarea
        className="w-full h-32 bg-surface text-slate-300 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600"
        placeholder="Paste your text here or enter a URL above to start reading..."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
};