import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const recipients = await Recipient.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ recipients });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, folder, customFields } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if recipient already exists for this user
    const existing = await Recipient.findOne({
      userId: auth.userId,
      email: email.trim().toLowerCase(),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Recipient with this email already exists' },
        { status: 400 }
      );
    }

    const recipient = new Recipient({
      userId: auth.userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      folder: folder && folder.trim() ? folder.trim() : undefined,
      customFields: customFields && typeof customFields === 'object' ? customFields : {},
    });

    await recipient.save();

    return NextResponse.json(
      { message: 'Recipient added successfully', recipient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding recipient:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Recipient with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

