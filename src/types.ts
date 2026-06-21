export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'exam';

export interface Lesson {
  id: string;
  title: string;
  text: string;
  difficulty: DifficultyLevel;
  source: string;
  isCustom?: boolean;
}

export interface TypingMetrics {
  grossWpm: number;
  netWpm: number;
  grossKspm: number;
  netKspm: number;
  accuracy: number;
  errorRate: number;
  totalCharsTyped: number;
  correctChars: number;
  errorCount: number;
  backspaceCount: number;
  elapsedTime: number; // in seconds
  timeRemaining: number; // in seconds
  
  totalWordsTyped: number;
  correctWordsTyped: number;
  incorrectWordsTyped: number;
  fullMistakes: number;
  halfMistakes: number;
  keystrokeCount: number;

  typedTextRaw: string;
  originalTextRaw: string;
  wrongWords: string[];
}

export interface PracticeSession extends TypingMetrics {
  id: string;
  lessonId: string;
  lessonTitle: string;
  date: string; // ISO string
  difficulty: DifficultyLevel;
  backspaceDisabled: boolean;
  highlightDisabled: boolean;
  timeLimit: number; // original time limit in seconds
}

export interface AppSettings {
  timeLimit: number; // 60, 120, 300, 600, 900, 1200 seconds
  allowBackspace: boolean;
  highlightCurrentWord: boolean;
  textSize: 'sm' | 'md' | 'lg';
  examLayout: boolean; // true = Gov exam look and feel, false = modern layout
  layoutMode: 'scrollable-split' | 'inline-wrap';
}

export interface HistoryAnalytics {
  totalSessions: number;
  averageWpm: number;
  peakWpm: number;
  averageAccuracy: number;
  totalErrors: number;
}
