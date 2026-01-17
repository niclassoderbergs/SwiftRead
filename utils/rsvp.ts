import { WordPart } from '../types';

export const processTextToWords = (text: string): string[] => {
  // Split by whitespace but keep punctuation attached to the word
  return text.trim().split(/\s+/).filter(w => w.length > 0);
};

export const getOptimalRecognitionPoint = (word: string): WordPart => {
  const len = word.length;
  let pivotIndex = 0;

  // Algorithm to find the Optimal Recognition Point (ORP)
  // Usually slightly to the left of the center
  if (len === 1) pivotIndex = 0;
  else if (len >= 2 && len <= 5) pivotIndex = 1;
  else if (len >= 6 && len <= 9) pivotIndex = 2;
  else if (len >= 10 && len <= 13) pivotIndex = 3;
  else pivotIndex = 4;

  // Adjust if word is shorter than the standard heuristic calculation
  if (pivotIndex >= len) pivotIndex = Math.floor((len - 1) / 2);

  return {
    left: word.substring(0, pivotIndex),
    pivot: word[pivotIndex],
    right: word.substring(pivotIndex + 1)
  };
};

export const getCenterPoint = (word: string): WordPart => {
  // Classic centering - strictly mathematical middle
  // This avoids specific patent claims regarding "Optimal Recognition Point" logic
  const len = word.length;
  const pivotIndex = len > 0 ? Math.floor((len - 1) / 2) : 0;

  return {
    left: word.substring(0, pivotIndex),
    pivot: word[pivotIndex] || '',
    right: word.substring(pivotIndex + 1)
  };
};

export const calculateDelay = (wpm: number): number => {
  // 60 seconds * 1000 ms / words per minute
  return (60 * 1000) / wpm;
};