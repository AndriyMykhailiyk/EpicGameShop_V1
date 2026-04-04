import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validation/authSchemas";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token and sends an email via Resend.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некоректні дані", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, email, blocked")
      .eq("email", email)
      .single();

    if (!user || user.blocked) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
      });

    if (tokenError) {
      logger.error("Failed to create reset token", {
        message: tokenError.message,
      });
      return NextResponse.json(
        { error: "Помилка сервера" },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/account/reset-password?token=${token}`;

    try {
      const { Resend } = await import("resend");
      const resendKey = process.env.RESEND_API_KEY;

      if (resendKey) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "EpicGame Shop <onboarding@resend.dev>",
          to: email,
          subject: "Відновлення пароля — EpicGame Shop",
          html: buildResetEmailHtml(resetUrl),
        });
        logger.info("Password reset email sent", { email });
      } else {
        logger.warn("RESEND_API_KEY not set, reset URL logged", { resetUrl });
      }
    } catch (emailErr) {
      logger.error("Failed to send reset email", {
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/auth/forgot-password failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 },
    );
  }
}

function buildResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Відновлення пароля</h2>
      <p>Ви отримали цей лист, тому що запросили скидання пароля для вашого акаунту в EpicGame Shop.</p>
      <p>Натисніть кнопку нижче, щоб встановити новий пароль:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0066ff, #0099ff); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Скинути пароль
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Посилання дійсне протягом 1 години.</p>
      <p style="color: #666; font-size: 14px;">Якщо ви не запитували скидання пароля, проігноруйте цей лист.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">EpicGame Shop — ваш ігровий магазин</p>
    </div>
  `;
}
