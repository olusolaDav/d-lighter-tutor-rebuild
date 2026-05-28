
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SavedJob from '@/lib/models/SavedJob';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Check if job exists
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      userId: user.id,
      jobId: id,
    });

    if (existingSave) {
      return NextResponse.json(
        { success: false, error: 'Job already saved' },
        { status: 400 }
      );
    }

    // Save the job
    const savedJob = new SavedJob({
      userId: user.id,
      jobId: id,
    });

    await savedJob.save();

    return NextResponse.json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    console.error('Save job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Remove the saved job
    const result = await SavedJob.findOneAndDelete({
      userId: user.id,
      jobId: id,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Saved job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job removed from saved',
    });
  } catch (error) {
    console.error('Remove saved job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove saved job' },
      { status: 500 }
    );
  }
}
