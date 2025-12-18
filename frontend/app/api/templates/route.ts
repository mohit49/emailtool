import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/lib/models/Template';
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

    if (projectId) {
      const projId = new mongoose.Types.ObjectId(projectId);
      
      // For API key auth, projectId must match the token's projectId
      if (auth.type === 'api_key' && auth.projectId && auth.projectId !== projectId) {
        return NextResponse.json(
          { error: 'Project ID mismatch' },
          { status: 403 }
        );
      }

      // Verify user has access to this project (skip for API key auth as it's already verified)
      if (auth.type !== 'api_key') {
        const userId = new mongoose.Types.ObjectId(auth.userId);
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
      }

      // Get templates for this project
      const templates = await Template.find({ 
        projectId: projId
      })
        .sort({ updatedAt: -1 });

      return NextResponse.json({ templates });
    } else {
      // No projectId - return user's personal templates (backward compatibility)
      const templates = await Template.find({ 
        userId: auth.userId,
        projectId: null
      })
        .sort({ updatedAt: -1 });

      return NextResponse.json({ templates });
    }
  } catch (error: any) {
    console.error('Get templates error:', error);
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

    const { name, html, folder, isDefault, defaultTemplateId, projectId } = await req.json();

    if (!name || !html) {
      return NextResponse.json(
        { error: 'Name and HTML are required' },
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

      // emailDeveloper and ProjectAdmin can create templates
      if (!isCreator && member && !['emailDeveloper', 'ProjectAdmin'].includes(member.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create templates' },
          { status: 403 }
        );
      }
    }

    const template = new Template({
      userId,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
      name: name.trim(),
      html,
      folder: folder?.trim() || undefined,
      isDefault: isDefault || false,
      defaultTemplateId: defaultTemplateId || undefined,
    });

    await template.save();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

