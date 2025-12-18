import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ApiKey from '@/lib/models/ApiKey';
import Project from '@/lib/models/Project';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// POST - Authenticate using API key and project ID
export async function POST(req: NextRequest) {
  try {
    const { apiKey, projectId } = await req.json();

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { error: 'API key and project ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the API key
    const keyRecord = await ApiKey.findOne({
      key: apiKey,
      isActive: true,
    }).populate('userId', 'name email');

    if (!keyRecord) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Verify the project ID matches
    if (keyRecord.projectId.toString() !== projectId) {
      return NextResponse.json(
        { error: 'API key does not belong to this project' },
        { status: 403 }
      );
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update last used timestamp
    keyRecord.lastUsedAt = new Date();
    await keyRecord.save();

    // Generate JWT token for API access
    const token = jwt.sign(
      {
        userId: keyRecord.userId._id.toString(),
        projectId: projectId,
        apiKeyId: keyRecord._id.toString(),
        type: 'api_key',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: 'API key authenticated successfully',
      project: {
        id: project._id.toString(),
        name: project.name,
      },
      user: {
        id: keyRecord.userId._id.toString(),
        name: (keyRecord.userId as any).name,
        email: (keyRecord.userId as any).email,
      },
    });

    // Set HTTP-only cookie for API authentication
    // For cross-origin requests, use 'none' with secure: true
    // For same-origin, use 'lax'
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('przio_api_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error authenticating API key:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

