import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { requireAdmin } from '@/lib/utils/admin';

// Admin endpoint to get Google OAuth settings
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const googleOAuthSettings = await Settings.findOne({ key: 'googleOAuth' });
    
    if (!googleOAuthSettings) {
      // Return empty settings - must be configured via Admin Panel
      return NextResponse.json({
        googleOAuth: {
          clientId: '',
          clientSecret: '',
          enabled: false,
        },
      });
    }

    // Don't return the actual secret, just indicate if it's set
    return NextResponse.json({
      googleOAuth: {
        clientId: googleOAuthSettings.value.clientId || '',
        clientSecret: googleOAuthSettings.value.clientSecret ? '***configured***' : '',
        enabled: googleOAuthSettings.value.enabled === true,
        updatedAt: googleOAuthSettings.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get Google OAuth settings error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint to update Google OAuth settings
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

    const { clientId, clientSecret, enabled } = await req.json();

    console.log('Received Google OAuth settings update:', { clientId, hasSecret: !!clientSecret, enabled });

    if (!clientId || !clientId.trim()) {
      return NextResponse.json(
        { error: 'Google Client ID is required' },
        { status: 400 }
      );
    }

    // Get existing settings to preserve clientSecret if not provided
    const existingSettings = await Settings.findOne({ key: 'googleOAuth' });
    const existingSecret = existingSettings?.value?.clientSecret;

    // Explicitly handle enabled - default to false if not provided, but respect true/false
    const isEnabled = enabled === true;

    const settingsValue: any = {
      clientId: clientId.trim(),
      enabled: isEnabled,
    };

    // Only update secret if provided (allows updating just client ID)
    if (clientSecret && clientSecret.trim() && clientSecret !== '***configured***') {
      settingsValue.clientSecret = clientSecret.trim();
    } else if (existingSecret) {
      // Preserve existing secret if not provided
      settingsValue.clientSecret = existingSecret;
    } else {
      // No secret provided and no existing secret - leave empty
      settingsValue.clientSecret = '';
    }

    const setting = await Settings.findOneAndUpdate(
      { key: 'googleOAuth' },
      {
        value: settingsValue,
        updatedBy: auth.userId,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('updatedBy', 'name email');

    console.log('Google OAuth settings saved:', {
      clientId: setting.value.clientId,
      enabled: setting.value.enabled,
      hasSecret: !!setting.value.clientSecret,
    });

    return NextResponse.json({
      message: 'Google OAuth settings updated successfully',
      googleOAuth: {
        clientId: setting.value.clientId,
        clientSecret: '***configured***',
        enabled: setting.value.enabled,
      },
    });
  } catch (error: any) {
    console.error('Update Google OAuth settings error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

