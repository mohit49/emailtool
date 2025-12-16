import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserSmtp from '@/lib/models/UserSmtp';
import { authenticateRequest } from '@/lib/utils/auth';

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

    const smtp = await UserSmtp.findOneAndDelete({
      _id: params.id,
      userId: auth.userId,
    });

    if (!smtp) {
      return NextResponse.json(
        { error: 'SMTP configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'SMTP configuration deleted successfully' });
  } catch (error: any) {
    console.error('Delete user SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


