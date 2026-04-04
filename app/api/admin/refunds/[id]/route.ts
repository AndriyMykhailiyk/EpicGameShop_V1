import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { refundStatusSchema } from "@/lib/validation/authSchemas";
import { logger } from "@/lib/logger";

/**
 * PATCH /api/admin/refunds/[id]
 * Updates a refund request status (approve/reject).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const json = await request.json();
    const parsed = refundStatusSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { status, adminComment } = parsed.data;

    const { data: refund, error: fetchError } = await supabaseAdmin
      .from("refund_requests")
      .select("id, status, order_id")
      .eq("id", id)
      .single();

    if (fetchError || !refund) {
      return NextResponse.json(
        { error: "Refund request not found" },
        { status: 404 },
      );
    }

    if (refund.status !== "pending") {
      return NextResponse.json(
        { error: "This refund request has already been processed" },
        { status: 409 },
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("refund_requests")
      .update({
        status,
        admin_comment: adminComment || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      logger.error("Refund status update failed", {
        message: updateError.message,
      });
      return NextResponse.json(
        { error: "Failed to update refund" },
        { status: 500 },
      );
    }

    if (status === "approved") {
      const { error: orderUpdateError } = await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", refund.order_id);

      if (orderUpdateError) {
        logger.warn("Failed to cancel order after refund approval", {
          orderId: refund.order_id,
          message: orderUpdateError.message,
        });
      }
    }

    logger.info("Refund request updated", {
      refundId: id,
      status,
      adminId: auth.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("PATCH /api/admin/refunds/[id] failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
