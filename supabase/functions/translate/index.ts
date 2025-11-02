// Supabase Edge Function for Translation
// This file should be deployed to Supabase Edge Functions
// To deploy: supabase functions deploy translate
// Note: This file runs on Deno runtime, not Node.js
// TypeScript errors here are expected when using Node.js TypeScript compiler
// This file is excluded from main tsconfig.json and should use Deno for type checking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || '',
});

interface TranslateRequest {
  input: string;
  inputLanguage?: string;
  outputLanguage?: string;
  tone?: string;
}

serve(async (req) => {
  const startTime = Date.now();

  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const body: TranslateRequest = await req.json();
    const { input, inputLanguage = 'auto', outputLanguage = 'en' } = body;
    
    // Note: inputLanguage and outputLanguage reserved for future use
    // Currently always translates to English
    void inputLanguage;
    void outputLanguage;

    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Input text is required',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Rate limiting check (future implementation)
    // await checkRateLimit(userId);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate mixed Vietnamese-English text to natural, professional English. Preserve proper nouns and technical terms. Output ONLY the translation, no explanations.`,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      temperature: 0.3, // Low temp for consistency
      max_tokens: 500,
    });

    const output = completion.choices[0].message.content || '';
    const processingTime = Date.now() - startTime;

    // Simple language detection (can be improved)
    const detectedLanguages = detectLanguages(input);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          output,
          detectedLanguages,
          confidence: 0.95,
          processingTime,
        },
        meta: {
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Translation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Translation failed',
        },
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function detectLanguages(input: string): string[] {
  const languages: string[] = [];
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(input);
  const hasEnglish = /[a-z]/i.test(input);

  if (hasVietnamese) languages.push('vi');
  if (hasEnglish) languages.push('en');

  return languages.length > 0 ? languages : ['unknown'];
}

