import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { logger } from "@/lib/logger";

export type AdminSessionResult =
  | { ok: true; userId: string; email: string | null | undefined }
  | { ok: false; response: Response };

/**
 * Ensures the current request is authenticated as an admin user.
 *
 * @returns Either a session context or a ready-to-return 401/403 Response
 */
export async function requireAdminSession(): Promise<AdminSessionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    const isAdmin = Boolean(
      (session.user as { isAdmin?: boolean }).isAdmin === true,
    );
    if (!isAdmin) {
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    return {
      ok: true,
      userId: session.user.id,
      email: session.user.email,
    };
  } catch (err) {
    logger.error("requireAdminSession failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
}
