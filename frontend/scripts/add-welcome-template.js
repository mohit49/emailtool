const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const defaultWelcomeTemplate = {
  name: 'Welcome Email',
  description: 'A beautiful welcome email with colorful header and footer',
  category: 'Welcome',
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Colorful Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                🎉 Welcome Aboard!
                            </h1>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                                We're thrilled to have you with us
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #ffffff;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                Hello there!
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Thank you for joining us! We're excited to have you as part of our community. 
                                You're now part of something special, and we can't wait to see what we'll accomplish together.
                            </p>
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Here's what you can expect:
                            </p>
                            
                            <!-- Features List -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin-bottom: 10px;">
                                        <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">
                                            ✨ Amazing Features
                                        </p>
                                        <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">
                                            Access to all premium features and tools
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #764ba2; margin-bottom: 10px;">
                                        <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">
                                            🚀 Quick Start Guide
                                        </p>
                                        <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">
                                            Get started in minutes with our easy-to-follow guides
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #f093fb; margin-bottom: 10px;">
                                        <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">
                                            💬 24/7 Support
                                        </p>
                                        <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">
                                            Our team is here to help you whenever you need
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Get Started Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you have any questions, feel free to reach out to us. We're always happy to help!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Colorful Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                            <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                Let's Stay Connected
                            </p>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <tr>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">📘</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">🐦</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">📷</span>
                                        </a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display: inline-block; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                                            <span style="color: #ffffff; font-size: 20px;">💼</span>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                                © 2024 Your Company Name. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.8;">
                                123 Main Street, City, State 12345 | <a href="#" style="color: #ffffff; text-decoration: underline;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
};

async function addWelcomeTemplate() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emailtestingtool';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const DefaultTemplate = mongoose.model('DefaultTemplate', new mongoose.Schema({
      name: String,
      description: String,
      html: String,
      category: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now }
    }));

    // Check if template already exists
    const existing = await DefaultTemplate.findOne({ name: 'Welcome Email' });
    if (existing) {
      console.log('Welcome Email template already exists. Updating...');
      existing.html = defaultWelcomeTemplate.html;
      existing.description = defaultWelcomeTemplate.description;
      await existing.save();
      console.log('Welcome Email template updated successfully!');
    } else {
      const template = new DefaultTemplate(defaultWelcomeTemplate);
      await template.save();
      console.log('Welcome Email template added successfully!');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addWelcomeTemplate();


