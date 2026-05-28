import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { isApproved } = await request.json();
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        isApproved,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      { new: true }
    ).populate('postedBy', 'firstName lastName email');

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Approve job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}