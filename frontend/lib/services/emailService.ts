import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';
import UserSmtp from '@/lib/models/UserSmtp';
import AdminSmtp from '@/lib/models/AdminSmtp';

// Get admin SMTP settings for system emails (verification, password reset, etc.)
const getAdminSMTPSettings = async () => {
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
const createSystemTransporter = async () => {
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

