import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

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
    let url: string;

    if (isProduction) {
      // In production, save to static/assets/templet/
      uploadDir = path.join(process.cwd(), '..', 'static', 'assets', 'templet');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      url = `/static/assets/templet/${filename}`;
    } else {
      // In development, save to public/templates/
      uploadDir = path.join(process.cwd(), 'public', 'templates', shareToken);
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      url = `/templates/${shareToken}/${filename}`;
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}

