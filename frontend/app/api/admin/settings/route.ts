import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { requireAdmin } from '@/lib/utils/admin';

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

    const allSettings = await Settings.find().populate('updatedBy', 'name email');
    
    // Convert to object format
    const settingsObj: Record<string, any> = {};
    allSettings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        updatedBy: setting.updatedBy,
        updatedAt: setting.updatedAt,
      };
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

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

    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value,
        updatedBy: auth.userId,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('updatedBy', 'name email');

    return NextResponse.json({ setting });
  } catch (error: any) {
    console.error('Save setting error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


