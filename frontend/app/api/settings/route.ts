import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

// Public route to get SMTP settings (for email service)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const smtpSettings = await Settings.findOne({ key: 'smtp' });
    
    if (!smtpSettings) {
      // Return default/empty settings
      return NextResponse.json({
        smtp: {
          host: process.env.SMTP_HOST || '',
          port: process.env.SMTP_PORT || '587',
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
          from: process.env.SMTP_FROM || '',
        },
      });
    }

    // Don't return the password in the response
    const { value } = smtpSettings;
    return NextResponse.json({
      smtp: {
        host: value.host || '',
        port: value.port || '587',
        user: value.user || '',
        pass: value.pass || '', // Only used server-side
        from: value.from || '',
      },
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


