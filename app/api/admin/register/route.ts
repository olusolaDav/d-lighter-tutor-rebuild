import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateOTP, hashOTP, validatePassword, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 registration attempts per hour per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `register_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 1 hour window

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { firstName, lastName, email, password, role = 'admin' } = body;

    // Input validation and sanitization
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: sanitizedEmail });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'An admin account with this email already exists' },
        { status: 409 }
      );
    }

    // Check admin count limit (max 4 admins)
    const adminCount = await Admin.countDocuments();
    if (adminCount >= 4) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Maximum number of admin accounts (4) has been reached. Contact system administrator.' 
        },
        { status: 403 }
      );
    }

    // Create new admin (password will be hashed by pre-save middleware)
    const newAdmin = new Admin({
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      password: password, // Will be hashed by pre-save middleware
      role: role,
      isActive: true,
      isEmailVerified: false, // Will be verified via OTP
    });

    await newAdmin.save();

    // Generate and save OTP for email verification
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Remove any existing OTPs for this email and purpose
    await OTP.deleteMany({ 
      email: sanitizedEmail, 
      purpose: 'email_verification' 
    });

    const newOTP = new OTP({
      email: sanitizedEmail,
      otp: hashedOTP,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newOTP.save();

    // Send verification email
    const emailSent = await emailService.sendOTPEmail(sanitizedEmail, {
      recipientName: `${sanitizedFirstName} ${sanitizedLastName}`,
      otp: otp, // Send the original OTP, not the hash
      purpose: 'registration',
      expiryMinutes: 10,
    });

    if (!emailSent) {
      // If email fails, delete the created admin and OTP
      await Admin.findByIdAndDelete(newAdmin._id);
      await OTP.findByIdAndDelete(newOTP._id);
      
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully. Please check your email for verification code.',
        data: {
          adminId: newAdmin._id,
          email: sanitizedEmail,
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          role: role,
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An admin account with this email already exists' },
        { status: 409 }
      );
    }

    // Handle max admin limit error
    if (error.message.includes('Maximum number of admin accounts')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}