import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLiqPayConfig } from "@/lib/payment/liqpayConfig";
import { buildLiqPayPayment } from "@/lib/payment/liqpay";
import { generateOrderNumber, generateActivationKeys } from "@/lib/checkout/orderUtils";

const cartItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
});

const createPaymentSchema = z.object({
  email: z.string().email(),
  items: z.array(cartItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

/**
 * POST /api/payment/liqpay/create
 *
 * Creates a pending order in Supabase and returns signed LiqPay
 * form data for redirecting the user to the LiqPay checkout page.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parsed = createPaymentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невірні дані", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const config = getLiqPayConfig();
    const orderNumber = generateOrderNumber();

    const itemsForKeys = body.items.map((it) => ({
      id: it.id,
      title: it.title,
      imageUrl: "",
      price: String(it.unitPrice),
      originalPrice: String(it.unitPrice),
      discountedPrice: String(it.unitPrice),
      quantity: it.quantity,
    }));

    const { flat: flatKeys } = generateActivationKeys(itemsForKeys);

    const userId = session.user.id ?? null;
    let normalizedUserId: string | null = null;
    if (userId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        normalizedUserId = userId;
      }
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: normalizedUserId,
        email: body.email,
        status: "pending",
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        payment_method: "liqpay",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      logger.error("LiqPay order insert failed", {
        message: orderError?.message,
        code: orderError?.code,
        details: orderError?.details,
        hint: orderError?.hint,
      });
      return NextResponse.json(
        { error: `Не вдалося створити замовлення: ${orderError?.message || "unknown"}` },
        { status: 500 },
      );
    }

    const orderItemRows = body.items.map((it) => {
      const keysForGame = flatKeys.filter((k) => k.game_id === it.id);
      return {
        order_id: order.id,
        game_id: it.id,
        game_title: it.title,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        line_total: it.lineTotal,
        activation_key: keysForGame.map((k) => k.activation_key).join(", "),
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemRows);

    if (itemsError) {
      logger.error("LiqPay order items insert failed", {
        message: itemsError.message,
        code: itemsError.code,
      });
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: `Не вдалося зберегти товари: ${itemsError.message}` },
        { status: 500 },
      );
    }

    const description = `Замовлення ${orderNumber} — EpicGame Shop`;
    const resultUrl = `${config.baseUrl}/checkout/result?order_id=${orderNumber}`;
    const serverUrl = `${config.baseUrl}/api/payment/liqpay/callback`;

    const { data: liqpayData, signature } = buildLiqPayPayment(
      {
        action: "pay",
        amount: body.total,
        currency: "UAH",
        description,
        order_id: orderNumber,
        result_url: resultUrl,
        server_url: serverUrl,
        sandbox: config.sandbox,
      },
      config.publicKey,
      config.privateKey,
    );

    logger.info("LiqPay payment created", {
      orderNumber,
      orderId: order.id,
      total: body.total,
      sandbox: config.sandbox,
    });

    return NextResponse.json({
      data: liqpayData,
      signature,
      orderNumber,
      orderId: order.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logger.error("POST /api/payment/liqpay/create failed", {
      error: message,
      stack,
    });
    return NextResponse.json(
      { error: message || "Помилка сервера" },
      { status: 500 },
    );
  }
}
