import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

// Helper function to get base URL for images
function getBaseUrl(req: NextRequest): string {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // If env var is not set or contains localhost, use request headers
  if (!baseUrl || baseUrl.includes('localhost')) {
    const protocol = req.headers.get('x-forwarded-proto') || 
                    (req.url.startsWith('https') ? 'https' : 'http');
    const host = req.headers.get('host') || 
                req.headers.get('x-forwarded-host') || 
                'localhost:3000';
    baseUrl = `${protocol}://${host}`;
  }
  
  // Ensure baseUrl doesn't end with a slash
  baseUrl = baseUrl.replace(/\/$/, '');
  return baseUrl;
}

// Saves to public/{projectId}/{date-time-folder}/{filename}
// shareToken is used as projectId for email templates
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const shareToken = (formData.get('shareToken') as string | null) || 'shared';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    
    // Create date-time folder: YYYY-MM-DD-HHmmss format
    const now = new Date();
    const dateTimeFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Use shareToken as projectId (it's actually the projectId in the tool page)
    const projectId = shareToken;
    
    // Create directory structure: public/{projectId}/{date-time-folder}/
    const uploadDir = path.join(
      process.cwd(),
      'public',
      projectId,
      dateTimeFolder
    );
    
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return relative path that can be used in HTML
    const relativePath = `/${projectId}/${dateTimeFolder}/${filename}`;

    // Get base URL and return absolute URL
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}${relativePath}`;

    return NextResponse.json({ url, relativePath });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}


