# Environment Configuration Guide

Complete guide for configuring environment variables, security best practices, and environment-specific settings for QuickTranslate.

## 🔐 Environment Variables

### Required Variables

#### Supabase Configuration
```bash
# Supabase Project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anonymous Key
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the URL and anon (public) key

#### OpenAI Configuration
```bash
# OpenAI API Key (for Edge Functions)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get this value:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-`)

### Optional Variables

#### Development
```bash
# Environment marker
NODE_ENV=development

# Debug logging
DEBUG=true

# Local Supabase (when running locally)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

#### Production
```bash
# Environment marker
NODE_ENV=production

# Sentry DSN (error tracking)
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id

# Analytics tracking ID
ANALYTICS_ID=your-analytics-id
```

---

## 📁 Environment Files

### File Structure
```
project-root/
├── .env                    # Default environment (gitignored)
├── .env.local             # Local overrides (gitignored)
├── .env.example           # Template file (committed)
├── .env.production        # Production template (committed)
└── .env.test              # Test environment (committed)
```

### Environment File Priority
1. `.env.local` (highest priority)
2. `.env.production` / `.env.development` / `.env.test`
3. `.env` (lowest priority)

### Creating Environment Files

#### Development Setup
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

#### Production Setup
```bash
# Copy production template  
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

---

## 🛡️ Security Best Practices

### API Key Security

#### ✅ Do's
- **Use different keys** for development/staging/production
- **Rotate keys regularly** (quarterly recommended)
- **Use environment variables** never hardcode keys
- **Set API key restrictions** in provider dashboards
- **Monitor API usage** for unusual activity
- **Use least privilege** principle for permissions

#### ❌ Don'ts
- **Never commit** `.env` files to version control
- **Never share** API keys in chat/email
- **Never use production keys** in development
- **Never log** API keys in console output
- **Never store keys** in client-side code

### Environment Variable Validation
```typescript
// lib/env.ts - Environment validation
export const validateEnvironment = () => {
  const required = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

### Key Rotation Process

#### Supabase Keys
1. Generate new anon key in Supabase dashboard
2. Update environment variables in all environments
3. Deploy applications with new keys
4. Verify functionality
5. Revoke old keys (after grace period)

#### OpenAI Keys
1. Create new API key in OpenAI dashboard
2. Update Supabase Edge Function environment
3. Update local development environment
4. Test translation functionality
5. Delete old API key

---

## 🔧 Platform-Specific Configuration

### Web (Expo/React Native Web)
```bash
# Expo public variables (available in client)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private variables (server-side only)
OPENAI_API_KEY=sk-your-openai-key
```

### Desktop (Electron)
Electron can access Node.js environment variables:
```javascript
// electron/main.js
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const openaiKey = process.env.OPENAI_API_KEY; // Available in main process
```

### Mobile (iOS/Android)
Environment variables are bundled at build time:
```bash
# EAS Build environment variables
# Set in eas.json or EAS Secrets
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co"
      }
    }
  }
}
```

---

## 🌍 Environment-Specific Configurations

### Development Environment

#### Local Supabase Setup
```bash
# Start local Supabase
supabase start

# Get local credentials
supabase status

# Use in .env.local
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

#### Development Features
```bash
# Enable debug logging
DEBUG=true

# Skip API rate limiting
SKIP_RATE_LIMIT=true

# Use test OpenAI key (with lower rate limits)
OPENAI_API_KEY=sk-test-key-here
```

### Staging Environment

#### Configuration
```bash
# Use staging Supabase project
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key

# Use staging OpenAI key
OPENAI_API_KEY=sk-staging-key-here

# Enable verbose logging
LOG_LEVEL=debug

# Staging identifier
NODE_ENV=staging
```

### Production Environment

#### Configuration
```bash
# Production Supabase project
EXPO_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=production-anon-key

# Production OpenAI key
OPENAI_API_KEY=sk-production-key-here

# Production settings
NODE_ENV=production
LOG_LEVEL=error

# Error tracking
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
```

---

## 🏗️ Deployment Platform Configuration

### Vercel Environment Variables

#### Dashboard Configuration
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with appropriate scope

#### Vercel CLI Configuration
```bash
# Set environment variable
vercel env add EXPO_PUBLIC_SUPABASE_URL production

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm EXPO_PUBLIC_SUPABASE_URL production
```

### EAS (Expo Application Services)

#### EAS Secrets
```bash
# Set secret for builds
eas secret:create --scope project --name OPENAI_API_KEY --value sk-your-key

# List secrets
eas secret:list

# Delete secret
eas secret:delete --scope project --name OPENAI_API_KEY
```

#### EAS Build Configuration
```json
// eas.json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://dev-project.supabase.co"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://prod-project.supabase.co"
      }
    }
  }
}
```

### GitHub Actions Secrets

#### Repository Secrets
1. Go to GitHub repository
2. Settings > Secrets and variables > Actions
3. Add repository secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `OPENAI_API_KEY`
   - `SENTRY_DSN`

#### Usage in Workflows
```yaml
# .github/workflows/deploy.yml
env:
  EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## 🧪 Testing Environment Variables

### Test Configuration
```bash
# .env.test
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
OPENAI_API_KEY=sk-test-key
NODE_ENV=test
```

### Mock Environment for Tests
```typescript
// tests/setup.ts
import { validateEnvironment } from '../lib/env';

// Mock environment variables for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'sk-test-key';

// Validate before running tests
validateEnvironment();
```

---

## 🔍 Environment Debugging

### Verification Script
```typescript
// scripts/verify-env.ts
const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

console.log('🔍 Environment Variable Check\n');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    `${value.substring(0, 10)}...` : 
    'Not set';
  
  console.log(`${status} ${varName}: ${displayValue}`);
});

// Test Supabase connection
import { supabase } from '../lib/supabase';
supabase.from('translations').select('count', { count: 'exact' })
  .then(({ error }) => {
    console.log(error ? '❌ Supabase: Connection failed' : '✅ Supabase: Connected');
  });
```

### Common Environment Issues

#### Issue: Environment variables not loading
```bash
# Check if .env file exists
ls -la .env

# Check file permissions
chmod 644 .env

# Verify file format (no spaces around =)
cat .env | grep -E '^[A-Z_]+=.*$'
```

#### Issue: Variables not available in client
```javascript
// Only EXPO_PUBLIC_* variables are available in client
console.log(process.env.EXPO_PUBLIC_SUPABASE_URL); // ✅ Available
console.log(process.env.OPENAI_API_KEY); // ❌ Not available (server-only)
```

#### Issue: Different values in different environments
```bash
# Check which .env file is being loaded
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Environment file priority: .env.local > .env.production > .env');
```

---

## 📋 Environment Checklist

### Development Setup
- [ ] `.env` file created from template
- [ ] All required variables set
- [ ] Supabase connection working
- [ ] OpenAI API key valid
- [ ] Local development server starts

### Production Setup
- [ ] Production environment variables configured
- [ ] Different keys used than development
- [ ] API key restrictions configured
- [ ] Monitoring/error tracking configured
- [ ] Environment validation passes

### Security Audit
- [ ] No API keys in code commits
- [ ] `.env` files in `.gitignore`
- [ ] API keys rotated recently
- [ ] Access logs reviewed
- [ ] Rate limiting configured

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Maintainer**: Engineering Team
