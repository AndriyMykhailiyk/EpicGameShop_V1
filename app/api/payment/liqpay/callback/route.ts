import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLiqPayConfig } from "@/lib/payment/liqpayConfig";
import { verifyLiqPaySignature, decodeLiqPayData } from "@/lib/payment/liqpay";
import { buildReceiptEmailHtml } from "@/lib/checkout/emailTemplate";

const LIQPAY_SUCCESS_STATUSES = ["success", "sandbox"];

/**
 * POST /api/payment/liqpay/callback
 *
 * Server-to-server callback from LiqPay when a payment is completed.
 * Verifies the signature, decodes the data, and updates the order status.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get("data") as string | null;
    const signature = formData.get("signature") as string | null;

    if (!data || !signature) {
      logger.warn("LiqPay callback: missing data or signature");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const config = getLiqPayConfig();

    if (!verifyLiqPaySignature(config.privateKey, data, signature)) {
      logger.warn("LiqPay callback: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const decoded = decodeLiqPayData(data);
    const orderId = decoded.order_id as string;
    const status = decoded.status as string;
    const paymentId = decoded.payment_id as number | undefined;
    const amount = decoded.amount as number | undefined;

    logger.info("LiqPay callback received", {
      orderId,
      status,
      paymentId,
      amount,
    });

    if (LIQPAY_SUCCESS_STATUSES.includes(status)) {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          liqpay_payment_id: paymentId ? String(paymentId) : null,
          liqpay_status: status,
          paid_at: new Date().toISOString(),
        })
        .eq("order_number", orderId);

      if (updateError) {
        logger.error("LiqPay callback: order update failed", {
          orderId,
          message: updateError.message,
        });
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      await sendReceiptForOrder(orderId);

      logger.info("LiqPay payment confirmed", { orderId, paymentId });
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          liqpay_status: status,
        })
        .eq("order_number", orderId);

      if (updateError) {
        logger.warn("LiqPay callback: status update failed", {
          orderId,
          status,
        });
      }

      logger.info("LiqPay non-success status", { orderId, status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/payment/liqpay/callback failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function sendReceiptForOrder(orderNumber: string): Promise<void> {
  try {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("email, total, subtotal, tax")
      .eq("order_number", orderNumber)
      .single();

    if (!order?.email) return;

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("game_title, quantity, line_total, activation_key")
      .eq("order_id", orderNumber);

    if (!items?.length) return;

    const html = buildReceiptEmailHtml({
      orderNumber,
      items: items.map((it) => ({
        title: it.game_title,
        quantity: it.quantity,
        price: it.line_total,
      })),
      keys: items.map((it) => ({
        title: it.game_title,
        keys: it.activation_key ? it.activation_key.split(", ") : [],
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
    });

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: order.email,
        subject: `Замовлення ${orderNumber} оплачено — EpicGame Shop`,
        html,
      }),
    });
  } catch (err) {
    logger.warn("Failed to send receipt after LiqPay callback", {
      orderNumber,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
