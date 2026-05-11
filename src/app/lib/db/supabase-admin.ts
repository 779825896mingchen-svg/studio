import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

function readSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url: url.trim(), serviceRoleKey: serviceRoleKey.trim() };
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const { url, serviceRoleKey } = readSupabaseConfig();
  if (!url || !serviceRoleKey) {
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

