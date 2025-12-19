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

// In production, saves to /static/assets/templet/
// In development, saves to /public/templates/<shareToken>/
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const shareToken = (formData.get('shareToken') as string | null) || 'shared';
    const isProduction = process.env.NODE_ENV === 'production';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    
    let uploadDir: string;
    let relativePath: string;

    if (isProduction) {
      // In production, save to static/assets/templet/
      uploadDir = path.join(process.cwd(), '..', 'static', 'assets', 'templet');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      relativePath = `/static/assets/templet/${filename}`;
    } else {
      // In development, save to public/templates/
      uploadDir = path.join(process.cwd(), 'public', 'templates', shareToken);
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      relativePath = `/templates/${shareToken}/${filename}`;
    }

    // Get base URL and return absolute URL
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}${relativePath}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}


