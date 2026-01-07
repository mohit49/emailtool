import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormSubmission from '@/lib/models/FormSubmission';
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

    // Fetch all form submissions for this project
    const submissions = await FormSubmission.find({ projectId })
      .sort({ submittedAt: -1 })
      .lean();

    // Fetch all forms for this project to get form names
    const forms = await Form.find({ projectId })
      .select('_id name formId')
      .lean();

    // Create a map of formObjectId to form name
    const formMap = new Map<string, { name: string; formId: string }>();
    forms.forEach(form => {
      formMap.set(form._id.toString(), {
        name: form.name,
        formId: form.formId,
      });
    });

    // Group submissions by form name
    const groupedByForm: Record<string, any[]> = {};

    submissions.forEach(submission => {
      const formInfo = formMap.get(submission.formObjectId.toString());
      if (formInfo) {
        const formName = formInfo.name;
        if (!groupedByForm[formName]) {
          groupedByForm[formName] = [];
        }
        groupedByForm[formName].push({
          ...submission,
          formName: formInfo.name,
          formId: formInfo.formId,
        });
      }
    });

    return NextResponse.json({
      formSubmissions: groupedByForm,
      totalSubmissions: submissions.length,
    });
  } catch (error: any) {
    console.error('Get form submissions error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


