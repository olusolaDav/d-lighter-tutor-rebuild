import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateOTP, hashOTP, validatePassword, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

const VALID_ROLES = ['admin', 'super_admin', 'student', 'parent'] as const;

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`register_${clientIP}`, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60),
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { firstName, lastName, email, password, role = 'admin' } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const existingUser = await Admin.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = new Admin({
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      password,
      role,
      isActive: true,
      isEmailVerified: false,
      twoFactorEnabled: false,
    });
    await newUser.save();

    // Send email verification OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await newOTP.save();

    await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${sanitizedFirstName} ${sanitizedLastName}`,
      otp,
      purpose: 'registration',
      expiryMinutes: 60 * 24,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        data: {
          userId: newUser._id,
          email: sanitizedEmail,
          firstName: sanitizedFirstName,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
