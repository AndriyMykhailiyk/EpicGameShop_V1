import { z } from "zod";

/**
 * Returns a value safe for `orders.user_id` (FK to `public.users.id`, UUID only).
 * OAuth sessions often expose a provider subject string, which is not a UUID and
 * would cause the insert to fail; in that case we return `null` so the order is
 * still stored and linked by `email`.
 *
 * @param raw - Typically `session.user.id` from the client or `undefined` / `null`.
 * @returns A canonical UUID string, or `null` when absent or not a valid UUID.
 *
 * @example
 * normalizeOrderUserId("550e8400-e29b-41d4-a716-446655440000");
 * // "550e8400-e29b-41d4-a716-446655440000"
 * @example
 * normalizeOrderUserId("google-oauth-sub-123");
 * // null
 */
export function normalizeOrderUserId(raw: unknown): string | null {
  try {
    if (raw == null || raw === "") {
      return null;
    }
    const trimmed = String(raw).trim();
    if (!trimmed) {
      return null;
    }
    const parsed = z.string().uuid().safeParse(trimmed);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
