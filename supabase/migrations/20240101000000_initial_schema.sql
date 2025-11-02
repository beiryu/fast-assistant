-- Migration: Initial schema for translations and settings
-- This replaces the local SQLite schema with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
  id TEXT PRIMARY KEY,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  input_language TEXT DEFAULT 'mixed' CHECK (input_language IN ('vi', 'en', 'mixed')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_synced BOOLEAN DEFAULT false,
  device_id TEXT NOT NULL,
  word_count INTEGER,
  char_count INTEGER,
  -- Optional: Add user_id for future authentication support
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Add timestamps as PostgreSQL types for easier querying
  created_at_tz TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(created_at / 1000)) STORED,
  updated_at_tz TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(updated_at / 1000)) STORED
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  -- Optional: Add user_id for future authentication support
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Add timestamp as PostgreSQL type
  updated_at_tz TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(updated_at / 1000)) STORED
);

-- Indexes for performance (matching SQLite indexes)
CREATE INDEX IF NOT EXISTS idx_translations_created_at 
  ON translations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_translations_sync_status 
  ON translations(is_synced) 
  WHERE is_synced = false;

CREATE INDEX IF NOT EXISTS idx_translations_device_id 
  ON translations(device_id);

CREATE INDEX IF NOT EXISTS idx_translations_user_id 
  ON translations(user_id) 
  WHERE user_id IS NOT NULL;

-- Full-text search index for translations (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_translations_search_input 
  ON translations USING gin(to_tsvector('english', input_text));

CREATE INDEX IF NOT EXISTS idx_translations_search_output 
  ON translations USING gin(to_tsvector('english', output_text));

-- Row Level Security (RLS) - Enable but allow all access for now (can be restricted later with auth)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (no authentication yet)
-- Later, you can update this to: USING (auth.uid() = user_id OR user_id IS NULL)
CREATE POLICY "Allow all access to translations" 
  ON translations FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all access to settings" 
  ON settings FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = EXTRACT(EPOCH FROM NOW()) * 1000; -- Convert to milliseconds
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on translations
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on settings
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

