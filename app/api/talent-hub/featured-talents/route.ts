import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    // First, get featured talents
    const featuredTalents = await TalentProfile.find({
      isActive: true,
      status: 'approved',
      featured: true
    })
      .populate('userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const remainingSlots = limit - featuredTalents.length;

    let recentTalents = [];
    if (remainingSlots > 0) {
      // Get recent approved talents that are not featured
      recentTalents = await TalentProfile.find({
        isActive: true,
        status: 'approved',
        featured: { $ne: true }
      })
        .populate('userId', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
        .limit(remainingSlots)
        .lean();
    }

    const talents = [...featuredTalents, ...recentTalents];

    return NextResponse.json({
      success: true,
      data: {
        talents,
        total: talents.length,
        featured: featuredTalents.length,
        recent: recentTalents.length
      },
    });
  } catch (error) {
    console.error('Featured talents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured talents' },
      { status: 500 }
    );
  }
}