import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://qintzlgeicjemcprkwtl.supabase.co";
const DEFAULT_ANON_KEY = "sb_publishable_RkDpl3PcFFXXXoz46662Ag_ZUtV-pXH";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : DEFAULT_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : DEFAULT_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseReady(): boolean {
  return Boolean(supabase);
}
