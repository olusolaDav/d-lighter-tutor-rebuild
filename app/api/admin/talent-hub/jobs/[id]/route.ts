import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const job = await Job.findById(resolvedParams.id)
      .populate('postedBy', 'firstName lastName email')
      .lean();

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const job = await Job.findById(resolvedParams.id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const updateData = await request.json();

    // Update the job (admin can edit without resetting approval status)
    const updatedJob = await Job.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true }
    ).populate('postedBy', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const job = await Job.findById(resolvedParams.id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    await Job.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}