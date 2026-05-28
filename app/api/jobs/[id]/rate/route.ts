import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
        { success: false, error: 'Please login to rate jobs' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { rating, review } = requestData;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid rating (1-5 stars)' },
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

    // Initialize ratings array if it doesn't exist
    if (!job.ratings) {
      job.ratings = [];
    }

    // Check if user already rated this job
    const existingRatingIndex = job.ratings.findIndex(
      (r: any) => r.userId.toString() === user.id
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      job.ratings[existingRatingIndex] = {
        userId: user.id,
        rating,
        review: review || '',
        createdAt: new Date(),
      };
    } else {
      // Add new rating
      job.ratings.push({
        userId: user.id,
        rating,
        review: review || '',
        createdAt: new Date(),
      });
    }

    // Calculate average rating
    const totalRatings = job.ratings.length;
    const sumRatings = job.ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
    job.averageRating = sumRatings / totalRatings;

    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      averageRating: job.averageRating,
      totalRatings: totalRatings
    });

  } catch (error) {
    console.error('Error rating job:', error);
    return NextResponse.json(
      { success: false, error: `Failed to rate job: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}