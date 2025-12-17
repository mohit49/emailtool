import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SharedTemplate from '@/lib/models/SharedTemplate';

// Get shared template by token (public endpoint)
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const sharedTemplate = await SharedTemplate.findOne({
      shareToken: params.token,
    }).lean();

    if (!sharedTemplate) {
      return NextResponse.json(
        { error: 'Shared template not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (sharedTemplate.expiresAt && new Date(sharedTemplate.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This shared link has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      html: sharedTemplate.html,
      createdAt: sharedTemplate.createdAt,
    });
  } catch (error: any) {
    console.error('Get shared template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


