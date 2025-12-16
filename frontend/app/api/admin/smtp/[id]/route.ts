import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSmtp from '@/lib/models/AdminSmtp';
import { requireAdmin } from '@/lib/utils/admin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const smtp = await AdminSmtp.findById(params.id);
    if (!smtp) {
      return NextResponse.json(
        { error: 'SMTP configuration not found' },
        { status: 404 }
      );
    }

    await AdminSmtp.deleteOne({ _id: params.id });

    return NextResponse.json({ message: 'SMTP configuration deleted successfully' });
  } catch (error: any) {
    console.error('Delete admin SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


