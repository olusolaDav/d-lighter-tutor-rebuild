import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Job from '@/lib/models/Job';
import JobApplication from '@/lib/models/JobApplication';
import { getAuthUser } from '@/lib/auth';

// Cache headers for HTTP caching
const getCacheHeaders = (maxAge: number = 60) => ({
  'Cache-Control': `private, max-age=${maxAge}`,
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const jobId = searchParams.get('jobId') || '';
    const viewMode = searchParams.get('viewMode') || 'list';
    const myJobs = searchParams.get('myJobs') || '';
    const sort = searchParams.get('sort') || 'newest';

    console.log('Applications API: Processing request with params:', {
      page, limit, search, status, jobId, viewMode, myJobs
    });

    // Enforce admin-only access for this route
    const authUser = await getAuthUser(request);
    if (!authUser?.id || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query — admins see ALL applications by default
    const query: any = {};

    // Only filter by poster when myJobs=true AND user is not admin (future-proof for non-admin roles)
    if (myJobs === 'true' && authUser.role !== 'admin') {
      const userJobs = await Job.find({ postedBy: authUser.id }).distinct('_id');
      query.jobId = { $in: userJobs };
    }

    if (jobId) {
      query.jobId = jobId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex },
        { 'personalInfo.email': searchRegex },
        { 'personalInfo.location': searchRegex },
        { 'skills.name': searchRegex }
      ];
    }

    // Get stats
    const statsAggregation = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };

    statsAggregation.forEach(stat => {
      stats[stat._id as keyof typeof stats] = stat.count;
      stats.total += stat.count;
    });

    if (viewMode === 'grouped') {
      // Group applications by job
      const groupedApplications = await JobApplication.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $lookup: {
            from: 'users',
            localField: 'applicantId',
            foreignField: '_id',
            as: 'applicant'
          }
        },
        { $unwind: '$applicant' },
        {
          $group: {
            _id: '$jobId',
            job: { $first: '$job' },
            applications: { $push: '$$ROOT' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $project: {
              job: {
                _id: '$job._id',
                title: '$job.title',
                company: '$job.company',
                applicationMethod: '$job.applicationMethod'
              },
              applications: {
                $map: {
                  input: '$applications',
                  as: 'app',
                  in: {
                    _id: '$$app._id',
                    jobId: {
                      _id: '$$app.job._id',
                      title: '$$app.job.title',
                      company: '$$app.job.company',
                      applicationMethod: '$$app.job.applicationMethod'
                    },
                  applicantId: {
                    firstName: '$$app.applicant.firstName',
                    lastName: '$$app.applicant.lastName',
                    email: '$$app.applicant.email'
                  },
                  personalInfo: '$$app.personalInfo',
                  workExperience: '$$app.workExperience',
                  education: '$$app.education',
                  skills: '$$app.skills',
                  certifications: '$$app.certifications',
                  socialMedia: '$$app.socialMedia',
                  documents: '$$app.documents',
                  application: '$$app.application',
                  status: '$$app.status',
                  notes: '$$app.notes',
                  reviewedBy: '$$app.reviewedBy',
                  reviewedAt: '$$app.reviewedAt',
                  createdAt: '$$app.createdAt'
                }
              }
            },
            count: 1
          }
        }
      ]);

      const totalGroups = await JobApplication.aggregate([
        { $match: query },
        { $group: { _id: '$jobId' } },
        { $count: 'total' }
      ]);

      const total = totalGroups[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: {
          groupedApplications,
          stats,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      }, {
        headers: getCacheHeaders(60)
      });
    } else {
      // Regular list view
      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        JobApplication.find(query)
          .populate({
            path: 'jobId',
            select: 'title company applicationMethod',
            populate: {
              path: 'applicationMethod.specificQuestions'
            }
          })
          .populate('applicantId', 'firstName lastName email')
          .sort(
            sort === 'oldest' ? { createdAt: 1 } :
            sort === 'name_az' ? { 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 } :
            sort === 'name_za' ? { 'personalInfo.firstName': -1, 'personalInfo.lastName': -1 } :
            { createdAt: -1 }
          )
          .skip(skip)
          .limit(limit)
          .lean(),
        JobApplication.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: {
          applications,
          stats,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      }, {
        headers: getCacheHeaders(60)
      });
    }
  } catch (error) {
    console.error('Admin applications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}