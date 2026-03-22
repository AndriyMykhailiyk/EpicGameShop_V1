import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/admin/orders — all orders with line items.
 */
export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Admin orders list failed", { message: error.message });
      return NextResponse.json(
        { error: "Failed to load orders" },
        { status: 500 },
      );
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch (err) {
    logger.error("Admin orders GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
