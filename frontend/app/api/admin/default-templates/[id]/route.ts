import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DefaultTemplate from '@/lib/models/DefaultTemplate';
import { requireAdmin } from '@/lib/utils/admin';

export async function PUT(
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

    const { name, description, html, category } = await req.json();
    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (html) updateData.html = html;
    if (category) updateData.category = category.trim();

    const template = await DefaultTemplate.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Update default template error:', error);
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
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const template = await DefaultTemplate.findByIdAndDelete(params.id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Delete default template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


