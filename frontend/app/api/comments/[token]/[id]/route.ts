import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { authenticateRequest } from '@/lib/utils/auth';

// Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    await connectDB();

    const auth = authenticateRequest(req);
    
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

    // Only allow deletion if user is authenticated and is the comment owner
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { error: 'Authentication required to delete comments' },
        { status: 401 }
      );
    }

    // Check if user owns this comment
    if (comment.userId && comment.userId.toString() !== auth.userId.toString()) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Soft delete the comment (mark as deleted instead of removing)
    comment.deleted = true;
    await comment.save();

    // Convert to plain object and include userId as string
    const commentObj = comment.toObject();
    return NextResponse.json({ 
      message: 'Comment deleted successfully',
      comment: {
        ...commentObj,
        userId: commentObj.userId ? commentObj.userId.toString() : undefined,
      }
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

