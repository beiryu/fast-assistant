// Core types for the application

export interface Translation {
  id: string;
  input_text: string;
  output_text: string;
  input_language: 'vi' | 'en' | 'mixed';
  created_at: number;
  updated_at: number;
  is_synced: boolean;
  device_id: string;
  word_count?: number;
  char_count?: number;
}

export interface TranslationResult {
  output: string;
  detectedLanguages: string[];
  confidence: number;
  processingTime?: number;
  cached?: boolean;
}

export interface Settings {
  key: string;
  value: string;
  updated_at: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt?: number;
  pendingItems: number;
}

