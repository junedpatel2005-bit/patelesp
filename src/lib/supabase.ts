import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_URL = "https://qintzlgeicjemcprkwtl.supabase.co";
export const DEFAULT_ANON_KEY = "sb_publishable_RkDpl3PcFFXXXoz46662Ag_ZUtV-pXH";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Guard against outdated/mismatched project URL if set on Vercel
export const supabaseUrl =
  rawUrl && rawUrl.startsWith("http") && !rawUrl.includes("bxbdjdlpfjicntwmltii")
    ? rawUrl
    : DEFAULT_URL;

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : DEFAULT_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Fallback client directly pointing to verified working project
export const fallbackSupabase: SupabaseClient =
  supabaseUrl !== DEFAULT_URL ? createClient(DEFAULT_URL, DEFAULT_ANON_KEY) : supabase;

export function isSupabaseReady(): boolean {
  return Boolean(supabase);
}

/**
 * Execute a query on the configured Supabase client.
 * If the configured client returns any error (PGRST205 schema cache, 401 invalid key, connection drop),
 * automatically fallback to the verified cloud database instance.
 */
export async function executeWithCloudFallback<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any; clientUsed: string }> {
  let result = await queryFn(supabase);

  if (result.error && supabaseUrl !== DEFAULT_URL) {
    console.warn(
      `[Supabase] Primary client error on ${supabaseUrl} (${result.error.message || result.error.code}). Falling back to verified project ${DEFAULT_URL}...`
    );
    try {
      const fallbackResult = await queryFn(fallbackSupabase);
      return { ...fallbackResult, clientUsed: DEFAULT_URL };
    } catch (fbErr) {
      console.warn("[Supabase] Fallback client exception:", fbErr);
    }
  }

  return { ...result, clientUsed: supabaseUrl };
}
