import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { authenticateRequest } from '@/lib/utils/auth';

// Mark a comment as resolved or unresolved
export async function PUT(
  req: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    await connectDB();

    const auth = authenticateRequest(req);
    const { resolved } = await req.json();

    // Find the comment
    const comment = await Comment.findById(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if comment belongs to this share token
    if (comment.shareToken !== params.token) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only allow resolution if user is authenticated and is the comment owner
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { error: 'Authentication required to resolve comments' },
        { status: 401 }
      );
    }

    // Check if user owns this comment
    if (comment.userId && comment.userId.toString() !== auth.userId.toString()) {
      return NextResponse.json(
        { error: 'You can only resolve your own comments' },
        { status: 403 }
      );
    }

    // Update the comment resolved status
    comment.resolved = resolved !== undefined ? resolved : true;
    await comment.save();

    // Convert to plain object and include userId as string
    const commentObj = comment.toObject();
    return NextResponse.json({ 
      message: `Comment ${comment.resolved ? 'resolved' : 'unresolved'} successfully`,
      comment: {
        ...commentObj,
        userId: commentObj.userId ? commentObj.userId.toString() : undefined,
      }
    });
  } catch (error: any) {
    console.error('Resolve comment error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


