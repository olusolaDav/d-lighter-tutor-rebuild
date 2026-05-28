
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, profileIds, reason } = await request.json();

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile IDs are required' },
        { status: 400 }
      );
    }

    const profiles = await TalentProfile.find({ _id: { $in: profileIds } })
      .populate('userId', 'firstName lastName email');

    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profiles found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let successMessage = '';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          isApproved: true,
          approvedBy: user.id,
          approvedAt: new Date(),
          rejectedAt: undefined,
          rejectionReason: undefined,
        };
        successMessage = 'Profiles approved successfully';
        break;
      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { success: false, error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'rejected',
          isApproved: false,
          rejectedAt: new Date(),
          rejectionReason: reason,
          approvedBy: undefined,
          approvedAt: undefined,
        };
        successMessage = 'Profiles rejected successfully';
        break;
      case 'feature':
        updateData = { featured: true };
        successMessage = 'Profiles featured successfully';
        break;
      case 'unfeature':
        updateData = { featured: false };
        successMessage = 'Profiles unfeatured successfully';
        break;
      case 'activate':
        updateData = { isActive: true };
        successMessage = 'Profiles activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        successMessage = 'Profiles deactivated successfully';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update all profiles
    await TalentProfile.updateMany(
      { _id: { $in: profileIds } },
      updateData
    );

    // Send email notifications for approve/reject actions
    if (action === 'approve' || action === 'reject') {
      for (const profile of profiles) {
        try {
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
                rejectionReason: reason || 'No specific reason provided'
              }
            });
          }
        } catch (emailError) {
          console.error(`Error sending email to ${profile.userId.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      affectedCount: profiles.length
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
