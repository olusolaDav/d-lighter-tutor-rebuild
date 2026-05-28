import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const profile = await TalentProfile.findById(id)
      .populate('userId', 'firstName lastName email avatar')
      .lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Allow viewing only approved profiles
    if (profile.status !== 'approved' || !profile.isActive) {
      return NextResponse.json(
        { success: false, error: 'Profile not available' },
        { status: 404 }
      );
    }

    // Add cache headers for public profiles
    const headers = new Headers({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'Content-Type': 'application/json',
    });

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { headers }
    );
  } catch (error) {
    console.error('Get profile by ID error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const profile = await TalentProfile.findById(id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if the profile belongs to the authenticated user
    if (profile.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // If profile was rejected and is being updated, reset status to pending
    if (profile.status === 'rejected') {
      data.status = 'pending';
      data.rejectedAt = undefined;
      data.rejectionReason = undefined;
    }

    const updatedProfile = await TalentProfile.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email avatar');

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await params;

    const profile = await TalentProfile.findById(id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user owns this profile
    if (profile.userId.toString() !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await TalentProfile.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}