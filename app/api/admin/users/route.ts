import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/admin/users — list users (no password hash).
 */
export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, is_admin, blocked")
      .order("email", { ascending: true });

    if (error) {
      logger.error("Admin users list failed", { message: error.message });
      return NextResponse.json(
        { error: "Failed to load users" },
        { status: 500 },
      );
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (err) {
    logger.error("Admin users GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
