import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { logger } from "@/lib/logger";
import { normalizeOrderUserId } from "@/lib/orders/normalizeOrderUserId";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/validation/adminSchemas";

/**
 * POST /api/orders — persists a completed checkout.
 * Requires an authenticated session (NextAuth).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parsed = createOrderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;
    const userIdForDb = normalizeOrderUserId(body.userId);
    if (body.userId && !userIdForDb) {
      logger.debug("Order: ignoring non-UUID session user id (e.g. OAuth sub)");
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: body.orderNumber,
        user_id: userIdForDb,
        email: body.email,
        status: body.status,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      logger.error("Order insert failed", {
        message: orderError?.message,
        code: orderError?.code,
      });
      return NextResponse.json(
        { error: "Could not save order" },
        { status: 500 },
      );
    }

    const rows = body.items.map((it) => ({
      order_id: order.id,
      game_id: it.gameId,
      game_title: it.gameTitle,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      line_total: it.lineTotal,
      activation_key: it.activationKey ?? null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(rows);

    if (itemsError) {
      logger.error("Order items insert failed", {
        message: itemsError.message,
        code: itemsError.code,
      });
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Could not save order lines" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err) {
    logger.error("POST /api/orders failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
