import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";

const requestSchema = z.object({
  code: z.string().min(1).max(50),
});

/**
 * POST /api/checkout/validate-promo
 *
 * Validates a promo code against the `promo_codes` table in Supabase.
 * Expected table schema:
 *   code       text UNIQUE NOT NULL
 *   discount   numeric NOT NULL
 *   discount_type text DEFAULT 'percentage'  -- 'percentage' | 'fixed'
 *   is_active  boolean DEFAULT true
 *   valid_until timestamptz
 *   max_uses   integer
 *   current_uses integer DEFAULT 0
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Введіть коректний промокод" },
        { status: 400 },
      );
    }

    const { code } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("discount, discount_type, is_active, valid_until, max_uses, current_uses")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (error) {
      logger.warn("Promo code lookup failed", {
        message: error.message,
        code: error.code,
      });
      return NextResponse.json(
        { valid: false, error: "Промокод не знайдено" },
        { status: 404 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { valid: false, error: "Промокод не знайдено" },
        { status: 404 },
      );
    }

    if (!data.is_active) {
      return NextResponse.json(
        { valid: false, error: "Промокод більше не активний" },
        { status: 410 },
      );
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Термін дії промокоду закінчився" },
        { status: 410 },
      );
    }

    if (
      data.max_uses !== null &&
      data.current_uses !== null &&
      data.current_uses >= data.max_uses
    ) {
      return NextResponse.json(
        { valid: false, error: "Промокод вичерпано" },
        { status: 410 },
      );
    }

    return NextResponse.json({
      valid: true,
      discount: Number(data.discount),
      discountType: data.discount_type || "percentage",
    });
  } catch (err) {
    logger.error("POST /api/checkout/validate-promo failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { valid: false, error: "Не вдалося перевірити промокод" },
      { status: 500 },
    );
  }
}
