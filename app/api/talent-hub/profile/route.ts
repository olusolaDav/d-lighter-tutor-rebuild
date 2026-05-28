import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
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

    const profile = await TalentProfile.findOne({ userId: user.id })
      .populate('userId', 'firstName lastName email avatar');

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if profile already exists
    const existingProfile = await TalentProfile.findOne({ userId: user.id });
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const profile = new TalentProfile({
      ...data,
      userId: user.id,
      status: 'pending',
      isApproved: false,
      isActive: true,
    });

    await profile.save();
    await profile.populate('userId', 'firstName lastName email avatar');

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile created successfully and is pending approval'
    }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();

    const profile = await TalentProfile.findOneAndUpdate(
      { userId: user.id },
      data,
      { new: true, upsert: true }
    ).populate('userId', 'firstName lastName email avatar');

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}