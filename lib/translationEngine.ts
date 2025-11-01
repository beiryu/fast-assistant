import { supabase, EdgeFunctionResponse } from './supabase';
import { TranslationResult } from './types';
import { dbService } from './database';
import { getDeviceId } from './constants';
import { v4 as uuidv4 } from 'uuid';

// In-memory cache for translations
const translationCache = new Map<string, TranslationResult>();

export class TranslationEngine {
  async translate(input: string): Promise<TranslationResult> {
    // Check cache first
    const cacheKey = input.toLowerCase().trim();
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          input,
          inputLanguage: 'auto',
          outputLanguage: 'en',
        },
      });

      if (error) {
        throw new Error(error.message || 'Translation failed');
      }

      const response = data as EdgeFunctionResponse<TranslationResult>;
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Translation failed');
      }

      const result = response.data;

      // Cache result
      translationCache.set(cacheKey, result);

      // Auto-save to local DB
      const deviceId = await getDeviceId();
      await dbService.saveTranslation({
        id: uuidv4(),
        input_text: input,
        output_text: result.output,
        input_language: this.detectLanguage(input),
        created_at: Date.now(),
        updated_at: Date.now(),
        is_synced: false,
        device_id: deviceId,
        word_count: input.split(/\s+/).length,
        char_count: input.length,
      });

      return result;
    } catch (error) {
      console.error('Translation error:', error);
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

