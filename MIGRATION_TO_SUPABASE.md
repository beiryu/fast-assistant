# Database Migration to Supabase PostgreSQL

This document outlines the migration from SQLite/local storage to Supabase PostgreSQL.

## ✅ Completed Changes

### 1. Database Schema Migration
- **Location**: `supabase/migrations/20240101000000_initial_schema.sql`
- Created PostgreSQL tables matching the original SQLite schema:
  - `translations` table with all original fields
  - `settings` table
  - Added indexes for performance
  - Added Row Level Security (RLS) policies (currently allowing all access)
  - Added auto-update triggers for `updated_at` fields
  - Added generated timestamp columns for easier querying

### 2. Database Service Migration
- **Location**: `lib/database.ts`
- Replaced `expo-sqlite` with Supabase client
- Maintained the same API interface (`dbService`) - no changes needed in other files
- Added graceful error handling for offline/network issues
- All methods now use Supabase PostgREST API:
  - `saveTranslation()` - uses `upsert()`
  - `getTranslations()` - uses `select()` with pagination
  - `searchTranslations()` - uses `ilike` pattern matching
  - `deleteTranslation()` - uses `delete()`
  - `getUnsyncedTranslations()` - uses filtered query
  - `markAsSynced()` - uses `update()`
  - Settings operations - all use Supabase queries

### 3. Test File Updates
- **Location**: `lib/database.test.ts`
- Removed SQLite-specific `getDatabase()` call
- Added Supabase configuration check

## 🚀 Next Steps

### 1. Run Database Migration

Apply the migration to your Supabase database:

```bash
# If using Supabase CLI locally
supabase db push

# Or if using hosted Supabase, apply the migration manually via:
# - Supabase Dashboard > SQL Editor
# - Or using Supabase CLI: supabase db push --linked
```

### 2. Environment Variables

Ensure your `.env` file or environment has:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Test the Migration

Run the database test to verify everything works:

```typescript
import { testDatabase } from './lib/database.test';
await testDatabase();
```

### 4. Optional: Remove SQLite Dependency

If you're no longer using SQLite elsewhere, you can optionally remove it:

```bash
npm uninstall expo-sqlite
```

However, it's safe to leave it installed if you might need it for other features.

## 📱 Cross-Platform Compatibility

The new setup works seamlessly across:
- ✅ **Web** - Direct Supabase API calls
- ✅ **React Native (iOS/Android)** - Supabase JS client works natively
- ✅ **Desktop (Electron)** - Supabase JS client works in Node.js environment

## 🔒 Security Considerations

1. **Row Level Security (RLS)**: Currently set to allow all access. When you add authentication, update the policies in the migration file to restrict access:
   ```sql
   CREATE POLICY "Users can only access own translations" 
     ON translations FOR ALL 
     USING (auth.uid() = user_id OR user_id IS NULL);
   ```

2. **Environment Variables**: Never commit `.env` files with actual keys to version control.

## 🌐 Offline Handling

The current implementation:
- Gracefully handles network failures
- Returns empty arrays/null when Supabase is unavailable
- Logs errors for debugging
- Doesn't break the app when offline

For production, consider implementing:
- Local cache layer (e.g., AsyncStorage for React Native)
- Offline queue for write operations
- Sync mechanism when connection is restored

## 🔄 Data Migration (If Needed)

If you have existing SQLite data to migrate:

1. Export data from SQLite:
   ```sql
   -- Get all translations
   SELECT * FROM translations;
   
   -- Get all settings
   SELECT * FROM settings;
   ```

2. Import to Supabase using the Supabase Dashboard or a script that uses `dbService.saveTranslation()` for each record.

## 📝 Notes

- The `is_synced` field is preserved for potential future sync scenarios
- Timestamps remain as Unix milliseconds (BIGINT) for compatibility
- The migration includes generated PostgreSQL timestamp columns for easier querying
- Full-text search indexes are available for future advanced search features

