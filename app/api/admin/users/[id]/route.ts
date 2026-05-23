import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, sanitizeInput } from '@/lib/auth';
import { emailService } from '@/lib/emailService';
import crypto from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from(crypto.randomBytes(12))
    .map((b) => chars[b % chars.length])
    .join('');
}

// GET /api/admin/users/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const user = await Admin.findById(id)
      .select('-password')
      .populate('parentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName role')
      .lean();

    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] — update user or reset password
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { action, ...fields } = body;

    const user = await Admin.findById(id).select('+password');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Prevent modifying super_admins unless you are super_admin
    if (user.role === 'super_admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    if (action === 'reset-password') {
      const newPassword = generateTemporaryPassword();
      user.password = newPassword;
      user.mustChangePassword = true;
      await user.save();

      // Notify user (or parent for students)
      let notifyEmail = user.email;
      let parentName: string | undefined;
      if (user.role === 'student' && user.parentId) {
        const parent = await Admin.findById(user.parentId).select('firstName lastName email');
        notifyEmail = parent?.email;
        parentName = `${parent?.firstName} ${parent?.lastName}`;
      }

      if (notifyEmail) {
        await emailService.sendAccountCreatedEmail({
          recipientEmail: notifyEmail,
          recipientName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          loginIdentifier: user.username ?? user.email ?? '',
          loginIdentifierLabel: user.username ? 'Username' : 'Email',
          temporaryPassword: newPassword,
          loginUrl: `${APP_URL}/auth/login`,
          parentName,
        }).catch(() => null);
      }

      return NextResponse.json({ success: true, message: 'Password reset. New credentials sent via email.' });
    }

    if (action === 'toggle-active') {
      user.isActive = !user.isActive;
      await user.save();
      return NextResponse.json({
        success: true,
        message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: user.isActive },
      });
    }

    // General field update
    const allowedFields = ['firstName', 'lastName', 'phone', 'gender', 'age', 'subjects', 'profileImage'];
    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        (user as any)[key] = typeof fields[key] === 'string' ? sanitizeInput(fields[key]) : fields[key];
      }
    }
    await user.save();

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const user = await Admin.findById(id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Admins can't delete super_admins
    if (user.role === 'super_admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    // If deleting a parent, also remove their students
    if (user.role === 'parent') {
      await Admin.deleteMany({ parentId: user._id });
    }

    await user.deleteOne();

    return NextResponse.json({ success: true, message: 'User account removed successfully' });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
