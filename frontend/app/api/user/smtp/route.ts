import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserSmtp from '@/lib/models/UserSmtp';
import { authenticateRequest } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const smtpConfigs = await UserSmtp.find({ userId: auth.userId }).sort({ createdAt: -1 });

    // Don't send passwords back
    const smtpWithoutPasswords = smtpConfigs.map(smtp => {
      const { smtpPass, ...rest } = smtp.toObject();
      return rest;
    });

    return NextResponse.json({ smtpConfigs: smtpWithoutPasswords });
  } catch (error: any) {
    console.error('Get user SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, name, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, isActive } = await req.json();

    if (!smtpHost || !smtpPort || !smtpUser || !smtpFrom) {
      return NextResponse.json(
        { error: 'SMTP Host, Port, User, and From are required' },
        { status: 400 }
      );
    }

    // For new configurations, password is required
    if (!id && (!smtpPass || !smtpPass.trim())) {
      return NextResponse.json(
        { error: 'SMTP Password is required for new configurations' },
        { status: 400 }
      );
    }

    // If id is provided, update existing settings
    if (id) {
      const existing = await UserSmtp.findOne({ _id: id, userId: auth.userId });
      
      if (!existing) {
        return NextResponse.json(
          { error: 'SMTP configuration not found' },
          { status: 404 }
        );
      }

      // Update existing settings - always update name if provided
      if (name !== undefined && name !== null) {
        existing.name = (name.trim() || 'Default');
      } else if (name === '') {
        // If name is explicitly empty string, set to Default
        existing.name = 'Default';
      }
      existing.smtpHost = smtpHost.trim();
      existing.smtpPort = parseInt(smtpPort);
      existing.smtpUser = smtpUser.trim();
      // Update password if provided and not empty
      // Always save the password when user provides a new one
      if (smtpPass !== undefined && smtpPass !== null && smtpPass.trim()) {
        existing.smtpPass = smtpPass.trim();
      }
      // If password is not provided or empty, keep the existing password
      existing.smtpFrom = smtpFrom.trim();
      if (isActive !== undefined) {
        existing.isActive = isActive;
      }
      await existing.save();

      const { smtpPass: _, ...smtpWithoutPassword } = existing.toObject();
      return NextResponse.json({ smtp: smtpWithoutPassword });
    } else {
      // For new settings, password is required
      if (!smtpPass || !smtpPass.trim()) {
        return NextResponse.json(
          { error: 'SMTP Password is required for new settings' },
          { status: 400 }
        );
      }

      // Create new settings
      const smtp = new UserSmtp({
        userId: auth.userId,
        name: (name && name.trim()) || 'Default',
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort),
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        smtpFrom: smtpFrom.trim(),
        isActive: isActive !== undefined ? isActive : true,
      });

      await smtp.save();

      const { smtpPass: _, ...smtpWithoutPassword } = smtp.toObject();
      return NextResponse.json({ smtp: smtpWithoutPassword }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Save user SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

