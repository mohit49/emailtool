import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';

// Get admin SMTP settings for system emails (verification, password reset, etc.)
export const getAdminSMTPSettings = async () => {
  try {
    await connectDB();
    
    // First, try to find admin SMTP with support@przio.com
    let adminSmtp = await AdminSmtp.findOne({ 
      smtpFrom: 'support@przio.com',
      isActive: true 
    });
    
    // If not found, try to find default admin SMTP
    if (!adminSmtp) {
      adminSmtp = await AdminSmtp.findOne({ 
        isDefault: true,
        isActive: true 
      });
    }
    
    // If still not found, get any active admin SMTP
    if (!adminSmtp) {
      adminSmtp = await AdminSmtp.findOne({ isActive: true });
    }
    
    if (adminSmtp && adminSmtp.smtpHost && adminSmtp.smtpUser && adminSmtp.smtpPass) {
      return {
        host: adminSmtp.smtpHost,
        port: adminSmtp.smtpPort,
        user: adminSmtp.smtpUser,
        pass: adminSmtp.smtpPass,
        from: adminSmtp.smtpFrom || 'support@przio.com',
      };
    }
    
    // Fallback to old Settings model
    const smtpSetting = await Settings.findOne({ key: 'smtp' });
    if (smtpSetting && smtpSetting.value) {
      const { host, port, user, pass, from } = smtpSetting.value;
      if (host && user && pass) {
        return {
          host: host || 'smtp.gmail.com',
          port: parseInt(port || '587'),
          user,
          pass,
          from: from || 'support@przio.com',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching admin SMTP settings from database:', error);
  }

  // Fallback to environment variables
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'support@przio.com',
  };
};

// Get SMTP settings - priority: user settings > admin settings > environment variables
const getSMTPSettings = async (userId?: string) => {
  try {
    await connectDB();
    
    // First, try to get user's active SMTP settings if userId is provided
    if (userId) {
      const userSmtp = await UserSmtp.findOne({ userId, isActive: true });
      if (userSmtp && userSmtp.smtpHost && userSmtp.smtpUser && userSmtp.smtpPass) {
        return {
          host: userSmtp.smtpHost,
          port: userSmtp.smtpPort,
          user: userSmtp.smtpUser,
          pass: userSmtp.smtpPass,
          from: userSmtp.smtpFrom,
        };
      }
    }
    
    // Fallback to admin settings
    const smtpSetting = await Settings.findOne({ key: 'smtp' });
    if (smtpSetting && smtpSetting.value) {
      const { host, port, user, pass, from } = smtpSetting.value;
      if (host && user && pass) {
        return {
          host: host || 'smtp.gmail.com',
          port: parseInt(port || '587'),
          user,
          pass,
          from: from || user,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching SMTP settings from database:', error);
  }

  // Fallback to environment variables
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  };
};

// Create transporter
const createTransporter = async (userId?: string) => {
  const settings = await getSMTPSettings(userId);

  if (!settings.user || !settings.pass) {
    throw new Error(
      'SMTP credentials are not configured. Please configure email settings in Settings → Email Settings, ' +
      'or contact your administrator. ' +
      'For Gmail, you need to generate an App Password: https://support.google.com/accounts/answer/185833'
    );
  }

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });
};

// Create transporter for system emails (uses admin SMTP)
export const createSystemTransporter = async () => {
  const settings = await getAdminSMTPSettings();

  if (!settings.user || !settings.pass) {
    throw new Error(
      'Admin SMTP credentials are not configured. Please configure admin SMTP settings. ' +
      'System emails (verification, password reset) require admin SMTP configuration.'
    );
  }

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });
};

// Send verification email (uses admin SMTP)
export const sendVerificationEmail = async (email: string, name: string, token: string, userId?: string) => {
  try {
    const transporter = await createSystemTransporter();
    const settings = await getAdminSMTPSettings();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email/${token}`;

    const mailOptions = {
      from: settings.from || 'support@przio.com',
      to: email,
      subject: 'Verify Your Email - Email Testing Tool',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Email Testing Tool!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email} from ${settings.from}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email (uses admin SMTP)
export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  try {
    const transporter = await createSystemTransporter();
    const settings = await getAdminSMTPSettings();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

    const mailOptions = {
      from: settings.from || 'support@przio.com',
      to: email,
      subject: 'Reset Your Password - Email Testing Tool',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email} from ${settings.from}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send test email
export const sendTestEmail = async (to: string, subject: string, html: string, userId?: string) => {
  try {
    const transporter = await createTransporter(userId);
    const settings = await getSMTPSettings(userId);

    const mailOptions = {
      from: settings.from,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Test email sent to ${to}`);
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// Send project invitation email (uses admin SMTP)
export const sendProjectInvitationEmail = async (
  email: string,
  userName: string,
  projectName: string,
  addedByName: string,
  role: string
) => {
  try {
    const transporter = await createSystemTransporter();
    const settings = await getAdminSMTPSettings();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const projectsUrl = `${appUrl}/projects`;

    const roleDisplay = role === 'ProjectAdmin' ? 'Project Admin' : 'Email Developer';

    const mailOptions = {
      from: settings.from || 'support@przio.com',
      to: email,
      subject: `You've been added to "${projectName}" project - PRZIO`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f2f4f7; font-family: Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f4f7">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Gradient Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);">
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                        🎉 You've Been Added to a Project!
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                        Great news! <strong>${addedByName}</strong> has added you to the project:
                      </p>

                      <!-- Project Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%); border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <tr>
                          <td align="center">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                              <span style="font-size: 30px;">📁</span>
                            </div>
                            <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #1f2937;">
                              ${projectName}
                            </h2>
                            <span style="display: inline-block; padding: 6px 12px; background-color: #6366f1; color: #ffffff; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${roleDisplay}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        You now have access to collaborate on email templates within this project. Click the button below to get started:
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${projectsUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                              View Project →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                        If you have any questions, feel free to reach out to <strong>${addedByName}</strong> or our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                        This email was sent by PRZIO - Email Testing Tool<br>
                        © ${new Date().getFullYear()} PRZIO. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Project invitation email sent to ${email} from ${settings.from}`);
  } catch (error) {
    console.error('Error sending project invitation email:', error);
    // Don't throw error - we don't want to fail the API call if email fails
    console.error('Failed to send project invitation email, but member was added successfully');
  }
};// Send project invitation email for unregistered users (prompts them to sign up)
export const sendProjectSignupInvitationEmail = async (
  email: string,
  projectName: string,
  addedByName: string,
  role: string
) => {
  try {
    const transporter = await createSystemTransporter();
    const settings = await getAdminSMTPSettings();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signupUrl = `${appUrl}/signup`;

    const roleDisplay = role === 'ProjectAdmin' ? 'Project Admin' : 'Email Developer';

    const mailOptions = {
      from: settings.from || 'support@przio.com',
      to: email,
      subject: `You've been invited to join "${projectName}" project - PRZIO`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f2f4f7; font-family: Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f4f7">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Gradient Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);">
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                        🎉 You've Been Invited to Join a Project!
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi there,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                        Great news! <strong>${addedByName}</strong> has invited you to join the project:
                      </p>

                      <!-- Project Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%); border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <tr>
                          <td align="center">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                              <span style="font-size: 30px;">📁</span>
                            </div>
                            <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #1f2937;">
                              ${projectName}
                            </h2>
                            <span style="display: inline-block; padding: 6px 12px; background-color: #6366f1; color: #ffffff; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${roleDisplay}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        To get started, you'll need to sign up on PRZIO. Click the button below to create your account:
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${signupUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                              Sign Up on PRZIO →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                        Once you sign up with this email address (${email}), you'll automatically be added to the project and can start collaborating on email templates.
                      </p>

                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                        If you have any questions, feel free to reach out to <strong>${addedByName}</strong> or our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                        This email was sent by PRZIO - Email Testing Tool<br>
                        © ${new Date().getFullYear()} PRZIO. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Project signup invitation email sent to ${email} from ${settings.from}`);
  } catch (error) {
    console.error('Error sending project signup invitation email:', error);
    // Don't throw error - we don't want to fail the API call if email fails
    console.error('Failed to send project signup invitation email, but invitation was created successfully');
  }
};

// Send ticket update notification email (uses admin SMTP)
export const sendTicketUpdateNotification = async (
  ticketNumber: string,
  ticketTitle: string,
  updateType: 'status' | 'priority' | 'comment' | 'assignment' | 'new',
  updatedBy: { name: string; email: string; role: string },
  recipients: Array<{ email: string; name: string }>,
  updateDetails: {
    oldStatus?: string;
    newStatus?: string;
    oldPriority?: string;
    newPriority?: string;
    comment?: string;
    assignedUsers?: string[];
  },
  ticketId: string
) => {
  try {
    const transporter = await createSystemTransporter();
    const settings = await getAdminSMTPSettings();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Build update description
    let updateDescription = '';
    let updateSubject = '';
    
    if (updateType === 'new') {
      updateSubject = `New Support Ticket #${ticketNumber} Created`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          A new support ticket has been created and requires your attention.
        </p>
        ${updateDetails.comment ? `
          <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #1f2937; white-space: pre-wrap;">${updateDetails.comment}</p>
          </div>
        ` : ''}
      `;
    } else if (updateType === 'status' && updateDetails.oldStatus && updateDetails.newStatus) {
      updateSubject = `Ticket #${ticketNumber} Status Updated`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          The status has been changed from <strong>${updateDetails.oldStatus}</strong> to <strong>${updateDetails.newStatus}</strong>.
        </p>
      `;
    } else if (updateType === 'priority' && updateDetails.oldPriority && updateDetails.newPriority) {
      updateSubject = `Ticket #${ticketNumber} Priority Updated`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          The priority has been changed from <strong>${updateDetails.oldPriority}</strong> to <strong>${updateDetails.newPriority}</strong>.
        </p>
      `;
    } else if (updateType === 'comment') {
      updateSubject = `New Comment on Ticket #${ticketNumber}`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          A new comment has been added to the ticket.
        </p>
        ${updateDetails.comment ? `
          <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #1f2937; white-space: pre-wrap;">${updateDetails.comment}</p>
          </div>
        ` : ''}
      `;
    } else if (updateType === 'assignment') {
      updateSubject = `Ticket #${ticketNumber} Assignment Updated`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          The assigned users have been updated.
        </p>
      `;
    } else {
      updateSubject = `Ticket #${ticketNumber} Updated`;
      updateDescription = `
        <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
          The ticket has been updated.
        </p>
      `;
    }
    
    // Add comment if provided (for status/priority changes)
    if (updateDetails.comment && updateType !== 'comment') {
      updateDescription += `
        <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 5px; font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase;">Note:</p>
          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #1f2937; white-space: pre-wrap;">${updateDetails.comment}</p>
        </div>
      `;
    }

    // Send email to each recipient
    for (const recipient of recipients) {
      const ticketUrl = `${appUrl}/support/tickets/${ticketId}`;
      
      const mailOptions = {
        from: settings.from || 'support@przio.com',
        to: recipient.email,
        subject: `${updateSubject} - ${ticketTitle}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Update</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f2f4f7; font-family: Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f4f7">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <!-- Main Container -->
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Gradient Header -->
                    <tr>
                      <td align="center" style="padding: 40px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);">
                        <img src="${appUrl}/assets/logo-web.png" alt="PRZIO Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;" />
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                          ${updateType === 'new' ? '🎫 New Support Ticket' : '🎫 Support Ticket Update'}
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                          Hi <strong>${recipient.name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                          ${updateType === 'new' 
                            ? `A new support ticket has been created by <strong>${updatedBy.name}</strong> and requires your attention.`
                            : `Your support ticket has been updated by <strong>${updatedBy.name}</strong> ${updatedBy.role === 'admin' ? '(Administrator)' : ''}.`
                          }
                        </p>

                        <!-- Ticket Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%); border-radius: 8px; padding: 20px; margin: 20px 0;">
                          <tr>
                            <td>
                              <div style="margin-bottom: 10px;">
                                <span style="font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Number</span>
                                <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #1f2937; font-family: monospace;">
                                  #${ticketNumber}
                                </p>
                              </div>
                              <div style="margin-top: 15px;">
                                <span style="font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px;">Title</span>
                                <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                                  ${ticketTitle}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>

                        ${updateDescription}

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${ticketUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                                View Ticket →
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                          If you have any questions, feel free to reach out to our support team.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                          This email was sent by PRZIO - Email Testing Tool<br>
                          © ${new Date().getFullYear()} PRZIO. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Ticket update notification sent to ${recipient.email} from ${settings.from}`);
    }
  } catch (error) {
    console.error('Error sending ticket update notification:', error);
    // Don't throw error - we don't want to fail the API call if email fails
    console.error('Failed to send ticket update notification, but ticket was updated successfully');
  }
};
