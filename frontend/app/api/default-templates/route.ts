import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DefaultTemplate from '@/lib/models/DefaultTemplate';
import { authenticateRequest } from '@/lib/utils/auth';

// Public route for users to get default templates
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const templates = await DefaultTemplate.find()
      .select('name description html category')
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


