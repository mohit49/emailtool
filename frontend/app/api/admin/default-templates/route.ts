import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DefaultTemplate from '@/lib/models/DefaultTemplate';
import { requireAdmin } from '@/lib/utils/admin';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const templates = await DefaultTemplate.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Get default templates error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    if (!name || !html) {
      return NextResponse.json(
        { error: 'Name and HTML are required' },
        { status: 400 }
      );
    }

    const template = new DefaultTemplate({
      name: name.trim(),
      description: description?.trim(),
      html,
      category: category?.trim() || 'General',
      createdBy: auth.userId,
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Create default template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


