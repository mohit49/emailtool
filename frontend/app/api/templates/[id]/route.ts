import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/lib/models/Template';
import { authenticateRequest } from '@/lib/utils/auth';

export async function GET(
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

    const template = await Template.findOne({
      _id: params.id,
      userId: auth.userId,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { name, html, folder } = await req.json();
    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (html) updateData.html = html;
    if (folder !== undefined) updateData.folder = folder?.trim() || undefined;

    const template = await Template.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

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

    const template = await Template.findOneAndDelete({
      _id: params.id,
      userId: auth.userId,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

