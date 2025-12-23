import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PopupActivity from '@/lib/models/PopupActivity';
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
    const activityObjectId = new mongoose.Types.ObjectId(activityId);

    const activity = await PopupActivity.findById(activityObjectId).lean();
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
      projectId: activity.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error('Get popup activity error:', error);
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

    const activityId = params.id;
    if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const activityObjectId = new mongoose.Types.ObjectId(activityId);

    const activity = await PopupActivity.findById(activityObjectId);
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
      projectId: activity.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { name, urlConditions, logicOperator, html, status, popupSettings } = await req.json();

    if (name !== undefined) activity.name = name.trim();
    if (urlConditions !== undefined) activity.urlConditions = urlConditions;
    if (logicOperator !== undefined) activity.logicOperator = logicOperator;
    if (html !== undefined) activity.html = html;
    if (status !== undefined) activity.status = status;
    if (popupSettings !== undefined) activity.popupSettings = popupSettings;

    await activity.save();

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error('Update popup activity error:', error);
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

    const activityId = params.id;
    if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const activityObjectId = new mongoose.Types.ObjectId(activityId);

    const activity = await PopupActivity.findById(activityObjectId);
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
      projectId: activity.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await PopupActivity.findByIdAndDelete(activityObjectId);

    return NextResponse.json({ message: 'Popup activity deleted successfully' });
  } catch (error: any) {
    console.error('Delete popup activity error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
