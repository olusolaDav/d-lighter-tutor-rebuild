import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

const isProd = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 401 }
      );
    }

    const tokenPayload = verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const admin = await Admin.findById(tokenPayload.adminId);
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account not found or deactivated' },
        { status: 403 }
      );
    }

    const newAccessToken = generateAccessToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      mustChangePassword: admin.mustChangePassword ?? false,
    });

    const res = NextResponse.json(
      {
        success: true,
        data: {
          adminId: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          mustChangePassword: admin.mustChangePassword ?? false,
        },
      },
      { status: 200 }
    );

    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
