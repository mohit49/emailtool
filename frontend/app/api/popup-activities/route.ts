import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PopupActivity from '@/lib/models/PopupActivity';
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

    const activities = await PopupActivity.find({ projectId: projectObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Get popup activities error:', error);
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

    const { name, projectId, urlConditions, logicOperator, html, status, popupSettings } = await req.json();

    if (!name || !projectId) {
      return NextResponse.json(
        { error: 'Name and projectId are required' },
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

    const activity = new PopupActivity({
      name: name.trim(),
      projectId: projectObjectId,
      userId,
      urlConditions: urlConditions || [],
      logicOperator: logicOperator || 'OR',
      html: html || '',
      status: status || 'draft',
      popupSettings: popupSettings || {},
    });

    await activity.save();

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    console.error('Create popup activity error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
