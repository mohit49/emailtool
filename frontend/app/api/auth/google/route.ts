import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, name, googleId, sub } = await req.json();

    // Use sub (Google's user ID) if googleId is not provided
    const finalGoogleId = googleId || sub;

    if (!email || !name || !finalGoogleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = new User({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        googleId: finalGoogleId,
        emailVerified: true, // Google emails are pre-verified
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing email account
      user.googleId = finalGoogleId;
      user.emailVerified = true;
      await user.save();
    } else if (user.googleId !== finalGoogleId) {
      // Update Google ID if it changed
      user.googleId = finalGoogleId;
      await user.save();
    }

    const token = generateToken(user._id.toString());

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Server error during Google authentication' },
      { status: 500 }
    );
  }
}


