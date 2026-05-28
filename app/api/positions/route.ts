import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || ''; // 'tutor' | 'other'
    const employmentType = searchParams.get('employmentType') || '';
    const locationType = searchParams.get('locationType') || '';
    const featured = searchParams.get('featured') || '';

    const query: Record<string, any> = {
      isActive: true,
      isApproved: true,
    };

    if (type) query.type = type;
    if (employmentType) query.employmentType = employmentType;
    if (locationType) query['location.type'] = locationType;
    if (featured === 'true') query.featured = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subjects: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [positions, total] = await Promise.all([
      Position.find(query)
        .select('title type description subjects location employmentType compensation applicationDeadline featured isActive views createdAt')
        .sort({ type: 1, featured: -1, createdAt: -1 }) // tutor first (alphabetically 't' > 'o' so tutor last — use custom sort below)
        .skip(skip)
        .limit(limit)
        .lean(),
      Position.countDocuments(query),
    ]);

    // Bring 'tutor' type positions to the front
    const sorted = [
      ...positions.filter((p: any) => p.type === 'tutor'),
      ...positions.filter((p: any) => p.type !== 'tutor'),
    ];

    return NextResponse.json({
      success: true,
      data: {
        positions: sorted,
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
    console.error('Positions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
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

    const position = new Position({
      ...body,
      postedBy: user.id,
      isActive: false,
      isApproved: false,
    });

    await position.save();

    return NextResponse.json({ success: true, data: position }, { status: 201 });
  } catch (error: any) {
    console.error('Create position error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create position' },
      { status: 500 }
    );
  }
}
