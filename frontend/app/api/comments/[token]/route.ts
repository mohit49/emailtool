import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { authenticateRequest } from '@/lib/utils/auth';

// Get all comments for a shared template
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const comments = await Comment.find({
      shareToken: params.token,
    })
      .sort({ createdAt: -1 })
      .lean()
      .then(comments => comments.map(comment => ({
        ...comment,
        userId: comment.userId ? comment.userId.toString() : undefined,
      })));

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const auth = authenticateRequest(req);
    const { comment, position } = await req.json();

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return NextResponse.json(
        { error: 'Valid position is required' },
        { status: 400 }
      );
    }

    // Determine user name
    let userName = 'Anonymous User';
    let userId = undefined;

    if (auth && auth.userId) {
      // Fetch user name from database
      const User = (await import('@/lib/models/User')).default;
      const mongoose = await import('mongoose');
      const user = await User.findById(auth.userId).lean();
      if (user) {
        userName = user.name || user.email || 'User';
        userId = new mongoose.Types.ObjectId(auth.userId);
      }
    }

    const newComment = new Comment({
      shareToken: params.token,
      userId,
      userName,
      comment: comment.trim(),
      position: {
        x: position.x,
        y: position.y,
        elementSelector: position.elementSelector || undefined,
      },
    });

    await newComment.save();

    // Convert to plain object and include userId as string
    const commentObj = newComment.toObject();
    return NextResponse.json({ 
      comment: {
        ...commentObj,
        userId: commentObj.userId ? commentObj.userId.toString() : undefined,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

