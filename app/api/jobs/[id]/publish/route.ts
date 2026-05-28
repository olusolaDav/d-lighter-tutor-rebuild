import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

/**
 * PATCH /api/jobs/[id]/publish
 * Body: { publish: boolean }
 * Allows an admin to publish (isActive=true, isApproved=true) or
 * unpublish (isActive=false) a job post.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const { publish } = await request.json();

    if (typeof publish !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: publish (boolean)' },
        { status: 400 }
      );
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { isActive: publish };

    // When publishing, also mark as approved (admin is the approver)
    if (publish) {
      updateData.isApproved = true;
      updateData.approvedBy = user.id;
      updateData.approvedAt = new Date();
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true }).lean();

    return NextResponse.json({
      success: true,
      data: { job: updatedJob },
      message: publish ? 'Job published successfully' : 'Job unpublished successfully',
    });
  } catch (error) {
    console.error('Publish job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job publish state' },
      { status: 500 }
    );
  }
}
