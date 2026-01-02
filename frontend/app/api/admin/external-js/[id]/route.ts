import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { requireAdmin } from '@/lib/utils/admin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;

    const setting = await Settings.findOne({ key: 'external_js_scripts' });
    if (!setting) {
      return NextResponse.json(
        { error: 'No scripts found' },
        { status: 404 }
      );
    }

    const scripts = setting.value || [];
    const filteredScripts = scripts.filter((s: any) => s.id !== id);

    if (filteredScripts.length === scripts.length) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      );
    }

    await Settings.findOneAndUpdate(
      { key: 'external_js_scripts' },
      {
        value: filteredScripts,
        updatedBy: auth.userId,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ message: 'Script deleted successfully' });
  } catch (error: any) {
    console.error('Delete external JS script error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


