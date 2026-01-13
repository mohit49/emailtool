import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authenticateRequest } from '@/lib/utils/auth';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

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

// POST - Upload temporary image before ticket creation
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    
    // Create temporary directory: public/tickets/temp/{userId}/
    const userId = auth.userId;
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'tickets',
      'temp',
      userId
    );
    
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return relative path that can be used in HTML
    const relativePath = `/tickets/temp/${userId}/${filename}`;

    // Get base URL and return absolute URL
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}${relativePath}`;

    return NextResponse.json({ url, relativePath, tempPath: filePath });
  } catch (error: any) {
    console.error('Temp image upload failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' }, 
      { status: 500 }
    );
  }
}
