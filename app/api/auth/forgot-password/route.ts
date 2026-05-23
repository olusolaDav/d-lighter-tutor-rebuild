import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateOTP, hashOTP, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`forgot_password_${clientIP}`, 3, 60 * 60 * 1000);

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
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const successMessage =
      'If an account with this email exists, a password reset code has been sent.';

    const admin = await Admin.findOne({ email: sanitizedEmail });
    if (!admin || !admin.isActive || !admin.isEmailVerified) {
      return NextResponse.json({ success: true, message: successMessage }, { status: 200 });
    }

    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    await OTP.deleteMany({ email: sanitizedEmail, purpose: 'password_reset' });

    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    await newOTP.save();

    await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${admin.firstName} ${admin.lastName}`,
      otp,
      purpose: 'password_reset',
      expiryMinutes: 15,
    });

    return NextResponse.json({ success: true, message: successMessage }, { status: 200 });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
