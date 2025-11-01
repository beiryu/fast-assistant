# Product Requirements Document (PRD)
**QuickTranslate - Mixed Language Translation Tool**

---

## 1. OVERVIEW

### 1.1 Product Vision
A seamless, cross-platform translation tool that helps Vietnamese professionals communicate naturally with international clients by supporting mixed Vietnamese-English input and providing natural English output.

### 1.2 Problem Statement
Vietnamese professionals lose focus and productivity when communicating with international clients due to:
- Constant context switching between multiple translation tools
- Loss of conversation history and learning progress
- Unnatural translation output
- Time-consuming workflow interruptions
- Lack of support for mixed-language input (Vi+En in same sentence)

### 1.3 Success Metrics
- **Primary**: Time to translate reduced by 70% (from ~30s to <10s)
- **Secondary**: User completes 50+ translations in first week
- **Tertiary**: 80%+ user satisfaction with translation quality

---

## 2. TARGET USERS

### Primary Persona: "Mai - The Busy Account Manager"
- **Role**: Account Manager at tech company
- **Age**: 25-35
- **English Level**: Intermediate (can read well, struggle with writing)
- **Pain**: Spends 30-40% of workday switching between Google Translate and work tools
- **Goal**: Respond to clients quickly with natural English
- **Platforms**: MacBook (work), iPhone (mobile)

---

## 3. MVP SCOPE

### 3.1 In Scope ✅
1. **Desktop Application** (Windows + macOS)
   - Global hotkey popup (Cmd/Ctrl+Shift+T)
   - Mixed Vietnamese-English input support
   - Natural English translation output
   - Voice input with native speech recognition
   - Auto-save translation history (local-first)
   - Simple history view with search
   - Copy to clipboard

2. **Mobile Application** (iOS + Android)
   - Same core features as desktop
   - System-wide share extension
   - Quick widget access

### 3.2 Out of Scope ❌ (Post-MVP)
- Context-aware tone adjustment (formal/casual)
- Grammar correction suggestions
- Team collaboration features
- Browser extension
- Web version
- Custom vocabulary/dictionary
- Offline translation
- Multiple output language options

### 3.3 Technical Constraints
- **Internal use only** (no app store deployment for MVP)
- **Local-first architecture** (works offline, sync when online)
- **No localStorage/sessionStorage** in web components
- **Maximum translation time**: <2 seconds
- **Supported languages**: Vietnamese + English input → English output only

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Core Translation Flow

#### FR-1: Quick Access Popup
**Priority**: P0 (Must Have)
- **Trigger**: Global hotkey (Cmd/Ctrl+Shift+T)
- **Behavior**: 
  - Floating overlay appears on top of any application
  - Focus automatically on input field
  - Draggable window position
  - Remembers last position
- **Acceptance Criteria**:
  - Popup appears within 200ms of hotkey press
  - Works across all applications (not just browser)
  - Doesn't interfere with system hotkeys

#### FR-2: Mixed Language Input
**Priority**: P0 (Must Have)
- **Input Support**:
  - Pure Vietnamese: "Tôi muốn hỏi về dự án"
  - Pure English: "I want to ask about the project"
  - Mixed: "Tôi muốn confirm về meeting tomorrow"
- **Behavior**:
  - Auto-detect language mix
  - Preserve English words/phrases that are already correct
  - Translate Vietnamese parts to natural English
- **Acceptance Criteria**:
  - Correctly identifies and translates mixed input 90%+ accuracy
  - Preserves technical terms (API, database, meeting, etc.)

#### FR-3: Translation Output
**Priority**: P0 (Must Have)
- **Output Quality**:
  - Natural, conversational English
  - Professional tone (default)
  - Grammatically correct
- **Display**:
  - Read-only output box
  - One-click copy button
  - Visual feedback on copy success
- **Acceptance Criteria**:
  - Translation completes in <2 seconds
  - Output is different from direct Google Translate
  - 80%+ user satisfaction rating

#### FR-4: Voice Input
**Priority**: P1 (Should Have)
- **Activation**: Microphone button or hotkey (Cmd/Ctrl+Shift+V)
- **Technology**: 
  - Primary: Native speech recognition (iOS Speech Framework, Android SpeechRecognizer)
  - Fallback: Deepgram API (if native confidence <80%)
- **Behavior**:
  - Real-time transcription display
  - Support both Vietnamese and English speech
  - Auto-detect language
  - Stop recording: click again or auto-stop after 30s
- **Acceptance Criteria**:
  - Voice transcription accuracy >85%
  - Works in quiet environment
  - Clear visual indicator of recording state

#### FR-5: Auto-Save History
**Priority**: P0 (Must Have)
- **Save Triggers**:
  1. Immediately after successful translation
  2. On copy to clipboard
  3. Every 3 seconds while typing (debounced)
  4. On app minimize/background
- **Data Saved**:
  - Input text (mixed language)
  - Output text (English)
  - Timestamp
  - Device ID
  - Sync status
- **Storage**:
  - Local SQLite database (primary)
  - Cloud sync in background (secondary)
- **Acceptance Criteria**:
  - Zero data loss on app crash
  - History available immediately on reopen
  - Sync completes within 5s when online

#### FR-6: History View
**Priority**: P1 (Should Have)
- **Display**:
  - Chronological list (newest first)
  - Show input + output preview (first 50 chars)
  - Timestamp (relative: "2 hours ago")
- **Actions**:
  - Click to view full text
  - Copy input or output
  - Delete individual item
- **Search**:
  - Real-time search in both input/output
  - Search as you type (debounced 300ms)
- **Acceptance Criteria**:
  - Load first 50 items in <500ms
  - Search results appear in <300ms
  - Smooth infinite scroll for older items

### 4.2 Desktop-Specific Features

#### FR-7: Global Hotkey
**Priority**: P0 (Must Have)
- **Default**: Cmd/Ctrl+Shift+T
- **Customizable**: User can change in settings
- **Behavior**: Works system-wide, even when app is in background
- **Acceptance Criteria**:
  - Hotkey works in 100% of applications
  - No conflict with common app shortcuts

#### FR-8: System Tray Integration
**Priority**: P1 (Should Have)
- **Icon**: Always visible in system tray/menu bar
- **Menu Options**:
  - Show/Hide window
  - Open history
  - Settings
  - Quit
- **Acceptance Criteria**:
  - App continues running when window closed
  - Can reopen from tray

### 4.3 Mobile-Specific Features

#### FR-9: Share Extension
**Priority**: P1 (Should Have)
- **Trigger**: System share menu from any app
- **Behavior**: 
  - Pre-fill input with shared text
  - Translate immediately
  - Option to copy or share back
- **Acceptance Criteria**:
  - Available in share menu of all apps
  - Pre-fills text correctly

#### FR-10: Home Screen Widget
**Priority**: P2 (Nice to Have)
- **Display**: Quick input field on home screen
- **Action**: Opens app with focus on input
- **Acceptance Criteria**:
  - Widget loads in <1s
  - Tapping opens app instantly

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance
- **NFR-1**: App launch time <2 seconds (cold start)
- **NFR-2**: Translation response time <2 seconds (95th percentile)
- **NFR-3**: Voice transcription latency <500ms (real-time feel)
- **NFR-4**: History search results <300ms
- **NFR-5**: Memory usage <150MB (desktop), <100MB (mobile)

### 5.2 Reliability
- **NFR-6**: App uptime 99.9% (excluding planned maintenance)
- **NFR-7**: Zero data loss on crash (auto-save)
- **NFR-8**: Graceful degradation when offline
- **NFR-9**: Auto-retry failed sync (max 3 attempts with exponential backoff)

### 5.3 Usability
- **NFR-10**: New user can complete first translation within 30 seconds
- **NFR-11**: Maximum 2 clicks/taps for any core action
- **NFR-12**: Keyboard shortcuts for all primary actions
- **NFR-13**: Responsive UI (60fps animations)

### 5.4 Security & Privacy
- **NFR-14**: All data encrypted at rest (AES-256)
- **NFR-15**: Encrypted communication with backend (TLS 1.3)
- **NFR-16**: No analytics/tracking without explicit consent
- **NFR-17**: User can delete all history (GDPR compliance)

### 5.5 Compatibility
- **NFR-18**: Desktop: Windows 10+, macOS 11+
- **NFR-19**: Mobile: iOS 14+, Android 8+
- **NFR-20**: Works on devices with minimum 2GB RAM

---

## 6. USER STORIES

### Epic 1: Quick Translation
**US-1.1**: As a user, I want to open the translator with a hotkey so that I don't lose focus from my current task.
- **Acceptance**: Popup appears within 200ms of pressing Cmd+Shift+T

**US-1.2**: As a user, I want to type mixed Vietnamese-English so that I can practice while getting help.
- **Acceptance**: "Tôi cần confirm meeting tomorrow" → "I need to confirm the meeting tomorrow"

**US-1.3**: As a user, I want to copy the translation with one click so that I can paste it quickly.
- **Acceptance**: Click copy button, see "Copied!" confirmation

### Epic 2: Voice Input
**US-2.1**: As a user, I want to speak instead of typing so that I can work faster.
- **Acceptance**: Click mic, speak, see text appear in real-time

**US-2.2**: As a user, I want accurate Vietnamese speech recognition so that voice input is reliable.
- **Acceptance**: Vietnamese phrases transcribed with >85% accuracy

### Epic 3: History & Learning
**US-3.1**: As a user, I want my translations auto-saved so that I never lose my work.
- **Acceptance**: Translation saved automatically, no manual save needed

**US-3.2**: As a user, I want to search my history so that I can reuse common phrases.
- **Acceptance**: Type in search, see matching results instantly

**US-3.3**: As a user, I want to see recent translations so that I can track my progress.
- **Acceptance**: Open history, see chronological list

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Technology Stack
```
Frontend:
- React Native 0.73+ (iOS, Android)
- React Native Web (Desktop via Electron)
- TypeScript
- Tailwind via NativeWind

Desktop Wrapper:
- Electron 28+
- electron-globalshortcut (hotkey)
- electron-store (settings)

Backend:
- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (API wrapper)

APIs:
- OpenAI GPT-4 (translation)
- Native Speech Recognition (primary voice)
- Deepgram (fallback voice)

Local Storage:
- SQLite (react-native-sqlite-storage)
- AsyncStorage (settings)
```

### 7.2 Data Flow
```
User Input → Local Validation → API Call → Response → Auto-save Local → Sync Cloud (background)
```

### 7.3 Offline Support
- All translations saved locally first
- Queue failed API calls for retry
- Show cached history immediately
- Sync when connection restored

---

## 8. UI/UX SPECIFICATIONS

### 8.1 Design Principles
1. **Speed First**: Every action <2 seconds
2. **Zero Friction**: Maximum 2 clicks/taps for any task
3. **Invisible**: Popup when needed, hidden when not
4. **Forgiving**: Auto-save everything, undo anything

### 8.2 Key Screens
1. **Translation Popup** (Primary)
2. **History List** (Secondary)
3. **Settings** (Tertiary)

### 8.3 Interaction Patterns
- **Keyboard-first**: All actions have shortcuts
- **Progressive disclosure**: Show advanced options only when needed
- **Instant feedback**: Visual confirmation for every action
- **Error recovery**: Clear error messages with actionable fixes

---

## 9. RELEASE PLAN

### Phase 1: MVP (Month 1)
**Week 1-2**: Desktop core features
- Translation popup with hotkey
- Mixed language support
- Auto-save to local DB

**Week 3**: Voice + History
- Voice input (native speech)
- History view with search

**Week 4**: Polish + Internal Beta
- Bug fixes
- Performance optimization
- Deploy to internal users (5-10 people)

### Phase 2: Mobile (Month 2)
**Week 5-6**: Mobile app
- Port React Native to iOS/Android
- Share extension
- Basic testing

**Week 7-8**: Cross-platform sync
- Cloud sync implementation
- Conflict resolution
- Full QA testing

### Phase 3: Refinement (Month 3)
- User feedback incorporation
- Performance optimization
- Deepgram fallback integration
- Documentation

---

## 10. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Native speech accuracy too low | High | Medium | Implement Deepgram fallback |
| Electron app too slow | High | Low | Optimize React Native Web, consider Tauri |
| API costs too high | Medium | Medium | Cache common phrases, rate limiting |
| Cross-platform bugs | Medium | High | Extensive testing, staged rollout |
| User adoption low | High | Medium | Onboarding tutorial, clear value prop |

---

## 11. OPEN QUESTIONS

1. **Translation API**: OpenAI GPT-4 vs Claude vs Google Translate API?
   - Recommendation: Start with OpenAI (best quality), measure cost
   
2. **Cloud sync frequency**: Real-time vs batched (every 5 min)?
   - Recommendation: Batched to save battery/data

3. **History retention**: Keep all history or auto-delete after 90 days?
   - Recommendation: Keep all, add manual cleanup option

4. **Voice recording limit**: 30s vs 60s vs unlimited?
   - Recommendation: 30s (covers 95% of use cases)

---

## 12. APPENDIX

### 12.1 Glossary
- **Mixed Language**: Text containing both Vietnamese and English words
- **Natural Translation**: Output that sounds like a native speaker wrote it
- **Local-first**: Data saved on device before syncing to cloud
- **Global Hotkey**: Keyboard shortcut that works across all applications

### 12.2 References
- React Native Documentation: https://reactnative.dev
- Electron Documentation: https://electronjs.org
- Supabase Documentation: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Author**: Product Team  
**Reviewers**: Engineering Team, Design Team