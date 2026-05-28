
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

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

    const { profileId, type } = await request.json();

    const profile = await TalentProfile.findById(profileId)
      .populate('userId', 'firstName lastName email');

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify the profile belongs to the authenticated user
    if (profile.userId._id.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userData = profile.userId;
    const fullName = `${userData.firstName} ${userData.lastName}`;

    if (type === 'created') {
      // Send profile creation confirmation email
      await sendEmail({
        to: userData.email,
        template: 'talent-profile-created',
        data: {
          name: fullName,
          profileTitle: profile.title,
          profileId: profile._id
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Profile creation notification sent successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid notification type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Profile notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
