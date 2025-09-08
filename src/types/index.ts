export interface WordInfo {
  word: string;
  phonetic?: string;
  translation: string;
  partOfSpeech?: string; // 词性：动词、名词等
  definitions?: string[];
  examples?: string[];
}

export interface RecognitionResult {
  originalText: string;
  words: WordInfo[];
  confidence?: number;
  provider: 'doubao' | 'deepseek';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface YoudaoTranslateResponse {
  errorCode: string;
  query: string;
  translation: string[];
  basic?: {
    phonetic?: string;
    explains?: string[];
  };
  web?: Array<{
    key: string;
    value: string[];
  }>;
}
