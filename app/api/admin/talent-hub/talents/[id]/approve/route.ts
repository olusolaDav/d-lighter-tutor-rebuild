import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const { action, reason } = await request.json();

    const profile = await TalentProfile.findById(id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      profile.status = 'approved';
      profile.isApproved = true;
      profile.approvedBy = user.id;
      profile.approvedAt = new Date();
      profile.rejectedAt = undefined;
      profile.rejectionReason = undefined;
    } else if (action === 'reject') {
      profile.status = 'rejected';
      profile.isApproved = false;
      profile.rejectedAt = new Date();
      profile.rejectionReason = reason || 'No reason provided';
      profile.approvedBy = undefined;
      profile.approvedAt = undefined;
    } else if (action === 'feature') {
      profile.featured = true;
    } else if (action === 'unfeature') {
      profile.featured = false;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    await profile.save();
    await profile.populate('userId', 'firstName lastName email');

    // Send email notification
    try {
      const { sendEmail } = require('@/lib/email');
      const userData = profile.userId;
      const fullName = `${userData.firstName} ${userData.lastName}`;

      if (action === 'approve') {
        await sendEmail({
          to: userData.email,
          template: 'talent-profile-approved',
          data: {
            name: fullName,
            profileTitle: profile.title,
            profileId: profile._id
          }
        });
      } else if (action === 'reject') {
        await sendEmail({
          to: userData.email,
          template: 'talent-profile-rejected',
          data: {
            name: fullName,
            profileTitle: profile.title,
            rejectionReason: reason || profile.rejectionReason || 'No specific reason provided'
          }
        });
      }
    } catch (emailError) {
      console.error('Error sending profile status email:', emailError);
      // Don't fail the operation if email fails
    }

    let successMessage = '';
    switch (action) {
      case 'approve':
        successMessage = 'Profile approved successfully';
        break;
      case 'reject':
        successMessage = 'Profile rejected successfully';
        break;
      case 'feature':
        successMessage = 'Profile featured successfully';
        break;
      case 'unfeature':
        successMessage = 'Profile unfeatured successfully';
        break;
      default:
        successMessage = `Profile ${action}d successfully`;
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: successMessage
    });
  } catch (error) {
    console.error('Profile approval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile status' },
      { status: 500 }
    );
  }
}