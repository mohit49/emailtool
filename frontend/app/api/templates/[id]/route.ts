import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/lib/models/Template';
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
    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // If template belongs to a project, verify access
    if (template.projectId) {
      const project = await Project.findById(template.projectId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: template.projectId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    } else {
      // Personal template - check ownership
      if (template.userId.toString() !== userId.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Get template error:', error);
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

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const { name, html, folder, projectId } = await req.json();
    
    const template = await Template.findById(params.id);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify access and permissions
    if (template.projectId) {
      const project = await Project.findById(template.projectId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: template.projectId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // emailDeveloper and ProjectAdmin can edit templates
      if (!isCreator && member && !['emailDeveloper', 'ProjectAdmin'].includes(member.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit templates' },
          { status: 403 }
        );
      }
    } else {
      // Personal template - check ownership
      if (template.userId.toString() !== userId.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (html) updateData.html = html;
    if (folder !== undefined) updateData.folder = folder?.trim() || undefined;
    if (projectId !== undefined) {
      updateData.projectId = projectId ? new mongoose.Types.ObjectId(projectId) : null;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ template: updatedTemplate });
  } catch (error: any) {
    console.error('Update template error:', error);
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

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify access and permissions
    if (template.projectId) {
      const project = await Project.findById(template.projectId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: template.projectId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Only ProjectAdmin and owner can delete templates
      if (!isCreator && (!member || member.role !== 'ProjectAdmin')) {
        return NextResponse.json(
          { error: 'Only ProjectAdmin can delete templates' },
          { status: 403 }
        );
      }
    } else {
      // Personal template - check ownership
      if (template.userId.toString() !== userId.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    await Template.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

