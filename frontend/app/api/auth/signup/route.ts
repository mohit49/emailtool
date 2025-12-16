import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/services/emailService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      verificationToken,
      verificationTokenExpiry,
      emailVerified: false,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        message: 'User created. Please check your email for verification.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Server error during signup' },
      { status: 500 }
    );
  }
}


