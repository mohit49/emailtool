import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const setting = await Settings.findOne({ key: 'external_js_scripts' });
    const scripts = setting?.value || [];

    console.log('[API] External JS scripts requested, returning:', scripts.length, 'scripts');
    
    return NextResponse.json(
      { scripts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Get external JS scripts error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

