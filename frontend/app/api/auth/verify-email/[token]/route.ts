import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const jwtToken = generateToken(user._id.toString());

    return NextResponse.json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Server error during verification' },
      { status: 500 }
    );
  }
}


