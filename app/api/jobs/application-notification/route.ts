
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://alotdigitalagency.com';

export async function POST(request: NextRequest) {
  try {
    const { jobId, applicantName, applicantEmail, jobTitle, companyName, employerEmail } = await request.json();

    // ── Email to applicant ────────────────────────────────────────────
    const applicantHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Application Submitted Successfully!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear ${applicantName},</p>
            
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We have successfully received your application through ALOT Digital Agency.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0;">Job Details:</h3>
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Reference ID:</strong> ${jobId}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ol>
              <li>Your application is now being reviewed by the hiring team.</li>
              <li>You can track your application status in real-time on your <strong>Candidate Dashboard</strong>.</li>
              <li>If you are <strong>shortlisted</strong>, the next phase will be a <strong>skill assessment</strong> designed to evaluate your technical competence for the role.</li>
              <li>You will receive email updates as your application status changes.</li>
            </ol>
            
            <p style="text-align: center;">
              <a href="${BASE_URL}/candidate/applications" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View My Applications</a>
            </p>
            
            <p>Best of luck with your application!</p>
            
            <p>Best regards,<br>The ALOT Digital Agency Team</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from ALOT Digital Agency.<br>
            If you have any questions, please contact us at hr@alotdigitalagency.com</p>
          </div>
        </body>
      </html>
    `;

    // ── Email to employer / admin ─────────────────────────────────────
    const employerHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">New Application Received</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear Hiring Manager,</p>
            
            <p>You have received a new application for your <strong>${jobTitle}</strong> position through ALOT Digital Agency.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0;">Applicant Information:</h3>
              <p><strong>Name:</strong> ${applicantName}</p>
              <p><strong>Email:</strong> ${applicantEmail}</p>
              <p><strong>Applied for:</strong> ${jobTitle}</p>
              <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Please log into the admin dashboard to review the complete application, including the candidate's resume, cover letter, and responses.</p>
            
            <p style="text-align: center;">
              <a href="${BASE_URL}/admin/job-applications" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Application</a>
            </p>
            
            <p>Best regards,<br>ALOT Digital Agency System</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from ALOT Digital Agency.</p>
          </div>
        </body>
      </html>
    `;

    // Send emails in parallel
    const results = await Promise.allSettled([
      sendEmail({
        to: [{ email: applicantEmail, name: applicantName }],
        subject: `Application Confirmation – ${jobTitle} at ${companyName}`,
        htmlContent: applicantHtml,
      }),
      sendEmail({
        to: [{ email: employerEmail || 'hr@alotdigitalagency.com', name: 'Hiring Manager' }],
        subject: `New Application Received – ${jobTitle}`,
        htmlContent: employerHtml,
      }),
    ]);

    const allSucceeded = results.every(
      (r) => r.status === 'fulfilled' && r.value === true
    );

    return NextResponse.json({
      success: true,
      allEmailsSent: allSucceeded,
      message: 'Notification emails processed',
    }, { status: 200 });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification emails' },
      { status: 500 }
    );
  }
}
