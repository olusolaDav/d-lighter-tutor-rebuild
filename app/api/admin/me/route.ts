import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

async function getMeHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const admin = request.admin!;
    
    // Get full admin details from database
    const adminData = await Admin.findById(admin.adminId).select('-password');
    
    if (!adminData) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Check if account is still active
    if (!adminData.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
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
          lastLogin: adminData.lastLogin,
          profileImage: adminData.profileImage,
          createdAt: adminData.createdAt,
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get admin info error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getMeHandler);