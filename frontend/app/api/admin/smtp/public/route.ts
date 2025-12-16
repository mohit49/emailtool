import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSmtp from '@/lib/models/AdminSmtp';

// Public route to get default admin SMTP configuration (for users to select)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Only return the default admin SMTP configuration
    const defaultSmtp = await AdminSmtp.findOne({ 
      isDefault: true,
      isActive: true 
    }).lean();

    if (!defaultSmtp) {
      // If no default is set, return empty array
      return NextResponse.json({ smtpConfigs: [] });
    }

    // Don't send password back
    const { smtpPass, ...smtpWithoutPassword } = defaultSmtp;

    return NextResponse.json({ smtpConfigs: [smtpWithoutPassword] });
  } catch (error: any) {
    console.error('Get public admin SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

