import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Form from '@/lib/models/Form';
import FormSubmission from '@/lib/models/FormSubmission';
import mongoose from 'mongoose';

// Helper function to get CORS headers
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Allow requests from any origin (since forms can be on any website)
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

// Handle preflight OPTIONS request
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  // Enable CORS for form submissions from external websites
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    await connectDB();

    const { formId, data, visitorId } = await req.json();

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'formId and data are required' },
        { status: 400 }
      );
    }

    // Find form by formId
    const form = await Form.findOne({ formId: formId.trim().toLowerCase() });
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Check if form is active
    if (form.status !== 'active') {
      return NextResponse.json(
        { error: 'Form is not active' },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create submission
    const submission = new FormSubmission({
      formId: form.formId,
      formObjectId: form._id,
      projectId: form.projectId,
      data,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
      visitorId: visitorId || undefined, // przio-uuid from cookie
    });

    await submission.save();

    return NextResponse.json({ 
      message: 'Form submitted successfully',
      submissionId: submission._id 
    }, { 
      status: 201,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Submit form error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

