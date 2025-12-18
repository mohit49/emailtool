import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmailHistory from '@/lib/models/EmailHistory';
import ProjectMember from '@/lib/models/ProjectMember';
import Project from '@/lib/models/Project';
import { requireAuth } from '@/lib/utils/auth';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // Filter by status: pending, sent, failed, success
    const skip = (page - 1) * limit;

    await connectDB();

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const isCreator = project.createdBy.toString() === userId.toString();
    const projectMember = await ProjectMember.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId,
    });

    if (!isCreator && !projectMember) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {
      projectId: new mongoose.Types.ObjectId(projectId),
    };

    if (status && ['pending', 'sent', 'failed', 'success'].includes(status)) {
      query.status = status;
    }

    // Get email history with populated user information
    const [emailHistory, total] = await Promise.all([
      EmailHistory.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailHistory.countDocuments(query),
    ]);

    // Get statistics
    const stats = await EmailHistory.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap: Record<string, number> = {
      pending: 0,
      sent: 0,
      failed: 0,
      success: 0,
    };

    stats.forEach((stat: any) => {
      statsMap[stat._id] = stat.count;
    });

    return NextResponse.json({
      emailHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statsMap,
    });
  } catch (error: any) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

