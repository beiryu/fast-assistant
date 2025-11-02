import { supabase } from './supabase';
import { Translation } from './types';

// Helper to check if we're online and Supabase is configured
const isSupabaseAvailable = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Helper to handle Supabase errors gracefully
const handleSupabaseError = (error: any, operation: string): void => {
  if (error) {
    console.error(`Supabase ${operation} error:`, error);
    // Don't throw - allow app to continue functioning
    // In production, you might want to implement offline queue
  }
};

export const dbService = {
  // Translation CRUD operations
  async saveTranslation(translation: Translation): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Translation not saved to database.');
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .upsert(
          {
            id: translation.id,
            input_text: translation.input_text,
            output_text: translation.output_text,
            input_language: translation.input_language,
            created_at: translation.created_at,
            updated_at: translation.updated_at,
            is_synced: translation.is_synced,
            device_id: translation.device_id,
            word_count: translation.word_count ?? null,
            char_count: translation.char_count ?? null,
          },
          {
            onConflict: 'id',
          }
        );

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'saveTranslation');
      throw error;
    }
  },

  async getTranslations(limit: number = 50, offset: number = 0): Promise<Translation[]> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Returning empty array.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Map database rows to Translation type
      return (data || []).map((row: any) => ({
        id: row.id,
        input_text: row.input_text,
        output_text: row.output_text,
        input_language: row.input_language as 'vi' | 'en' | 'mixed',
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_synced: Boolean(row.is_synced),
        device_id: row.device_id,
        word_count: row.word_count ?? undefined,
        char_count: row.char_count ?? undefined,
      }));
    } catch (error) {
      handleSupabaseError(error, 'getTranslations');
      return [];
    }
  },

  async searchTranslations(query: string, limit: number = 50): Promise<Translation[]> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Returning empty array.');
      return [];
    }

    try {
      // Escape special characters for SQL LIKE patterns
      const escapedQuery = query.replace(/[%_\\]/g, '\\$&');
      const searchTerm = `%${escapedQuery}%`;
      
      // Use .or() filter - Supabase PostgREST format: column.operator.value
      // The JS client will URL-encode special characters automatically
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .or(`input_text.ilike.${searchTerm},output_text.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        input_text: row.input_text,
        output_text: row.output_text,
        input_language: row.input_language as 'vi' | 'en' | 'mixed',
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_synced: Boolean(row.is_synced),
        device_id: row.device_id,
        word_count: row.word_count ?? undefined,
        char_count: row.char_count ?? undefined,
      }));
    } catch (error) {
      handleSupabaseError(error, 'searchTranslations');
      return [];
    }
  },

  async deleteTranslation(id: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Translation not deleted.');
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'deleteTranslation');
      throw error;
    }
  },

  async getUnsyncedTranslations(): Promise<Translation[]> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Returning empty array.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('is_synced', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        input_text: row.input_text,
        output_text: row.output_text,
        input_language: row.input_language as 'vi' | 'en' | 'mixed',
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_synced: Boolean(row.is_synced),
        device_id: row.device_id,
        word_count: row.word_count ?? undefined,
        char_count: row.char_count ?? undefined,
      }));
    } catch (error) {
      handleSupabaseError(error, 'getUnsyncedTranslations');
      return [];
    }
  },

  async markAsSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Translations not marked as synced.');
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .update({ is_synced: true })
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'markAsSynced');
      throw error;
    }
  },

  // Settings operations
  async saveSetting(key: string, value: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Setting not saved.');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            key,
            value,
            updated_at: Date.now(),
          },
          {
            onConflict: 'key',
          }
        );

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'saveSetting');
      throw error;
    }
  },

  async getSetting(key: string): Promise<string | null> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Returning null.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        // If no rows found, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data?.value ?? null;
    } catch (error) {
      handleSupabaseError(error, 'getSetting');
      return null;
    }
  },

  async getAllSettings(): Promise<Record<string, string>> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured. Returning empty object.');
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      return (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      handleSupabaseError(error, 'getAllSettings');
      return {};
    }
  },
};

