import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// PUT - Update member role
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const memberId = new mongoose.Types.ObjectId(params.memberId);
    const { role } = await req.json();

    if (!role || !['emailDeveloper', 'ProjectAdmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required (emailDeveloper or ProjectAdmin)' },
        { status: 400 }
      );
    }

    // Check if user has permission (owner or ProjectAdmin)
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
        { error: 'Only project owner or ProjectAdmin can update member roles' },
        { status: 403 }
      );
    }

    // Find the member to update
    const memberToUpdate = await ProjectMember.findById(memberId);
    if (!memberToUpdate || memberToUpdate.projectId.toString() !== projectId.toString()) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Update role
    memberToUpdate.role = role as 'emailDeveloper' | 'ProjectAdmin';
    await memberToUpdate.save();

    const populatedMember = await ProjectMember.findById(memberId)
      .populate('userId', 'name email')
      .populate('addedBy', 'name email')
      .lean();

    return NextResponse.json({ member: populatedMember });
  } catch (error: any) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member from project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const memberId = new mongoose.Types.ObjectId(params.memberId);

    // Check if user has permission (owner or ProjectAdmin)
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
        { error: 'Only project owner or ProjectAdmin can remove members' },
        { status: 403 }
      );
    }

    // Find the member to remove
    const memberToRemove = await ProjectMember.findById(memberId);
    if (!memberToRemove || memberToRemove.projectId.toString() !== projectId.toString()) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Can't remove yourself if you're the only ProjectAdmin (unless you're the owner)
    if (!isCreator && memberToRemove.userId.toString() === userId.toString()) {
      const projectAdmins = await ProjectMember.countDocuments({
        projectId,
        role: 'ProjectAdmin',
      });
      if (projectAdmins <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove yourself. At least one ProjectAdmin is required.' },
          { status: 400 }
        );
      }
    }

    // Remove member
    await ProjectMember.findByIdAndDelete(memberId);

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}















