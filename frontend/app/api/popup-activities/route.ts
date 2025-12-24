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

    // Create activity first to get the ID
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

    // Generate default HTML with przio-popup wrapper if html is empty
    if (!activity.html || !activity.html.includes('przio-popup')) {
      const popupId = `popup-${activity._id}`;
      // Default position is center
      const positionStyles = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); margin:0;';
      activity.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Popup</title>
</head>
<body style="margin:0; padding:0;">
    <div class="przio-popup" id="${popupId}" style="${positionStyles} padding:40px; background-color:#ffffff; border-radius:12px; max-width:500px; box-shadow:0 4px 6px rgba(0,0,0,0.1); z-index:9999;">
        <div class="przio-placeholder" style="position:relative; padding:40px 20px; border:2px dashed #cbd5e1; border-radius:8px; background-color:#f9fafb; text-align:center;" contenteditable="false">
            <p style="margin:0 0 12px 0; font-size:24px; color:#64748b;">🎯</p>
            <p style="margin:0 0 8px 0; font-size:18px; font-weight:600; color:#1e293b;">Start Building Your Popup</p>
            <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">Drag and drop components from the toolbar to create your popup</p>
        </div>
    </div>
</body>
</html>`;
      await activity.save();
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    console.error('Create popup activity error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
