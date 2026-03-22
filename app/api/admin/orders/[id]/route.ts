import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { orderStatusSchema } from "@/lib/validation/adminSchemas";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/orders/[id] — update payment / fulfillment status.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = orderStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: parsed.data.status })
      .eq("id", id);

    if (error) {
      logger.error("Admin order status update failed", {
        message: error.message,
      });
      return NextResponse.json(
        { error: "Could not update order" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Admin order PATCH failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
