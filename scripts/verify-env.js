#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Validates that all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required environment variables
const requiredVars = [
  {
    name: 'EXPO_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://your-project-ref.supabase.co',
    validation: (value) => value && value.startsWith('https://') && value.includes('supabase.co')
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    validation: (value) => value && value.length > 100
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API key for translation',
    example: 'sk-your-openai-api-key-here',
    validation: (value) => value && value.startsWith('sk-')
  }
];

// Optional environment variables
const optionalVars = [
  {
    name: 'NODE_ENV',
    description: 'Environment mode',
    example: 'development | production | test'
  },
  {
    name: 'SENTRY_DSN',
    description: 'Sentry error tracking DSN',
    example: 'https://your-dsn.ingest.sentry.io/project-id'
  }
];

function loadEnvironment() {
  // Try to load .env file
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    // Set environment variables
    Object.assign(process.env, envVars);
  }
}

function formatValue(value) {
  if (!value) return `${colors.red}Not set${colors.reset}`;
  
  // Show first 10 characters + ellipsis for security
  const displayValue = value.length > 10 ? `${value.substring(0, 10)}...` : value;
  return `${colors.cyan}${displayValue}${colors.reset}`;
}

function checkVariable(varConfig) {
  const value = process.env[varConfig.name];
  const exists = !!value;
  const valid = exists && varConfig.validation ? varConfig.validation(value) : exists;
  
  const status = valid ? `${colors.green}✅` : `${colors.red}❌`;
  const statusText = valid ? 'Valid' : 'Invalid/Missing';
  
  console.log(`${status} ${varConfig.name}: ${formatValue(value)} (${statusText})${colors.reset}`);
  
  if (!exists) {
    console.log(`   ${colors.yellow}Description: ${varConfig.description}${colors.reset}`);
    console.log(`   ${colors.yellow}Example: ${varConfig.example}${colors.reset}`);
  } else if (exists && varConfig.validation && !varConfig.validation(value)) {
    console.log(`   ${colors.red}Validation failed: ${varConfig.description}${colors.reset}`);
    console.log(`   ${colors.yellow}Expected format: ${varConfig.example}${colors.reset}`);
  }
  
  return valid;
}

async function testSupabaseConnection() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  
  try {
    // Test basic connection to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testTranslationAPI() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  
  try {
    // Test translation Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: 'hello world',
        inputLanguage: 'auto',
        outputLanguage: 'en'
      })
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log(`${colors.blue}🔍 QuickTranslate Environment Verification${colors.reset}\n`);
  
  // Load environment from .env file
  loadEnvironment();
  
  // Check if .env file exists
  const envExists = fs.existsSync(path.join(process.cwd(), '.env'));
  console.log(`Environment file (.env): ${envExists ? `${colors.green}✅ Found` : `${colors.red}❌ Missing`}${colors.reset}`);
  
  if (!envExists) {
    console.log(`${colors.yellow}💡 Create .env file from .env.example template${colors.reset}\n`);
  }
  
  console.log(`\n${colors.blue}Required Variables:${colors.reset}`);
  let allRequiredValid = true;
  for (const varConfig of requiredVars) {
    const isValid = checkVariable(varConfig);
    if (!isValid) allRequiredValid = false;
  }
  
  console.log(`\n${colors.blue}Optional Variables:${colors.reset}`);
  for (const varConfig of optionalVars) {
    checkVariable(varConfig);
  }
  
  // Test connections
  console.log(`\n${colors.blue}Connection Tests:${colors.reset}`);
  
  if (allRequiredValid) {
    console.log('Testing Supabase connection...');
    const supabaseOk = await testSupabaseConnection();
    console.log(`${supabaseOk ? `${colors.green}✅` : `${colors.red}❌`} Supabase: ${supabaseOk ? 'Connected' : 'Connection failed'}${colors.reset}`);
    
    console.log('Testing translation API...');
    const translationOk = await testTranslationAPI();
    console.log(`${translationOk ? `${colors.green}✅` : `${colors.red}❌`} Translation API: ${translationOk ? 'Working' : 'Failed (check OPENAI_API_KEY in Supabase dashboard)'}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Skipping connection tests (missing required variables)${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  if (allRequiredValid) {
    console.log(`${colors.green}✅ Environment configuration is valid${colors.reset}`);
    console.log(`${colors.green}Ready to run: npm start${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Environment configuration has issues${colors.reset}`);
    console.log(`${colors.yellow}Please fix the missing/invalid variables above${colors.reset}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
  process.exit(1);
});
