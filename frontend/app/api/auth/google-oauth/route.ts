import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

// Public endpoint to get Google OAuth Client ID (safe to expose)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Find the settings document
    const googleOAuthSettings = await Settings.findOne({ key: 'googleOAuth' });
    
    console.log('=== Google OAuth Settings Debug ===');
    console.log('Document found:', !!googleOAuthSettings);
    
    if (googleOAuthSettings) {
      console.log('Document ID:', googleOAuthSettings._id);
      console.log('Document key:', googleOAuthSettings.key);
      console.log('Value exists:', !!googleOAuthSettings.value);
      console.log('Value type:', typeof googleOAuthSettings.value);
      console.log('Full value:', JSON.stringify(googleOAuthSettings.value, null, 2));
      
      if (googleOAuthSettings.value) {
        console.log('Value keys:', Object.keys(googleOAuthSettings.value));
        console.log('clientId:', googleOAuthSettings.value.clientId);
        console.log('enabled:', googleOAuthSettings.value.enabled);
        console.log('enabled type:', typeof googleOAuthSettings.value.enabled);
      }
    }
    
    if (!googleOAuthSettings) {
      console.log('Google OAuth settings document not found in database');
      return NextResponse.json({
        clientId: '',
        enabled: false,
      });
    }

    // Handle different possible structures
    let clientId = '';
    let enabled = false;

    if (googleOAuthSettings.value) {
      // Check if value is an object
      if (typeof googleOAuthSettings.value === 'object' && !Array.isArray(googleOAuthSettings.value)) {
        clientId = googleOAuthSettings.value.clientId?.trim() || '';
        // Explicitly check if enabled is true (boolean)
        // Only return true if explicitly set to boolean true
        enabled = googleOAuthSettings.value.enabled === true;
      } else if (typeof googleOAuthSettings.value === 'string') {
        // If value is stored as JSON string, try to parse it
        try {
          const parsed = JSON.parse(googleOAuthSettings.value);
          clientId = parsed.clientId?.trim() || '';
          enabled = parsed.enabled === true;
        } catch (e) {
          console.log('Failed to parse value as JSON string:', e);
        }
      } else {
        console.log('Value is not an object or string, type:', typeof googleOAuthSettings.value);
      }
    }

    console.log('Returning Google OAuth settings:', { 
      clientId: clientId ? clientId.substring(0, 20) + '...' : 'empty', 
      enabled 
    });

    return NextResponse.json({
      clientId,
      enabled,
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

