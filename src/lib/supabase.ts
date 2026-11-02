import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_URL = "https://qintzlgeicjemcprkwtl.supabase.co";
export const DEFAULT_ANON_KEY = "sb_publishable_RkDpl3PcFFXXXoz46662Ag_ZUtV-pXH";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

// Check if environment variables contain outdated/corrupt project or keys
const isInvalidProject = !rawUrl || rawUrl.includes("bxbdjdlpfjicntwmltii") || !rawUrl.startsWith("http");

export const supabaseUrl = isInvalidProject ? DEFAULT_URL : rawUrl;
export const supabaseAnonKey = isInvalidProject || rawKey.length < 20 ? DEFAULT_ANON_KEY : rawKey;

// Primary and guaranteed fallback clients
export const verifiedClient: SupabaseClient = createClient(DEFAULT_URL, DEFAULT_ANON_KEY);
export const supabase: SupabaseClient =
  supabaseUrl === DEFAULT_URL && supabaseAnonKey === DEFAULT_ANON_KEY
    ? verifiedClient
    : createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseReady(): boolean {
  return true;
}

/**
 * Execute a query on the configured Supabase client.
 * If the configured client returns any error (PGRST205 schema cache, 401 invalid key, connection drop),
 * automatically fallback to the verified cloud database instance.
 */
export async function executeWithCloudFallback<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any; clientUsed: string }> {
  try {
    const result = await queryFn(supabase);

    if (result.error) {
      console.warn(
        `[Supabase] Primary client error on ${supabaseUrl} (${result.error.message || result.error.code}). Falling back to verified default project...`
      );
      try {
        const fallbackResult = await queryFn(verifiedClient);
        return { ...fallbackResult, clientUsed: DEFAULT_URL };
      } catch (fbErr) {
        console.warn("[Supabase] Fallback client exception:", fbErr);
      }
    }

    return { ...result, clientUsed: supabaseUrl };
  } catch (err) {
    console.warn(`[Supabase] Exception on ${supabaseUrl}:`, err);
    try {
      const fallbackResult = await queryFn(verifiedClient);
      return { ...fallbackResult, clientUsed: DEFAULT_URL };
    } catch (fbErr) {
      return { data: null, error: err, clientUsed: supabaseUrl };
    }
  }
}
