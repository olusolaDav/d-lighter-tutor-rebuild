import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/lib/models/JobApplication';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const application = await JobApplication.findById(id)
      .populate('jobId', 'title company location jobType experience salary applicationMethod')
      .populate('applicantId', 'firstName lastName email')
      .lean();

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch application' }, { status: 500 });
  }
}
