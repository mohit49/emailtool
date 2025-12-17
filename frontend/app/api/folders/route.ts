import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Folder from '@/lib/models/Folder';
import { authenticateRequest } from '@/lib/utils/auth';

// Get all folders for the authenticated user
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'template'; // 'template' or 'recipient'

    const folders = await Folder.find({
      userId: auth.userId,
      type: type,
    }).sort({ name: 1 });

    return NextResponse.json({ folders });
  } catch (error: any) {
    console.error('Get folders error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new folder
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

    const { name, type = 'template' } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Check if folder already exists for this user and type
    const existingFolder = await Folder.findOne({
      userId: auth.userId,
      name: name.trim(),
      type: type,
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Folder with this name already exists' },
        { status: 400 }
      );
    }

    const folder = new Folder({
      userId: auth.userId,
      name: name.trim(),
      type: type,
    });

    await folder.save();

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error: any) {
    console.error('Create folder error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Folder with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

