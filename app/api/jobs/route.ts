import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';

// Cache headers for HTTP caching
const getCacheHeaders = (maxAge: number = 300) => ({
  'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const jobType = searchParams.get('jobType');
    const locationType = searchParams.get('locationType');
    const experienceLevel = searchParams.get('experienceLevel');
    const location = searchParams.get('location');
    const salaryRange = searchParams.get('salaryRange');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort');
    const approved = searchParams.get('approved');
    const active = searchParams.get('active');
    const myJobs = searchParams.get('myJobs');


    // Check if user is requesting their own jobs
    let currentUserId = null;
    let isAdmin = false;
    if (myJobs === 'true') {
      const authUser = await getAuthUser(request);

      if (!authUser?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      isAdmin = authUser.role === 'admin';
      // Admins see ALL jobs; non-admins only see their own
      if (!isAdmin) {
        currentUserId = authUser.id;
      }
    }

    // Build query - default to showing only approved and active jobs for public access
    const query: any = {};
    const andConditions: any[] = [];

    if (currentUserId) {
      // Non-admin user: filter to their own posted jobs
      query.postedBy = currentUserId;
    } else if (!isAdmin) {
      // Public access: only show approved and active jobs
      query.isApproved = true;
      query.isActive = true;
    }
    // Admin with myJobs=true: no postedBy filter — sees all jobs

    // Override defaults only if explicitly set to false (for admin or own jobs)
    if (approved === 'false' && (currentUserId || isAdmin)) {
      delete query.isApproved;
    }
    if (active === 'false' && (currentUserId || isAdmin)) {
      delete query.isActive;
    }

    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = { $ne: true };
    }

    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'company.name': { $regex: search, $options: 'i' } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    if (jobType && jobType !== 'all') {
      query.jobType = jobType;
    }

    if (locationType) {
      query['location.type'] = locationType;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experience = experienceLevel;
    }

    if (location) {
      andConditions.push({
        $or: [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ]
      });
    }

    if (salaryRange) {
      // Handle salary range filtering if needed
      const [minSalary, maxSalary] = salaryRange.split('-').map(Number);
      if (minSalary && maxSalary) {
        query['salary.min'] = { $gte: minSalary };
        query['salary.max'] = { $lte: maxSalary };
      }
    }

    // Combine $and conditions if any exist (prevents $or overwrite bug)
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    let sortOrder: Record<string, 1 | -1> = { featured: -1, createdAt: -1 }; // Default sort
    if (sort === 'recent') {
      sortOrder = { createdAt: -1 }; // Most recent first
    }

    // Select only fields needed for listing (skip heavy fields like applicants, reports, ratings)
    const listingFields = myJobs === 'true'
      ? undefined // Admin/owner needs full data
      : 'title company location salary jobType internshipType experience experienceLevel description requirements skills applicationDeadline isActive isApproved featured createdAt views postedBy';

    // Use lean() to return plain JavaScript objects instead of Mongoose documents
    // This significantly improves performance for large result sets
    const jobQuery = Job.find(query)
      .populate('postedBy', 'firstName lastName email')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .lean();

    if (listingFields) {
      jobQuery.select(listingFields);
    }

    const [jobs, total] = await Promise.all([
      jobQuery.exec(),
      Job.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Add cache headers - public endpoints can be cached longer
    const cacheAge = currentUserId ? 60 : 300; // 5 mins for public, 1 min for user-specific

    return NextResponse.json(
      {
        success: true,
        data: {
          jobs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      },
      {
        headers: getCacheHeaders(cacheAge)
      }
    );

  } catch (error) {
    console.error('Jobs API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }


    const {
      title,
      company,
      employerInfo,
      applicationMethod,
      description,
      requirements,
      responsibilities,
      benefits,
      skills,
      location,
      salary,
      jobType,
      experience,
      applicationDeadline,
      featured
    } = await request.json();

    // Create new job
    const job = new Job({
      title,
      company,
      employerInfo,
      applicationMethod,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      skills: skills || [],
      location,
      salary,
      jobType,
      experience,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      featured: featured || false,
      postedBy: user.id,
      isActive: true,
      isApproved: false,
      views: 0,
      applicants: [],
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      reports: []
    });

    await job.save();

    // Populate the response
    await job.populate('postedBy', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job posted successfully and is pending approval'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}