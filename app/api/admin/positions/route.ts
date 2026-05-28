import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query.isApproved = true;
    } else if (status === 'draft') {
      query.$or = [{ isActive: false }, { isApproved: false }];
    }

    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [positions, total] = await Promise.all([
      Position.find(query)
        .populate('postedBy', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Position.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
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
    console.error('Admin positions API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch positions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: 'Position title is required' }, { status: 400 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ success: false, error: 'Position description is required' }, { status: 400 });
    }

    const position = new Position({
      title: body.title.trim(),
      type: body.type || 'other',
      description: body.description.trim(),
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      subjects: body.subjects || [],
      qualifications: body.qualifications || [],
      benefits: body.benefits || [],
      location: body.location || { type: 'remote' },
      compensation: body.compensation || { type: 'negotiable', currency: 'NGN' },
      employmentType: body.employmentType || 'part-time',
      applicationDeadline: body.applicationDeadline || undefined,
      assessmentLink: body.assessmentLink?.trim() || '',
      featured: !!body.featured,
      isActive: false,
      isApproved: false,
      postedBy: user.id,
    });

    await position.save();

    return NextResponse.json({ success: true, data: position }, { status: 201 });
  } catch (error: any) {
    console.error('Create position error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create position' }, { status: 500 });
  }
}
