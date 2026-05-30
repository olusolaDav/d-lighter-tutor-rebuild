import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';
import { Admin } from '@/lib/models/Admin';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const position = await Position.findOne({ _id: id, isActive: true, isApproved: true }).lean();
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

    const position = await Position.findByIdAndUpdate(id, body, { new: true, runValidators: true });
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
    const { password } = await request.json().catch(() => ({}));
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const admin = await Admin.findById(user.id).select('+password');
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

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
