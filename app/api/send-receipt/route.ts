import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    console.log('📧 Sending email to:', to);

    const { data, error } = await resend.emails.send({
      from: 'EpicGame Shop <onboarding@resend.dev>', // ✅ Тимчасовий email від Resend
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Email sent:', data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}