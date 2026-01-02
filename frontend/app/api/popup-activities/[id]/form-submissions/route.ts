import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PopupActivity from '@/lib/models/PopupActivity';
import FormSubmission from '@/lib/models/FormSubmission';
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

    const activityId = params.id;
    if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // Verify activity exists and user has access
    const activity = await PopupActivity.findById(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Popup activity not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(activity.projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({
      userId,
      projectId: activity.projectId,
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId is required' },
        { status: 400 }
      );
    }

    // Find all form submissions for this visitor ID in the same project
    const submissions = await FormSubmission.find({
      visitorId: visitorId,
      projectId: activity.projectId,
    })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      submissions: submissions.map((sub) => ({
        _id: sub._id,
        formId: sub.formId,
        formObjectId: sub.formObjectId,
        data: sub.data,
        submittedAt: sub.submittedAt,
        visitorId: sub.visitorId,
        activityId: activityId, // Include the popup activity ID
      })),
    });
  } catch (error: any) {
    console.error('Get form submissions by visitor ID error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}





