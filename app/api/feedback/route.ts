import { NextResponse } from "next/server";
import { feedbackSchema, feedbackTypeLabels } from "@/lib/validation/feedbackSchema";
import { logger } from "@/lib/logger";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

/**
 * Sends a message to Telegram with exponential backoff retry.
 */
async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn("Telegram env vars not configured, skipping notification");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        return true;
      }

      const errorBody = await res.text();
      logger.warn("Telegram API error", {
        status: res.status,
        body: errorBody,
        attempt: attempt + 1,
      });
    } catch (err) {
      logger.warn("Telegram API request failed", {
        error: err instanceof Error ? err.message : String(err),
        attempt: attempt + 1,
      });
    }

    if (attempt < MAX_RETRIES - 1) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildTelegramMessage(data: {
  name: string;
  email: string;
  telegram?: string;
  type: string;
  message: string;
}): string {
  const typeLabel = feedbackTypeLabels[data.type as keyof typeof feedbackTypeLabels] || data.type;
  const now = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });
  const telegramLine = data.telegram
    ? `\n<b>Telegram:</b> ${escapeHtml(data.telegram)}`
    : "";

  return (
    `<b>--- Новий відгук ---</b>\n` +
    `<b>Тип:</b> ${escapeHtml(typeLabel)}\n` +
    `<b>Ім'я:</b> ${escapeHtml(data.name)}\n` +
    `<b>Email:</b> ${escapeHtml(data.email)}` +
    `${telegramLine}\n\n` +
    `<b>Повідомлення:</b>\n${escapeHtml(data.message)}\n\n` +
    `<i>Надіслано: ${now}</i>`
  );
}

/**
 * POST /api/feedback
 * Validates the feedback form and sends the message to Telegram.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некоректні дані", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, telegram, type, message } = parsed.data;

    const telegramText = buildTelegramMessage({
      name,
      email,
      telegram: telegram || undefined,
      type,
      message,
    });

    const sent = await sendTelegramMessage(telegramText);

    if (!sent) {
      logger.error("Failed to send feedback to Telegram after retries", {
        email,
        type,
      });
      return NextResponse.json(
        { error: "Не вдалося надіслати повідомлення. Спробуйте пізніше." },
        { status: 502 },
      );
    }

    logger.info("Feedback sent to Telegram", { email, type });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/feedback failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 },
    );
  }
}
