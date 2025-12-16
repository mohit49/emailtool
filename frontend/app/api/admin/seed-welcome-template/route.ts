import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DefaultTemplate from '@/lib/models/DefaultTemplate';
import { requireAdmin } from '@/lib/utils/admin';

const welcomeTemplateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome Email</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        /* Mobile Responsive Styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .header-padding {
                padding: 30px 20px !important;
            }
            .header-title {
                font-size: 24px !important;
            }
            .header-subtitle {
                font-size: 16px !important;
            }
            .content-padding {
                padding: 30px 20px !important;
            }
            .content-title {
                font-size: 20px !important;
            }
            .content-text {
                font-size: 14px !important;
            }
            .feature-box {
                padding: 12px !important;
                margin-bottom: 10px !important;
            }
            .feature-title {
                font-size: 14px !important;
            }
            .feature-text {
                font-size: 13px !important;
            }
            .cta-button {
                padding: 12px 30px !important;
                font-size: 14px !important;
                display: block !important;
                width: 100% !important;
                text-align: center !important;
            }
            .footer-padding {
                padding: 25px 20px !important;
            }
            .footer-title {
                font-size: 16px !important;
            }
            .social-icon {
                width: 35px !important;
                height: 35px !important;
                line-height: 35px !important;
                margin: 0 5px !important;
            }
            .footer-text {
                font-size: 12px !important;
            }
            .footer-small {
                font-size: 11px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <!--[if mso]>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 600px;">
                <tr>
                <td>
                <![endif]-->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <!-- Colorful Header -->
                    <tr>
                        <td class="header-padding" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; background-color: #667eea;">
                            <h1 class="header-title" style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                                🎉 Welcome Aboard!
                            </h1>
                            <p class="header-subtitle" style="margin: 15px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95; line-height: 1.4;">
                                We're thrilled to have you with us
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 40px 30px; background-color: #ffffff;">
                            <h2 class="content-title" style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600; line-height: 1.3;">
                                Hello there!
                            </h2>
                            <p class="content-text" style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Thank you for joining us! We're excited to have you as part of our community. 
                                You're now part of something special, and we can't wait to see what we'll accomplish together.
                            </p>
                            <p class="content-text" style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Here's what you can expect:
                            </p>
                            
                            <!-- Features List -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td class="feature-box" style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin-bottom: 10px;">
                                        <p class="feature-title" style="margin: 0; color: #333333; font-size: 16px; font-weight: 600; line-height: 1.4;">
                                            ✨ Amazing Features
                                        </p>
                                        <p class="feature-text" style="margin: 5px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                            Access to all premium features and tools
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="feature-box" style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #764ba2; margin-bottom: 10px;">
                                        <p class="feature-title" style="margin: 0; color: #333333; font-size: 16px; font-weight: 600; line-height: 1.4;">
                                            🚀 Quick Start Guide
                                        </p>
                                        <p class="feature-text" style="margin: 5px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                            Get started in minutes with our easy-to-follow guides
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="feature-box" style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #f093fb; margin-bottom: 10px;">
                                        <p class="feature-title" style="margin: 0; color: #333333; font-size: 16px; font-weight: 600; line-height: 1.4;">
                                            💬 24/7 Support
                                        </p>
                                        <p class="feature-text" style="margin: 5px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                            Our team is here to help you whenever you need
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin: 30px 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="#" class="cta-button" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); line-height: 1.5;">
                                            Get Started Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p class="content-text" style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you have any questions, feel free to reach out to us. We're always happy to help!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Colorful Footer -->
                    <tr>
                        <td class="footer-padding" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); background-color: #f093fb; padding: 30px; text-align: center;">
                            <p class="footer-title" style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 600; line-height: 1.4;">
                                Let's Stay Connected
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin: 20px 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">📘</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">🐦</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">📷</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" class="social-icon" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">💼</span>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p class="footer-text" style="margin: 20px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9; line-height: 1.5;">
                                © 2024 Your Company Name. All rights reserved.
                            </p>
                            <p class="footer-small" style="margin: 10px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.8; line-height: 1.5;">
                                123 Main Street, City, State 12345 | <a href="#" style="color: #ffffff; text-decoration: underline;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
                <!--[if mso]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
</body>
</html>`;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if welcome template already exists
    const existing = await DefaultTemplate.findOne({ name: 'Welcome Email' });
    
    if (existing) {
      // Update existing template
      existing.html = welcomeTemplateHTML;
      existing.description = 'A beautiful welcome email with colorful header and footer';
      existing.category = 'Welcome';
      await existing.save();
      return NextResponse.json({ 
        message: 'Welcome Email template updated successfully',
        template: existing 
      });
    } else {
      // Create new template
      const template = new DefaultTemplate({
        name: 'Welcome Email',
        description: 'A beautiful welcome email with colorful header and footer',
        html: welcomeTemplateHTML,
        category: 'Welcome',
        createdBy: auth.userId,
      });

      await template.save();
      await template.populate('createdBy', 'name email');

      return NextResponse.json({ 
        message: 'Welcome Email template created successfully',
        template 
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Seed welcome template error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

