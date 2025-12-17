import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import ProjectInvitation from '@/lib/models/ProjectInvitation';
import Recipient from '@/lib/models/Recipient';
import { sendVerificationEmail } from '@/lib/services/emailService';
import crypto from 'crypto';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      verificationToken,
      verificationTokenExpiry,
      emailVerified: false,
    });

    await user.save();

    // Check for pending project invitations and add user to projects
    const userId = new mongoose.Types.ObjectId(user._id);
    const pendingInvitations = await ProjectInvitation.find({
      email: user.email.toLowerCase().trim(),
      status: 'pending',
    });

    const addedProjects: string[] = [];

    for (const invitation of pendingInvitations) {
      try {
        // Check if user is already a member (shouldn't happen, but just in case)
        const existingMember = await ProjectMember.findOne({
          userId: userId,
          projectId: invitation.projectId,
        });

        if (!existingMember) {
          // Add user as project member
          const projectMember = new ProjectMember({
            userId: userId,
            projectId: invitation.projectId,
            role: invitation.role,
            addedBy: invitation.addedBy,
          });
          await projectMember.save();

          // Get all existing project members to add them as recipients
          const project = await Project.findById(invitation.projectId);
          if (project) {
            const allExistingMembers = await ProjectMember.find({ projectId: invitation.projectId })
              .populate('userId', 'name email')
              .lean();
            
            const creator = await User.findById(project.createdBy).select('name email').lean();
            
            // Add all existing members as recipients for the new user
            const membersToAdd: Array<{ name: string; email: string }> = [];
            
            if (creator && project.createdBy.toString() !== userId.toString()) {
              membersToAdd.push({
                name: creator.name,
                email: creator.email,
              });
            }
            
            allExistingMembers.forEach((m: any) => {
              if (m.userId && 
                  m.userId._id.toString() !== project.createdBy.toString() &&
                  m.userId._id.toString() !== userId.toString()) {
                membersToAdd.push({
                  name: m.userId.name,
                  email: m.userId.email,
                });
              }
            });

            // Add all existing members as recipients in Team Members folder
            for (const member of membersToAdd) {
              try {
                const existingRecipient = await Recipient.findOne({
                  userId: userId,
                  projectId: invitation.projectId,
                  email: member.email.toLowerCase().trim(),
                });

                if (!existingRecipient) {
                  const recipient = new Recipient({
                    userId: userId,
                    projectId: invitation.projectId,
                    name: member.name,
                    email: member.email.toLowerCase().trim(),
                    folder: 'Team Members',
                  });
                  await recipient.save();
                }
              } catch (error: any) {
                if (error.code !== 11000) {
                  console.error('Error adding recipient:', error);
                }
              }
            }

            // Add new user as recipient for all existing project members
            const allExistingMemberIds = await ProjectMember.find({ projectId: invitation.projectId })
              .select('userId')
              .lean();
            
            const creatorId = project.createdBy;
            
            const usersToAddRecipient: mongoose.Types.ObjectId[] = [];
            if (creatorId.toString() !== userId.toString()) {
              usersToAddRecipient.push(new mongoose.Types.ObjectId(creatorId));
            }
            
            allExistingMemberIds.forEach((m: any) => {
              if (m.userId && 
                  m.userId.toString() !== creatorId.toString() &&
                  m.userId.toString() !== userId.toString()) {
                usersToAddRecipient.push(new mongoose.Types.ObjectId(m.userId));
              }
            });

            for (const memberUserId of usersToAddRecipient) {
              try {
                const existingMemberUser = await User.findById(memberUserId).select('name email').lean();
                if (!existingMemberUser) continue;

                const existingRecipient = await Recipient.findOne({
                  userId: memberUserId,
                  projectId: invitation.projectId,
                  email: user.email.toLowerCase().trim(),
                });

                if (!existingRecipient) {
                  const recipient = new Recipient({
                    userId: memberUserId,
                    projectId: invitation.projectId,
                    name: user.name,
                    email: user.email.toLowerCase().trim(),
                    folder: 'Team Members',
                  });
                  await recipient.save();
                }
              } catch (error: any) {
                if (error.code !== 11000) {
                  console.error('Error adding recipient:', error);
                }
              }
            }
          }

          // Mark invitation as accepted
          invitation.status = 'accepted';
          await invitation.save();

          addedProjects.push(invitation.projectId.toString());
        }
      } catch (error: any) {
        console.error('Error processing project invitation:', error);
        // Continue with other invitations even if one fails
      }
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        message: 'User created. Please check your email for verification.',
        userId: user._id,
        addedToProjects: addedProjects.length > 0 ? addedProjects : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Server error during signup' },
      { status: 500 }
    );
  }
}


