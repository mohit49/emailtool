import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authenticateRequest } from '@/lib/utils/auth';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = await req.json();

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter with user's SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtpHost.trim(),
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: smtpFrom.trim(),
      to: smtpUser.trim(), // Send to the user's email
      subject: 'Test Email from Email Testing Tool',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from your Email Testing Tool.</p>
          <p>If you received this email, your SMTP settings are configured correctly!</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'Test email sent successfully',
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('Test SMTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email. Please check your SMTP settings.' },
      { status: 400 }
    );
  }
}


