import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Lazily-initialized Supabase admin client (service role).
 *
 * Uses lazy initialization so the module can be imported during
 * Next.js build without crashing when env vars are not yet available.
 * Throws at first actual usage if the variables are missing.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_supabaseAdmin) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) {
        throw new Error(
          "Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
        );
      }

      _supabaseAdmin = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }

    const value = Reflect.get(_supabaseAdmin, prop, receiver);
    return typeof value === "function" ? value.bind(_supabaseAdmin) : value;
  },
});
