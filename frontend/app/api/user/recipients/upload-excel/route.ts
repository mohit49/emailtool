import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Recipient from '@/lib/models/Recipient';
import Project from '@/lib/models/Project';
import ProjectMember from '@/lib/models/ProjectMember';
import { requireAuth } from '@/lib/utils/auth';
import * as XLSX from 'xlsx';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder')?.toString() || undefined;
    const projectId = formData.get('projectId')?.toString() || undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // If projectId is provided, verify access
    let projId: mongoose.Types.ObjectId | null = null;
    if (projectId) {
      projId = new mongoose.Types.ObjectId(projectId);
      
      const project = await Project.findById(projId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const isCreator = project.createdBy.toString() === userId.toString();
      const member = await ProjectMember.findOne({ userId, projectId: projId });

      if (!isCreator && !member) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or invalid' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let added = 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      // Find name and email columns (case-insensitive)
      let name = '';
      let email = '';

      // Try different possible column names
      name = row['Name'] || row['name'] || row['NAME'] || row['Full Name'] || row['full name'] || '';
      email = row['Email'] || row['email'] || row['EMAIL'] || row['E-mail'] || row['e-mail'] || '';

      // Validate required fields
      if (!name || !name.toString().trim()) {
        errors.push(`Row ${i + 2}: Name is required`);
        continue;
      }

      if (!email || !email.toString().trim()) {
        errors.push(`Row ${i + 2}: Email is required`);
        continue;
      }

      // Validate email format
      const emailStr = email.toString().trim().toLowerCase();
      if (!emailRegex.test(emailStr)) {
        errors.push(`Row ${i + 2}: Invalid email format (${emailStr})`);
        continue;
      }

      // Extract custom fields (all columns except Name and Email)
      const customFields: Record<string, any> = {};
      const reservedFields = ['name', 'email', 'NAME', 'EMAIL', 'Name', 'Email', 'Full Name', 'full name', 'E-mail', 'e-mail'];
      
      Object.keys(row).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (!reservedFields.includes(key) && !reservedFields.includes(lowerKey)) {
          const value = row[key];
          if (value !== undefined && value !== null && value.toString().trim() !== '') {
            customFields[key.trim()] = value.toString().trim();
          }
        }
      });

      // Check if recipient already exists for this user and project
      const existing = await Recipient.findOne({
        userId: auth.userId,
        projectId: projId || null,
        email: emailStr,
      });

      if (existing) {
        errors.push(`Row ${i + 2}: Email already exists (${emailStr})`);
        continue;
      }

      // Create recipient
      try {
        const recipient = new Recipient({
          userId: auth.userId,
          projectId: projId || undefined,
          name: name.toString().trim(),
          email: emailStr,
          folder: folder && folder.trim() ? folder.trim() : undefined,
          customFields: Object.keys(customFields).length > 0 ? customFields : {},
        });

        await recipient.save();
        added++;
      } catch (error: any) {
        if (error.code === 11000) {
          errors.push(`Row ${i + 2}: Email already exists (${emailStr})`);
        } else {
          errors.push(`Row ${i + 2}: ${error.message || 'Failed to add recipient'}`);
        }
      }
    }

    return NextResponse.json({
      message: `Import completed. ${added} recipient(s) added.`,
      added,
      errors,
      totalRows: data.length,
    });
  } catch (error: any) {
    console.error('Error uploading Excel:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

