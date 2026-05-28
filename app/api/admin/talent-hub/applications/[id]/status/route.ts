import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/lib/models/JobApplication';
import Job from '@/lib/models/Job';
import { getAuthUser } from '@/lib/auth';
import { notify } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { status, notes } = await request.json();
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find and update the application
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application
    const updateData: any = {
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('jobId', 'title company')
     .populate('applicantId', 'firstName lastName email');

    // Send notification email to applicant based on status
    if (updatedApplication && updatedApplication.applicantId && updatedApplication.jobId) {
      try {
        const { sendEmail } = await import('@/lib/email');

        const applicant = updatedApplication.applicantId as any;
        const job = updatedApplication.jobId as any;
        const firstName = applicant.firstName || 'Applicant';
        const jobTitle = job.title || 'the position';
        const companyName = job.company?.name || 'our company';

        const emailSubjects: Record<string, string> = {
          reviewed:    `Your application for "${jobTitle}" is under review`,
          shortlisted: `You've been shortlisted for "${jobTitle}" 🎉`,
          rejected:    `Update on your application for "${jobTitle}"`,
          hired:       `Congratulations! You've been selected for "${jobTitle}" 🎊`,
        };

        const emailBodies: Record<string, string> = {
          reviewed: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Under Review - Alot Digital Agency</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #f7971d 0%, #ffd200 100%); padding: 30px 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alot Digital Agency</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f7971d; margin-top: 0;">Application Under Review</h2>
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>Thank you for applying to <strong>${companyName}</strong>. We wanted to let you know that your application is now being reviewed by our team.</p>
        <div style="margin: 24px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #f7971d;">
          <p style="margin: 0 0 8px;"><strong>Position Applied:</strong> ${jobTitle}</p>
          <p style="margin: 0;"><strong>Company:</strong> ${companyName}</p>
        </div>
        <p>Our hiring team is carefully reviewing all applications. We will be in touch with a further update as soon as possible — usually within a few business days.</p>
        <p>In the meantime, you can log in to your dashboard to track your application status at any time.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://alotdigitalagency.com/candidate/applications" style="background-color: #f7971d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Track My Application</a>
        </div>
        <p>Best regards,<br/><strong>Alot Digital Agency Hiring Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Alot Digital Agency &bull; Email: <a href="mailto:hr@alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">hr@alotdigitalagency.com</a> &bull; <a href="https://alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">alotdigitalagency.com</a>
        </p>
        <p style="font-size: 11px; color: #999; margin: 8px 0 0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,

          shortlisted: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Shortlisted! - Alot Digital Agency</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #f7971d 0%, #ffd200 100%); padding: 30px 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alot Digital Agency</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f7971d; margin-top: 0;">You've Been Shortlisted! 🎉</h2>
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>We have some exciting news — you have been <strong>shortlisted</strong> for the role at <strong>${companyName}</strong>! We were genuinely impressed by your background and experience.</p>
        <div style="margin: 24px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #f7971d;">
          <p style="margin: 0 0 8px;"><strong>Position:</strong> ${jobTitle}</p>
          <p style="margin: 0;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 8px 0 0;"><strong>Status:</strong> <span style="color: #f7971d; font-weight: 600;">Shortlisted ✓</span></p>
        </div>
        <p>Our team will be reaching out to you shortly with details about the next stage of the process, which may include an interview or additional assessment.</p>
        <p>Please ensure your contact details are up to date so we can get in touch without delay.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://alotdigitalagency.com/candidate/applications" style="background-color: #f7971d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">View My Application</a>
        </div>
        <p>Best of luck with the next steps — we look forward to speaking with you!</p>
        <p>Best regards,<br/><strong>Alot Digital Agency Hiring Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Alot Digital Agency &bull; Email: <a href="mailto:hr@alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">hr@alotdigitalagency.com</a> &bull; <a href="https://alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">alotdigitalagency.com</a>
        </p>
        <p style="font-size: 11px; color: #999; margin: 8px 0 0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,

          rejected: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update on Your Application - Alot Digital Agency</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #f7971d 0%, #ffd200 100%); padding: 30px 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alot Digital Agency</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f7971d; margin-top: 0;">Update on Your Application</h2>
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>Thank you for your interest in joining <strong>${companyName}</strong> and for the time and effort you invested in your application.</p>
        <div style="margin: 24px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #f7971d;">
          <p style="margin: 0 0 8px;"><strong>Position Applied:</strong> ${jobTitle}</p>
          <p style="margin: 0;"><strong>Company:</strong> ${companyName}</p>
        </div>
        <p>After carefully reviewing all applications, we have decided not to move forward with your application for this particular role at this time. This was a highly competitive process and the decision was not easy.</p>
        ${notes ? `<div style="margin: 20px 0; padding: 16px; background-color: #fff8f0; border-radius: 8px; border-left: 4px solid #f7971d;"><p style="margin: 0; font-size: 14px; color: #555;"><strong>Feedback from the hiring team:</strong><br/>${notes}</p></div>` : ''}
        <p>We encourage you to keep an eye on our careers page for future opportunities that align with your skills. We genuinely appreciate the quality of your application and wish you every success in your career journey.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://alotdigitalagency.com/careers" style="background-color: #f7971d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">View Other Openings</a>
        </div>
        <p>Best regards,<br/><strong>Alot Digital Agency Hiring Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Alot Digital Agency &bull; Email: <a href="mailto:hr@alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">hr@alotdigitalagency.com</a> &bull; <a href="https://alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">alotdigitalagency.com</a>
        </p>
        <p style="font-size: 11px; color: #999; margin: 8px 0 0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,

          hired: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations! You've Been Selected - Alot Digital Agency</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #f7971d 0%, #ffd200 100%); padding: 30px 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alot Digital Agency</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f7971d; margin-top: 0;">Congratulations — You've Been Selected! 🎊</h2>
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>We are absolutely thrilled to share fantastic news — you have been <strong>selected</strong> for the role at <strong>${companyName}</strong>! This is the result of your hard work and the impressive qualities you demonstrated throughout the process.</p>
        <div style="margin: 24px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #f7971d;">
          <p style="margin: 0 0 8px;"><strong>Position:</strong> ${jobTitle}</p>
          <p style="margin: 0 0 8px;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Selected 🎊</span></p>
        </div>
        <p>Our team will be reaching out to you very shortly with all the details you need — including next steps, onboarding information, and your official start date. Please keep an eye on your inbox and ensure your contact details are current.</p>
        <p>On behalf of the entire team at <strong>${companyName}</strong>, welcome aboard! We cannot wait to have you with us and are excited about the incredible things we'll build together.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://alotdigitalagency.com/candidate/applications" style="background-color: #f7971d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Go to My Dashboard</a>
        </div>
        <p>Best regards,<br/><strong>Alot Digital Agency Hiring Team</strong></p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Alot Digital Agency &bull; Email: <a href="mailto:hr@alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">hr@alotdigitalagency.com</a> &bull; <a href="https://alotdigitalagency.com" style="color: #f7971d; text-decoration: none;">alotdigitalagency.com</a>
        </p>
        <p style="font-size: 11px; color: #999; margin: 8px 0 0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
        };

        const subject = emailSubjects[status];
        const htmlContent = emailBodies[status];

        if (subject && htmlContent) {
          console.log(`[Email] Sending status "${status}" email to ${applicant.email}`);
          const emailResult = await sendEmail({
            to: [{ email: applicant.email, name: `${firstName} ${applicant.lastName || ''}`.trim() }],
            subject,
            htmlContent,
          });
          if (emailResult) {
            console.log(`✅ Email notification sent to ${applicant.email} for status: ${status}`);
          } else {
            console.warn(`❌ Email notification failed for ${applicant.email}`);
          }
        } else {
          console.log(`ℹ️ No email configured for status: ${status}`);
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Continue with the response even if email fails
      }
    }

    // ── In-app notification to the applicant ──────────────────────────
    if (updatedApplication && updatedApplication.applicantId) {
      try {
        const applicant = updatedApplication.applicantId as any;
        const job = updatedApplication.jobId as any;
        const jobTitle = job?.title || 'a job';
        const applicationLink = `/candidate/applications`;

        const notificationMap: Record<string, { title: string; message: string }> = {
          reviewed:    { title: 'Application Under Review', message: `Your application for "${jobTitle}" is now being reviewed.` },
          shortlisted: { title: 'You\'ve Been Shortlisted! 🎉', message: `Congratulations! You have been shortlisted for "${jobTitle}".` },
          rejected:    { title: 'Application Update', message: `We've reviewed your application for "${jobTitle}". Unfortunately, you were not selected at this time.` },
          hired:       { title: 'Offer Extended! 🎊', message: `Congratulations! You have been selected for "${jobTitle}". Please check your email for next steps.` },
        };

        const notifData = notificationMap[status];
        if (notifData) {
          await notify({
            userId: String(applicant._id || applicant),
            type: 'application_status_changed',
            title: notifData.title,
            message: notifData.message,
            link: applicationLink,
            metadata: { applicationId: applicationId, status, jobTitle },
          });
        }
      } catch (notifyError) {
        console.error('Failed to create in-app notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        application: updatedApplication
      },
      message: `Application status updated to ${status}`
    });

  } catch (error) {
    console.error('Application status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}