import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Form from '@/lib/models/Form';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

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
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Verify user has access to this project
    const project = await Project.findById(projectObjectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId: projectObjectId });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const forms = await Form.find({ projectId: projectObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ forms });
  } catch (error: any) {
    console.error('Get forms error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

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

    const { formId, name, formType, projectId, fields, status } = await req.json();

    if (!formId || !name || !formType || !projectId) {
      return NextResponse.json(
        { error: 'formId, name, formType, and projectId are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Verify user has access to this project
    const project = await Project.findById(projectObjectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId: projectObjectId });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if formId already exists
    const existingForm = await Form.findOne({ formId: formId.trim().toLowerCase() });
    if (existingForm) {
      return NextResponse.json(
        { error: 'Form ID already exists. Please choose a different ID.' },
        { status: 400 }
      );
    }

    const form = new Form({
      formId: formId.trim().toLowerCase(),
      name: name.trim(),
      formType,
      projectId: projectObjectId,
      userId,
      fields: fields || [],
      status: status || 'draft',
    });

    await form.save();

    return NextResponse.json({ form }, { status: 201 });
  } catch (error: any) {
    console.error('Create form error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Form ID already exists. Please choose a different ID.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

