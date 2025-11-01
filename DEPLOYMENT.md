# Deployment Guide

Complete deployment procedures, rollback strategies, and post-deployment verification for QuickTranslate.

## 🚀 Deployment Overview

QuickTranslate supports multiple deployment targets:
- **Web**: Static site hosting (Vercel, Netlify, etc.)
- **Desktop**: Native applications (macOS, Windows, Linux)
- **Mobile**: App stores (iOS App Store, Google Play)
- **Backend**: Supabase Edge Functions

---

## 📋 Pre-Deployment Checklist

### Environment Preparation
- [ ] Production environment variables configured
- [ ] API keys verified and active
- [ ] Database schema up to date
- [ ] Edge functions deployed
- [ ] SSL certificates valid
- [ ] Domain/subdomain configured

### Code Quality
- [ ] All tests passing (`make test`)
- [ ] No ESLint errors (`make lint`)
- [ ] TypeScript compilation successful (`make type-check`)
- [ ] Security audit clean (`make security-audit`)
- [ ] Dependencies up to date

### Build Verification
- [ ] Web build successful (`make build-web`)
- [ ] Desktop build successful (`make build-desktop`)
- [ ] Smoke tests passing (`make smoke-test`)

---

## 🌐 Web Deployment

### Vercel (Recommended)

#### First-Time Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Configure environment variables in Vercel dashboard
# Dashboard > Settings > Environment Variables
```

#### Production Deployment
```bash
# Automated deployment
make deploy-prod

# Manual deployment
vercel --prod
```

#### Environment Variables in Vercel
Set these in the Vercel dashboard:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `NODE_ENV=production`

### Alternative Platforms

#### Netlify
```bash
# Build command: npm run build:web
# Publish directory: dist
# Environment variables: Set in dashboard
```

#### AWS S3 + CloudFront
```bash
# Build locally
make build-web

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 🖥️ Desktop Deployment

### Build Process
```bash
# Build all platforms
make build-desktop-all

# Or platform-specific
make build-desktop  # Current platform only
```

### Distribution Strategies

#### 1. Direct Download
- Host installer files on your website
- Users download and install manually
- Simple but requires manual updates

#### 2. Auto-Updater (Recommended)
Configure electron-updater in `electron/main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

// Configure update server
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo'
});

// Check for updates on startup
autoUpdater.checkForUpdatesAndNotify();
```

#### 3. App Store Distribution
- **Mac App Store**: Requires Apple Developer account
- **Microsoft Store**: Requires developer account
- **Snap Store** (Linux): Free distribution

### Signing Certificates

#### macOS Code Signing
```bash
# Development
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Production (requires Apple Developer account)
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
```

#### Windows Code Signing
```bash
# Requires code signing certificate
export WIN_CSC_LINK="path/to/certificate.p12"
export WIN_CSC_KEY_PASSWORD="certificate-password"
```

---

## 📱 Mobile Deployment

### EAS Build & Submit

#### Prerequisites
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project (first time)
eas build:configure
```

#### Build Process
```bash
# Build for production
make build-mobile

# Or manually
eas build --platform ios --profile production
eas build --platform android --profile production
```

#### App Store Submission
```bash
# Submit to stores
make deploy-mobile

# Or manually
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Store Requirements

#### iOS App Store
- Valid Apple Developer account ($99/year)
- App Store Connect configured
- Privacy policy URL
- App review compliance

#### Google Play Store
- Google Play Console account ($25 one-time)
- Signed APK/AAB
- Content rating completed
- Privacy policy URL

---

## 🔧 Backend Deployment (Supabase)

### Edge Functions
```bash
# Deploy translation function
supabase functions deploy translate

# Set environment variables in Supabase dashboard
# Dashboard > Edge Functions > Settings
```

### Database Migrations
```bash
# Apply migrations
supabase db push

# Create new migration
supabase migration new migration_name
```

---

## 🔄 Rollback Procedures

### Web Rollback

#### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote specific deployment
vercel promote [deployment-url] --scope [team]
```

#### Manual Rollback
```bash
# Git rollback
git log --oneline  # Find commit to rollback to
git revert [commit-hash]
git push origin main

# Or reset to previous commit
git reset --hard [commit-hash]
git push --force-with-lease origin main
```

### Desktop Rollback
- Users can reinstall previous version
- Auto-updater can be configured to rollback
- Store downloaded installers for quick distribution

### Mobile Rollback
- iOS: Cannot rollback, must submit new version
- Android: Can disable APK in Play Console, users keep installed version

### Database Rollback
```bash
# Create backup before changes
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Rollback migration
supabase migration revert

# Restore from backup
supabase db reset
psql -f backup_file.sql [connection_string]
```

---

## ✅ Post-Deployment Verification

### Automated Checks
```bash
# Health check script
#!/bin/bash
echo "Checking deployment health..."

# Web app availability
curl -f https://your-app.vercel.app/health || echo "❌ Web app unreachable"

# API functionality
curl -X POST https://your-project.supabase.co/functions/v1/translate \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":"test","inputLanguage":"auto","outputLanguage":"en"}' \
  | jq '.success' || echo "❌ Translation API failed"

echo "✅ Health check completed"
```

### Manual Verification Checklist

#### Web Application
- [ ] App loads correctly
- [ ] Translation functionality works
- [ ] Dark/light mode toggle works
- [ ] Responsive design on mobile
- [ ] Console shows no critical errors

#### Desktop Application
- [ ] App launches without errors
- [ ] Translation functionality works
- [ ] Keyboard shortcuts work
- [ ] Window behavior correct
- [ ] System integration works (notifications, etc.)

#### Mobile Application
- [ ] App installs correctly
- [ ] Core functionality works
- [ ] Performance acceptable
- [ ] No crashes during basic usage
- [ ] Permissions requested appropriately

#### Backend Services
- [ ] Edge functions respond correctly
- [ ] Database operations work
- [ ] Rate limiting functions properly
- [ ] Error handling works
- [ ] Logging captures events

---

## 📊 Monitoring & Alerts

### Recommended Monitoring

#### Web Application
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior tracking

#### API Monitoring
- **Supabase Dashboard**: Built-in monitoring
- **Uptime Robot**: Endpoint availability monitoring
- **DataDog**: Comprehensive monitoring solution

#### Mobile Applications
- **Sentry**: Crash reporting
- **Firebase Analytics**: User engagement
- **App Store Connect**: iOS performance metrics
- **Google Play Console**: Android performance metrics

### Alert Configuration
```javascript
// Example Sentry configuration
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});
```

---

## 🚨 Incident Response

### Severity Levels

#### Critical (P0)
- App completely unavailable
- Data loss or corruption
- Security breach
- **Response Time**: Immediate

#### High (P1)
- Core functionality broken
- Performance severely degraded
- **Response Time**: 1 hour

#### Medium (P2)
- Non-critical features broken
- Performance impact
- **Response Time**: 4 hours

#### Low (P3)
- Minor bugs
- Cosmetic issues
- **Response Time**: Next business day

### Incident Response Process

1. **Detection**: Monitoring alerts or user reports
2. **Assessment**: Determine severity and impact
3. **Response**: Execute appropriate rollback/fix
4. **Communication**: Update users/stakeholders
5. **Resolution**: Implement permanent fix
6. **Post-mortem**: Document lessons learned

### Emergency Contacts
- **Primary**: On-call engineer
- **Secondary**: Engineering manager
- **Infrastructure**: Platform support (Vercel, Supabase)

---

## 📈 Performance Optimization

### Web Performance
- **Bundle Analysis**: `npx expo export --analyze`
- **Code Splitting**: Implement lazy loading
- **CDN**: Use for static assets
- **Caching**: Configure appropriate cache headers

### Desktop Performance
- **Bundle Size**: Exclude unnecessary dependencies
- **Memory Usage**: Monitor with Activity Monitor/Task Manager
- **Startup Time**: Profile and optimize initialization

### Mobile Performance
- **Bundle Size**: Use Hermes JavaScript engine
- **Memory**: Profile with React DevTools
- **Battery**: Monitor CPU/network usage

---

## 📋 Deployment Templates

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: make ci-test
      
      - name: Build
        run: make build-web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Maintainer**: Engineering Team
