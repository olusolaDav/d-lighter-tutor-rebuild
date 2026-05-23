import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

async function meHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();
    const { adminId } = request.admin!;

    const adminData = await Admin.findById(adminId).select('-password');
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    if (!adminData.isActive) {
      return NextResponse.json({ success: false, message: 'Account is deactivated' }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          adminId: adminData._id,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          role: adminData.role,
          permissions: adminData.permissions,
          isEmailVerified: adminData.isEmailVerified,
          twoFactorEnabled: adminData.twoFactorEnabled,
          lastLogin: adminData.lastLogin,
          profileImage: adminData.profileImage,
          createdAt: adminData.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user info error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(meHandler);
