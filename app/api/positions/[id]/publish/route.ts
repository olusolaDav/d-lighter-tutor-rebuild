import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { publish } = await request.json();

    const position = await Position.findByIdAndUpdate(
      id,
      { isActive: !!publish, isApproved: !!publish },
      { new: true }
    );

    if (!position) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: publish ? 'Position published successfully' : 'Position unpublished',
      data: position,
    });
  } catch (error) {
    console.error('Publish position error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update position' }, { status: 500 });
  }
}
