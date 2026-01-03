import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ScheduledEmail from '@/lib/models/ScheduledEmail';
import Recipient from '@/lib/models/Recipient';
import FormSubmission from '@/lib/models/FormSubmission';
import Form from '@/lib/models/Form';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';
import EmailHistory from '@/lib/models/EmailHistory';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// POST - Process and send scheduled emails (called by cron job or manually)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Find all pending scheduled emails that are due
    const now = new Date();
    const scheduledEmails = await ScheduledEmail.find({
      status: 'pending',
      scheduledAt: { $lte: now },
    }).populate('templateId', 'name').lean();

    if (scheduledEmails.length === 0) {
      return NextResponse.json({ 
        message: 'No scheduled emails to process',
        processed: 0 
      });
    }

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const scheduledEmail of scheduledEmails) {
      try {
        // Update status to processing (we'll update to sent/failed later)
        await ScheduledEmail.updateOne(
          { _id: scheduledEmail._id },
          { $set: { status: 'sent' } } // We'll update this if it fails
        );

        // Get SMTP configuration
        let smtpConfig: any = null;
        if (scheduledEmail.smtpId.startsWith('admin_')) {
          const adminSmtpId = scheduledEmail.smtpId.replace('admin_', '');
          smtpConfig = await AdminSmtp.findById(adminSmtpId);
        } else {
          smtpConfig = await UserSmtp.findById(scheduledEmail.smtpId);
        }

        if (!smtpConfig || !smtpConfig.smtpHost || !smtpConfig.smtpUser || !smtpConfig.smtpPass) {
          throw new Error('SMTP configuration not found or invalid');
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

        // Collect all recipients from selected folders
        const recipientEmails = new Set<string>();
        const recipientData = new Map<string, any>();

        // Process regular recipient folders
        const regularFolders = scheduledEmail.recipientFolders.filter(f => !f.startsWith('form-'));
        if (regularFolders.length > 0) {
          const recipients = await Recipient.find({
            projectId: scheduledEmail.projectId,
            folder: { $in: regularFolders },
          }).lean();

          recipients.forEach((recipient: any) => {
            const email = recipient.email.toLowerCase();
            recipientEmails.add(email);
            recipientData.set(email, {
              name: recipient.name,
              email: recipient.email,
              ...(recipient.customFields || {}),
            });
          });
        }

        // Process form lead folders
        const formFolders = scheduledEmail.recipientFolders.filter(f => f.startsWith('form-'));
        if (formFolders.length > 0) {
          // Get all forms for this project
          const forms = await Form.find({ projectId: scheduledEmail.projectId })
            .select('_id name')
            .lean();
          
          // Create a map of form name to form ID
          const formNameMap = new Map<string, mongoose.Types.ObjectId>();
          forms.forEach((form: any) => {
            formNameMap.set(form.name, form._id);
          });

          // Get form IDs for the selected form folders
          const formIds: mongoose.Types.ObjectId[] = [];
          formFolders.forEach(formFolder => {
            const formName = formFolder.replace('form-', '');
            const formId = formNameMap.get(formName);
            if (formId) {
              formIds.push(formId);
            }
          });

          if (formIds.length > 0) {
            // Find form submissions for these forms
            const submissions = await FormSubmission.find({
              projectId: scheduledEmail.projectId,
              formObjectId: { $in: formIds },
            }).lean();

            // Extract emails from form submissions
            submissions.forEach((submission: any) => {
              const emailFields = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'mail', 'Mail'];
              let email = '';
              for (const field of emailFields) {
                if (submission.data && submission.data[field]) {
                  email = String(submission.data[field]).trim().toLowerCase();
                  break;
                }
              }

              if (email) {
                recipientEmails.add(email);
                // Store all form data as variables (merge if email already exists)
                const existingData = recipientData.get(email) || {};
                recipientData.set(email, {
                  ...existingData,
                  name: submission.data.name || submission.data.Name || existingData.name || '',
                  email: email,
                  ...(submission.data || {}),
                });
              }
            });
          }
        }

        if (recipientEmails.size === 0) {
          throw new Error('No recipients found in selected folders');
        }

        // Send emails to all recipients
        const emailPromises = Array.from(recipientEmails).map(async (email) => {
          const recipientInfo = recipientData.get(email) || { email, name: '' };

          // Replace variables in subject and HTML
          let processedSubject = scheduledEmail.subject;
          let processedHtml = scheduledEmail.html;

          // Replace all variables
          Object.keys(recipientInfo).forEach(key => {
            const value = String(recipientInfo[key] || '');
            const regex = new RegExp(`{{${key}}}`, 'gi');
            processedSubject = processedSubject.replace(regex, value);
            processedHtml = processedHtml.replace(regex, value);
          });

          try {
            await transporter.sendMail({
              from: smtpConfig.smtpFrom || smtpConfig.smtpUser,
              to: email,
              subject: processedSubject,
              html: processedHtml,
            });

            // Create email history record
            try {
              await EmailHistory.create({
                projectId: scheduledEmail.projectId,
                userId: scheduledEmail.userId,
                templateId: scheduledEmail.templateId._id,
                templateName: scheduledEmail.templateId.name,
                recipientEmail: email,
                recipientName: recipientInfo.name || '',
                subject: processedSubject,
                fromEmail: smtpConfig.smtpFrom || smtpConfig.smtpUser,
                fromName: smtpConfig.title || smtpConfig.name || undefined,
                smtpId: scheduledEmail.smtpId,
                status: 'success',
                sentAt: new Date(),
              });
            } catch (error) {
              console.error('Error creating email history:', error);
            }

            return { success: true, email };
          } catch (error: any) {
            console.error(`Error sending email to ${email}:`, error);
            return { success: false, email, error: error.message };
          }
        });

        const results = await Promise.allSettled(emailPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failCount = results.length - successCount;

        // Update scheduled email status
        if (failCount === 0) {
          await ScheduledEmail.updateOne(
            { _id: scheduledEmail._id },
            { 
              $set: { 
                status: 'sent',
                sentAt: new Date(),
              } 
            }
          );
          sent++;
        } else if (successCount > 0) {
          // Partially sent - mark as sent but log errors
          await ScheduledEmail.updateOne(
            { _id: scheduledEmail._id },
            { 
              $set: { 
                status: 'sent',
                sentAt: new Date(),
                errorMessage: `${failCount} emails failed to send`,
              } 
            }
          );
          sent++;
        } else {
          // All failed
          await ScheduledEmail.updateOne(
            { _id: scheduledEmail._id },
            { 
              $set: { 
                status: 'failed',
                errorMessage: 'All emails failed to send',
              } 
            }
          );
          failed++;
        }

        processed++;
      } catch (error: any) {
        console.error(`Error processing scheduled email ${scheduledEmail._id}:`, error);
        
        // Update status to failed
        await ScheduledEmail.updateOne(
          { _id: scheduledEmail._id },
          { 
            $set: { 
              status: 'failed',
              errorMessage: error.message || 'Failed to process scheduled email',
            } 
          }
        );
        
        failed++;
        processed++;
      }
    }

    return NextResponse.json({
      message: 'Scheduled emails processed',
      processed,
      sent,
      failed,
    });
  } catch (error: any) {
    console.error('Process scheduled emails error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

