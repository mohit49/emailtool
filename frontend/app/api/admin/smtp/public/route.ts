import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSmtp from '@/lib/models/AdminSmtp';

// Public route to get default admin SMTP configuration (for users to select)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // First, try to get the default active admin SMTP
    let defaultSmtp = await AdminSmtp.findOne({ 
      isDefault: true,
      isActive: true 
    }).lean();

    // If no default active SMTP found, try to get any active admin SMTP as fallback
    if (!defaultSmtp) {
      defaultSmtp = await AdminSmtp.findOne({ 
        isActive: true 
      }).sort({ createdAt: -1 }).lean(); // Get the most recently created active one
      
      console.log('No default active SMTP found, using fallback active SMTP:', defaultSmtp ? {
        _id: defaultSmtp._id,
        title: defaultSmtp.title,
        isDefault: defaultSmtp.isDefault,
        isActive: defaultSmtp.isActive,
      } : 'No active SMTP found');
    }

    if (!defaultSmtp) {
      // If no active SMTP is set, return empty array
      console.log('No active admin SMTP configuration found');
      return NextResponse.json({ smtpConfigs: [] });
    }

    // Don't send password back, but ensure all other fields are included
    const { smtpPass, ...smtpWithoutPassword } = defaultSmtp;

    // Explicitly ensure isDefault and isActive are included
    const smtpConfig = {
      ...smtpWithoutPassword,
      isDefault: defaultSmtp.isDefault === true,
      isActive: defaultSmtp.isActive === true,
    };

    console.log('Public admin SMTP response:', {
      _id: smtpConfig._id,
      title: smtpConfig.title,
      isDefault: smtpConfig.isDefault,
      isActive: smtpConfig.isActive,
    });

    return NextResponse.json({ smtpConfigs: [smtpConfig] });
  } catch (error: any) {
    console.error('Get public admin SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

