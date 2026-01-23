import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateOTP, hashOTP, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 forgot password attempts per hour per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `forgot_password_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 1 hour window

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
    const { email } = body;

    // Input validation and sanitization
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    // Find admin account
    const admin = await Admin.findOne({ email: sanitizedEmail });
    
    // Always return success message to prevent email enumeration attacks
    const successMessage = 'If an admin account with this email exists, a password reset code has been sent.';

    if (!admin) {
      return NextResponse.json(
        { success: true, message: successMessage },
        { status: 200 }
      );
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: true, message: successMessage },
        { status: 200 }
      );
    }

    // Check if email is verified
    if (!admin.isEmailVerified) {
      return NextResponse.json(
        { success: true, message: successMessage },
        { status: 200 }
      );
    }

    // Rate limiting per email - max 3 password reset requests per hour per email
    const emailRateLimitKey = `forgot_password_email_${sanitizedEmail}`;
    const emailRateLimit = checkRateLimit(emailRateLimitKey, 3, 60 * 60 * 1000); // 1 hour window

    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many password reset requests for this email. Please try again later.',
          retryAfter: Math.ceil((emailRateLimit.resetTime - Date.now()) / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    // Generate and save OTP for password reset
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Remove any existing password reset OTPs for this email
    await OTP.deleteMany({ 
      email: sanitizedEmail, 
      purpose: 'password_reset' 
    });

    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'password_reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newOTP.save();

    // Send password reset email
    const emailSent = await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${admin.firstName} ${admin.lastName}`,
      otp: otp, // Send the original OTP, not the hash
      purpose: 'password_reset',
      expiryMinutes: 10,
    });

    if (!emailSent) {
      // Delete the OTP if email failed to send
      await OTP.findByIdAndDelete(newOTP._id);
      
      return NextResponse.json(
        { success: false, message: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        data: {
          email: sanitizedEmail,
          // Don't return admin details for security
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}