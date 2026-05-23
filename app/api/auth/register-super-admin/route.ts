import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { validatePassword, sanitizeInput, checkRateLimit } from '@/lib/auth';
import { emailService } from '@/lib/emailService';

const MAX_SUPER_ADMINS = 2;

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`register_super_admin_${clientIP}`, 3, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Enforce max super admin limit
    const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
    if (superAdminCount >= MAX_SUPER_ADMINS) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum of ${MAX_SUPER_ADMINS} super admin accounts has been reached. Contact the system administrator.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, password, secretKey } = body;

    // Validate secret registration key (stored in env)
    const expectedKey = process.env.SUPER_ADMIN_REGISTER_KEY;
    if (!expectedKey || secretKey !== expectedKey) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration key.' },
        { status: 403 }
      );
    }

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
        { success: false, message: passwordValidation.errors.join('. ') },
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
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true, // Super admins are pre-verified
      mustChangePassword: false,
    });

    await newUser.save();

    // Send welcome email (best effort)
    await emailService.sendWelcomeEmail(sanitizedEmail, sanitizedFirstName, 'super_admin').catch(() => null);

    return NextResponse.json(
      {
        success: true,
        message: 'Super admin account created successfully! You can now log in.',
        data: { email: sanitizedEmail, role: 'super_admin' },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Super admin registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
