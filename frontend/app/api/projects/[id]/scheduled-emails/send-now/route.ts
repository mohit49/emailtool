import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import FormSubmission from '@/lib/models/FormSubmission';
import Form from '@/lib/models/Form';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';
import EmailHistory from '@/lib/models/EmailHistory';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/lib/utils/auth';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';

// POST - Send email immediately (for testing)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const projectId = new mongoose.Types.ObjectId(params.id);
    const { templateId, smtpId, subject, html, recipientFolders } = await req.json();

    // Validate required fields
    if (!templateId || !smtpId || !subject || !html || !recipientFolders || !Array.isArray(recipientFolders) || recipientFolders.length === 0) {
      return NextResponse.json(
        { error: 'All fields are required: templateId, smtpId, subject, html, recipientFolders (array)' },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isCreator = project.createdBy.toString() === userId.toString();
    const member = await ProjectMember.findOne({ userId, projectId });

    if (!isCreator && !member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get SMTP configuration
    let smtpConfig: any = null;
    if (smtpId.startsWith('admin_')) {
      const adminSmtpId = smtpId.replace('admin_', '');
      smtpConfig = await AdminSmtp.findById(adminSmtpId);
    } else {
      smtpConfig = await UserSmtp.findById(smtpId);
    }

    if (!smtpConfig || !smtpConfig.smtpHost || !smtpConfig.smtpUser || !smtpConfig.smtpPass) {
      return NextResponse.json(
        { error: 'SMTP configuration not found or invalid' },
        { status: 400 }
      );
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
    const regularFolders = recipientFolders.filter((f: string) => !f.startsWith('form-'));
    if (regularFolders.length > 0) {
      const recipients = await Recipient.find({
        projectId: projectId,
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
    const formFolders = recipientFolders.filter((f: string) => f.startsWith('form-'));
    if (formFolders.length > 0) {
      // Get all forms for this project
      const forms = await Form.find({ projectId })
        .select('_id name')
        .lean();
      
      // Create a map of form name to form ID
      const formNameMap = new Map<string, mongoose.Types.ObjectId>();
      forms.forEach((form: any) => {
        formNameMap.set(form.name, form._id);
      });

      // Get form IDs for the selected form folders
      const formIds: mongoose.Types.ObjectId[] = [];
      formFolders.forEach((formFolder: string) => {
        const formName = formFolder.replace('form-', '');
        const formId = formNameMap.get(formName);
        if (formId) {
          formIds.push(formId);
        }
      });

      if (formIds.length > 0) {
        // Find form submissions for these forms
        const submissions = await FormSubmission.find({
          projectId: projectId,
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
      return NextResponse.json(
        { error: 'No recipients found in selected folders' },
        { status: 400 }
      );
    }

    // Send emails to all recipients
    const emailPromises = Array.from(recipientEmails).map(async (email) => {
      const recipientInfo = recipientData.get(email) || { email, name: '' };

      // Replace variables in subject and HTML
      let processedSubject = subject;
      let processedHtml = html;

      // Replace all variables
      Object.keys(recipientInfo).forEach((key: string) => {
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
            projectId: projectId,
            userId: userId,
            templateId: new mongoose.Types.ObjectId(templateId),
            recipientEmail: email,
            recipientName: recipientInfo.name || '',
            subject: processedSubject,
            fromEmail: smtpConfig.smtpFrom || smtpConfig.smtpUser,
            fromName: smtpConfig.title || smtpConfig.name || undefined,
            smtpId: smtpId,
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
    const successCount = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    return NextResponse.json({
      message: 'Email sent',
      total: recipientEmails.size,
      sent: successCount,
      failed: failCount,
    });
  } catch (error: any) {
    console.error('Send now error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

