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

    const { id, url, injectInHead } = await req.json();

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let setting = await Settings.findOne({ key: 'external_js_scripts' });
    const scripts = setting?.value || [];

    if (id) {
      // Update existing script
      const scriptIndex = scripts.findIndex((s: any) => s.id === id);
      if (scriptIndex === -1) {
        return NextResponse.json(
          { error: 'Script not found' },
          { status: 404 }
        );
      }
      scripts[scriptIndex] = {
        id,
        url: url.trim(),
        injectInHead: injectInHead === true,
      };
    } else {
      // Add new script
      const newScript = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: url.trim(),
        injectInHead: injectInHead === true,
      };
      scripts.push(newScript);
    }

    setting = await Settings.findOneAndUpdate(
      { key: 'external_js_scripts' },
      {
        value: scripts,
        updatedBy: auth.userId,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('updatedBy', 'name email');

    return NextResponse.json({ 
      message: id ? 'Script updated successfully' : 'Script added successfully',
      script: id ? scripts.find((s: any) => s.id === id) : scripts[scripts.length - 1]
    });
  } catch (error: any) {
    console.error('Save external JS script error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

