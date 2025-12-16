import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminSmtp from '@/lib/models/AdminSmtp';
import { requireAdmin } from '@/lib/utils/admin';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const smtpConfigs = await AdminSmtp.find().sort({ createdAt: -1 }).lean();

    // Don't send passwords back
    const smtpWithoutPasswords = smtpConfigs.map(smtp => {
      const { smtpPass, ...rest } = smtp;
      return rest;
    });

    return NextResponse.json({ smtpConfigs: smtpWithoutPasswords });
  } catch (error: any) {
    console.error('Get admin SMTP error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, title, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, isActive, isDefault } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!smtpHost || !smtpUser) {
      return NextResponse.json(
        { error: 'SMTP Host and User are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // If setting as default, unset other defaults
    if (isDefault) {
      await AdminSmtp.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    if (id) {
      // Update existing
      const existing = await AdminSmtp.findById(id);
      if (!existing) {
        return NextResponse.json(
          { error: 'SMTP configuration not found' },
          { status: 404 }
        );
      }

      existing.title = title.trim();
      existing.smtpHost = smtpHost.trim();
      existing.smtpPort = parseInt(smtpPort);
      existing.smtpUser = smtpUser.trim();
      if (smtpPass && smtpPass.trim()) {
        existing.smtpPass = smtpPass.trim();
      }
      existing.smtpFrom = smtpFrom.trim() || smtpUser.trim();
      existing.isActive = isActive !== undefined ? isActive : true;
      existing.isDefault = isDefault !== undefined ? isDefault : false;

      await existing.save();

      const { smtpPass: _, ...smtpWithoutPassword } = existing.toObject();
      return NextResponse.json({ smtp: smtpWithoutPassword });
    } else {
      // Create new
      if (!smtpPass || !smtpPass.trim()) {
        return NextResponse.json(
          { error: 'SMTP Password is required for new configurations' },
          { status: 400 }
        );
      }

      const smtp = new AdminSmtp({
        title: title.trim(),
        smtpHost: smtpHost.trim(),
        smtpPort: parseInt(smtpPort),
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        smtpFrom: smtpFrom.trim() || smtpUser.trim(),
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault !== undefined ? isDefault : false,
      });

      await smtp.save();

      const { smtpPass: _, ...smtpWithoutPassword } = smtp.toObject();
      return NextResponse.json({ smtp: smtpWithoutPassword }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Save admin SMTP error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Only one default SMTP configuration can exist' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


