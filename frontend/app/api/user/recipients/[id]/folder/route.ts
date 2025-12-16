import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folder } = await req.json();

    await connectDB();

    const recipient = await Recipient.findOne({
      _id: params.id,
      userId: auth.userId,
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    recipient.folder = folder && folder.trim() ? folder.trim() : undefined;
    await recipient.save();

    return NextResponse.json({ message: 'Recipient moved successfully', recipient });
  } catch (error: any) {
    console.error('Error moving recipient:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

