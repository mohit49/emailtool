import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SharedTemplate from '@/lib/models/SharedTemplate';
import { authenticateRequest } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// Create a shareable link for a template
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

    const { html, templateId } = await req.json();

    if (!html || !html.trim()) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // If templateId is provided, check if a shared template already exists for this template
    let sharedTemplate;
    if (templateId) {
      sharedTemplate = await SharedTemplate.findOne({
        userId: new mongoose.Types.ObjectId(auth.userId),
        templateId: new mongoose.Types.ObjectId(templateId),
      });

      if (sharedTemplate) {
        // Update existing shared template with new HTML content
        sharedTemplate.html = html.trim();
        sharedTemplate.updatedAt = new Date();
        await sharedTemplate.save();
      }
    }

    // If no existing shared template found, create a new one
    if (!sharedTemplate) {
      sharedTemplate = new SharedTemplate({
        userId: new mongoose.Types.ObjectId(auth.userId),
        templateId: templateId ? new mongoose.Types.ObjectId(templateId) : undefined,
        html: html.trim(),
      });

      await sharedTemplate.save();
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/preview/${sharedTemplate.shareToken}`;

    return NextResponse.json({
      shareToken: sharedTemplate.shareToken,
      shareUrl,
      expiresAt: sharedTemplate.expiresAt,
    });
  } catch (error: any) {
    console.error('Create share link error:', error);
    if (error.code === 11000) {
      // Duplicate token, try again
      return NextResponse.json(
        { error: 'Failed to create share link. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

