import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AutoSendEmail from '@/lib/models/AutoSendEmail';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import Template from '@/lib/models/Template';
import Form from '@/lib/models/Form';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET - Get all auto-send email rules for a project
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

    const autoSendEmails = await AutoSendEmail.find({ projectId })
      .populate('formId', 'name')
      .populate('templateId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ autoSendEmails });
  } catch (error: any) {
    console.error('Get auto-send emails error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new auto-send email rule
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
    const { formId, templateId, smtpId, subject, html, enabled } = await req.json();

    // Validate required fields
    if (!formId || !templateId || !smtpId || !subject || !html) {
      return NextResponse.json(
        { error: 'All fields are required: formId, templateId, smtpId, subject, html' },
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

    // Verify form exists and belongs to project
    const form = await Form.findOne({
      _id: formId,
      projectId: projectId,
    });
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or does not belong to this project' },
        { status: 404 }
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

    // Check if auto-send rule already exists for this form
    const existing = await AutoSendEmail.findOne({
      formId: new mongoose.Types.ObjectId(formId),
      projectId: projectId,
    });

    if (existing) {
      // Update existing rule
      existing.templateId = new mongoose.Types.ObjectId(templateId);
      existing.smtpId = smtpId;
      existing.subject = subject;
      existing.html = html;
      existing.enabled = enabled !== undefined ? enabled : true;
      await existing.save();

      const populated = await AutoSendEmail.findById(existing._id)
        .populate('formId', 'name')
        .populate('templateId', 'name')
        .lean();

      return NextResponse.json({ autoSendEmail: populated });
    }

    // Create new auto-send email rule
    const autoSendEmail = new AutoSendEmail({
      userId,
      projectId,
      formId: new mongoose.Types.ObjectId(formId),
      templateId: new mongoose.Types.ObjectId(templateId),
      smtpId,
      subject,
      html,
      enabled: enabled !== undefined ? enabled : true,
    });

    await autoSendEmail.save();

    const populated = await AutoSendEmail.findById(autoSendEmail._id)
      .populate('formId', 'name')
      .populate('templateId', 'name')
      .lean();

    return NextResponse.json({ autoSendEmail: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Create auto-send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}


