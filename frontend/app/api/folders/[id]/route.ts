import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Folder from '@/lib/models/Folder';
import Template from '@/lib/models/Template';
import Recipient from '@/lib/models/Recipient';
import { authenticateRequest } from '@/lib/utils/auth';

// Delete a folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const folder = await Folder.findById(params.id);

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Check if user owns this folder
    if (folder.userId.toString() !== auth.userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if folder has any templates or recipients
    if (folder.type === 'template') {
      const templatesInFolder = await Template.countDocuments({
        userId: auth.userId,
        folder: folder.name,
      });

      if (templatesInFolder > 0) {
        return NextResponse.json(
          { error: 'Cannot delete folder with templates. Please move or delete templates first.' },
          { status: 400 }
        );
      }
    } else if (folder.type === 'recipient') {
      const recipientsInFolder = await Recipient.countDocuments({
        userId: auth.userId,
        folder: folder.name,
      });

      if (recipientsInFolder > 0) {
        return NextResponse.json(
          { error: 'Cannot delete folder with recipients. Please move or delete recipients first.' },
          { status: 400 }
        );
      }
    }

    await Folder.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error: any) {
    console.error('Delete folder error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

