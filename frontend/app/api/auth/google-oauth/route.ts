import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

// Public endpoint to get Google OAuth Client ID (safe to expose)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const googleOAuthSettings = await Settings.findOne({ key: 'googleOAuth' });
    
    if (!googleOAuthSettings || !googleOAuthSettings.value?.clientId) {
      // Google OAuth not configured - must be set via Admin Panel
      return NextResponse.json({
        clientId: '',
        enabled: false,
      });
    }

    return NextResponse.json({
      clientId: googleOAuthSettings.value.clientId,
      enabled: googleOAuthSettings.value.enabled !== false,
    });
  } catch (error: any) {
    console.error('Get Google OAuth settings error:', error);
    // Return disabled on error
    return NextResponse.json({
      clientId: '',
      enabled: false,
    });
  }
}

