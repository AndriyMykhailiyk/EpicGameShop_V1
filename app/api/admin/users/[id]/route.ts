import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { userBlockSchema } from "@/lib/validation/adminSchemas";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/users/[id] — block or unblock a user.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = userBlockSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (id === gate.userId) {
      return NextResponse.json(
        { error: "You cannot change your own block status here" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ blocked: parsed.data.blocked })
      .eq("id", id);

    if (error) {
      logger.error("Admin user block update failed", { message: error.message });
      return NextResponse.json(
        { error: "Could not update user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Admin user PATCH failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
