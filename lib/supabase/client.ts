import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ Зберігати сесію
    autoRefreshToken: true, // ✅ Автооновлення токена
    detectSessionInUrl: true, // ✅ Визначати сесію з URL
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // ✅ Використовувати localStorage
  }
});