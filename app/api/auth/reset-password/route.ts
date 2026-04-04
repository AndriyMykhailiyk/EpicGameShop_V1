import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validation/authSchemas";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = resetPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некоректні дані", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const { data: resetRecord, error: fetchError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .single();

    if (fetchError || !resetRecord) {
      return NextResponse.json(
        { error: "Невірний або протермінований токен" },
        { status: 400 },
      );
    }

    if (resetRecord.used) {
      return NextResponse.json(
        { error: "Цей токен вже був використаний" },
        { status: 400 },
      );
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Термін дії токена минув. Запросіть новий." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", resetRecord.user_id);

    if (updateError) {
      logger.error("Password update failed", {
        message: updateError.message,
      });
      return NextResponse.json(
        { error: "Не вдалося оновити пароль" },
        { status: 500 },
      );
    }

    const { error: tokenUpdateError } = await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetRecord.id);

    if (tokenUpdateError) {
      logger.warn("Failed to mark token as used", {
        message: tokenUpdateError.message,
      });
    }

    logger.info("Password reset successfully", {
      userId: resetRecord.user_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/auth/reset-password failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 },
    );
  }
}
