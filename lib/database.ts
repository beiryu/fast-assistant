import * as SQLite from 'expo-sqlite';
import { Translation, Settings } from './types';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('quicktranslate.db');
  
  // Initialize schema if not exists
  await initializeSchema(db);
  
  return db;
};

const initializeSchema = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS translations (
      id TEXT PRIMARY KEY,
      input_text TEXT NOT NULL,
      output_text TEXT NOT NULL,
      input_language TEXT DEFAULT 'mixed',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_synced INTEGER DEFAULT 0,
      device_id TEXT NOT NULL,
      word_count INTEGER,
      char_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_translations_created_at 
      ON translations(created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_translations_sync_status 
      ON translations(is_synced) WHERE is_synced = 0;
  `);
};

export const dbService = {
  // Translation CRUD operations
  async saveTranslation(translation: Translation): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT OR REPLACE INTO translations 
       (id, input_text, output_text, input_language, created_at, updated_at, is_synced, device_id, word_count, char_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        translation.id,
        translation.input_text,
        translation.output_text,
        translation.input_language,
        translation.created_at,
        translation.updated_at,
        translation.is_synced ? 1 : 0,
        translation.device_id,
        translation.word_count ?? null,
        translation.char_count ?? null,
      ]
    );
  },

  async getTranslations(limit: number = 50, offset: number = 0): Promise<Translation[]> {
    const database = await getDatabase();
    const result = await database.getAllAsync<Translation>(
      `SELECT * FROM translations 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    return result.map((row) => ({
      ...row,
      is_synced: Boolean(row.is_synced),
    }));
  },

  async searchTranslations(query: string, limit: number = 50): Promise<Translation[]> {
    const database = await getDatabase();
    const searchTerm = `%${query}%`;
    const result = await database.getAllAsync<Translation>(
      `SELECT * FROM translations 
       WHERE input_text LIKE ? OR output_text LIKE ?
       ORDER BY created_at DESC 
       LIMIT ?`,
      [searchTerm, searchTerm, limit]
    );
    
    return result.map((row) => ({
      ...row,
      is_synced: Boolean(row.is_synced),
    }));
  },

  async deleteTranslation(id: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM translations WHERE id = ?', [id]);
  },

  async getUnsyncedTranslations(): Promise<Translation[]> {
    const database = await getDatabase();
    const result = await database.getAllAsync<Translation>(
      `SELECT * FROM translations WHERE is_synced = 0 ORDER BY created_at DESC LIMIT 50`
    );
    
    return result.map((row) => ({
      ...row,
      is_synced: Boolean(row.is_synced),
    }));
  },

  async markAsSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    
    const database = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    await database.runAsync(
      `UPDATE translations SET is_synced = 1 WHERE id IN (${placeholders})`,
      ids
    );
  },

  // Settings operations
  async saveSetting(key: string, value: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, value, Date.now()]
    );
  },

  async getSetting(key: string): Promise<string | null> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<Settings>(
      'SELECT * FROM settings WHERE key = ?',
      [key]
    );
    return result?.value ?? null;
  },

  async getAllSettings(): Promise<Record<string, string>> {
    const database = await getDatabase();
    const result = await database.getAllAsync<Settings>('SELECT * FROM settings');
    return result.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  },
};

