import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PopupActivity from '@/lib/models/PopupActivity';
import Project from '@/lib/models/Project';
import mongoose from 'mongoose';

/**
 * Public API endpoint for SDK to fetch activated popup activities
 * No authentication required - uses projectId as public identifier
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid projectId' },
        { status: 400 }
      );
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Verify project exists
    const project = await Project.findById(projectObjectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch only activated popup activities
    const activities = await PopupActivity.find({
      projectId: projectObjectId,
      status: 'activated',
    })
      .select('name urlConditions logicOperator html popupSettings')
      .lean();

    // Return activities with only necessary data
    const sanitizedActivities = activities.map((activity) => ({
      _id: activity._id.toString(),
      name: activity.name,
      urlConditions: activity.urlConditions || [],
      logicOperator: activity.logicOperator || 'OR',
      html: activity.html || '',
      popupSettings: activity.popupSettings || {},
    }));

    return NextResponse.json(
      { activities: sanitizedActivities },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error: any) {
    console.error('SDK get popups error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}












