import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLiqPayConfig } from "@/lib/payment/liqpayConfig";
import { buildLiqPayStatusRequest, LIQPAY_API_URL } from "@/lib/payment/liqpay";

/**
 * GET /api/payment/liqpay/status/[orderId]
 *
 * Returns the current status of a LiqPay order.
 * If the order is still "pending" in our DB, also checks with LiqPay API
 * to synchronize status (handles cases where callback was missed).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 },
      );
    }

    const { orderId } = await params;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, email, status, total, subtotal, tax, liqpay_status, payment_method")
      .eq("order_number", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Замовлення не знайдено" },
        { status: 404 },
      );
    }

    if (order.status === "pending" && order.payment_method === "liqpay") {
      try {
        const syncedStatus = await syncWithLiqPay(order.order_number);
        if (syncedStatus === "paid") {
          order.status = "paid";
        }
      } catch (syncErr) {
        logger.warn("LiqPay status sync failed", {
          orderId,
          error: syncErr instanceof Error ? syncErr.message : String(syncErr),
        });
      }
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("game_id, game_title, quantity, unit_price, line_total, activation_key")
      .eq("order_id", order.id);

    return NextResponse.json({
      orderNumber: order.order_number,
      email: order.email,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      items: items ?? [],
    });
  } catch (err) {
    logger.error("GET /api/payment/liqpay/status failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 },
    );
  }
}

/**
 * Checks payment status directly with LiqPay API and updates our DB if paid.
 */
async function syncWithLiqPay(orderNumber: string): Promise<string> {
  const config = getLiqPayConfig();
  const { data, signature } = buildLiqPayStatusRequest(
    orderNumber,
    config.publicKey,
    config.privateKey,
  );

  const response = await fetch(LIQPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data, signature }).toString(),
  });

  if (!response.ok) {
    throw new Error(`LiqPay status API returned ${response.status}`);
  }

  const result = await response.json();
  const liqpayStatus = result.status as string;

  if (liqpayStatus === "success" || liqpayStatus === "sandbox") {
    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        liqpay_payment_id: result.payment_id ? String(result.payment_id) : null,
        liqpay_status: liqpayStatus,
        paid_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    return "paid";
  }

  return liqpayStatus;
}
