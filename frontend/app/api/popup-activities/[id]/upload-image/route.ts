import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { authenticateRequest } from '@/lib/utils/auth';
import connectDB from '@/lib/db';
import PopupActivity from '@/lib/models/PopupActivity';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import mongoose from 'mongoose';

// Helper function to get base URL for images
function getBaseUrl(req: NextRequest): string {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseUrl || baseUrl.includes('localhost')) {
    const protocol = req.headers.get('x-forwarded-proto') || 
                    (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('host') || 
                req.headers.get('x-forwarded-host') || 
                'localhost:3000';
    baseUrl = `${protocol}://${host}`;
  }
  
  baseUrl = baseUrl.replace(/\/$/, '');
  return baseUrl;
}

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

    const activityId = params.id;
    if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const activityObjectId = new mongoose.Types.ObjectId(activityId);

    const activity = await PopupActivity.findById(activityObjectId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Popup activity not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(activity.projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ 
      userId, 
      projectId: activity.projectId 
    });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    
    // Create directory structure: public/popups/{projectId}/{activityId}/
    const uploadDir = path.join(
      process.cwd(), 
      'public', 
      'popups', 
      activity.projectId.toString(),
      activityId
    );
    
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return relative path that can be used in HTML
    const relativePath = `/popups/${activity.projectId}/${activityId}/${filename}`;
    
    // Get base URL and return absolute URL
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}${relativePath}`;

    return NextResponse.json({ url, relativePath });
  } catch (error: any) {
    console.error('Popup image upload failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' }, 
      { status: 500 }
    );
  }
}








