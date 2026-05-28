
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const availability = searchParams.get('availability') || '';
    const jobType = searchParams.get('jobType') || '';
    const location = searchParams.get('location') || '';
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    const query: any = { 
      isActive: true, 
      status: 'approved' 
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (skills.length > 0) {
      query['skills.name'] = { $in: skills.map(skill => new RegExp(skill, 'i')) };
    }

    if (availability) {
      query['availability.status'] = availability;
    }

    if (jobType) {
      query['availability.preferredJobType'] = jobType;
    }

    if (location) {
      query['availability.preferredLocation'] = { $regex: location, $options: 'i' };
    }

    const experience = searchParams.get('experience');
    if (experience && experience !== 'all') {
      // Map experience levels to years of experience
      const experienceMap: any = {
        'junior': { $lt: 2 },
        'mid': { $gte: 2, $lt: 5 },
        'senior': { $gte: 5, $lt: 10 },
        'expert': { $gte: 10 }
      };
      
      if (experienceMap[experience]) {
        query['experience.yearsOfExperience'] = experienceMap[experience];
      }
    }

    const featured = searchParams.get('featured');
    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = { $ne: true };
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { profileViews: -1 };
        break;
      case 'featured':
        sortQuery = { featured: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [talents, total] = await Promise.all([
      TalentProfile.find(query)
        .populate('userId', 'firstName lastName email avatar')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      TalentProfile.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        talents,
        profiles: talents, // Keep both for backward compatibility
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Talents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch talent profiles' },
      { status: 500 }
    );
  }
}
