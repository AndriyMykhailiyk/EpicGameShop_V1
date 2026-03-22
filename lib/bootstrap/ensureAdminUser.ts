import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

export type EnsureAdminUserOptions = {
  /**
   * When true, updates the password hash from env even if the user already exists.
   * Used by `npm run seed:admin`. Startup bootstrap keeps this false to avoid DB writes every run.
   */
  syncPassword?: boolean;
};

/**
 * Ensures the credentials admin row exists in `public.users` (Supabase).
 * Uses `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` or built-in dev defaults.
 *
 * @param options - Pass `{ syncPassword: true }` to force password re-hash (CLI seed).
 *
 * @example
 * await ensureAdminUser();
 * await ensureAdminUser({ syncPassword: true });
 */
export async function ensureAdminUser(
  options?: EnsureAdminUserOptions,
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      logger.warn("ensureAdminUser skipped: missing Supabase URL or service role key");
      return;
    }

    const email =
      process.env.ADMIN_SEED_EMAIL?.trim() || "admin@epicgame.shop";
    const password =
      process.env.ADMIN_SEED_PASSWORD || "EpicAdmin!2026";
    const syncPassword = options?.syncPassword === true;

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existing, error: findErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      logger.warn("ensureAdminUser lookup failed", {
        message: findErr.message,
        code: findErr.code,
      });
      return;
    }

    if (existing?.id) {
      if (syncPassword) {
        const hash = await bcrypt.hash(password, 10);
        const { error } = await supabase
          .from("users")
          .update({
            password: hash,
            is_admin: true,
            blocked: false,
          })
          .eq("email", email);
        if (error) {
          logger.warn("ensureAdminUser password sync failed", {
            message: error.message,
          });
        } else {
          logger.info("ensureAdminUser: admin password synced");
        }
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({ is_admin: true, blocked: false })
        .eq("email", email);
      if (error) {
        logger.warn("ensureAdminUser flag update failed", {
          message: error.message,
        });
      }
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from("users").insert({
      email,
      password: hash,
      name: "Administrator",
      is_admin: true,
      blocked: false,
    });
    if (error) {
      logger.warn("ensureAdminUser insert failed", {
        message: error.message,
        code: error.code,
      });
      return;
    }
    logger.info("ensureAdminUser: admin account created", { email });
  } catch (err) {
    logger.error("ensureAdminUser unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
