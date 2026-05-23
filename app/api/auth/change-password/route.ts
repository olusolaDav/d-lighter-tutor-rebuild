import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, validatePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
  parent: '/parent',
};

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Session expired. Please log in again.' }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'New passwords do not match' }, { status: 400 });
    }

    if (newPassword === currentPassword) {
      return NextResponse.json({ success: false, message: 'New password must be different from the current password' }, { status: 400 });
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, message: validation.errors.join('. ') }, { status: 400 });
    }

    await dbConnect();
    const user = await Admin.findById(payload.adminId).select('+password');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    // Re-issue tokens with mustChangePassword = false
    const isProd = process.env.NODE_ENV === 'production';
    const newAccessToken = generateAccessToken({
      adminId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      mustChangePassword: false,
    });
    const newRefreshToken = generateRefreshToken({
      adminId: user._id.toString(),
      email: user.email,
      tokenVersion: 1,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Password changed successfully! Redirecting to your dashboard…',
      data: { redirectTo: ROLE_ROUTES[user.role] ?? '/auth/login' },
    });
    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60, path: '/',
    });
    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60, path: '/',
    });
    return res;
  } catch (error) {
    console.error('change-password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
