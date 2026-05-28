import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const position = await Position.findById(id)
      .populate('postedBy', 'firstName lastName email')
      .lean();

    if (!position) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Get position error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch position' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Strip read-only fields
    delete body._id;
    delete body.__v;
    delete body.postedBy;
    delete body.createdAt;
    delete body.views;

    const position = await Position.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!position) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: position });
  } catch (error: any) {
    console.error('Update position error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update position' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const position = await Position.findByIdAndDelete(id);
    if (!position) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Delete position error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete position' }, { status: 500 });
  }
}
