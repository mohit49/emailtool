import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ScheduledEmail from '@/lib/models/ScheduledEmail';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import Template from '@/lib/models/Template';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET - Get all scheduled emails for a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const scheduledEmails = await ScheduledEmail.find({ projectId })
      .populate('templateId', 'name')
      .sort({ scheduledAt: 1 })
      .lean();

    return NextResponse.json({ scheduledEmails });
  } catch (error: any) {
    console.error('Get scheduled emails error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new scheduled email
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const { templateId, smtpId, subject, html, recipientFolders, scheduledAt } = await req.json();

    // Validate required fields
    if (!templateId || !smtpId || !subject || !html || !recipientFolders || !Array.isArray(recipientFolders) || recipientFolders.length === 0 || !scheduledAt) {
      return NextResponse.json(
        { error: 'All fields are required: templateId, smtpId, subject, html, recipientFolders (array), scheduledAt' },
        { status: 400 }
      );
    }

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

    // Verify template exists and belongs to project
    const template = await Template.findOne({
      _id: templateId,
      projectId: projectId,
    });
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or does not belong to this project' },
        { status: 404 }
      );
    }

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduled date' },
        { status: 400 }
      );
    }

    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Create scheduled email
    const scheduledEmail = new ScheduledEmail({
      userId,
      projectId,
      templateId: new mongoose.Types.ObjectId(templateId),
      smtpId,
      subject,
      html,
      recipientFolders,
      scheduledAt: scheduledDate,
      status: 'pending',
    });

    await scheduledEmail.save();

    const populated = await ScheduledEmail.findById(scheduledEmail._id)
      .populate('templateId', 'name')
      .lean();

    return NextResponse.json({ scheduledEmail: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Create scheduled email error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

