import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET - Get a specific project
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

    // Check if user has access to this project
    const project = await Project.findById(projectId).populate('createdBy', 'name email').lean();
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy._id.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId }).lean();

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const role = isCreator ? 'owner' : (member?.role as 'ProjectAdmin' | 'emailDeveloper' || null);

    return NextResponse.json({
      project: {
        ...project,
        role,
      },
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a project
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

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectId = new mongoose.Types.ObjectId(params.id);
    const { name, description } = await req.json();

    // Check if user is creator or ProjectAdmin
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId });

    if (!isCreator && (!member || member.role !== 'ProjectAdmin')) {
      return NextResponse.json(
        { error: 'Only project owner or ProjectAdmin can update the project' },
        { status: 403 }
      );
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description?.trim() || '';
    }

    await project.save();

    const populatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({ project: populatedProject });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
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

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectId = new mongoose.Types.ObjectId(params.id);

    // Only creator can delete project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'Only project owner can delete the project' },
        { status: 403 }
      );
    }

    // Delete all project members
    await ProjectMember.deleteMany({ projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

