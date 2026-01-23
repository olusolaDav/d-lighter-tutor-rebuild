import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { OTP } from '@/lib/models/OTP';
import { generateAccessToken, generateRefreshToken, verifyOTPHash, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 OTP verification attempts per 15 minutes per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `verify_otp_${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000); // 15 minutes window

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many verification attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { email, otp, purpose } = body;

    // Input validation and sanitization
    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and purpose are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedOTP = sanitizeInput(otp);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(sanitizedOTP)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes = ['email_verification', 'login_verification', 'password_reset'];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP purpose' },
        { status: 400 }
      );
    }

    // Find the admin
    const admin = await Admin.findOne({ email: sanitizedEmail });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: sanitizedEmail,
      purpose: purpose,
      isUsed: false,
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'No valid verification code found. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      // Delete expired OTP
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      // Delete OTP after too many attempts
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json(
        { success: false, message: 'Too many incorrect attempts. Please request a new verification code.' },
        { status: 429 }
      );
    }

    // Verify OTP
    const isOTPValid = verifyOTPHash(sanitizedOTP, otpRecord.otp);

    if (!isOTPValid) {
      // Increment attempt count
      await OTP.findByIdAndUpdate(otpRecord._id, {
        $inc: { attempts: 1 }
      });

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      const message = remainingAttempts > 0 
        ? `Invalid verification code. ${remainingAttempts} attempts remaining.`
        : 'Invalid verification code. Please request a new one.';

      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    // OTP is valid - mark as used
    await OTP.findByIdAndUpdate(otpRecord._id, {
      isUsed: true
    });

    // Handle different purposes
    let response: any = {
      success: true,
      data: {
        adminId: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      }
    };

    switch (purpose) {
      case 'email_verification':
        // Mark email as verified and activate account
        await Admin.findByIdAndUpdate(admin._id, {
          isEmailVerified: true,
          isActive: true
        });

        // Send welcome email
        await emailService.sendWelcomeEmail(
          admin.email,
          `${admin.firstName} ${admin.lastName}`,
          admin.role
        );

        response.message = 'Email verified successfully! Welcome to D-lighter Tutor Admin Portal.';
        response.data.isEmailVerified = true;
        break;

      case 'login_verification':
        // Generate tokens for successful login
        const tokenPayload = {
          adminId: admin._id.toString(),
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        };

        const refreshTokenPayload = {
          adminId: admin._id.toString(),
          email: admin.email,
          tokenVersion: 1, // Can be used for token revocation
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(refreshTokenPayload);

        response.message = 'Login successful! Welcome back.';
        response.data.accessToken = accessToken;
        response.data.refreshToken = refreshToken;
        response.data.permissions = admin.permissions;
        response.data.isEmailVerified = admin.isEmailVerified;
        response.data.lastLogin = admin.lastLogin;

        // Set secure HTTP-only cookies for tokens
        const accessTokenCookie = `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${15 * 60}`; // 15 minutes
        const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`; // 7 days

        return new NextResponse(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': [accessTokenCookie, refreshTokenCookie].join(', '),
          },
        });

      case 'password_reset':
        // Return a temporary token for password reset
        const resetToken = generateAccessToken({
          adminId: admin._id.toString(),
          email: admin.email,
          role: 'password_reset',
          permissions: ['reset_password'],
        });

        response.message = 'Verification successful. You can now reset your password.';
        response.data.resetToken = resetToken;
        response.data.canResetPassword = true;
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid OTP purpose' },
          { status: 400 }
        );
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}