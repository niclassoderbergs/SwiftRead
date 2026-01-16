export interface WordPart {
  left: string;
  pivot: string;
  right: string;
}

export enum ReaderStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
}

export interface ReaderSettings {
  wpm: number;
  chunkSize: number; // For future support of multi-word chunks
}
