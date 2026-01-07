import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { createSystemTransporter, getAdminSMTPSettings } from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { message, email, pageUrl } = await req.json();

    if (!message || !email) {
      return NextResponse.json(
        { error: 'Message and email are required' },
        { status: 400 }
      );
    }

    // Get support email from settings
    const supportEmailSetting = await Settings.findOne({ key: 'supportEmail' });
    const supportEmail = supportEmailSetting?.value || process.env.SUPPORT_EMAIL || 'support@przio.com';

    // Get admin SMTP settings for sending email
    const transporter = await createSystemTransporter();
    const smtpSettings = await getAdminSMTPSettings();

    // Get user IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Send email to support
    const mailOptions = {
      from: smtpSettings.from || 'support@przio.com',
      to: supportEmail,
      subject: `New Support Chat Message from ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0; border-radius: 4px; }
            .info { background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 14px; }
            .label { font-weight: bold; color: #6366f1; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Support Chat Message</h2>
            </div>
            <div class="content">
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              
              <div class="info">
                <p style="margin: 5px 0;"><span class="label">From:</span> ${email}</p>
                <p style="margin: 5px 0;"><span class="label">Page:</span> <a href="${pageUrl}" style="color: #6366f1;">${pageUrl}</a></p>
                <p style="margin: 5px 0;"><span class="label">IP Address:</span> ${ipAddress}</p>
                <p style="margin: 5px 0;"><span class="label">User Agent:</span> ${userAgent}</p>
                <p style="margin: 5px 0;"><span class="label">Time:</span> ${new Date().toLocaleString()}</p>
              </div>

              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                This message was sent through the support chat widget on your website.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error sending support chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

