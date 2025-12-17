import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import Recipient from '@/lib/models/Recipient';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET - List all projects for the authenticated user
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

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // Get projects where user is creator or member
    const memberProjects = await ProjectMember.find({ userId }).select('projectId').lean();
    const projectIds = memberProjects.map(m => m.projectId);
    
    // Also include projects created by the user
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { _id: { $in: projectIds } }
      ]
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

    // Get user's role in each project
    const projectsWithRoles = await Promise.all(
      projects.map(async (project) => {
        const isCreator = project.createdBy._id.toString() === userId.toString();
        let role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' | null = null;
        
        if (isCreator) {
          role = 'owner';
        } else {
          const member = await ProjectMember.findOne({
            userId,
            projectId: project._id
          }).lean();
          role = member?.role as 'ProjectAdmin' | 'emailDeveloper' || null;
        }

        return {
          ...project,
          role,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithRoles });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new project
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

    const { name, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // Create project
    const project = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: userId,
    });

    await project.save();

    // Automatically add creator as ProjectAdmin member
    const projectMember = new ProjectMember({
      userId,
      projectId: project._id,
      role: 'ProjectAdmin',
      addedBy: userId,
    });

    await projectMember.save();

    // Add project creator to recipients in "Team Members" folder
    // This ensures they appear in the recipients modal immediately
    try {
      const creator = await User.findById(userId).select('name email').lean();
      if (creator) {
        const existingRecipient = await Recipient.findOne({
          userId: userId,
          projectId: project._id,
          email: creator.email.toLowerCase().trim(),
        });

        if (!existingRecipient) {
          const recipient = new Recipient({
            userId: userId,
            projectId: project._id,
            name: creator.name,
            email: creator.email.toLowerCase().trim(),
            folder: 'Team Members',
          });
          await recipient.save();
          console.log(`Added project creator ${creator.email} to Team Members folder for project ${project._id}`);
        } else if (existingRecipient.folder !== 'Team Members') {
          // Update folder if it's not already Team Members
          existingRecipient.folder = 'Team Members';
          await existingRecipient.save();
          console.log(`Updated project creator ${creator.email} folder to Team Members`);
        }
      }
    } catch (error: any) {
      // Don't fail project creation if recipient creation fails
      if (error.code !== 11000) {
        console.error('Error adding project creator to recipients:', error);
      }
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .lean();

    return NextResponse.json({
      project: {
        ...populatedProject,
        role: 'owner',
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

