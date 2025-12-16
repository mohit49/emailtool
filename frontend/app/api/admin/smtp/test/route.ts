import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSmtp from '@/lib/models/AdminSmtp';
import { requireAdmin } from '@/lib/utils/admin';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { smtpId, testEmail, smtpData } = await req.json();

    let smtpConfig;

    // If smtpId is provided, use existing configuration
    if (smtpId) {
      smtpConfig = await AdminSmtp.findById(smtpId);
      if (!smtpConfig) {
        return NextResponse.json(
          { error: 'SMTP configuration not found' },
          { status: 404 }
        );
      }
      if (!smtpConfig.isActive) {
        return NextResponse.json(
          { error: 'SMTP configuration is not active' },
          { status: 400 }
        );
      }
    } else if (smtpData) {
      // Use provided form data for testing (for new configurations)
      smtpConfig = {
        smtpHost: smtpData.host,
        smtpPort: parseInt(smtpData.port),
        smtpUser: smtpData.user,
        smtpPass: smtpData.pass,
        smtpFrom: smtpData.from || smtpData.user,
        title: smtpData.title || 'Test Configuration',
      };
      
      if (!smtpConfig.smtpHost || !smtpConfig.smtpUser || !smtpConfig.smtpPass) {
        return NextResponse.json(
          { error: 'Host, User, and Password are required for testing' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'SMTP configuration ID or SMTP data is required' },
        { status: 400 }
      );
    }

    // Create transporter with admin SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtpHost,
      port: smtpConfig.smtpPort,
      secure: smtpConfig.smtpPort === 465,
      auth: {
        user: smtpConfig.smtpUser,
        pass: smtpConfig.smtpPass,
      },
    });

    // Verify connection
    await transporter.verify();

    // Determine recipient email
    const recipientEmail = testEmail?.trim() || smtpConfig.smtpUser;

    // Send test email
    const info = await transporter.sendMail({
      from: smtpConfig.smtpFrom,
      to: recipientEmail,
      subject: 'Test Email from Email Testing Tool (Admin)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from your Email Testing Tool Admin SMTP configuration.</p>
          <p><strong>Configuration:</strong> ${smtpConfig.title}</p>
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
    console.error('Admin test SMTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email. Please check your SMTP settings.' },
      { status: 400 }
    );
  }
}

