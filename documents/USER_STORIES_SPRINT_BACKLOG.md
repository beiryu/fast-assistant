# User Stories & Sprint Backlog
**QuickTranslate MVP - 4 Sprints (1 Month)**

---

## SPRINT 0: Project Setup (Days 1-2)

### Setup Tasks
- [ ] **SETUP-1**: Initialize React Native project with TypeScript
  - Setup: 4 hours
  - Create project structure
  - Configure NativeWind (Tailwind)
  - Setup Zustand for state management

- [ ] **SETUP-2**: Setup Electron wrapper
  - Setup: 4 hours
  - Configure Electron with React Native Web
  - Setup global shortcut handler
  - Test hotkey functionality

- [ ] **SETUP-3**: Setup backend infrastructure
  - Setup: 3 hours
  - Create Supabase project
  - Configure Edge Functions
  - Setup OpenAI API integration

- [ ] **SETUP-4**: Setup local database
  - Setup: 2 hours
  - Configure SQLite
  - Create initial schema
  - Test CRUD operations

---

## SPRINT 1: Core Translation (Days 3-7)

### Epic 1: Basic Translation Flow

#### 🎯 **US-1.1**: Quick Access Popup
**As a user, I want to open the translator with a hotkey so that I can quickly translate without switching apps.**

**Priority**: P0 (Must Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] Pressing Cmd/Ctrl+Shift+T opens popup overlay
- [ ] Popup appears within 200ms
- [ ] Popup works on top of any application
- [ ] Focus automatically goes to input field
- [ ] Pressing hotkey again closes popup

**Technical Tasks**:
- [ ] Implement Electron global shortcut handler (2h)
- [ ] Create floating overlay component (3h)
- [ ] Add focus management (1h)
- [ ] Test across different apps (2h)

**Definition of Done**:
- [ ] Hotkey registered successfully
- [ ] Popup shows/hides correctly
- [ ] All tests passing
- [ ] Works on Mac and Windows

---

#### 🎯 **US-1.2**: Text Input Field
**As a user, I want to type mixed Vietnamese-English text so that I can get help while practicing.**

**Priority**: P0 (Must Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Input accepts both Vietnamese and English characters
- [ ] Multiline support (up to 10 lines)
- [ ] Auto-resize as user types
- [ ] Character counter shows remaining space
- [ ] Placeholder text is helpful

**Technical Tasks**:
- [ ] Create TextInput component (2h)
- [ ] Add character validation (1h)
- [ ] Implement auto-resize logic (2h)
- [ ] Add character counter (1h)

**Definition of Done**:
- [ ] Input handles mixed languages correctly
- [ ] Auto-resize works smoothly
- [ ] Character limit enforced
- [ ] Component fully tested

---

#### 🎯 **US-1.3**: Translation API Integration
**As a user, I want accurate translations so that I can communicate professionally.**

**Priority**: P0 (Must Have)  
**Story Points**: 8  
**Acceptance Criteria**:
- [ ] Translation completes in <2 seconds (95th percentile)
- [ ] Handles mixed Vi+En input correctly
- [ ] Preserves technical terms (API, meeting, etc.)
- [ ] Shows loading state during translation
- [ ] Error handling with user-friendly messages

**Technical Tasks**:
- [ ] Create Edge Function for translation (4h)
- [ ] Integrate OpenAI GPT-4 API (3h)
- [ ] Add error handling and retries (2h)
- [ ] Implement loading states (1h)
- [ ] Add response caching (2h)
- [ ] Write integration tests (3h)

**Definition of Done**:
- [ ] API returns accurate translations
- [ ] Performance meets SLA (<2s)
- [ ] Error cases handled gracefully
- [ ] Integration tests passing
- [ ] Documented API usage

---

#### 🎯 **US-1.4**: Display Translation Output
**As a user, I want to see the translated text clearly so that I can review before using.**

**Priority**: P0 (Must Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Output displays in read-only box
- [ ] Text is easily readable (good contrast)
- [ ] Supports multiline output
- [ ] Shows when translation is complete
- [ ] Clears when new input entered

**Technical Tasks**:
- [ ] Create output display component (2h)
- [ ] Style for readability (1h)
- [ ] Add clear/reset functionality (1h)
- [ ] Handle long text with scroll (1h)

**Definition of Done**:
- [ ] Output clearly visible
- [ ] Styling consistent with design
- [ ] Reset works correctly
- [ ] Responsive on different screen sizes

---

#### 🎯 **US-1.5**: Copy to Clipboard
**As a user, I want to copy translations with one click so that I can paste quickly into my work.**

**Priority**: P0 (Must Have)  
**Story Points**: 2  
**Acceptance Criteria**:
- [ ] One-click copy button
- [ ] Visual confirmation when copied ("Copied!")
- [ ] Works on all platforms (Mac, Windows)
- [ ] Keyboard shortcut: Cmd/Ctrl+C
- [ ] Clipboard contains only output text

**Technical Tasks**:
- [ ] Implement copy functionality (1h)
- [ ] Add visual feedback (toast) (2h)
- [ ] Add keyboard shortcut (1h)
- [ ] Test on different platforms (1h)

**Definition of Done**:
- [ ] Copy works reliably
- [ ] Feedback is clear
- [ ] Keyboard shortcut works
- [ ] Cross-platform tested

---

## SPRINT 2: Auto-Save & History (Days 8-14)

### Epic 2: Data Persistence

#### 🎯 **US-2.1**: Auto-Save Translations
**As a user, I want my translations automatically saved so that I never lose my work.**

**Priority**: P0 (Must Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] Saves immediately after successful translation

**Technical Tasks**:
- [ ] Create SQLite database schema (2h)
- [ ] Handle edge cases (app crash) (2h)

**Definition of Done**:
- [ ] No data loss on crash
- [ ] Performance not affected
- [ ] Database indexed properly

---

#### 🎯 **US-2.2**: View Translation History
**As a user, I want to see my past translations so that I can reuse common phrases.**

**Priority**: P1 (Should Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] Shows last 50 translations by default
- [ ] Displays input + output
- [ ] Shows timestamp (relative: "2 hours ago")
- [ ] Sorted newest first
- [ ] Infinite scroll loads older items

**Technical Tasks**:
- [ ] Create History screen (3h)
- [ ] Build list component with FlashList (4h)
- [ ] Add timestamp formatting (1h)
- [ ] Implement infinite scroll (3h)
- [ ] Add pull-to-refresh (2h)

**Definition of Done**:
- [ ] List loads quickly (<500ms)
- [ ] Smooth scrolling
- [ ] Timestamps accurate
- [ ] Pull-to-refresh works

---

## SPRINT 3: Voice Input (Days 15-21)

### Epic 3: Voice Recognition

#### 🎯 **US-3.1**: Voice Recording Button
**As a user, I want to click a button to start voice input so that I can translate faster.**

**Priority**: P1 (Should Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Microphone button visible next to input
- [ ] Click to start recording
- [ ] Click again to stop
- [ ] Visual indicator when recording (pulsing red)
- [ ] Auto-stop after 30 seconds

**Technical Tasks**:
- [ ] Create voice button component (2h)
- [ ] Add recording animations (2h)
- [ ] Implement start/stop logic (2h)
- [ ] Add auto-stop timer (1h)

**Definition of Done**:
- [ ] Button clearly indicates state
- [ ] Animations smooth
- [ ] Auto-stop works reliably
- [ ] Accessible design

---

#### 🎯 **US-3.2**: Native Speech Recognition
**As a user, I want accurate Vietnamese voice recognition so that I can speak naturally.**

**Priority**: P1 (Should Have)  
**Story Points**: 8  
**Acceptance Criteria**:
- [ ] Recognizes Vietnamese speech >85% accuracy
- [ ] Works on iOS and Android
- [ ] Real-time transcription displayed
- [ ] Supports English words in Vietnamese speech
- [ ] Error messages if permission denied

**Technical Tasks**:
- [ ] Integrate @react-native-voice/voice (3h)
- [ ] Request microphone permissions (2h)
- [ ] Configure for Vietnamese language (2h)
- [ ] Add real-time transcription display (3h)
- [ ] Handle errors and edge cases (3h)
- [ ] Test on different devices (3h)

**Definition of Done**:
- [ ] Voice input works on iOS/Android
- [ ] Accuracy meets target (85%+)
- [ ] Permissions handled correctly
- [ ] Error states clear to user

---

#### 🎯 **US-3.3**: Voice Transcription Display
**As a user, I want to see my speech transcribed in real-time so that I know it's working.**

**Priority**: P1 (Should Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Text appears as user speaks
- [ ] Updates smoothly (no jarring jumps)
- [ ] Final text replaces input field content
- [ ] User can edit after transcription
- [ ] Clear button to start over

**Technical Tasks**:
- [ ] Create transcription display component (2h)
- [ ] Add smooth update animations (2h)
- [ ] Implement edit mode (1h)
- [ ] Add clear functionality (1h)

**Definition of Done**:
- [ ] Real-time display works
- [ ] Smooth animations
- [ ] Editing works naturally
- [ ] Clear button resets correctly

---

#### 🎯 **US-3.4**: Voice Input Hotkey
**As a user, I want to press a hotkey to start voice input so that I can work hands-free.**

**Priority**: P2 (Nice to Have)  
**Story Points**: 2  
**Acceptance Criteria**:
- [ ] Cmd/Ctrl+Shift+V starts recording
- [ ] Works even when popup not focused
- [ ] Visual feedback when activated
- [ ] Press again to stop
- [ ] Configurable in settings

**Technical Tasks**:
- [ ] Add hotkey registration (2h)
- [ ] Connect to voice service (1h)
- [ ] Add visual feedback (1h)
- [ ] Test reliability (1h)

**Definition of Done**:
- [ ] Hotkey works globally
- [ ] Feedback is clear
- [ ] Toggle works smoothly
- [ ] No conflicts with system hotkeys

---

## SPRINT 4: Polish & Mobile (Days 22-28)

### Epic 4: Mobile Application

#### 🎯 **US-4.1**: Mobile App Layout
**As a user, I want the mobile app to feel native so that it's comfortable to use.**

**Priority**: P1 (Should Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] Full-screen translation interface
- [ ] Navigation between Translation/History tabs
- [ ] Responsive to keyboard (input stays visible)
- [ ] Works in portrait and landscape
- [ ] Native status bar styling

**Technical Tasks**:
- [ ] Create mobile screen layouts (4h)
- [ ] Add tab navigation (2h)
- [ ] Handle keyboard avoidance (2h)
- [ ] Test on different screen sizes (3h)

**Definition of Done**:
- [ ] Layout looks native
- [ ] Navigation smooth
- [ ] Keyboard doesn't hide input
- [ ] Works on all device sizes

---

#### 🎯 **US-4.2**: Share Extension
**As a user, I want to share text from other apps to translate so that I can work within my flow.**

**Priority**: P2 (Nice to Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] Appears in system share menu
- [ ] Pre-fills input with shared text
- [ ] Translates immediately
- [ ] Option to copy result
- [ ] Option to share back to original app

**Technical Tasks**:
- [ ] Create iOS share extension (4h)
- [ ] Create Android intent filter (4h)
- [ ] Implement pre-fill logic (2h)
- [ ] Test with multiple apps (3h)

**Definition of Done**:
- [ ] Share extension works on iOS/Android
- [ ] Pre-fill reliable
- [ ] Share back works
- [ ] Tested with common apps

---

#### 🎯 **US-4.3**: Quick Widget (Mobile)
**As a user, I want a home screen widget so that I can translate even faster.**

**Priority**: P3 (Future)  
**Story Points**: 8  
**Acceptance Criteria**:
- [ ] Small widget on home screen
- [ ] Shows input field
- [ ] Tapping opens full app
- [ ] Recent translation preview
- [ ] Works on iOS and Android

**Technical Tasks**:
- [ ] Create iOS widget (6h)
- [ ] Create Android widget (6h)
- [ ] Add tap-to-open logic (2h)
- [ ] Style widget UI (2h)

**Definition of Done**:
- [ ] Widget installs correctly
- [ ] Opens app on tap
- [ ] Preview shows recent item
- [ ] Performance acceptable

---

### Epic 5: Polish & Quality

#### 🎯 **US-5.1**: Settings Screen
**As a user, I want to customize the app so that it works my way.**

**Priority**: P2 (Nice to Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Can change global hotkey
- [ ] Can change voice language (Vi/En)
- [ ] Can enable/disable auto-save
- [ ] Can clear all history
- [ ] About section with version info

**Technical Tasks**:
- [ ] Create settings screen (3h)
- [ ] Implement hotkey customization (2h)
- [ ] Add language picker (1h)
- [ ] Implement clear history (1h)
- [ ] Add about section (1h)

**Definition of Done**:
- [ ] All settings persist
- [ ] Changes apply immediately
- [ ] Clear history has confirmation
- [ ] Version info accurate

---

#### 🎯 **US-5.2**: Onboarding Flow
**As a new user, I want a quick tutorial so that I know how to use the app.**

**Priority**: P2 (Nice to Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Shows on first launch only
- [ ] 3-4 slides explaining key features
- [ ] Can skip at any time
- [ ] "Don't show again" checkbox
- [ ] Beautiful illustrations

**Technical Tasks**:
- [ ] Create onboarding component (3h)
- [ ] Design slides (2h)
- [ ] Add skip logic (1h)
- [ ] Persist "seen" state (1h)

**Definition of Done**:
- [ ] Shows only on first launch
- [ ] Skip works immediately
- [ ] Don't show again persists
- [ ] Visually appealing

---

#### 🎯 **US-5.3**: Error Handling & Feedback
**As a user, I want clear error messages so that I know what to do when something fails.**

**Priority**: P1 (Should Have)  
**Story Points**: 3  
**Acceptance Criteria**:
- [ ] Network errors show retry option
- [ ] Permission errors explain what's needed
- [ ] Rate limit errors show wait time
- [ ] Sync errors don't block usage
- [ ] All errors dismissible

**Technical Tasks**:
- [ ] Create error UI components (2h)
- [ ] Map error codes to messages (2h)
- [ ] Add retry logic (2h)
- [ ] Test all error scenarios (3h)

**Definition of Done**:
- [ ] All errors have clear messages
- [ ] Retry works when applicable
- [ ] User never blocked completely
- [ ] Error tracking logged

---

#### 🎯 **US-5.4**: Performance Optimization
**As a user, I want the app to be fast so that I stay focused.**

**Priority**: P1 (Should Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] App launches in <2 seconds
- [ ] Translation response in <2 seconds
- [ ] History loads in <500ms
- [ ] Search results in <300ms
- [ ] Smooth 60fps animations

**Technical Tasks**:
- [ ] Profile performance bottlenecks (3h)
- [ ] Optimize database queries (3h)
- [ ] Add proper indexes (1h)
- [ ] Implement request caching (2h)
- [ ] Optimize bundle size (3h)
- [ ] Test on low-end devices (2h)

**Definition of Done**:
- [ ] All SLAs met (95th percentile)
- [ ] No jank in animations
- [ ] Works on 2GB RAM devices
- [ ] Bundle size <50MB

---

#### 🎯 **US-5.5**: Bug Fixes & QA
**As a user, I want a stable app so that it doesn't frustrate me.**

**Priority**: P0 (Must Have)  
**Story Points**: 5  
**Acceptance Criteria**:
- [ ] No crashes in testing
- [ ] All critical bugs fixed
- [ ] Edge cases handled gracefully
- [ ] Works across all supported devices
- [ ] Memory leaks identified and fixed

**Technical Tasks**:
- [ ] Comprehensive testing (8h)
- [ ] Fix identified bugs (8h)
- [ ] Memory profiling (3h)
- [ ] Cross-platform testing (5h)

**Definition of Done**:
- [ ] Zero critical bugs
- [ ] <5 minor bugs
- [ ] Tested on 10+ devices
- [ ] No memory leaks
- [ ] All tests passing

---

## BACKLOG SUMMARY

### Total Story Points by Epic
- **Epic 1: Core Translation**: 21 points
- **Epic 2: Auto-Save & History**: 20 points
- **Epic 3: Voice Input**: 16 points
- **Epic 4: Mobile**: 18 points
- **Epic 5: Polish**: 19 points

**Total MVP**: ~94 story points (~4 weeks with 2 developers)

### Priority Breakdown
- **P0 (Must Have)**: 46 points
- **P1 (Should Have)**: 38 points
- **P2 (Nice to Have)**: 10 points
- **P3 (Future)**: 8 points

---

## VELOCITY TRACKING

| Sprint | Planned Points | Completed Points | Velocity |
|--------|---------------|------------------|----------|
| Sprint 1 | 21 | TBD | TBD |
| Sprint 2 | 20 | TBD | TBD |
| Sprint 3 | 16 | TBD | TBD |
| Sprint 4 | 23 | TBD | TBD |

**Target Velocity**: ~20-25 points per sprint (with 2 developers)

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Product Owner**: [Name]  
**Scrum Master**: [Name]