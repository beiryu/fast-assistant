/// <reference types="https://deno.land/x/types/index.d.ts" />

// Deno global type definitions for Supabase Edge Functions
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
    function set(key: string, value: string): void;
    function toObject(): Record<string, string>;
  }
}

// Supabase Edge Functions runtime types
interface SupabaseEdgeFunctionContext {
  req: Request;
}

// Crypto global (Deno has built-in crypto)
declare const crypto: Crypto;

