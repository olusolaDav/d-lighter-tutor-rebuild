import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Position from '@/lib/models/Position';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const positionId = searchParams.get('positionId') || '';
    const sort = searchParams.get('sort') || 'newest';

    const query: Record<string, any> = {};

    if (positionId) query.positionId = positionId;
    if (status && status !== 'all') query.status = status;

    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [
        { 'personalInfo.firstName': rx },
        { 'personalInfo.lastName': rx },
        { 'personalInfo.email': rx },
        { 'personalInfo.city': rx },
        { subjects: { $in: [rx] } },
      ];
    }

    // Stats
    const statsResult = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats: Record<string, number> = { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, accepted: 0 };
    statsResult.forEach(s => {
      if (s._id && s._id in stats) stats[s._id] = s.count;
      stats.total += s.count;
    });

    // Sort
    const sortOrder: Record<string, 1 | -1> =
      sort === 'oldest'
        ? { createdAt: 1 }
        : sort === 'name_az'
        ? { 'personalInfo.firstName': 1 }
        : sort === 'name_za'
        ? { 'personalInfo.firstName': -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('positionId', 'title type')
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(query),
    ]);

    // Positions list for filter dropdown
    const positions = await Position.find({}).select('title type').sort({ title: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        applications,
        stats,
        positions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Admin applications API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applications' }, { status: 500 });
  }
}
