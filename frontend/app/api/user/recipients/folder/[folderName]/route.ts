import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderName: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderName = decodeURIComponent(params.folderName);

    await connectDB();

    // Protect "Team Members" folder from deletion
    if (folderName === 'Team Members') {
      return NextResponse.json(
        { error: 'Cannot delete the "Team Members" folder. This folder is protected and contains project team members.' },
        { status: 400 }
      );
    }

    // Delete all recipients in this folder
    const result = await Recipient.deleteMany({
      userId: auth.userId,
      folder: folderName,
    });

    return NextResponse.json({
      message: `Folder and ${result.deletedCount} recipient(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting folder recipients:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


