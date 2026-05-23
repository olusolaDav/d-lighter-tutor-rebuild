import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const [roleCounts, recentUsers] = await Promise.all([
      Admin.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } },
      ]),
      Admin.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName role createdAt isActive'),
    ]);

    const counts: Record<string, { total: number; active: number }> = {
      super_admin: { total: 0, active: 0 },
      admin: { total: 0, active: 0 },
      tutor: { total: 0, active: 0 },
      parent: { total: 0, active: 0 },
      student: { total: 0, active: 0 },
    };
    for (const r of roleCounts) {
      if (counts[r._id]) counts[r._id] = { total: r.count, active: r.active };
    }

    const totalUsers = Object.values(counts).reduce((s, r) => s + r.total, 0);

    return NextResponse.json({
      success: true,
      data: {
        counts,
        totalUsers,
        superAdminSlots: { used: counts.super_admin.total, max: 2 },
        recentUsers,
      },
    });
  } catch (error: any) {
    console.error('super-admin stats error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
