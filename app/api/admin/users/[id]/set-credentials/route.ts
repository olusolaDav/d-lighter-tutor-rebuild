import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken, validatePassword } from '@/lib/auth';

/**
 * PATCH /api/admin/users/[id]/set-credentials
 * Allows admin OR the student's parent to set student username and/or password.
 * When parent sets credentials: the student's mustChangePassword is cleared.
 * When admin sets credentials: mustChangePassword remains true (student must change on login).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const isAdmin = ['admin', 'super_admin'].includes(payload.role);
    const isParent = payload.role === 'parent';

    if (!isAdmin && !isParent) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const student = await Admin.findOne({ _id: id, role: 'student' }).select('+password');
    if (!student) return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });

    // Parent can only manage their own children
    if (isParent && student.parentId?.toString() !== payload.adminId) {
      return NextResponse.json({ success: false, message: 'Forbidden — this student is not linked to your account' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username && !password) {
      return NextResponse.json({ success: false, message: 'Provide a username or password to update' }, { status: 400 });
    }

    if (username) {
      const formatted = username.toUpperCase().trim();
      // Must match DLT-{NAME}{DIGITS} format
      if (!/^DLT-[A-Z]{2,8}\d{3}$/.test(formatted)) {
        return NextResponse.json(
          { success: false, message: 'Username must follow the format DLT-{NAME}{3 digits}, e.g. DLT-ADE123' },
          { status: 400 }
        );
      }
      const taken = await Admin.findOne({ username: formatted, _id: { $ne: id } });
      if (taken) return NextResponse.json({ success: false, message: 'This username is already taken' }, { status: 409 });
      student.username = formatted;
    }

    if (password) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        return NextResponse.json({ success: false, message: validation.errors.join('. ') }, { status: 400 });
      }
      student.password = password;
      // Parent setting the password means student doesn't need to change it on first login
      if (isParent) {
        student.mustChangePassword = false;
      }
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student credentials updated successfully.',
      data: { username: student.username },
    });
  } catch (error: any) {
    console.error('set-credentials error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
