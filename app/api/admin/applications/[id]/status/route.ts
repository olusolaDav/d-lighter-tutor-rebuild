import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { status, notes } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const update: Record<string, any> = { status };
    if (notes !== undefined) update.notes = notes;

    const application = await Application.findByIdAndUpdate(id, update, { new: true });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
