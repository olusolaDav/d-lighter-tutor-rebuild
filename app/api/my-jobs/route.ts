
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    // Admins see all jobs; other users only see their own
    const query: any = user.role === 'admin' ? {} : { postedBy: user.id };

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'most-applications':
        sortQuery = { 'applicants.length': -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('My Jobs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
