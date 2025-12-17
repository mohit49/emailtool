import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import ProjectInvitation from '@/lib/models/ProjectInvitation';
import User from '@/lib/models/User';
import Recipient from '@/lib/models/Recipient';
import { authenticateRequest } from '@/lib/utils/auth';
import { sendProjectInvitationEmail, sendProjectSignupInvitationEmail } from '@/lib/services/emailService';
import mongoose from 'mongoose';

// GET - Get all members of a project
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
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all members with user details
    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'name email')
      .populate('addedBy', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    // Also include the project creator
    const creator = await User.findById(project.createdBy).select('name email').lean();
    const membersList = members.map((m: any) => ({
      _id: m._id,
      userId: m.userId,
      role: m.role,
      addedBy: m.addedBy,
      createdAt: m.createdAt,
    }));

    // Add creator if not already in members list
    const creatorInMembers = members.some((m: any) => 
      m.userId && m.userId._id && m.userId._id.toString() === project.createdBy.toString()
    );

    if (!creatorInMembers && creator) {
      membersList.unshift({
        _id: null as any,
        userId: creator as any,
        role: 'owner' as any,
        addedBy: creator as any,
        createdAt: project.createdAt,
      });
    }

    return NextResponse.json({ members: membersList });
  } catch (error: any) {
    console.error('Get project members error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Add a member to a project
export async function POST(
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
    const { userEmail, role } = await req.json();

    if (!userEmail || !role) {
      return NextResponse.json(
        { error: 'User email and role are required' },
        { status: 400 }
      );
    }

    if (!['emailDeveloper', 'ProjectAdmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be emailDeveloper or ProjectAdmin' },
        { status: 400 }
      );
    }

    // Check if user has permission to add members (owner or ProjectAdmin)
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
        { error: 'Only project owner or ProjectAdmin can add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: userEmail.toLowerCase().trim() });
    const emailToAdd = userEmail.toLowerCase().trim();
    
    // If user doesn't exist, create a pending invitation
    if (!userToAdd) {
      // Check if there's already a pending invitation for this email and project
      const existingInvitation = await ProjectInvitation.findOne({
        email: emailToAdd,
        projectId,
        status: 'pending',
      });

      if (existingInvitation) {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email address' },
          { status: 400 }
        );
      }

      // Create pending invitation
      const invitation = new ProjectInvitation({
        email: emailToAdd,
        projectId,
        role,
        addedBy: userId,
        status: 'pending',
      });

      await invitation.save();

      // Send signup invitation email
      const addedByUser = await User.findById(userId).select('name').lean();
      sendProjectSignupInvitationEmail(
        emailToAdd,
        project.name,
        addedByUser?.name || 'Team Member',
        role
      ).catch(error => {
        console.error('Failed to send project signup invitation email:', error);
      });

      return NextResponse.json(
        { 
          message: 'Invitation sent successfully. The user will be added to the project once they sign up.',
          invitation: {
            _id: invitation._id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
          },
          isPending: true,
        },
        { status: 201 }
      );
    }

    const userToAddId = new mongoose.Types.ObjectId(userToAdd._id);

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      userId: userToAddId,
      projectId,
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Can't add the creator as a member (they're already the owner)
    if (userToAddId.toString() === project.createdBy.toString()) {
      return NextResponse.json(
        { error: 'Project creator is already the owner' },
        { status: 400 }
      );
    }

    // Add member
    const projectMember = new ProjectMember({
      userId: userToAddId,
      projectId,
      role,
      addedBy: userId,
    });

    await projectMember.save();

    // Add new member as recipient in "Team Members" folder for ALL existing project members
    // Get all existing project members (including owner)
    const allExistingMembers = await ProjectMember.find({ projectId })
      .populate('userId', 'name email')
      .lean();
    
    const creator = await User.findById(project.createdBy).select('name email').lean();
    
    // Create list of all users who should have the new member as a recipient
    const usersToAddRecipient: mongoose.Types.ObjectId[] = [];
    
    // Add creator if they're not the new member being added
    if (creator && project.createdBy.toString() !== userToAddId.toString()) {
      usersToAddRecipient.push(new mongoose.Types.ObjectId(project.createdBy));
    }
    
    // Add all existing members (excluding the new member being added)
    allExistingMembers.forEach((m: any) => {
      if (m.userId && 
          m.userId._id.toString() !== project.createdBy.toString() &&
          m.userId._id.toString() !== userToAddId.toString()) {
        usersToAddRecipient.push(new mongoose.Types.ObjectId(m.userId._id));
      }
    });

    // Add the new member as recipient for all existing project members
    for (const memberUserId of usersToAddRecipient) {
      try {
        const existingRecipient = await Recipient.findOne({
          userId: memberUserId,
          projectId: projectId,
          email: userToAdd.email.toLowerCase().trim(),
        });

        if (!existingRecipient) {
          const recipient = new Recipient({
            userId: memberUserId,
            projectId: projectId,
            name: userToAdd.name,
            email: userToAdd.email.toLowerCase().trim(),
            folder: 'Team Members',
          });
          await recipient.save();
          console.log(`Added new member ${userToAdd.email} as recipient for user ${memberUserId}`);
        } else {
          // Update folder if it's not already Team Members (handles empty string, null, undefined, or other folders)
          const currentFolder = existingRecipient.folder || '';
          if (currentFolder.trim() !== 'Team Members') {
            existingRecipient.folder = 'Team Members';
            await existingRecipient.save();
            console.log(`Updated recipient ${userToAdd.email} folder to Team Members for user ${memberUserId} (was: "${currentFolder}")`);
          }
          // Also update name in case it changed
          if (existingRecipient.name !== userToAdd.name) {
            existingRecipient.name = userToAdd.name;
            await existingRecipient.save();
          }
        }
      } catch (recipientError: any) {
        // If recipient already exists or other error, just log it and continue
        if (recipientError.code !== 11000) {
          console.error('Recipient creation error:', recipientError.message);
        }
      }
    }

    // Also add all existing project members (including creator/owner and ProjectAdmins) as recipients for the newly added member
    // Create a comprehensive list of all users who should be in the new member's Team Members folder
    const allUsersForNewMember: Array<{ userId: mongoose.Types.ObjectId; name: string; email: string }> = [];
    
    // Add creator/owner if they're not the new member
    if (creator && project.createdBy.toString() !== userToAddId.toString()) {
      allUsersForNewMember.push({
        userId: new mongoose.Types.ObjectId(project.createdBy),
        name: creator.name,
        email: creator.email,
      });
    }
    
    // Add all existing project members (including ProjectAdmins and emailDevelopers)
    for (const m of allExistingMembers) {
      const userId = m.userId as any;
      if (userId && 
          userId._id && userId._id.toString() !== project.createdBy.toString() &&
          userId._id.toString() !== userToAddId.toString()) {
        allUsersForNewMember.push({
          userId: new mongoose.Types.ObjectId(userId._id),
          name: userId.name,
          email: userId.email,
        });
      }
    }

    // Add all existing project members as recipients for the newly added member
    for (const memberInfo of allUsersForNewMember) {
      try {
        const existingRecipient = await Recipient.findOne({
          userId: userToAddId,
          projectId: projectId,
          email: memberInfo.email.toLowerCase().trim(),
        });

        if (!existingRecipient) {
          const recipient = new Recipient({
            userId: userToAddId,
            projectId: projectId,
            name: memberInfo.name,
            email: memberInfo.email.toLowerCase().trim(),
            folder: 'Team Members',
          });
          await recipient.save();
          console.log(`Added ${memberInfo.email} to Team Members folder for newly added member ${userToAdd.email}`);
        } else {
          // Update folder if it's not already Team Members (handles empty string, null, undefined, or other folders)
          const currentFolder = existingRecipient.folder || '';
          if (currentFolder.trim() !== 'Team Members') {
            existingRecipient.folder = 'Team Members';
            await existingRecipient.save();
            console.log(`Updated ${memberInfo.email} folder to Team Members for newly added member ${userToAdd.email} (was: "${currentFolder}")`);
          }
          // Also update name in case it changed
          if (existingRecipient.name !== memberInfo.name) {
            existingRecipient.name = memberInfo.name;
            await existingRecipient.save();
          }
        }
      } catch (recipientError: any) {
        // If recipient already exists or other error, just log it and continue
        if (recipientError.code !== 11000) {
          console.log('Recipient creation note:', recipientError.message);
        }
      }
    }

    const populatedMember = await ProjectMember.findById(projectMember._id)
      .populate('userId', 'name email')
      .populate('addedBy', 'name email')
      .lean();

    // Send invitation email (don't await - send in background)
    const addedByUser = await User.findById(userId).select('name').lean();
    sendProjectInvitationEmail(
      userToAdd.email,
      userToAdd.name,
      project.name,
      addedByUser?.name || 'Team Member',
      role
    ).catch(error => {
      console.error('Failed to send project invitation email:', error);
    });

    return NextResponse.json({ member: populatedMember }, { status: 201 });
  } catch (error: any) {
    console.error('Add project member error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

