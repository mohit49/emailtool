import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folder, newFolder } = await req.json();

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Recipient.updateMany(
      {
        userId: auth.userId,
        folder: folder,
      },
      {
        $set: {
          folder: newFolder && newFolder.trim() ? newFolder.trim() : undefined,
        },
      }
    );

    return NextResponse.json({
      message: `Moved ${result.modifiedCount} recipient(s) successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error moving folder recipients:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

