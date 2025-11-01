# QuickTranslate

A cross-platform translation app built with React Native, Expo, and Electron. Translates mixed Vietnamese-English text to natural English using AI.

## 🚀 Features

- **Cross-Platform**: Native mobile (iOS/Android) and desktop (macOS/Windows/Linux) support
- **AI-Powered Translation**: OpenAI GPT-4 integration for natural translations
- **Real-time Translation**: Fast, cached translation with offline storage
- **Modern UI**: Dark/light mode with native platform styling
- **Keyboard Shortcuts**: Cmd/Ctrl+Enter to translate, Cmd/Ctrl+C to copy

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Latest version

### Platform-Specific Requirements

#### For Mobile Development
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio with SDK 33+

#### For Desktop Development
- **Electron**: Included as dependency
- **macOS**: Xcode Command Line Tools
- **Windows**: Visual Studio Build Tools
- **Linux**: Build essentials

#### For Backend/Edge Functions
- **Supabase CLI**: `npm install -g supabase`
- **Docker**: For local Supabase development

---

## 🛠️ Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd fast-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

#### Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
```

#### Required Environment Variables
Edit `.env` with your actual values:

```bash
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI API Key (Required for translation)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get these values:**

1. **Supabase**: 
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Go to Settings > API
   - Copy URL and anon key

2. **OpenAI**:
   - Create account at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys section
   - Create new API key

### 4. Backend Setup (Supabase Edge Functions)

```bash
# Login to Supabase
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Deploy translation function
supabase functions deploy translate

# Set OpenAI API key in Supabase dashboard
# Dashboard > Edge Functions > Settings > Environment Variables
# Add: OPENAI_API_KEY = your-openai-key
```

### 5. Start Development

#### All Platforms
```bash
# Start Expo development server
npm start
```

#### Specific Platforms
```bash
# Mobile
npm run ios        # iOS simulator (macOS only)
npm run android    # Android emulator

# Web
npm run web        # Opens in browser

# Desktop (Electron)
npm run electron:dev   # Opens Electron window
```

---

## 🔧 Common Development Tasks

### Linting & Code Quality
```bash
# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

### Database Management
```bash
# Start local Supabase (requires Docker)
supabase start

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset
```

### Debugging
```bash
# Enable React Native debugging
# Press 'd' in terminal or shake device
# Choose "Debug with Chrome DevTools"

# Electron debugging
# Use built-in DevTools or:
npm run electron:dev
# Then: View > Toggle Developer Tools
```

---

## 🏗️ Production Build Process

### Build Commands

#### Web Build
```bash
# Build web version
npm run build:web

# Output: dist/ directory
# Ready for static hosting (Vercel, Netlify, etc.)
```

#### Desktop Build
```bash
# Build for current platform
npm run build:electron

# Platform-specific builds
npm run build:electron:mac    # macOS (.dmg)
npm run build:electron:win    # Windows (.exe)
npm run build:electron:linux  # Linux (AppImage)

# Output: dist-electron/ directory
```

#### Mobile Build (via EAS)
```bash
# Configure EAS (first time only)
eas login
eas build:configure

# Build for development
eas build --platform ios --profile development
eas build --platform android --profile development

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Build Verification
```bash
# Test web build locally
npx serve dist

# Test desktop build
# Run the generated executable in dist-electron/

# Test mobile build
# Install .apk (Android) or use TestFlight (iOS)
```

---

## 🚀 Production Deployment

### Environment Setup

#### Production Environment Variables
Create `.env.production`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
OPENAI_API_KEY=sk-your-production-openai-key
NODE_ENV=production
```

### Deployment Platforms

#### Web Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or use GitHub integration
# Connect repository at vercel.com
# Auto-deploys on push to main branch
```

#### Desktop Distribution
```bash
# Build all platforms
make build-desktop

# Distribute via:
# - Direct download (host .dmg/.exe files)
# - Auto-updater (electron-updater)
# - App stores (Mac App Store, Microsoft Store)
```

#### Mobile Distribution
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android

# Internal/Beta Distribution
# iOS: TestFlight (automatic with EAS)
# Android: Google Play Internal Testing
```

### Post-Deployment Verification

#### Automated Checks
```bash
# Health check endpoints
curl https://your-app.vercel.app/health

# Translation API test
curl -X POST https://your-project.supabase.co/functions/v1/translate \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world","inputLanguage":"auto","outputLanguage":"en"}'
```

#### Manual Testing Checklist
- [ ] App launches successfully
- [ ] Translation feature works
- [ ] Database persistence works
- [ ] Dark/light mode toggle works
- [ ] Keyboard shortcuts work (desktop)
- [ ] Error handling displays properly

---

## 🛡️ Security Best Practices

### Environment Variables
- ✅ **Never commit** `.env` files to version control
- ✅ Use **different keys** for development/production
- ✅ **Rotate API keys** regularly
- ✅ Use **environment-specific** Supabase projects

### API Security
- ✅ **Row Level Security (RLS)** enabled in Supabase
- ✅ **Rate limiting** on Edge Functions
- ✅ **Input validation** on all user inputs
- ✅ **HTTPS only** in production

### Production Hardening
```bash
# Supabase Security Checklist:
# 1. Enable RLS on all tables
# 2. Set up proper JWT policies
# 3. Configure CORS appropriately  
# 4. Enable audit logging
# 5. Set up monitoring/alerts
```

---

## 🔧 Automated Deployment (Makefile)

### Available Commands
```bash
# Build & Deploy
make deploy-prod          # Full production deployment
make deploy-staging       # Deploy to staging (if configured)

# Build Only
make build               # Build all platforms
make build-web           # Build web only
make build-desktop       # Build desktop only
make build-mobile        # Build mobile (EAS)

# Quality Checks
make test                # Run all tests
make lint                # Run linting
make type-check          # TypeScript checking
make env-check           # Verify environment variables

# Maintenance
make clean               # Clean build artifacts
make deps-update         # Update dependencies
make security-audit      # Security vulnerability check
```

### Production Deployment Workflow
```bash
# The make deploy-prod command runs:
# 1. Environment validation
# 2. Dependency security audit
# 3. Linting and type checking
# 4. Build all platforms
# 5. Run smoke tests
# 6. Deploy to production
# 7. Post-deployment verification
# 8. Slack/email notification (if configured)
```

---

## 🐛 Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables in app
# Add to your code temporarily:
console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
```

#### Build Failures
```bash
# Clear caches
npm run clean
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo r -c

# Clear Metro cache
npx expo start --clear
```

#### Supabase Connection Issues
```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Check Edge Function logs
supabase functions logs translate
```

#### Electron Build Issues
```bash
# macOS code signing issues
# Disable signing for development:
# In electron-builder.config.js, add:
# mac: { identity: null }

# Windows build on macOS
# Use GitHub Actions or Windows VM
```

### Performance Issues
```bash
# Bundle analysis
npx expo export --dump-sourcemap
npx expo export --analyze

# Memory leaks
# Use React DevTools Profiler
# Check for large cached objects
```

---

## 📁 Project Structure

```
fast-assistant/
├── app/                          # Expo Router pages
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation
│   │   └── index.tsx            # Main screen
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   ├── TranslationPopup.tsx     # Main app component
│   └── ...
├── lib/                         # Business logic
│   ├── translationEngine.ts    # Core translation logic
│   ├── database.ts              # SQLite operations
│   ├── supabase.ts              # Supabase client
│   └── types.ts                 # TypeScript definitions
├── stores/                      # State management (Zustand)
├── hooks/                       # Custom React hooks
├── constants/                   # App constants & themes
├── assets/                      # Images, fonts, etc.
├── electron/                    # Electron main process
├── supabase/                    # Supabase configuration
│   ├── functions/               # Edge Functions
│   └── config.toml              # Local development config
├── dist/                        # Web build output
├── dist-electron/               # Desktop build output
└── docs/                        # Documentation
```

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `make test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Create Pull Request

### Code Style
- Follow existing TypeScript/React patterns
- Use ESLint configuration provided
- Add JSDoc comments for public APIs
- Write tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🆘 Support

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)

### Getting Help
- Create an issue in this repository
- Check existing issues for solutions
- Join the [Expo Discord](https://discord.gg/4gtbPAdpaE)

---

**Built with ❤️ using React Native, Expo, and Electron**
