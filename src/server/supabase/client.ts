import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logEvent } from "../logging";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    logEvent(
      "rawn_supabase_missing_config",
      { hasUrl: Boolean(url), hasKey: Boolean(serviceKey) },
      "warn"
    );
    return null;
  }

  supabaseClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Rawn-Client": "server",
      },
    },
  });

  return supabaseClient;
}
