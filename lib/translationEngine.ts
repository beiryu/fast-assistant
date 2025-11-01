import { randomUUID } from 'expo-crypto';
import { API_CONFIG, getDeviceId } from './constants';
import { dbService } from './database';
import { EdgeFunctionResponse, supabase } from './supabase';
import { TranslationResult } from './types';

// In-memory cache for translations (LRU-like, max 100 items)
const translationCache = new Map<string, TranslationResult>();
const MAX_CACHE_SIZE = 100;

export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string = 'TRANSLATION_ERROR',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

export class TranslationEngine {
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async translate(input: string, retries: number = 3): Promise<TranslationResult> {
    // Normalize input for cache key
    const cacheKey = input.toLowerCase().trim();
    
    // Check cache first
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Validate input
    if (!input || input.trim().length === 0) {
      throw new TranslationError('Input text cannot be empty', 'INVALID_INPUT', false);
    }

    if (input.length > 500) {
      throw new TranslationError('Input text exceeds maximum length of 500 characters', 'INPUT_TOO_LONG', false);
    }

    let lastError: Error | null = null;
    const startTime = Date.now();

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new TranslationError(
            'Translation request timed out. Please try again.',
            'TIMEOUT',
            true
          )), API_CONFIG.TRANSLATION_TIMEOUT);
        });

        // Call Supabase Edge Function with timeout
        const translationPromise = supabase.functions.invoke('translate', {
          body: {
            input: input.trim(),
            inputLanguage: 'auto',
            outputLanguage: 'en',
          },
        });

        const { data, error } = await Promise.race([translationPromise, timeoutPromise]);

        if (error) {
          // Handle specific Supabase errors
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new TranslationError(
              'Network error. Please check your internet connection.',
              'NETWORK_ERROR',
              true
            );
          }
          throw new TranslationError(
            error.message || 'Translation request failed',
            'SUPABASE_ERROR',
            true
          );
        }

        const response = data as EdgeFunctionResponse<TranslationResult>;
        
        if (!response.success || !response.data) {
          const errorCode = response.error?.code || 'TRANSLATION_FAILED';
          const errorMessage = response.error?.message || 'Translation failed';
          
          // Check for rate limiting
          if (errorCode === 'RATE_LIMIT_EXCEEDED') {
            const retryAfter = response.error?.retryAfter || 60;
            throw new TranslationError(
              `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
              'RATE_LIMIT',
              true
            );
          }
          
          throw new TranslationError(errorMessage, errorCode, true);
        }

        const result = response.data;
        const processingTime = Date.now() - startTime;

        // Validate response
        if (!result.output || result.output.trim().length === 0) {
          throw new TranslationError(
            'Received empty translation. Please try again.',
            'EMPTY_RESPONSE',
            true
          );
        }

        // Cache result (with LRU-like eviction)
        if (translationCache.size >= MAX_CACHE_SIZE) {
          // Remove oldest entry (first key)
          const firstKey = translationCache.keys().next().value;
          translationCache.delete(firstKey);
        }
        translationCache.set(cacheKey, result);

        // Auto-save to local DB (don't await - fire and forget)
        this.saveTranslationToDB(input, result).catch(err => {
          console.error('Failed to save translation to DB:', err);
          // Non-critical error, don't throw
        });

        return { ...result, processingTime };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if error is not retryable
        if (error instanceof TranslationError && !error.retryable) {
          throw error;
        }

        // If not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    if (lastError instanceof TranslationError) {
      throw lastError;
    }
    
    throw new TranslationError(
      lastError?.message || 'Translation failed after multiple attempts. Please try again.',
      'MAX_RETRIES_EXCEEDED',
      true
    );
  }

  private async saveTranslationToDB(input: string, result: TranslationResult): Promise<void> {
    try {
      const deviceId = await getDeviceId();
      await dbService.saveTranslation({
        id: randomUUID(),
        input_text: input.trim(),
        output_text: result.output,
        input_language: this.detectLanguage(input),
        created_at: Date.now(),
        updated_at: Date.now(),
        is_synced: false,
        device_id: deviceId,
        word_count: input.trim().split(/\s+/).filter(w => w.length > 0).length,
        char_count: input.trim().length,
      });
    } catch (error) {
      console.error('Error saving translation to DB:', error);
      throw error;
    }
  }

  private detectLanguage(input: string): 'vi' | 'en' | 'mixed' {
    // Simple detection - can be improved
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(input);
    const hasEnglish = /[a-z]/i.test(input);
    
    if (hasVietnamese && hasEnglish) return 'mixed';
    if (hasVietnamese) return 'vi';
    return 'en';
  }
}

export const translationEngine = new TranslationEngine();

