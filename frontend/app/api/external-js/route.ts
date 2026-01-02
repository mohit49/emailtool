import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const setting = await Settings.findOne({ key: 'external_js_scripts' });
    const scripts = setting?.value || [];

    return NextResponse.json({ scripts });
  } catch (error: any) {
    console.error('Get external JS scripts error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

