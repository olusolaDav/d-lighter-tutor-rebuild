import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, sanitizeInput, validatePassword } from '@/lib/auth';
import { emailService } from '@/lib/emailService';
import crypto from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/** Generate a DLT username for students: DLT-{FIRSTNAME}{3-digit code} */
async function generateStudentUsername(firstName: string): Promise<string> {
  const base = firstName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8);
  let username: string;
  let attempts = 0;
  do {
    const code = String(Math.floor(100 + Math.random() * 900));
    username = `DLT-${base}${code}`;
    const exists = await Admin.findOne({ username });
    if (!exists) break;
    attempts++;
    if (attempts > 20) throw new Error('Could not generate unique username. Please try again.');
  } while (true);
  return username;
}

/** Generate a secure temporary password */
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from(crypto.randomBytes(12))
    .map((b) => chars[b % chars.length])
    .join('');
}

/** Roles each admin type is allowed to create */
const CREATION_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['admin', 'tutor', 'parent', 'student'],
  admin: ['tutor', 'parent', 'student'],
};

// GET /api/admin/users — list users (filtered by role capabilities)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const search = searchParams.get('search') || '';

    // Build filter
    const allowedRoles = CREATION_PERMISSIONS[payload.role] ?? [];
    const filter: Record<string, any> = {};

    if (role && allowedRoles.includes(role)) {
      filter.role = role;
    } else {
      filter.role = { $in: allowedRoles };
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      Admin.find(filter)
        .select('-password')
        .populate('parentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Admin.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: { users, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users — create a new user
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      role,
      firstName,
      lastName,
      email,
      phone,
      gender,
      age,
      parentId,      // required when role === 'student'
      subjects,      // array — for tutors
    } = body;

    // Validate role creation permission
    const allowedRoles = CREATION_PERMISSIONS[payload.role] ?? [];
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: `You are not allowed to create a '${role}' account` },
        { status: 403 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, message: 'First name and last name are required' }, { status: 400 });
    }

    // Students require a parent
    if (role === 'student') {
      if (!parentId) {
        return NextResponse.json({ success: false, message: 'A parent account must be selected before creating a student' }, { status: 400 });
      }
      const parent = await Admin.findOne({ _id: parentId, role: 'parent' });
      if (!parent) {
        return NextResponse.json({ success: false, message: 'The specified parent account was not found' }, { status: 404 });
      }
      if (!gender || !age) {
        return NextResponse.json({ success: false, message: 'Gender and age are required for student accounts' }, { status: 400 });
      }
    } else {
      // Non-student roles need email
      if (!email) {
        return NextResponse.json({ success: false, message: 'Email address is required' }, { status: 400 });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.toLowerCase())) {
        return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 });
      }
      const existing = await Admin.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 });
      }
    }

    const sanitizedFirst = sanitizeInput(firstName);
    const sanitizedLast = sanitizeInput(lastName);
    const temporaryPassword = generateTemporaryPassword();

    let username: string | undefined;
    if (role === 'student') {
      username = await generateStudentUsername(sanitizedFirst);
    }

    const newUser = new Admin({
      firstName: sanitizedFirst,
      lastName: sanitizedLast,
      email: role !== 'student' ? email?.toLowerCase() : undefined,
      username,
      phone: phone ? sanitizeInput(phone) : undefined,
      gender: role === 'student' ? gender : undefined,
      age: role === 'student' ? Number(age) : undefined,
      password: temporaryPassword,
      role,
      isActive: true,
      isEmailVerified: true, // admin-created accounts are pre-verified
      mustChangePassword: true,
      parentId: role === 'student' ? parentId : undefined,
      subjects: role === 'tutor' ? (subjects ?? []) : undefined,
      createdBy: payload.adminId,
    });

    await newUser.save();

    // Send credentials email
    let notificationEmail: string | null = null;
    let recipientName = `${sanitizedFirst} ${sanitizedLast}`;
    let loginIdentifier = email?.toLowerCase();
    let loginIdentifierLabel = 'Email';
    let parentName: string | undefined;

    if (role === 'student') {
      // Notify parent
      const parent = await Admin.findById(parentId).select('firstName lastName email');
      notificationEmail = parent?.email ?? null;
      loginIdentifier = username!;
      loginIdentifierLabel = 'Username';
      parentName = `${parent?.firstName} ${parent?.lastName}`;
    } else {
      notificationEmail = email?.toLowerCase();
    }

    if (notificationEmail) {
      await emailService.sendAccountCreatedEmail({
        recipientEmail: notificationEmail,
        recipientName,
        role,
        loginIdentifier: loginIdentifier!,
        loginIdentifierLabel,
        temporaryPassword,
        loginUrl: `${APP_URL}/auth/login`,
        parentName,
      }).catch(() => null);
    }

    return NextResponse.json(
      {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully. Login credentials sent to ${notificationEmail ?? 'parent email'}.`,
        data: {
          _id: newUser._id,
          firstName: sanitizedFirst,
          lastName: sanitizedLast,
          email: newUser.email,
          username: newUser.username,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
