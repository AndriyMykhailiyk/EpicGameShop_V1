import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/refunds
 * Returns all refund requests for the admin panel.
 */
export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { data: refunds, error } = await supabaseAdmin
      .from("refund_requests")
      .select(
        `id, order_id, user_id, email, reason, status, admin_comment, created_at, updated_at,
         orders(order_number, total, status)`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Admin: failed to fetch refunds", {
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to fetch refunds" },
        { status: 500 },
      );
    }

    return NextResponse.json({ refunds: refunds ?? [] });
  } catch (err) {
    logger.error("GET /api/admin/refunds failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
