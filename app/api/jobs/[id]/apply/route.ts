
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getDb } from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import JobApplication from '@/lib/models/JobApplication';
import { getAuthUser } from '@/lib/auth';
import { notify, notifyRole } from '@/lib/notifications';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ hasApplied: false }, { status: 200 });
    }

    await connectDB();
    const resolvedParams = await params;

    const existing = await JobApplication.findOne({
      jobId: resolvedParams.id,
      applicantId: user.id,
    });

    return NextResponse.json({ hasApplied: !!existing }, { status: 200 });
  } catch (error) {
    console.error('Check application status error:', error);
    return NextResponse.json({ hasApplied: false }, { status: 200 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const resolvedParams = await params;
    const job = await Job.findById(resolvedParams.id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { success: false, error: 'Job is no longer active' },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return NextResponse.json(
        { success: false, error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await JobApplication.findOne({
      jobId: resolvedParams.id,
      applicantId: user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    const applicationData = await request.json();

    // Validate required fields
    if (!applicationData.personalInfo?.firstName || 
        !applicationData.personalInfo?.lastName || 
        !applicationData.personalInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Personal information (first name, last name, email) is required' },
        { status: 400 }
      );
    }

    if (!applicationData.consent?.dataProcessing) {
      return NextResponse.json(
        { success: false, error: 'Consent to data processing is required' },
        { status: 400 }
      );
    }

    // Validate work experience
    if (!applicationData.workExperience || applicationData.workExperience.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one work experience entry is required' },
        { status: 400 }
      );
    }

    // Validate education
    if (!applicationData.education || applicationData.education.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one education entry is required' },
        { status: 400 }
      );
    }

    // Validate skills
    if (!applicationData.skills || applicationData.skills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one skill is required' },
        { status: 400 }
      );
    }

    // Validate resume
    if (!applicationData.documents?.resume) {
      return NextResponse.json(
        { success: false, error: 'Resume is required' },
        { status: 400 }
      );
    }

    // Create application with enhanced structure
    const application = new JobApplication({
      jobId: resolvedParams.id,
      applicantId: user.id,
      personalInfo: {
        firstName: applicationData.personalInfo.firstName,
        lastName: applicationData.personalInfo.lastName,
        email: applicationData.personalInfo.email,
        phone: applicationData.personalInfo.phone || '',
        phoneCountry: 'NG', // Default to Nigeria
        location: applicationData.personalInfo.location || '',
        summary: applicationData.personalInfo.summary || '',
        gender: applicationData.personalInfo.gender || '',
        religion: applicationData.personalInfo.religion || '',
      },
      workExperience: applicationData.workExperience.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        location: exp.location || '',
        employmentType: exp.employmentType,
        startDate: exp.startDate,
        endDate: exp.isCurrentRole ? '' : exp.endDate,
        isCurrentRole: exp.isCurrentRole,
        description: exp.description || '',
      })),
      education: applicationData.education.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || '',
        grade: edu.grade || '',
        startDate: edu.startDate,
        endDate: edu.isCurrentlyStudying ? '' : edu.endDate,
        isCurrentlyStudying: edu.isCurrentlyStudying,
        description: edu.description || '',
      })),
      skills: applicationData.skills.map((skill: any) => ({
        name: skill.name,
        proficiency: skill.proficiency,
        yearsOfExperience: skill.yearsOfExperience || 0,
      })),
      certifications: (applicationData.certifications || []).map((cert: any) => ({
        name: cert.name,
        issuingOrganization: cert.issuingOrganization,
        issueDate: cert.issueDate,
        expirationDate: cert.expirationDate || '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
      })),
      socialMedia: {
        linkedin: applicationData.socialMedia?.linkedin || '',
        github: applicationData.socialMedia?.github || '',
        portfolio: applicationData.socialMedia?.portfolio || '',
        website: applicationData.socialMedia?.website || '',
        twitter: applicationData.socialMedia?.twitter || '',
        behance: applicationData.socialMedia?.behance || '',
        dribbble: applicationData.socialMedia?.dribbble || '',
      },
      documents: {
        resume: applicationData.documents.resume,
        coverLetter: applicationData.documents.coverLetter || '',
        portfolio: applicationData.documents.portfolio || '',
        otherDocuments: applicationData.documents.otherDocuments || [],
      },
      application: {
        coverLetter: applicationData.application.coverLetter,
        whyInterested: applicationData.application.whyInterested || '',
        salaryExpectation: applicationData.application.salaryExpectation || '',
        availabilityDate: applicationData.application.availabilityDate || '',
        noticePeriod: applicationData.application.noticePeriod || '',
        willingToRelocate: applicationData.application.willingToRelocate || false,
        requiresSponsorship: applicationData.application.requiresSponsorship || false,
        dailyHoursAvailable: applicationData.application.dailyHoursAvailable || '',
        weeklyHoursAvailable: applicationData.application.weeklyHoursAvailable || '',
        hasPowerSupply: applicationData.application.hasPowerSupply || '',
        alternativePowerSource: applicationData.application.alternativePowerSource || '',
        personalComputer: applicationData.application.personalComputer || '',
        internetAccess: applicationData.application.internetAccess || '',
      },
      customAnswers: applicationData.customAnswers || {},
      consent: {
        dataProcessing: applicationData.consent.dataProcessing,
        emailUpdates: applicationData.consent.emailUpdates || false,
        backgroundCheck: applicationData.consent.backgroundCheck || false,
      },
    });

    await application.save();

    // Add applicant to job
    await Job.findByIdAndUpdate(resolvedParams.id, {
      $push: {
        applicants: {
          userId: user.id,
          appliedAt: new Date(),
          status: 'pending',
          applicationId: application._id,
        },
      },
    });

    // Mark user as having applied (for dashboard access guard)
    try {
      const db = await getDb();
      await db.collection('users').updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { hasApplied: true } }
      );
    } catch (err) {
      console.error('Failed to update hasApplied flag:', err);
    }

    // Create in-app notification for the candidate
    try {
      await notify({
        userId: user.id,
        type: 'application_submitted',
        title: 'Application Submitted',
        message: `Your application for ${job.title} at ${job.company || 'ALOT Digital Agency'} has been submitted successfully. Track your status from the dashboard.`,
        link: '/candidate/applications',
        metadata: { jobId: resolvedParams.id, jobTitle: job.title, applicationId: application._id.toString() },
      });

      // Notify admins about the new application
      await notifyRole({
        role: 'admin',
        type: 'new_job_application',
        title: 'New Job Application',
        message: `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName} applied for ${job.title}.`,
        link: '/admin/job-applications',
        metadata: { jobId: resolvedParams.id, applicantId: user.id, applicationId: application._id.toString() },
      });
    } catch (err) {
      console.error('Failed to create in-app notifications:', err);
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
