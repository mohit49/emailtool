import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AutoSendEmail from '@/lib/models/AutoSendEmail';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// PUT - Toggle enable/disable auto-send email rule
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
    const { enabled } = await req.json();

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

    // Find the auto-send email rule
    const autoSendEmail = await AutoSendEmail.findOne({
      _id: emailId,
      projectId: projectId,
    });

    if (!autoSendEmail) {
      return NextResponse.json(
        { error: 'Auto-send email rule not found' },
        { status: 404 }
      );
    }

    // Update enabled status
    autoSendEmail.enabled = enabled !== undefined ? enabled : !autoSendEmail.enabled;
    await autoSendEmail.save();

    const populated = await AutoSendEmail.findById(autoSendEmail._id)
      .populate('formId', 'name')
      .populate('templateId', 'name')
      .lean();

    return NextResponse.json({ 
      message: 'Auto-send email rule updated successfully',
      autoSendEmail: populated 
    });
  } catch (error: any) {
    console.error('Toggle auto-send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

