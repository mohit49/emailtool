import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/utils/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      // Verify user has access to this project
      const userId = new mongoose.Types.ObjectId(auth.userId);
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

      // Sync all project members to Team Members folder for this user
      // Get all project members (including owner)
      const allMembers = await ProjectMember.find({ projectId: projId })
        .populate('userId', 'name email')
        .lean();

      // Get project creator info
      const creator = await User.findById(project.createdBy).select('name email').lean();
      
      // Create a list of all project members (including owner) - but exclude current user
      const membersToSync: Array<{ name: string; email: string }> = [];
      
      // Add creator if they're not the current user
      if (creator && creator._id.toString() !== userId.toString()) {
        membersToSync.push({
          name: creator.name,
          email: creator.email,
        });
      }

      // Add all other members (excluding current user)
      allMembers.forEach((m: any) => {
        if (m.userId && 
            m.userId._id.toString() !== project.createdBy.toString() &&
            m.userId._id.toString() !== userId.toString()) {
          membersToSync.push({
            name: m.userId.name,
            email: m.userId.email,
          });
        }
      });

      // Add/update all project members as recipients in Team Members folder
      for (const member of membersToSync) {
        try {
          const existingRecipient = await Recipient.findOne({
            userId: userId,
            projectId: projId,
            email: member.email.toLowerCase().trim(),
          });

          if (!existingRecipient) {
            const recipient = new Recipient({
              userId: userId,
              projectId: projId,
              name: member.name,
              email: member.email.toLowerCase().trim(),
              folder: 'Team Members',
            });
            await recipient.save();
            console.log(`Synced team member ${member.email} to recipients for user ${userId}`);
          } else {
            // Always update folder to Team Members if it's not already set correctly
            // Handle empty string, null, undefined, or other folders
            const currentFolder = (existingRecipient.folder || '').trim();
            const needsUpdate = currentFolder !== 'Team Members';
            
            if (needsUpdate) {
              existingRecipient.folder = 'Team Members';
              console.log(`Updating team member ${member.email} folder to Team Members (was: "${currentFolder}")`);
            }
            
            // Also update name in case it changed
            if (existingRecipient.name !== member.name) {
              existingRecipient.name = member.name;
            }
            
            // Save if any changes were made
            if (needsUpdate || existingRecipient.name !== member.name) {
              await existingRecipient.save();
            }
          }
        } catch (error: any) {
          // Ignore duplicate key errors
          if (error.code !== 11000) {
            console.error('Error syncing team member:', error);
          }
        }
      }

      // Get recipients for this project
      const recipients = await Recipient.find({ 
        userId: auth.userId,
        projectId: projId
      })
        .sort({ createdAt: -1 })
        .lean();

      // Log for debugging
      const teamMembersCount = recipients.filter((r: any) => r.folder === 'Team Members').length;
      console.log(`Fetched ${recipients.length} recipients for project ${projId}, ${teamMembersCount} in Team Members folder`);

      return NextResponse.json({ recipients });
    } else {
      // No projectId - return user's personal recipients (backward compatibility)
      const recipients = await Recipient.find({ 
        userId: auth.userId,
        projectId: null
      })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ recipients });
    }
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, folder, customFields, projectId } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // If projectId is provided, verify access
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

      // Check if recipient already exists for this user and project
      const existing = await Recipient.findOne({
        userId: auth.userId,
        projectId: projId,
        email: email.trim().toLowerCase(),
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Recipient with this email already exists in this project' },
          { status: 400 }
        );
      }

      const recipient = new Recipient({
        userId: auth.userId,
        projectId: projId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        folder: folder && folder.trim() ? folder.trim() : undefined,
        customFields: customFields && typeof customFields === 'object' ? customFields : {},
      });

      await recipient.save();

      return NextResponse.json(
        { message: 'Recipient added successfully', recipient },
        { status: 201 }
      );
    } else {
      // No projectId - create personal recipient (backward compatibility)
      const existing = await Recipient.findOne({
        userId: auth.userId,
        projectId: null,
        email: email.trim().toLowerCase(),
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Recipient with this email already exists' },
          { status: 400 }
        );
      }

      const recipient = new Recipient({
        userId: auth.userId,
        projectId: null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        folder: folder && folder.trim() ? folder.trim() : undefined,
        customFields: customFields && typeof customFields === 'object' ? customFields : {},
      });

      await recipient.save();

      return NextResponse.json(
        { message: 'Recipient added successfully', recipient },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error adding recipient:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Recipient with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

