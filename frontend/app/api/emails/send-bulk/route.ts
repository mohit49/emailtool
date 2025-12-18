import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';
import Recipient from '@/lib/models/Recipient';
import { requireAuth } from '@/lib/utils/auth';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, html, subject, smtpId, recipients, projectId } = await req.json();

    if (!html || !subject || !smtpId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: html, subject, smtpId, recipients' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get template info if templateId is provided
    let templateName: string | undefined;
    if (templateId) {
      const template = await Template.findOne({ _id: templateId, userId: auth.userId });
      if (template) {
        templateName = template.name;
      }
    }

    // Get SMTP configuration - check if it's admin SMTP or user SMTP
    let smtpConfig;
    if (smtpId.startsWith('admin_')) {
      // Admin SMTP
      const adminSmtpId = smtpId.replace('admin_', '');
      smtpConfig = await AdminSmtp.findOne({ _id: adminSmtpId, isActive: true });
      if (!smtpConfig) {
        return NextResponse.json(
          { error: 'Admin SMTP configuration not found or inactive' },
          { status: 404 }
        );
      }
    } else {
      // User SMTP
      smtpConfig = await UserSmtp.findOne({ _id: smtpId, userId: auth.userId });
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

    // Get recipient details for history
    const recipientDetails = await Recipient.find({
      email: { $in: recipients },
      ...(projectId ? { projectId: new mongoose.Types.ObjectId(projectId) } : { userId: auth.userId }),
    });

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
                templateId: templateId ? new mongoose.Types.ObjectId(templateId) : undefined,
                templateName,
                recipientEmail: email.toLowerCase(),
                recipientName: recipientInfo.name,
                subject,
                fromEmail: smtpConfig.smtpFrom,
                fromName: smtpConfig.title || undefined,
                smtpId,
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
              html,
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
                  templateId: templateId ? new mongoose.Types.ObjectId(templateId) : undefined,
                  templateName,
                  recipientEmail: email.toLowerCase(),
                  recipientName: recipientInfo.name,
                  subject,
                  fromEmail: smtpConfig.smtpFrom,
                  fromName: smtpConfig.title || undefined,
                  smtpId,
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
                  templateId: templateId ? new mongoose.Types.ObjectId(templateId) : undefined,
                  templateName,
                  recipientEmail: email.toLowerCase(),
                  recipientName: recipientInfo.name,
                  subject,
                  fromEmail: smtpConfig.smtpFrom,
                  fromName: smtpConfig.title || undefined,
                  smtpId,
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

