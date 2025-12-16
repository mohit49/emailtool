import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    await Recipient.deleteOne({ _id: params.id });

    return NextResponse.json({ message: 'Recipient deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

