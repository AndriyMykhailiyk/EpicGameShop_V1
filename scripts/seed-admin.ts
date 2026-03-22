/**
 * CLI: force-create or reset admin password from env (same as startup, but always syncs password).
 * App startup already calls ensureAdminUser() without password sync if the user exists.
 */
import { ensureAdminUser } from "../lib/bootstrap/ensureAdminUser";

async function main() {
  try {
    await ensureAdminUser({ syncPassword: true });
    process.stdout.write("seed:admin finished (password synced if user existed).\n");
  } catch (err) {
    process.stderr.write(
      `${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
}

void main();
