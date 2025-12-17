import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Folder from '@/lib/models/Folder';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// Get all folders for the authenticated user
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
    const type = searchParams.get('type') || 'template'; // 'template' or 'recipient'
    const projectId = searchParams.get('projectId');

    const userId = new mongoose.Types.ObjectId(auth.userId);

    if (projectId) {
      // Verify user has access to this project
      const projId = new mongoose.Types.ObjectId(projectId);
      
      const project = await Project.findById(projId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: projId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get folders for this project
      const folders = await Folder.find({
        $or: [
          { projectId: projId, type: type },
          { projectId: null, userId, type } // Include user's personal folders for backward compatibility
        ]
      }).sort({ name: 1 });

      return NextResponse.json({ folders });
    } else {
      // No projectId - return user's personal folders (backward compatibility)
      const folders = await Folder.find({
        userId,
        type: type,
        projectId: null
      }).sort({ name: 1 });

      return NextResponse.json({ folders });
    }
  } catch (error: any) {
    console.error('Get folders error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new folder
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

    const { name, type = 'template', projectId } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // If projectId is provided, verify access and role
    if (projectId) {
      const projId = new mongoose.Types.ObjectId(projectId);
      
      const project = await Project.findById(projId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: projId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // emailDeveloper and ProjectAdmin can create folders
      if (!isCreator && member && !['emailDeveloper', 'ProjectAdmin'].includes(member.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create folders' },
          { status: 403 }
        );
      }

      // Check if folder already exists for this project and type
      const existingFolder = await Folder.findOne({
        userId,
        projectId: projId,
        name: name.trim(),
        type: type,
      });

      if (existingFolder) {
        return NextResponse.json(
          { error: 'Folder with this name already exists' },
          { status: 400 }
        );
      }

      const folder = new Folder({
        userId,
        projectId: projId,
        name: name.trim(),
        type: type,
      });

      await folder.save();

      return NextResponse.json({ folder }, { status: 201 });
    } else {
      // No projectId - create personal folder (backward compatibility)
      const existingFolder = await Folder.findOne({
        userId,
        projectId: null,
        name: name.trim(),
        type: type,
      });

      if (existingFolder) {
        return NextResponse.json(
          { error: 'Folder with this name already exists' },
          { status: 400 }
        );
      }

      const folder = new Folder({
        userId,
        projectId: null,
        name: name.trim(),
        type: type,
      });

      await folder.save();

      return NextResponse.json({ folder }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Create folder error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Folder with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


