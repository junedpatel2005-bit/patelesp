import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_URL = "https://qintzlgeicjemcprkwtl.supabase.co";
export const DEFAULT_ANON_KEY = "sb_publishable_RkDpl3PcFFXXXoz46662Ag_ZUtV-pXH";

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
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
 * If the configured client returns a schema cache / table not found error (PGRST205),
 * automatically fallback to the verified cloud database instance.
 */
export async function executeWithCloudFallback<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any; clientUsed: string }> {
  let result = await queryFn(supabase);

  const isSchemaCacheError =
    result.error &&
    (result.error.code === "PGRST205" ||
      (result.error.message && result.error.message.toLowerCase().includes("schema cache")));

  if (isSchemaCacheError && supabaseUrl !== DEFAULT_URL) {
    console.warn(
      `[Supabase] Schema cache error on ${supabaseUrl}. Falling back to default project ${DEFAULT_URL}...`
    );
    const fallbackResult = await queryFn(fallbackSupabase);
    return { ...fallbackResult, clientUsed: DEFAULT_URL };
  }

  return { ...result, clientUsed: supabaseUrl };
}
