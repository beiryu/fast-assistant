# Supabase Edge Functions

This directory contains Edge Functions that should be deployed to Supabase.

## Setup

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref <your-project-ref>`

## Deploy Functions

```bash
# Deploy translate function
supabase functions deploy translate

# Deploy all functions
supabase functions deploy
```

## Environment Variables

Set these in Supabase Dashboard > Edge Functions > Settings:

- `OPENAI_API_KEY`: Your OpenAI API key

## Local Development

```bash
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve translate --env-file .env
```

## Functions

### translate

Translates mixed Vietnamese-English text to natural English using OpenAI GPT-4.

**Request:**
```json
{
  "input": "Tôi muốn confirm về meeting tomorrow",
  "inputLanguage": "auto",
  "outputLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": "I would like to confirm the meeting tomorrow",
    "detectedLanguages": ["vi", "en"],
    "confidence": 0.95,
    "processingTime": 1250
  }
}
```

