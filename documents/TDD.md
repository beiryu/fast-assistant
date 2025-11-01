# Technical Design Document (TDD)
**QuickTranslate - System Architecture & Implementation**

---

## 1. SYSTEM OVERVIEW

### 1.1 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
├──────────────────┬──────────────────┬──────────────────────┤
│  Desktop App     │   Mobile App     │   Future: Web App    │
│  (Electron +     │   (React Native) │   (React Web)        │
│   RN Web)        │                  │                       │
└────────┬─────────┴─────────┬────────┴──────────────────────┘
         │                   │
         └───────────┬───────┘
                     │
         ┌───────────▼────────────┐
         │   API Gateway Layer    │
         │   (Edge Functions)     │
         └───────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐   ┌──────────┐   ┌──────────────┐
│ OpenAI  │   │ Deepgram │   │  Supabase    │
│   API   │   │   API    │   │  (Database)  │
└─────────┘   └──────────┘   └──────────────┘

LOCAL STORAGE (Client-side):
├── SQLite (Translation History)
├── AsyncStorage (User Settings)
└── Cache (Recent Translations)
```

### 1.2 Technology Stack Details

#### Frontend (Shared Codebase)
```typescript
{
  "framework": "React Native 0.73+",
  "language": "TypeScript 5.0+",
  "ui": "NativeWind (Tailwind for RN)",
  "state": "Zustand + React Query",
  "navigation": "React Navigation 6",
  "storage": "react-native-sqlite-storage",
  "voice": {
    "ios": "@react-native-voice/voice",
    "android": "@react-native-voice/voice",
    "fallback": "deepgram-sdk"
  }
}
```

#### Desktop Wrapper
```typescript
{
  "runtime": "Electron 28+",
  "bundler": "Webpack 5",
  "packages": [
    "electron-store",        // Settings persistence
    "electron-globalshortcut", // Hotkey support
    "electron-updater"       // Auto-updates (future)
  ]
}
```

#### Backend Infrastructure
```typescript
{
  "database": "Supabase (PostgreSQL 15)",
  "api": "Supabase Edge Functions (Deno)",
  "auth": "Supabase Auth (future)",
  "storage": "Supabase Storage (future file uploads)",
  "hosting": "Vercel/Cloudflare (web version future)"
}
```

---

## 2. DATA ARCHITECTURE

### 2.1 Database Schema

```sql
-- Local SQLite Schema (on device)
CREATE TABLE translations (
    id TEXT PRIMARY KEY,                    -- UUID v4
    input_text TEXT NOT NULL,               -- Mixed Vi+En input
    output_text TEXT NOT NULL,              -- English output
    input_language TEXT DEFAULT 'mixed',    -- 'vi', 'en', 'mixed'
    created_at INTEGER NOT NULL,            -- Unix timestamp (ms)
    updated_at INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,            -- Sync status
    device_id TEXT NOT NULL,                -- Device identifier
    word_count INTEGER,                     -- For analytics
    char_count INTEGER
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_translations_created_at 
    ON translations(created_at DESC);
CREATE INDEX idx_translations_sync_status 
    ON translations(is_synced) WHERE is_synced = 0;
CREATE INDEX idx_translations_search 
    ON translations(input_text, output_text);

-- Full-text search (optional, for advanced search)
CREATE VIRTUAL TABLE translations_fts USING fts5(
    input_text, 
    output_text,
    content='translations',
    content_rowid='rowid'
);
```

```sql
-- Cloud Database Schema (Supabase PostgreSQL)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ
);

CREATE TABLE cloud_translations (
    id UUID PRIMARY KEY,                    -- Same as local ID
    user_id UUID REFERENCES users(id),
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    input_language TEXT DEFAULT 'mixed',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    device_id TEXT NOT NULL,
    word_count INTEGER,
    char_count INTEGER,
    
    -- Conflict resolution
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_cloud_translations_user 
    ON cloud_translations(user_id, created_at DESC);
CREATE INDEX idx_cloud_translations_sync 
    ON cloud_translations(user_id, updated_at DESC);

-- Row Level Security (RLS)
ALTER TABLE cloud_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own translations"
    ON cloud_translations FOR ALL
    USING (auth.uid() = user_id);
```

### 2.2 Data Sync Strategy

#### Sync Flow
```
Local Change → Mark as Unsynced → Background Queue → API Call → Update Sync Status
                                         ↓
                                    [On Success]
                                         ↓
                                 Mark as Synced
                                         ↓
                                 Update version++
```

#### Conflict Resolution (Last-Write-Wins)
```typescript
// When syncing
if (cloudVersion > localVersion) {
  // Cloud is newer → update local
  updateLocal(cloudData);
} else if (localVersion > cloudVersion) {
  // Local is newer → update cloud
  updateCloud(localData);
} else {
  // Same version → compare updated_at timestamp
  if (cloudUpdatedAt > localUpdatedAt) {
    updateLocal(cloudData);
  }
}
```

### 2.3 Caching Strategy
```typescript
// Cache layers
const cacheStrategy = {
  recent: {
    // In-memory cache of last 20 translations
    ttl: Infinity, // Until app restart
    storage: 'memory',
  },
  frequent: {
    // Most-used phrases (future)
    ttl: '7d',
    storage: 'asyncstorage',
  },
  api: {
    // API response cache
    ttl: '1h',
    storage: 'memory',
  }
};
```

---

## 3. API DESIGN

### 3.1 Translation API

#### Endpoint: `/translate`
```typescript
// Request
POST /api/translate
Content-Type: application/json

{
  "input": "Tôi muốn confirm về meeting tomorrow",
  "inputLanguage": "mixed", // auto-detected
  "outputLanguage": "en",
  "tone": "professional" // future: casual, formal
}

// Response (Success)
{
  "success": true,
  "data": {
    "output": "I would like to confirm the meeting tomorrow",
    "detectedLanguages": ["vi", "en"],
    "confidence": 0.95,
    "processingTime": 1250 // ms
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": 1698765432000
  }
}

// Response (Error)
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60s",
    "retryAfter": 60
  }
}
```

#### Implementation (Edge Function)
```typescript
// supabase/functions/translate/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

serve(async (req) => {
  try {
    const { input, inputLanguage, outputLanguage } = await req.json()
    
    // Rate limiting check (future)
    // await checkRateLimit(userId)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate mixed Vietnamese-English text to natural, professional English. Preserve proper nouns and technical terms. Output ONLY the translation, no explanations.`
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.3, // Low temp for consistency
      max_tokens: 500,
    })
    
    const output = completion.choices[0].message.content
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          output,
          detectedLanguages: detectLanguages(input),
          confidence: 0.95,
          processingTime: Date.now() - startTime
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: error.code || "INTERNAL_ERROR",
          message: error.message
        }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### 3.2 Voice Transcription API

#### Endpoint: `/transcribe`
```typescript
POST /api/transcribe
Content-Type: multipart/form-data

{
  "audio": <binary audio file>,
  "language": "vi", // or "en", "auto"
  "format": "webm" // or "mp3", "wav"
}

// Response
{
  "success": true,
  "data": {
    "text": "Tôi muốn hỏi về dự án",
    "confidence": 0.89,
    "duration": 2.5, // seconds
    "detectedLanguage": "vi"
  }
}
```

#### Implementation (with fallback)
```typescript
// lib/voiceService.ts
export class VoiceService {
  async transcribe(audioBlob: Blob): Promise<string> {
    // Try native first (free)
    try {
      const nativeResult = await this.transcribeNative(audioBlob)
      if (nativeResult.confidence > 0.8) {
        return nativeResult.text
      }
    } catch (e) {
      console.log('Native transcription failed:', e)
    }
    
    // Fallback to Deepgram
    return await this.transcribeDeepgram(audioBlob)
  }
  
  private async transcribeNative(audioBlob: Blob) {
    // iOS: Use Speech Framework via native module
    // Android: Use SpeechRecognizer via native module
    const result = await Voice.start('vi-VN')
    return result
  }
  
  private async transcribeDeepgram(audioBlob: Blob) {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    return await response.json()
  }
}
```

### 3.3 Sync API

#### Endpoint: `/sync`
```typescript
POST /api/sync
Content-Type: application/json

{
  "deviceId": "device_abc123",
  "lastSyncTimestamp": 1698765000000,
  "changes": [
    {
      "id": "trans_123",
      "input_text": "...",
      "output_text": "...",
      "created_at": 1698765432000,
      "updated_at": 1698765432000,
      "version": 1
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "synced": 5,
    "conflicts": 0,
    "serverChanges": [
      // Changes from other devices
    ]
  }
}
```

---

## 4. CORE COMPONENTS

### 4.1 Translation Engine

```typescript
// lib/translationEngine.ts
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export class TranslationEngine {
  private supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  private cache = new Map<string, string>()
  
  async translate(input: string): Promise<TranslationResult> {
    // Check cache first
    const cached = this.cache.get(input)
    if (cached) {
      return { output: cached, cached: true }
    }
    
    // Call API
    const { data, error } = await this.supabase.functions.invoke('translate', {
      body: { input, outputLanguage: 'en' }
    })
    
    if (error) throw error
    
    // Cache result
    this.cache.set(input, data.output)
    
    // Auto-save to local DB
    await this.saveToLocal({
      id: uuidv4(),
      input_text: input,
      output_text: data.output,
      created_at: Date.now(),
    })
    
    return data
  }
  
  private async saveToLocal(translation: Translation) {
    await db.executeSql(
      `INSERT INTO translations 
       (id, input_text, output_text, created_at, updated_at, is_synced, device_id) 
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        translation.id,
        translation.input_text,
        translation.output_text,
        translation.created_at,
        translation.created_at,
        deviceId
      ]
    )
    
    // Trigger background sync
    SyncService.scheduleSync()
  }
}
```

### 4.2 Voice Input Manager

```typescript
// lib/voiceManager.ts
import Voice from '@react-native-voice/voice'

export class VoiceManager {
  private isRecording = false
  private onResult: (text: string) => void
  
  constructor(onResult: (text: string) => void) {
    this.onResult = onResult
    Voice.onSpeechResults = this.handleResults.bind(this)
    Voice.onSpeechError = this.handleError.bind(this)
  }
  
  async startRecording(language: 'vi-VN' | 'en-US' = 'vi-VN') {
    if (this.isRecording) return
    
    try {
      await Voice.start(language)
      this.isRecording = true
    } catch (error) {
      console.error('Voice start error:', error)
      throw error
    }
  }
  
  async stopRecording() {
    if (!this.isRecording) return
    
    try {
      await Voice.stop()
      this.isRecording = false
    } catch (error) {
      console.error('Voice stop error:', error)
    }
  }
  
  private handleResults(event: any) {
    const text = event.value[0]
    this.onResult(text)
  }
  
  private async handleError(error: any) {
    console.error('Voice error:', error)
    
    // Fallback to Deepgram if confidence too low
    if (error.code === 'INSUFFICIENT_CONFIDENCE') {
      // Trigger Deepgram API
    }
  }
}
```

### 4.3 Sync Service

```typescript
// lib/syncService.ts
export class SyncService {
  private syncQueue: Translation[] = []
  private isSyncing = false
  
  async scheduleSync() {
    // Debounce: wait 5 seconds before syncing
    clearTimeout(this.syncTimeout)
    this.syncTimeout = setTimeout(() => this.sync(), 5000)
  }
  
  async sync() {
    if (this.isSyncing) return
    this.isSyncing = true
    
    try {
      // Get unsynced translations
      const unsynced = await this.getUnsyncedTranslations()
      
      if (unsynced.length === 0) return
      
      // Send to server
      const { data, error } = await supabase.functions.invoke('sync', {
        body: {
          deviceId: await getDeviceId(),
          changes: unsynced
        }
      })
      
      if (error) throw error
      
      // Mark as synced
      await this.markAsSynced(unsynced.map(t => t.id))
      
      // Apply server changes
      await this.applyServerChanges(data.serverChanges)
      
    } catch (error) {
      console.error('Sync error:', error)
      // Retry with exponential backoff
      this.scheduleRetry()
    } finally {
      this.isSyncing = false
    }
  }
  
  private async getUnsyncedTranslations(): Promise<Translation[]> {
    const result = await db.executeSql(
      'SELECT * FROM translations WHERE is_synced = 0 ORDER BY created_at DESC LIMIT 50'
    )
    return result[0].rows.raw()
  }
  
  private async markAsSynced(ids: string[]) {
    await db.executeSql(
      `UPDATE translations SET is_synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    )
  }
}
```

### 4.4 Hotkey Manager (Desktop Only)

```typescript
// electron/hotkeyManager.js
const { globalShortcut } = require('electron')

class HotkeyManager {
  register(mainWindow) {
    // Register global hotkey
    const ret = globalShortcut.register('CommandOrControl+Shift+T', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })
    
    if (!ret) {
      console.error('Hotkey registration failed')
    }
  }
  
  unregister() {
    globalShortcut.unregisterAll()
  }
}

module.exports = new HotkeyManager()
```

---

## 5. UI COMPONENT ARCHITECTURE

### 5.1 Component Tree
```
App
├── Providers (Zustand, React Query)
├── Navigation
│   ├── MainStack
│   │   ├── TranslationScreen (Primary)
│   │   ├── HistoryScreen
│   │   └── SettingsScreen
│   └── Modal
│       └── TranslationPopup (Desktop overlay)
```

### 5.2 Key Components

#### TranslationPopup (Core Component)
```typescript
// components/TranslationPopup.tsx
import React, { useState, useEffect } from 'react'
import { View, TextInput, TouchableOpacity, Text } from 'react-native'
import { useTranslation } from '../hooks/useTranslation'
import { VoiceButton } from './VoiceButton'

export const TranslationPopup = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const { translate, isLoading } = useTranslation()
  
  const handleTranslate = async () => {
    const result = await translate(input)
    setOutput(result.output)
  }
  
  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input && output) {
        saveToHistory({ input, output })
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [input, output])
  
  return (
    <View className="bg-white rounded-lg shadow-2xl p-6 w-[500px]">
      {/* Input */}
      <View className="mb-4">
        <TextInput
          className="border border-gray-300 rounded p-3 text-base"
          placeholder="Type mixed Vietnamese-English..."
          value={input}
          onChangeText={setInput}
          multiline
          autoFocus
        />
        <VoiceButton onResult={setInput} />
      </View>
      
      {/* Actions */}
      <TouchableOpacity 
        onPress={handleTranslate}
        disabled={isLoading}
        className="bg-blue-600 rounded py-3 mb-4"
      >
        <Text className="text-white text-center font-semibold">
          {isLoading ? 'Translating...' : 'Translate'}
        </Text>
      </TouchableOpacity>
      
      {/* Output */}
      {output && (
        <View className="border border-gray-200 rounded p-3 bg-gray-50">
          <Text className="text-base">{output}</Text>
          <TouchableOpacity 
            onPress={() => Clipboard.setString(output)}
            className="mt-2"
          >
            <Text className="text-blue-600">📋 Copy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
```

---

## 6. PERFORMANCE OPTIMIZATION

### 6.1 Strategies
```typescript
// Performance optimizations
const optimizations = {
  rendering: {
    // Use React.memo for expensive components
    memoization: 'React.memo, useMemo, useCallback',
    
    // Virtualized lists for history
    virtualization: '@shopify/flash-list',
    
    // Debounce search input
    debounce: '300ms',
  },
  
  data: {
    // Paginated history loading
    pagination: '50 items per page',
    
    // Index database for fast queries
    indexes: ['created_at', 'is_synced'],
    
    // Cache frequent translations in memory
    cache: 'LRU cache, max 100 items',
  },
  
  network: {
    // Batch sync requests
    batching: 'Max 50 items per sync',
    
    // Retry with exponential backoff
    retry: '3 attempts: 1s, 4s, 16s',
    
    // Request deduplication
    dedup: 'Cancel duplicate in-flight requests',
  }
}
```

### 6.2 Code Splitting (Desktop)
```typescript
// Lazy load screens
const HistoryScreen = React.lazy(() => import('./screens/HistoryScreen'))
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'))

// Preload on idle
requestIdleCallback(() => {
  import('./screens/HistoryScreen')
  import('./screens/SettingsScreen')
})
```

---

## 7. SECURITY CONSIDERATIONS

### 7.1 Data Protection
- **At Rest**: SQLite database encrypted with SQLCipher
- **In Transit**: TLS 1.3 for all API calls
- **API Keys**: Stored in environment variables, never in code
- **User Data**: Encrypted before cloud sync

### 7.2 API Security
```typescript
// Rate limiting (Edge Function)
const rateLimiter = {
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests'
}

// API key validation
const validateApiKey = (req) => {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== INTERNAL_API_KEY) {
    throw new Error('Unauthorized')
  }
}
```

---

## 8. ERROR HANDLING

### 8.1 Error Types
```typescript
enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // API errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  TRANSLATION_FAILED = 'TRANSLATION_FAILED',
  
  // Database errors
  DB_ERROR = 'DB_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  
  // Voice errors
  VOICE_PERMISSION_DENIED = 'VOICE_PERMISSION_DENIED',
  VOICE_NOT_SUPPORTED = 'VOICE_NOT_SUPPORTED',
}
```

### 8.2 Error Handling Strategy
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking (future: Sentry)
    console.error('Error:', error, errorInfo)
    
    // Show user-friendly message
    this.setState({ hasError: true })
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// Retry mechanism
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(Math.pow(2, i) * 1000) // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## 9. TESTING STRATEGY

### 9.1 Test Pyramid
```
E2E Tests (10%)
  └── Critical user flows
  
Integration Tests (30%)
  └── Component interactions, API calls
  
Unit Tests (60%)
  └── Business logic, utilities
```

### 9.2 Test Coverage Goals
- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Happy path + critical errors

### 9.3 Testing Tools
```json
{
  "unit": "Jest + React Native Testing Library",
  "integration": "Jest + MSW (Mock Service Worker)",
  "e2e": "Detox (mobile) + Playwright (desktop)",
  "performance": "React Native Performance Monitor"
}
```

---

## 10. DEPLOYMENT

### 10.1 Build Process
```bash
# Desktop (Electron)
npm run build:desktop:mac
npm run build:desktop:win

# Mobile
npm run build:ios
npm run build:android
```

### 10.2 Distribution (Internal)
```
Desktop:
  - macOS: .dmg file via internal file server
  - Windows: .exe installer via internal file server
  
Mobile:
  - iOS: TestFlight (internal testing)
  - Android: .apk via internal file server
```

### 10.3 Environment Variables
```bash
# .env.production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
OPENAI_API_KEY=xxx
DEEPGRAM_API_KEY=xxx
SENTRY_DSN=xxx (future)
```

---

## 11. MONITORING & ANALYTICS

### 11.1 Metrics to Track
```typescript
const metrics = {
  performance: {
    translationTime: 'p50, p95, p99',
    appLaunchTime: 'cold start, warm start',
    searchLatency: 'average, p95',
  },
  
  usage: {
    dailyActiveUsers: 'count',
    translationsPerDay: 'average',
    voiceInputUsage: 'percentage',
  },
  
  quality: {
    crashRate: 'crashes per session',
    errorRate: 'errors per 100 requests',
    syncSuccessRate: 'percentage',
  }
}
```

### 11.2 Logging Strategy
```typescript
// Structured logging
logger.info('Translation completed', {
  inputLength: input.length,
  outputLength: output.length,
  duration: processingTime,
  cached: isCached,
})

// Error logging with context
logger.error('Translation failed', {
  error: error.message,
  stack: error.stack,
  input: input.substring(0, 100), // First 100 chars only
  userId: deviceId,
})
```

---

## 12. FUTURE ENHANCEMENTS

### 12.1 Technical Debt
- [ ] Migrate from SQLite to Realm for better performance
- [ ] Implement proper state machine for sync (XState)
- [ ] Add end-to-end encryption for cloud sync
- [ ] Optimize bundle size (code splitting)

### 12.2 Infrastructure
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Add error tracking (Sentry)
- [ ] Implement feature flags (LaunchDarkly)
- [ ] Setup staging environment

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Author**: Engineering Team  
**Status**: Ready for Development