import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

// This is a one-time setup route to make the first user an admin
// In production, you should remove this or protect it properly
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    ).select('-password -verificationToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User set as admin successfully',
      user,
    });
  } catch (error: any) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


