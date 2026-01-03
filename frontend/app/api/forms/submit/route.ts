import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Form from '@/lib/models/Form';
import FormSubmission from '@/lib/models/FormSubmission';
import AutoSendEmail from '@/lib/models/AutoSendEmail';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';
import nodemailer from 'nodemailer';
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

    // Check for auto-send email rules and send email if enabled
    try {
      const autoSendRule = await AutoSendEmail.findOne({
        formId: form._id,
        enabled: true,
      }).populate('templateId');

      if (autoSendRule) {
        // Extract email from form data (check common email field names)
        let recipientEmail = '';
        const emailFields = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'mail', 'Mail'];
        for (const field of emailFields) {
          if (data[field]) {
            recipientEmail = String(data[field]).trim();
            break;
          }
        }

        if (recipientEmail) {
          // Get SMTP configuration
          let smtpConfig: any = null;
          if (autoSendRule.smtpId.startsWith('admin_')) {
            const adminSmtpId = autoSendRule.smtpId.replace('admin_', '');
            smtpConfig = await AdminSmtp.findById(adminSmtpId);
          } else {
            smtpConfig = await UserSmtp.findById(autoSendRule.smtpId);
          }

          if (smtpConfig && smtpConfig.smtpHost && smtpConfig.smtpUser && smtpConfig.smtpPass) {
            // Create transporter
            const transporter = nodemailer.createTransport({
              host: smtpConfig.smtpHost,
              port: smtpConfig.smtpPort,
              secure: smtpConfig.smtpPort === 465,
              auth: {
                user: smtpConfig.smtpUser,
                pass: smtpConfig.smtpPass,
              },
            });

            // Replace placeholders in subject and HTML with form data
            let processedSubject = autoSendRule.subject;
            let processedHtml = autoSendRule.html;
            
            Object.keys(data).forEach(key => {
              const value = String(data[key]);
              processedSubject = processedSubject.replace(new RegExp(`{{${key}}}`, 'gi'), value);
              processedHtml = processedHtml.replace(new RegExp(`{{${key}}}`, 'gi'), value);
            });

            // Send email (fire and forget - don't wait for response)
            transporter.sendMail({
              from: smtpConfig.smtpFrom || smtpConfig.smtpUser,
              to: recipientEmail,
              subject: processedSubject,
              html: processedHtml,
            }).catch((error) => {
              console.error('Error sending auto-send email:', error);
              // Don't throw - we don't want to fail the form submission if email fails
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing auto-send email:', error);
      // Don't fail the form submission if auto-send fails
    }

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

