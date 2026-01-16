import React, { useRef, useState } from 'react';
import { BookOpen, X, FileUp, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdf';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({ text, onTextChange, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfText = await extractTextFromPdf(file);
      onTextChange(pdfText);
    } catch (error: any) {
      alert(error.message || "An error occurred while loading the PDF.");
    } finally {
      setIsProcessing(false);
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <BookOpen size={18} />
          <h2 className="font-medium">Source Text</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          
          <button
            onClick={triggerFileUpload}
            disabled={isProcessing}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-primary hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileUp size={14} />
            )}
            {isProcessing ? 'Processing...' : 'Upload PDF'}
          </button>

          {text.length > 0 && (
            <button 
              onClick={onClear}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <X size={14} /> 
              Clear
            </button>
          )}
        </div>
      </div>
      
      <textarea
        className="w-full h-32 bg-surface text-slate-300 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600"
        placeholder="Paste your text here or upload a PDF to start reading..."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
};