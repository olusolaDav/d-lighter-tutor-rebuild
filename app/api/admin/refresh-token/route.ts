import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get refresh token from cookies or body
    const refreshToken = request.cookies.get('refreshToken')?.value || 
                        (await request.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const tokenPayload = verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find admin to get current permissions and verify account status
    const admin = await Admin.findById(tokenPayload.adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Check if account is still active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Generate new access token with current permissions
    const newAccessToken = generateAccessToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    });

    // Set new access token cookie
    const accessTokenCookie = `accessToken=${newAccessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${15 * 60}`; // 15 minutes

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Access token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          adminId: admin._id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': accessTokenCookie,
        },
      }
    );

  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}