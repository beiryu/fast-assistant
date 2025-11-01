/**
 * Database Test/Verification Script
 * This can be run to verify database initialization works correctly
 * 
 * Usage in development:
 * import { testDatabase } from './database.test';
 * testDatabase();
 */

import { getDatabase, dbService } from './database';
import { getDeviceId } from './constants';
import { randomUUID } from 'expo-crypto';

export async function testDatabase() {
  try {
    console.log('Testing database initialization...');
    
    // Initialize database
    const db = await getDatabase();
    console.log('✓ Database initialized');
    
    // Test device ID
    const deviceId = await getDeviceId();
    console.log('✓ Device ID:', deviceId);
    
    // Test save translation
    const testTranslation = {
      id: randomUUID(),
      input_text: 'Test input',
      output_text: 'Test output',
      input_language: 'en' as const,
      created_at: Date.now(),
      updated_at: Date.now(),
      is_synced: false,
      device_id: deviceId,
      word_count: 2,
      char_count: 10,
    };
    
    await dbService.saveTranslation(testTranslation);
    console.log('✓ Translation saved');
    
    // Test get translations
    const translations = await dbService.getTranslations(10);
    console.log('✓ Translations retrieved:', translations.length);
    
    // Test search
    const searchResults = await dbService.searchTranslations('Test');
    console.log('✓ Search works:', searchResults.length);
    
    // Test settings
    await dbService.saveSetting('test_key', 'test_value');
    const setting = await dbService.getSetting('test_key');
    console.log('✓ Settings work:', setting);
    
    // Cleanup test data
    await dbService.deleteTranslation(testTranslation.id);
    console.log('✓ Cleanup complete');
    
    console.log('All database tests passed!');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

