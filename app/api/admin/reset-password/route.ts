import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, validatePassword, sanitizeInput, checkRateLimit, verifyResetToken } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 password reset attempts per hour per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `reset_password_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 1 hour window

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many password reset attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { resetToken, newPassword, confirmPassword } = body;

    // Input validation
    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token, new password, and password confirmation are required' },
        { status: 400 }
      );
    }

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Verify reset token
    const tokenPayload = verifyResetToken(resetToken);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Check if token has the right permissions
    if (tokenPayload.role !== 'password_reset' || !tokenPayload.permissions.includes('reset_password')) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token' },
        { status: 401 }
      );
    }

    const sanitizedEmail = sanitizeInput(tokenPayload.email.toLowerCase());

    // Find admin account
    const admin = await Admin.findOne({ 
      _id: tokenPayload.adminId,
      email: sanitizedEmail 
    }).select('+password'); // Include password for comparison

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!admin.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email must be verified before resetting password' },
        { status: 403 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await admin.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // Update password (will be hashed by pre-save middleware)
    admin.password = newPassword;
    
    // Reset login attempts and unlock account if locked
    admin.loginAttempts = 0;
    if (admin.lockUntil) {
      admin.lockUntil = undefined;
    }

    await admin.save();

    // Send confirmation email
    const emailSent = await emailService.sendPasswordResetConfirmation(
      admin.email,
      `${admin.firstName} ${admin.lastName}`
    );

    if (!emailSent) {
      console.warn('Failed to send password reset confirmation email to:', admin.email);
      // Don't fail the request if email fails - password was still reset successfully
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
        data: {
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}