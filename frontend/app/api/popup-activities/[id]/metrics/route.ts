import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import PopupMetrics from '../../../../../lib/models/PopupMetrics';
import PopupActivity from '../../../../../lib/models/PopupActivity';
import { verifyToken } from '../../../../../lib/utils/auth';

// Prevent route caching to avoid body consumption issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(params);
    const activityId = resolvedParams.id;

    // For metrics tracking, allow requests without authentication (from SDK)
    // But verify the activity exists
    const activity = await PopupActivity.findById(activityId);
    if (!activity) {
      return NextResponse.json({ error: 'Popup activity not found' }, { status: 404 });
    }

    // Try to verify token if provided (for authenticated requests)
    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      // If token is invalid, still allow the request (for SDK tracking)
    }

    // Read body once and handle potential errors
    let body;
    try {
      body = await req.json();
    } catch (error) {
      // If body is already consumed or invalid, return error
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { eventType, visitorId, elementSelector, elementText, url, userAgent, ipAddress, isUniqueVisitor, isRepeatVisitor, metadata } = body;

    // Get IP address from request if not provided
    const clientIp = ipAddress || req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';

    // Create metrics entry
    const metrics = new PopupMetrics({
      activityId,
      projectId: activity.projectId,
      eventType,
      visitorId,
      elementSelector,
      elementText,
      url,
      userAgent,
      ipAddress: clientIp,
      isUniqueVisitor,
      isRepeatVisitor,
      timestamp: new Date(),
      metadata: metadata || {},
    });

    await metrics.save();

    // Return CORS headers for SDK requests
    return NextResponse.json(
      { success: true, metrics },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('Error tracking metrics:', error);
    return NextResponse.json({ error: error.message || 'Failed to track metrics' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(params);
    const activityId = resolvedParams.id;

    // Verify authentication
    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify activity exists and user has access
    const activity = await PopupActivity.findById(activityId);
    if (!activity) {
      return NextResponse.json({ error: 'Popup activity not found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const visitorId = searchParams.get('visitorId');
    const visitorType = searchParams.get('visitorType'); // 'unique' | 'repeat'
    const elementSelector = searchParams.get('elementSelector');
    const search = searchParams.get('search'); // General search for visitor ID
    const limit = parseInt(searchParams.get('limit') || '50'); // Default 50 events per page
    const skip = parseInt(searchParams.get('skip') || '0'); // Default skip 0
    const eventsOnly = searchParams.get('eventsOnly') === 'true'; // If true, only return events, not stats

    // Build query
    const query: any = { activityId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (eventType) {
      query.eventType = eventType;
    }
    // Search takes precedence over exact visitorId match
    if (search) {
      // Search by visitor ID (partial match, case-insensitive)
      query.visitorId = { $regex: search, $options: 'i' };
    } else if (visitorId) {
      query.visitorId = visitorId;
    }
    if (visitorType === 'unique') {
      query.isUniqueVisitor = true;
    } else if (visitorType === 'repeat') {
      query.isRepeatVisitor = true;
    }
    if (elementSelector) {
      query.elementSelector = elementSelector;
    }

    // Get total count for pagination
    const totalCount = await PopupMetrics.countDocuments(query);

    // Get metrics with pagination (only if limit > 0)
    let metrics: any[] = [];
    if (limit > 0) {
      metrics = await PopupMetrics.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
    }

    // If eventsOnly is true, return only events (for lazy loading)
    if (eventsOnly) {
      return NextResponse.json({
        success: true,
        metrics,
        pagination: {
          total: totalCount,
          limit,
          skip,
          hasMore: skip + limit < totalCount,
        },
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Get all metrics for stats calculation (without pagination, limit to 10000 for performance)
    const allMetrics = await PopupMetrics.find(query).sort({ timestamp: -1 }).limit(10000);

    // Calculate aggregate statistics using allMetrics (for stats)
    const impressions = allMetrics.filter(m => m.eventType === 'impression').length;
    const clicks = allMetrics.filter(m => m.eventType === 'click').length;
    const closes = allMetrics.filter(m => m.eventType === 'close').length;
    
    // Unique visitors
    const uniqueVisitors = new Set(allMetrics.map(m => m.visitorId)).size;
    const repeatVisitors = allMetrics.filter(m => m.isRepeatVisitor).length;
    
    // Click-through rate
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    // Element click breakdown
    const elementClicks: { [key: string]: number } = {};
    allMetrics.filter(m => m.eventType === 'click' && m.elementSelector).forEach(m => {
      const selector = m.elementSelector || 'unknown';
      elementClicks[selector] = (elementClicks[selector] || 0) + 1;
    });

    // Time-based statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMetrics = allMetrics.filter(m => m.timestamp >= today);
    const todayImpressions = todayMetrics.filter(m => m.eventType === 'impression').length;
    const todayClicks = todayMetrics.filter(m => m.eventType === 'click').length;

    return NextResponse.json({
      success: true,
      stats: {
        total: {
          impressions,
          clicks,
          closes,
          uniqueVisitors,
          repeatVisitors,
          ctr: parseFloat(ctr.toFixed(2)),
        },
        today: {
          impressions: todayImpressions,
          clicks: todayClicks,
        },
        elementClicks,
      },
      metrics, // Return paginated metrics
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch metrics' }, { status: 500 });
  }
}

