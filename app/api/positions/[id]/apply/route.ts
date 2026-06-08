import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';
import Application from '@/lib/models/Application';
import { emailService } from '@/lib/emailService';

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/positions/[id]/apply
 *
 * Submit an application for a position. No authentication required —
 * any visitor can apply. After a successful submission the client displays
 * a success modal with the assessmentLink stored on the position.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const position = await Position.findOne({ _id: id, isActive: true, isApproved: true });
    if (!position) {
      return NextResponse.json({ success: false, error: 'This position is no longer available.' }, { status: 404 });
    }

    // Check if application deadline has passed
    if (position.applicationDeadline && new Date() > position.applicationDeadline) {
      return NextResponse.json({ success: false, error: 'The application deadline for this position has passed.' }, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    const { personalInfo, whyJoin, education, resume, availability } = body;
    if (!personalInfo?.firstName?.trim() || !personalInfo?.lastName?.trim()) {
      return NextResponse.json({ success: false, error: 'First name and last name are required.' }, { status: 400 });
    }
    if (!personalInfo?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      return NextResponse.json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!personalInfo?.phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }
    if (!whyJoin?.trim()) {
      return NextResponse.json({ success: false, error: 'Please tell us why you want to join.' }, { status: 400 });
    }
    if (!education || education.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one education entry is required.' }, { status: 400 });
    }
    if (!resume?.fileName || !resume?.fileType || !resume?.fileSize || !resume?.url || !resume?.publicId) {
      return NextResponse.json({ success: false, error: 'Resume upload is required.' }, { status: 400 });
    }
    const allowedResumeTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    if (!allowedResumeTypes.has(resume.fileType)) {
      return NextResponse.json({ success: false, error: 'Resume must be PDF, DOC, or DOCX.' }, { status: 400 });
    }
    if (Number(resume.fileSize) > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Resume file size must not exceed 2MB.' }, { status: 400 });
    }

    const validDays = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const allowedDaysByType: Record<string, Set<string>> = {
      weekdays: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      weekends: new Set(['Saturday', 'Sunday']),
      both: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
      flexible: new Set(),
    };
    const availabilityType = availability?.type || 'flexible';
    if (!['weekdays', 'weekends', 'both', 'flexible'].includes(availabilityType)) {
      return NextResponse.json({ success: false, error: 'Invalid availability type.' }, { status: 400 });
    }
    const schedules = Array.isArray(availability?.schedules) ? availability.schedules : [];
    if (availabilityType !== 'flexible' && schedules.length === 0) {
      return NextResponse.json({ success: false, error: 'Please provide at least one day and time range for availability.' }, { status: 400 });
    }
    for (const schedule of schedules) {
      if (!validDays.has(schedule?.day)) {
        return NextResponse.json({ success: false, error: 'Invalid availability day selected.' }, { status: 400 });
      }
      if (!allowedDaysByType[availabilityType].has(schedule.day)) {
        return NextResponse.json({ success: false, error: 'Selected availability day does not match availability type.' }, { status: 400 });
      }
      if (!schedule?.startTime || !schedule?.endTime) {
        return NextResponse.json({ success: false, error: 'Each selected day must include a valid start and end time.' }, { status: 400 });
      }
      if (schedule.startTime >= schedule.endTime) {
        return NextResponse.json({ success: false, error: 'Availability end time must be later than start time.' }, { status: 400 });
      }
    }

    const submittedSubjects = Array.isArray(body.subjects)
      ? body.subjects.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim())
      : [];
    if (position.type === 'tutor') {
      const configuredSubjects = Array.isArray(position.subjects)
        ? position.subjects.filter((s: any) => typeof s === 'string' && s.trim())
        : [];
      if (configuredSubjects.length > 0) {
        if (submittedSubjects.length === 0) {
          return NextResponse.json({ success: false, error: 'Please select at least one subject for this tutor position.' }, { status: 400 });
        }
        const invalidSubject = submittedSubjects.find((s: string) => !configuredSubjects.includes(s));
        if (invalidSubject) {
          return NextResponse.json({ success: false, error: 'One or more selected subjects are not valid for this position.' }, { status: 400 });
        }
      }
    }

    // Prevent duplicate applications per email + position
    const existing = await Application.findOne({
      positionId: id,
      'personalInfo.email': personalInfo.email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an application for this position.' },
        { status: 409 }
      );
    }

    const application = new Application({
      positionId: id,
      personalInfo: {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        email: personalInfo.email.toLowerCase().trim(),
        phone: personalInfo.phone.trim(),
        city: personalInfo.city?.trim() || '',
        country: personalInfo.country?.trim() || '',
      },
      subjects: submittedSubjects,
      teachingExperience: body.teachingExperience || { hasExperience: false },
      education: education.map((e: any) => ({
        institution: e.institution?.trim() || '',
        degree: e.degree?.trim() || '',
        fieldOfStudy: e.fieldOfStudy?.trim() || '',
        startYear: e.startYear ? parseInt(e.startYear) : undefined,
        endYear: e.isOngoing ? undefined : (e.endYear ? parseInt(e.endYear) : undefined),
        isOngoing: !!e.isOngoing,
      })),
      resume: {
        fileName: resume.fileName.trim(),
        fileType: resume.fileType.trim(),
        fileSize: Number(resume.fileSize),
        url: resume.url,
        publicId: resume.publicId,
        resourceType: resume.resourceType || 'raw',
        format: resume.format || '',
      },
      availability: {
        type: availabilityType,
        schedules: schedules.map((s: any) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
      whyJoin: whyJoin.trim(),
      additionalInfo: body.additionalInfo?.trim() || '',
      status: 'pending',
    });

    await application.save();

    // Best-effort: send submission confirmation email to candidate.
    try {
      await emailService.sendCareerApplicationReceivedEmail({
        candidateEmail: personalInfo.email.toLowerCase().trim(),
        candidateName: `${personalInfo.firstName.trim()} ${personalInfo.lastName.trim()}`,
        positionTitle: position.title,
        assessmentLink: position.assessmentLink || undefined,
      });
    } catch (emailError) {
      console.error('Application confirmation email error:', emailError);
    }

    // Best-effort: notify admin of the new application.
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://d-lightertutor.com';
      const dashboardUrl = `${baseUrl}/admin/job-applications`;
      await emailService.sendAdminApplicationNotificationEmail({
        positionTitle: position.title,
        candidateName: `${personalInfo.firstName.trim()} ${personalInfo.lastName.trim()}`,
        candidateEmail: personalInfo.email.toLowerCase().trim(),
        candidatePhone: personalInfo.phone?.trim() || '',
        dashboardUrl,
      });
    } catch (emailError) {
      console.error('Admin application notification email error:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully!',
        data: {
          applicationId: application._id,
          assessmentLink: position.assessmentLink || null,
          positionTitle: position.title,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Duplicate key error (race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an application for this position.' },
        { status: 409 }
      );
    }
    console.error('Submit application error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit application. Please try again.' }, { status: 500 });
  }
}
