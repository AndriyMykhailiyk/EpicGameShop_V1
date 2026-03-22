/**
 * Runs once per Node.js server start (not in Edge).
 * Creates the admin user if missing — no need to run `npm run seed:admin` for local dev.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  try {
    const { ensureAdminUser } = await import("@/lib/bootstrap/ensureAdminUser");
    await ensureAdminUser();
  } catch {
    /* optional bootstrap — ignore import failures */
  }
}
