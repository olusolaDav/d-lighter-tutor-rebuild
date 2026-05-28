
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const profile = await TalentProfile.findByIdAndUpdate(
      id,
      { $inc: { profileViews: 1 } },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { profileViews: profile.profileViews }
    });
  } catch (error) {
    console.error('Profile view increment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile views' },
      { status: 500 }
    );
  }
}
