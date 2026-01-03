import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ScheduledEmail from '@/lib/models/ScheduledEmail';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// PUT - Cancel a scheduled email
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; emailId: string } }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectId = new mongoose.Types.ObjectId(params.id);
    const emailId = new mongoose.Types.ObjectId(params.emailId);

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Find the scheduled email
    const scheduledEmail = await ScheduledEmail.findOne({
      _id: emailId,
      projectId: projectId,
    });

    if (!scheduledEmail) {
      return NextResponse.json(
        { error: 'Scheduled email not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation if status is pending
    if (scheduledEmail.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending scheduled emails can be cancelled' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    scheduledEmail.status = 'cancelled';
    await scheduledEmail.save();

    return NextResponse.json({ 
      message: 'Scheduled email cancelled successfully',
      scheduledEmail 
    });
  } catch (error: any) {
    console.error('Cancel scheduled email error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

