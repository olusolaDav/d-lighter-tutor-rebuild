import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SavedJob from '@/lib/models/SavedJob';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get saved jobs with job details
    const savedJobs = await SavedJob.find({ userId: user.id })
      .populate({
        path: 'jobId',
        model: 'Job',
        match: { isActive: true, isApproved: true },
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out any saved jobs where the job was deleted or is no longer active
    const validSavedJobs = savedJobs.filter(savedJob => savedJob.jobId);

    const total = await SavedJob.countDocuments({ 
      userId: user.id,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: validSavedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved jobs' },
      { status: 500 }
    );
  }
}