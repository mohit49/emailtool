import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET - Get a specific ticket
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const ticketId = new mongoose.Types.ObjectId(params.id);

    const ticket = await SupportTicket.findById(ticketId)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email')
      .populate('comments.userId', 'name email')
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check access: admin, creator, or assigned user
    const isAdmin = user.role === 'admin';
    const isCreator = ticket.createdBy._id.toString() === userId.toString();
    const isAssigned = ticket.assignedUsers.some(
      (assigned: any) => assigned._id.toString() === userId.toString()
    );

    if (!isAdmin && !isCreator && !isAssigned) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a ticket (status, comments, assigned users)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const ticketId = new mongoose.Types.ObjectId(params.id);

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check access: admin, creator, or assigned user
    const isAdmin = user.role === 'admin';
    const isCreator = ticket.createdBy.toString() === userId.toString();
    const isAssigned = ticket.assignedUsers.some(
      (assignedId) => assignedId.toString() === userId.toString()
    );

    if (!isAdmin && !isCreator && !isAssigned) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators, ticket creator, or assigned users can update tickets.' },
        { status: 403 }
      );
    }

    const { status, priority, comment, commentImages, images, assignedUsers } = await req.json();

    // Update status if provided
    if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      const oldStatus = ticket.status;
      if (oldStatus !== status) {
        ticket.status = status;
        // Add timeline entry
        ticket.timeline.push({
          type: 'status',
          userId: userId,
          userName: user.name,
          userEmail: user.email,
          oldValue: oldStatus,
          newValue: status,
          comment: comment || undefined,
          createdAt: new Date(),
        });
      }
    }

    // Update priority if provided
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      const oldPriority = ticket.priority;
      if (oldPriority !== priority) {
        ticket.priority = priority;
        // Add timeline entry
        ticket.timeline.push({
          type: 'priority',
          userId: userId,
          userName: user.name,
          userEmail: user.email,
          oldValue: oldPriority,
          newValue: priority,
          comment: comment || undefined,
          createdAt: new Date(),
        });
      }
    }

    // Update ticket images if provided
    if (images && Array.isArray(images)) {
      ticket.images = images;
    }

    // Add comment if provided (only if it's a standalone comment, not tied to status/priority change)
    const isStatusOrPriorityChange = (status && ticket.status !== status) || (priority && ticket.priority !== priority);
    if (!isStatusOrPriorityChange && ((comment && comment.trim()) || (commentImages && commentImages.length > 0))) {
      const commentText = comment ? comment.trim() : '';
      ticket.comments.push({
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        comment: commentText,
        images: commentImages || [],
        createdAt: new Date(),
      });
      
      // Add timeline entry for comment
      ticket.timeline.push({
        type: 'comment',
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        newValue: commentText || 'Added images',
        createdAt: new Date(),
      });
    }

    // Update assigned users if provided (only admin can do this)
    if (assignedUsers && Array.isArray(assignedUsers)) {
      if (isAdmin) {
        ticket.assignedUsers = assignedUsers.map(
          (id: string) => new mongoose.Types.ObjectId(id)
        );
      } else {
        return NextResponse.json(
          { error: 'Only administrators can update assigned users' },
          { status: 403 }
        );
      }
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email')
      .populate('comments.userId', 'name email')
      .lean();

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
