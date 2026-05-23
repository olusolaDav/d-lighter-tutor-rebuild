import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, validatePassword, sanitizeInput, checkRateLimit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`reset_password_${clientIP}`, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many password reset attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60),
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { resetToken, newPassword, confirmPassword } = body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token, new password, and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    const tokenPayload = verifyAccessToken(resetToken);
    if (
      !tokenPayload ||
      tokenPayload.role !== 'password_reset' ||
      !tokenPayload.permissions?.includes('reset_password')
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    const sanitizedEmail = sanitizeInput(tokenPayload.email.toLowerCase());

    const admin = await Admin.findOne({ _id: tokenPayload.adminId, email: sanitizedEmail }).select(
      '+password'
    );

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account not found or deactivated' },
        { status: 404 }
      );
    }

    admin.password = newPassword; // pre-save middleware will hash it
    admin.loginAttempts = 0;
    await admin.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
