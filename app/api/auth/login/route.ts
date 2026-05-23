import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  hashOTP,
  sanitizeInput,
  checkRateLimit,
} from '@/lib/auth';
import { emailService } from '@/lib/emailService';

const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
  parent: '/parent',
};

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60),
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    // Support login by email OR username (students use username)
    const { email, username, password } = body;
    const identifier = email || username;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Login credentials and password are required' },
        { status: 400 }
      );
    }

    // Detect whether this is a username (DLT- prefix) or email
    const isUsername = typeof identifier === 'string' && identifier.toUpperCase().startsWith('DLT-');

    let admin;
    let sanitizedEmail: string = "";
    if (isUsername) {
      admin = await Admin.findOne({ username: identifier.toUpperCase() }).select('+password +createdBy');
    } else {
      sanitizedEmail = sanitizeInput(identifier.toLowerCase());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid email address or student username' },
          { status: 400 }
        );
      }
      admin = await Admin.findOne({ email: sanitizedEmail }).select('+password +createdBy');
    }

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil(
        (admin.lockUntil!.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          success: false,
          message: `Account locked. Try again in ${lockTimeRemaining} minutes.`,
          lockTimeRemaining,
        },
        { status: 423 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Contact the administrator.' },
        { status: 403 }
      );
    }

    // Skip email verification for: students (use username), or accounts created by another user
    const createdByAnotherUser = !!(admin as any).createdBy;
    if (!admin.isEmailVerified && admin.role !== 'student' && !createdByAnotherUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email not verified. Please verify your email address first.',
          requiresEmailVerification: true,
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      await admin.incrementLoginAttempts();
      const remaining = 5 - (admin.loginAttempts + 1);
      const message =
        remaining > 0
          ? `Invalid credentials. ${remaining} attempts remaining.`
          : 'Invalid credentials. Account will be temporarily locked.';
      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    // Reset login attempts
    await Admin.findByIdAndUpdate(admin._id, {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      lastLogin: new Date(),
    });

    const tokenPayload = {
      adminId: admin._id.toString(),
      email: admin.email,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
      mustChangePassword: admin.mustChangePassword ?? false,
    };

    // ── mustChangePassword → issue limited token and redirect ─────────────
    if (admin.mustChangePassword) {
      const accessToken = generateAccessToken({ ...tokenPayload, expiresIn: '30m' });
      const refreshToken = generateRefreshToken({
        adminId: admin._id.toString(),
        email: admin.email,
        tokenVersion: 1,
      });
      const res = NextResponse.json(
        {
          success: true,
          message: 'Please change your password before continuing.',
          data: { mustChangePassword: true, redirectTo: '/auth/change-password' },
        },
        { status: 200 }
      );
      setAuthCookies(res, accessToken, refreshToken);
      return res;
    }
    if (!admin.twoFactorEnabled) {
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken({
        adminId: admin._id.toString(),
        email: admin.email,
        tokenVersion: 1,
      });

      const res = NextResponse.json(
        {
          success: true,
          message: 'Login successful!',
          data: {
            adminId: admin._id,
            email: admin.email,
            username: admin.username,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            permissions: admin.permissions,
            redirectTo: ROLE_ROUTES[admin.role] ?? '/auth/login',
          },
        },
        { status: 200 }
      );
      setAuthCookies(res, accessToken, refreshToken);
      return res;
    }

    // ── 2FA enabled → send OTP ────────────────────────────────────────────
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    await OTP.deleteMany({ email: sanitizedEmail, purpose: 'login_verification' });

    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'login_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await newOTP.save();

    const emailSent = await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${admin.firstName} ${admin.lastName}`,
      otp,
      purpose: 'login',
      expiryMinutes: 10,
    });

    if (!emailSent) {
      await OTP.findByIdAndDelete(newOTP._id);
      return NextResponse.json(
        { success: false, message: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email.',
        data: {
          adminId: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          role: admin.role,
          requiresOTP: true,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
