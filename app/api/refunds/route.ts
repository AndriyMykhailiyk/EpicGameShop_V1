import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { refundRequestSchema } from "@/lib/validation/authSchemas";
import { logger } from "@/lib/logger";

/**
 * GET /api/refunds
 * Returns the current user's refund requests.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: refunds, error } = await supabaseAdmin
      .from("refund_requests")
      .select(
        `id, order_id, email, reason, status, admin_comment, created_at, updated_at,
         orders!inner(order_number, total)`,
      )
      .eq("email", session.user.email)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch user refunds", {
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to fetch refunds" },
        { status: 500 },
      );
    }

    return NextResponse.json({ refunds: refunds ?? [] });
  } catch (err) {
    logger.error("GET /api/refunds failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/refunds
 * Creates a new refund request for an order.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parsed = refundRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { orderId, reason } = parsed.data;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, email, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Замовлення не знайдено" },
        { status: 404 },
      );
    }

    if (order.email !== session.user.email) {
      return NextResponse.json(
        { error: "Це замовлення не належить вашому акаунту" },
        { status: 403 },
      );
    }

    const { data: existingRefund } = await supabaseAdmin
      .from("refund_requests")
      .select("id, status")
      .eq("order_id", orderId)
      .in("status", ["pending", "approved"])
      .single();

    if (existingRefund) {
      return NextResponse.json(
        { error: "Запит на повернення для цього замовлення вже існує" },
        { status: 409 },
      );
    }

    const { data: refund, error: insertError } = await supabaseAdmin
      .from("refund_requests")
      .insert({
        order_id: orderId,
        user_id: session.user.id || null,
        email: session.user.email,
        reason,
      })
      .select("id")
      .single();

    if (insertError || !refund) {
      logger.error("Refund request insert failed", {
        message: insertError?.message,
      });
      return NextResponse.json(
        { error: "Не вдалося створити запит на повернення" },
        { status: 500 },
      );
    }

    logger.info("Refund request created", {
      refundId: refund.id,
      orderId,
      email: session.user.email,
    });

    return NextResponse.json({ ok: true, refundId: refund.id }, { status: 201 });
  } catch (err) {
    logger.error("POST /api/refunds failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
