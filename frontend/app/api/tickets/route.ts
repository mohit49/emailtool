import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/utils/auth';
import { sendTicketUpdateNotification } from '@/lib/services/emailService';
import mongoose from 'mongoose';

// GET - Get all tickets (user can see their own, admin can see all)
export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let tickets;

    if (user.role === 'admin') {
      // Admin can see all tickets
      tickets = await SupportTicket.find({})
        .populate('createdBy', 'name email')
        .populate('assignedUsers', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Regular users can see tickets they created or are assigned to
      tickets = await SupportTicket.find({
        $or: [
          { createdBy: userId },
          { assignedUsers: userId },
        ],
      })
        .populate('createdBy', 'name email')
        .populate('assignedUsers', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new ticket
export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { title, description, priority, images } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a unique 5-digit ticket number
    let ticketNumber: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isUnique && attempts < maxAttempts) {
      // Generate random 5-digit number (10000-99999)
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      ticketNumber = randomNum.toString();

      // Check if it already exists
      try {
        const existing = await SupportTicket.findOne({ ticketNumber });
        if (!existing) {
          isUnique = true;
        }
      } catch (err) {
        console.error('Error checking ticket number uniqueness:', err);
      }
      attempts++;
    }

    // Fallback if we couldn't find a unique number
    if (!isUnique || !ticketNumber) {
      const timestamp = Date.now();
      ticketNumber = String(timestamp % 100000).padStart(5, '0');
      
      // Double check
      try {
        const existing = await SupportTicket.findOne({ ticketNumber });
        if (existing) {
          ticketNumber = String((timestamp % 90000) + 10000);
        }
      } catch (err) {
        // Continue with generated number
      }
    }

    const ticket = new SupportTicket({
      ticketNumber,
      title,
      description,
      priority: priority || 'medium',
      createdBy: userId,
      assignedUsers: [userId], // Creator is automatically assigned
      images: images || [],
    });

    await ticket.save();

    // Move temporary images to ticket folder if they exist
    if (images && Array.isArray(images) && images.length > 0) {
      const path = require('path');
      const fs = require('fs').promises;
      
      try {
        const ticketNumber = ticket.ticketNumber;
        const ticketDir = path.join(
          process.cwd(),
          'public',
          'tickets',
          ticketNumber
        );
        
        await fs.mkdir(ticketDir, { recursive: true });
        
        const updatedImageUrls: string[] = [];
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                       (req.headers.get('x-forwarded-proto') || 'http') + '://' + 
                       (req.headers.get('host') || 'localhost:3000');
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        
        // Move images from temp folder to ticket folder
        for (const imageUrl of images) {
          // Extract filename from URL
          const urlParts = imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          
          // Check if it's a temp image
          if (imageUrl.includes('/tickets/temp/')) {
            const tempPath = path.join(
              process.cwd(),
              'public',
              'tickets',
              'temp',
              userId.toString(),
              filename
            );
            
            const destPath = path.join(ticketDir, filename);
            
            try {
              // Check if temp file exists
              await fs.access(tempPath);
              // Move file
              await fs.rename(tempPath, destPath);
              
              // Update image URL to point to ticket folder
              const newUrl = `${cleanBaseUrl}/tickets/${ticketNumber}/${filename}`;
              updatedImageUrls.push(newUrl);
            } catch (moveErr) {
              console.error('Error moving temp image:', moveErr);
              // If move fails, keep original URL
              updatedImageUrls.push(imageUrl);
            }
          } else {
            // Not a temp image, keep as is
            updatedImageUrls.push(imageUrl);
          }
        }
        
        // Update ticket with moved image URLs
        ticket.images = updatedImageUrls;
        await ticket.save();
      } catch (moveError) {
        console.error('Error moving images to ticket folder:', moveError);
        // Continue even if image move fails
      }
    }

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email')
      .lean();

    // Send email notification to all admins about new ticket
    try {
      const admins = await User.find({ role: 'admin' })
        .select('name email')
        .lean();
      
      if (admins.length > 0) {
        const recipients = admins.map((admin: any) => ({
          email: admin.email,
          name: admin.name,
        }));
        
        await sendTicketUpdateNotification(
          ticket.ticketNumber,
          ticket.title,
          'new', // New ticket type
          {
            name: user.name,
            email: user.email,
            role: user.role,
          },
          recipients,
          {
            comment: ticket.description,
          },
          ticket._id.toString()
        );
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send new ticket notification:', emailError);
    }

    return NextResponse.json(
      { ticket: populatedTicket },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
