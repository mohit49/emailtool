import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Form from '@/lib/models/Form';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

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

    const formId = params.id;
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const formObjectId = new mongoose.Types.ObjectId(formId);

    const form = await Form.findById(formObjectId).lean();
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(form.projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ 
      userId, 
      projectId: form.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error('Get form error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const formId = params.id;
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const formObjectId = new mongoose.Types.ObjectId(formId);

    const form = await Form.findById(formObjectId);
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(form.projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ 
      userId, 
      projectId: form.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { name, formType, fields, steps, status, formId: newFormId } = await req.json();

    if (name !== undefined) form.name = name.trim();
    if (formType !== undefined) form.formType = formType;
    if (fields !== undefined) form.fields = fields;
    if (steps !== undefined) form.steps = steps;
    if (status !== undefined) form.status = status;
    
    // If formId is being updated, check for uniqueness
    if (newFormId !== undefined && newFormId !== form.formId) {
      const existingForm = await Form.findOne({ formId: newFormId.trim().toLowerCase() });
      if (existingForm) {
        return NextResponse.json(
          { error: 'Form ID already exists. Please choose a different ID.' },
          { status: 400 }
        );
      }
      form.formId = newFormId.trim().toLowerCase();
    }

    await form.save();

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error('Update form error:', error);
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

export async function DELETE(
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

    const formId = params.id;
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const formObjectId = new mongoose.Types.ObjectId(formId);

    const form = await Form.findById(formObjectId);
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(form.projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ 
      userId, 
      projectId: form.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await Form.findByIdAndDelete(formObjectId);

    return NextResponse.json({ message: 'Form deleted successfully' });
  } catch (error: any) {
    console.error('Delete form error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

