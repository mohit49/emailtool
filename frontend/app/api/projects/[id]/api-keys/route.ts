import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ApiKey from '@/lib/models/ApiKey';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { requireAuth } from '@/lib/utils/auth';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Generate a secure API key
function generateApiKey(): string {
  return 'przio_' + crypto.randomBytes(32).toString('hex');
}

// GET - Get all API keys for a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    await connectDB();

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const isCreator = project.createdBy.toString() === userId.toString();
    const projectMember = await ProjectMember.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId,
    });

    if (!isCreator && !projectMember) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Get all API keys for this project
    const apiKeys = await ApiKey.find({
      projectId: new mongoose.Types.ObjectId(projectId),
    })
      .select('key name isActive lastUsedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ apiKeys });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key for a project
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const { name } = await req.json();
    await connectDB();

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const isCreator = project.createdBy.toString() === userId.toString();
    const projectMember = await ProjectMember.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId,
    });

    // Only owner or ProjectAdmin can create API keys
    if (!isCreator && (!projectMember || projectMember.role !== 'ProjectAdmin')) {
      return NextResponse.json(
        { error: 'Only project owner or ProjectAdmin can create API keys' },
        { status: 403 }
      );
    }

    // Generate API key
    const key = generateApiKey();

    // Create API key
    const apiKey = new ApiKey({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId,
      key,
      name: name || `API Key ${new Date().toLocaleDateString()}`,
      isActive: true,
    });

    await apiKey.save();

    return NextResponse.json({
      apiKey: {
        _id: apiKey._id,
        key: apiKey.key,
        name: apiKey.name,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
      message: 'API key created successfully',
    });
  } catch (error: any) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const isCreator = project.createdBy.toString() === userId.toString();
    const projectMember = await ProjectMember.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId,
    });

    // Only owner or ProjectAdmin can delete API keys
    if (!isCreator && (!projectMember || projectMember.role !== 'ProjectAdmin')) {
      return NextResponse.json(
        { error: 'Only project owner or ProjectAdmin can delete API keys' },
        { status: 403 }
      );
    }

    // Delete the API key
    await ApiKey.findOneAndDelete({
      _id: keyId,
      projectId: new mongoose.Types.ObjectId(projectId),
    });

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}








