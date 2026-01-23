import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateAccessToken, generateRefreshToken, generateOTP, hashOTP, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 login attempts per 15 minutes per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000); // 15 minutes window

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Input validation and sanitization
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find admin and include password field
    const admin = await Admin.findOne({ email: sanitizedEmail }).select('+password');
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { 
          success: false, 
          message: `Account is temporarily locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`,
          lockTimeRemaining
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Contact system administrator.' },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!admin.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email not verified. Please verify your email address first.',
          requiresEmailVerification: true,
          adminId: admin._id
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incrementLoginAttempts();
      
      const remainingAttempts = 5 - (admin.loginAttempts + 1);
      const message = remainingAttempts > 0 
        ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
        : 'Invalid email or password. Account will be temporarily locked.';

      return NextResponse.json(
        { success: false, message },
        { status: 401 }
      );
    }

    // Password is correct - reset login attempts and update last login
    await Admin.findByIdAndUpdate(admin._id, {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      lastLogin: new Date()
    });

    // Generate and send OTP for 2FA
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Remove any existing login verification OTPs for this email
    await OTP.deleteMany({ 
      email: sanitizedEmail, 
      purpose: 'login_verification' 
    });

    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'login_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newOTP.save();

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${admin.firstName} ${admin.lastName}`,
      otp: otp, // Send the original OTP, not the hash
      purpose: 'login',
      expiryMinutes: 10,
    });

    if (!emailSent) {
      // Delete the OTP if email failed to send
      await OTP.findByIdAndDelete(newOTP._id);
      
      return NextResponse.json(
        { success: false, message: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.',
        data: {
          adminId: admin._id,
          email: sanitizedEmail,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          requiresOTP: true,
        }
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