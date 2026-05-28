import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { Admin } from '@/lib/models/Admin';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const application = await Application.findById(id)
      .populate('positionId', 'title type subjects location employmentType compensation assessmentLink')
      .lean();

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const resume = application.resume
      ? {
          fileName: application.resume.fileName,
          fileType: application.resume.fileType,
          fileSize: application.resume.fileSize,
          url: application.resume.url,
          publicId: application.resume.publicId,
          resourceType: application.resume.resourceType,
          format: application.resume.format,
        }
      : null;

    const availability = {
      type: application.availability?.type || 'flexible',
      schedules: (application.availability?.schedules || []).map((schedule: any) => ({
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    };

    const normalized = {
      ...application,
      subjects: application.subjects || [],
      education: application.education || [],
      teachingExperience: application.teachingExperience || { hasExperience: false },
      resume,
      availability,
      additionalInfo: application.additionalInfo || '',
      notes: application.notes || '',
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { notes } = await request.json();

    const application = await Application.findByIdAndUpdate(id, { notes }, { new: true });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { password } = await request.json().catch(() => ({}));
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const admin = await Admin.findById(user.id).select('+password');
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    const { id } = await params;

    const application = await Application.findByIdAndDelete(id);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete application' }, { status: 500 });
  }
}
