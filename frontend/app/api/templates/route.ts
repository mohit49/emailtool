import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/lib/models/Template';
import { authenticateRequest } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const templates = await Template.find({ userId: auth.userId })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { name, html, folder, isDefault, defaultTemplateId } = await req.json();

    if (!name || !html) {
      return NextResponse.json(
        { error: 'Name and HTML are required' },
        { status: 400 }
      );
    }

    const template = new Template({
      userId: auth.userId,
      name: name.trim(),
      html,
      folder: folder?.trim() || undefined,
      isDefault: isDefault || false,
      defaultTemplateId: defaultTemplateId || undefined,
    });

    await template.save();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

