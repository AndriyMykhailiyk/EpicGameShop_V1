import { Resend } from "resend";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 },
      );
    }

    const resend = getResend();

    const { data, error } = await resend.emails.send({
      from: "EpicGame Shop <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      logger.error("Resend email failed", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logger.info("Receipt email sent", { to });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    logger.error("POST /api/send-receipt failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
