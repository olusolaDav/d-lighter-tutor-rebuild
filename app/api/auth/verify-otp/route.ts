import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  hashOTP,
  verifyOTPHash,
  sanitizeInput,
  checkRateLimit,
} from '@/lib/auth';
import { emailService } from '@/lib/emailService';

const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  student: '/student',
  parent: '/parent',
};

const isProd = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`verify_otp_${clientIP}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many verification attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60),
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { email, otp, purpose } = body;

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and purpose are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedOTP = sanitizeInput(otp);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(sanitizedOTP)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be exactly 6 digits' },
        { status: 400 }
      );
    }

    const validPurposes = ['email_verification', 'login_verification', 'password_reset'];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP purpose' },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email: sanitizedEmail });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    const otpRecord = await OTP.findOne({
      email: sanitizedEmail,
      purpose,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'No valid verification code found. Please request a new one.' },
        { status: 404 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json(
        { success: false, message: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const isOTPValid = verifyOTPHash(sanitizedOTP, otpRecord.otp);

    if (!isOTPValid) {
      await OTP.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      const remaining = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Invalid code. ${remaining} attempts remaining.`
              : 'Invalid code. Please request a new one.',
        },
        { status: 400 }
      );
    }

    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    const baseData = {
      adminId: admin._id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    };

    // ── email_verification ────────────────────────────────────────────────
    if (purpose === 'email_verification') {
      await Admin.findByIdAndUpdate(admin._id, { isEmailVerified: true, isActive: true });
      await emailService.sendWelcomeEmail(
        admin.email,
        `${admin.firstName} ${admin.lastName}`,
        admin.role
      );
      return NextResponse.json(
        {
          success: true,
          message: 'Email verified successfully! You can now log in.',
          data: { ...baseData, isEmailVerified: true },
        },
        { status: 200 }
      );
    }

    // ── login_verification (2FA) ──────────────────────────────────────────
    if (purpose === 'login_verification') {
      await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

      const accessToken = generateAccessToken({
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      });
      const refreshToken = generateRefreshToken({
        adminId: admin._id.toString(),
        email: admin.email,
        tokenVersion: 1,
      });

      const res = NextResponse.json(
        {
          success: true,
          message: 'Login successful! Welcome back.',
          data: {
            ...baseData,
            permissions: admin.permissions,
            redirectTo: ROLE_ROUTES[admin.role] ?? '/auth/login',
          },
        },
        { status: 200 }
      );

      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/',
      });
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return res;
    }

    // ── password_reset ────────────────────────────────────────────────────
    if (purpose === 'password_reset') {
      const resetToken = generateAccessToken({
        adminId: admin._id.toString(),
        email: admin.email,
        role: 'password_reset',
        permissions: ['reset_password'],
      });
      return NextResponse.json(
        {
          success: true,
          message: 'Verification successful. You can now reset your password.',
          data: { ...baseData, resetToken, canResetPassword: true },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, message: 'Invalid purpose' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
