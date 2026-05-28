
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'approved') {
      query.status = 'approved';
    } else if (status === 'pending') {
      query.status = 'pending';
    } else if (status === 'rejected') {
      query.status = 'rejected';
    } else if (status === 'featured') {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      TalentProfile.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TalentProfile.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        profiles,
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
    console.error('Admin talents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch talent profiles' },
      { status: 500 }
    );
  }
}
