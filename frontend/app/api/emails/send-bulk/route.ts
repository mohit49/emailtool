import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';
import Recipient from '@/lib/models/Recipient';
import Project from '@/lib/models/Project';
import { requireAuth } from '@/lib/utils/auth';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, html, subject, smtpId, recipients, projectId: requestProjectId } = await req.json();
    
    // For API key authentication, use the projectId from the token
    // For regular authentication, use the projectId from the request
    const projectId = auth.projectId || requestProjectId;
    
    // If using API key, projectId must match the token's projectId
    if (auth.type === 'api_key' && auth.projectId && requestProjectId && auth.projectId !== requestProjectId) {
      return NextResponse.json(
        { error: 'Project ID mismatch' },
        { status: 403 }
      );
    }

    if (!subject || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, recipients' },
        { status: 400 }
      );
    }

    // Either html or templateId must be provided
    if (!html && !templateId) {
      return NextResponse.json(
        { error: 'Either html or templateId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get project defaults if projectId is provided
    let projectDefaults: { defaultTemplateId?: mongoose.Types.ObjectId; defaultSmtpId?: string } = {};
    if (projectId) {
      const project = await Project.findById(projectId).lean();
      if (project) {
        projectDefaults.defaultTemplateId = project.defaultTemplateId;
        projectDefaults.defaultSmtpId = project.defaultSmtpId;
      }
    }

    // Use project default template if templateId not provided
    let finalTemplateId = templateId || (projectDefaults.defaultTemplateId?.toString());
    let finalHtml = html;
    let templateName: string | undefined;

    // Get template info if templateId is provided or using default
    if (finalTemplateId) {
      const templateQuery: any = { _id: finalTemplateId };
      if (auth.type === 'api_key' && projectId) {
        // For API key auth, check projectId
        templateQuery.projectId = new mongoose.Types.ObjectId(projectId);
      } else {
        // For regular auth, check userId
        templateQuery.userId = new mongoose.Types.ObjectId(auth.userId);
      }
      const template = await Template.findOne(templateQuery);
      if (template) {
        templateName = template.name;
        // If html not provided, use template HTML
        if (!finalHtml) {
          finalHtml = template.html;
        }
      }
    }

    if (!finalHtml) {
      return NextResponse.json(
        { error: 'HTML content is required. Provide html or set a default template for the project.' },
        { status: 400 }
      );
    }

    // Use project default SMTP if smtpId not provided
    let finalSmtpId = smtpId || projectDefaults.defaultSmtpId;

    if (!finalSmtpId) {
      return NextResponse.json(
        { error: 'SMTP ID is required. Provide smtpId or set a default SMTP for the project.' },
        { status: 400 }
      );
    }

    // Get SMTP configuration - check if it's admin SMTP or user SMTP
    let smtpConfig;
    if (finalSmtpId.startsWith('admin_')) {
      // Admin SMTP
      const adminSmtpId = finalSmtpId.replace('admin_', '');
      smtpConfig = await AdminSmtp.findOne({ _id: adminSmtpId, isActive: true });
      if (!smtpConfig) {
        return NextResponse.json(
          { error: 'Admin SMTP configuration not found or inactive' },
          { status: 404 }
        );
      }
    } else {
      // User SMTP
      smtpConfig = await UserSmtp.findOne({ _id: finalSmtpId, userId: auth.userId });
      if (!smtpConfig) {
        return NextResponse.json(
          { error: 'SMTP configuration not found' },
          { status: 404 }
        );
      }
    }

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

    // Send emails
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const emailHistoryRecords: any[] = [];

    // Get recipient details for history (only if projectId is provided)
    let recipientDetails: any[] = [];
    if (projectId) {
      recipientDetails = await Recipient.find({
        email: { $in: recipients },
        projectId: new mongoose.Types.ObjectId(projectId),
      });
    }

    const recipientMap = new Map(
      recipientDetails.map((r: any) => [r.email.toLowerCase(), { name: r.name, email: r.email }])
    );

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (email: string) => {
          const recipientInfo = recipientMap.get(email.toLowerCase()) || { name: undefined, email };
          let historyRecord: any = null;

          // Create pending history record
          if (projectId) {
            try {
              historyRecord = new EmailHistory({
                projectId: new mongoose.Types.ObjectId(projectId),
                userId: new mongoose.Types.ObjectId(auth.userId),
                templateId: finalTemplateId ? new mongoose.Types.ObjectId(finalTemplateId) : undefined,
                templateName,
                recipientEmail: email.toLowerCase(),
                recipientName: recipientInfo.name,
                subject,
                fromEmail: smtpConfig.smtpFrom,
                fromName: smtpConfig.title || undefined,
                smtpId: finalSmtpId,
                status: 'pending',
              });
              await historyRecord.save();
            } catch (error) {
              console.error('Error creating email history record:', error);
            }
          }

          try {
            await transporter.sendMail({
              from: smtpConfig.smtpFrom,
              to: email,
              subject,
              html: finalHtml,
            });
            sent++;
            
            // Update history record to success
            if (historyRecord) {
              historyRecord.status = 'success';
              historyRecord.sentAt = new Date();
              await historyRecord.save();
            } else if (projectId) {
              // Create success record if it wasn't created before (edge case)
              try {
                await EmailHistory.create({
                  projectId: new mongoose.Types.ObjectId(projectId),
                  userId: new mongoose.Types.ObjectId(auth.userId),
                  templateId: finalTemplateId ? new mongoose.Types.ObjectId(finalTemplateId) : undefined,
                  templateName,
                  recipientEmail: email.toLowerCase(),
                  recipientName: recipientInfo.name,
                  subject,
                  fromEmail: smtpConfig.smtpFrom,
                  fromName: smtpConfig.title || undefined,
                  smtpId: finalSmtpId,
                  status: 'success',
                  sentAt: new Date(),
                });
              } catch (error) {
                console.error('Error creating email history record:', error);
              }
            }
          } catch (error: any) {
            failed++;
            errors.push(`${email}: ${error.message}`);
            console.error(`Error sending email to ${email}:`, error);
            
            // Update history record to failed
            if (historyRecord) {
              historyRecord.status = 'failed';
              historyRecord.errorMessage = error.message;
              historyRecord.sentAt = new Date();
              await historyRecord.save();
            } else if (projectId) {
              // Create failed record if it wasn't created before (edge case)
              try {
                await EmailHistory.create({
                  projectId: new mongoose.Types.ObjectId(projectId),
                  userId: new mongoose.Types.ObjectId(auth.userId),
                  templateId: finalTemplateId ? new mongoose.Types.ObjectId(finalTemplateId) : undefined,
                  templateName,
                  recipientEmail: email.toLowerCase(),
                  recipientName: recipientInfo.name,
                  subject,
                  fromEmail: smtpConfig.smtpFrom,
                  fromName: smtpConfig.title || undefined,
                  smtpId: finalSmtpId,
                  status: 'failed',
                  errorMessage: error.message,
                  sentAt: new Date(),
                });
              } catch (error) {
                console.error('Error creating email history record:', error);
              }
            }
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      message: `Emails sent: ${sent}, Failed: ${failed}`,
      sent,
      failed,
      total: recipients.length,
      errors: errors.slice(0, 10), // Return first 10 errors
      progress: {
        sent,
        pending: recipients.length - sent - failed,
        failed,
        total: recipients.length,
      },
    });
  } catch (error: any) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

