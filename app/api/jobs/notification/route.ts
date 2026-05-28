import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { 
      employerName, 
      employerEmail, 
      jobTitle, 
      companyName 
    } = await request.json();

    // Send confirmation email to employer
    await sendEmail({
      to: employerEmail,
      subject: 'Job Posted Successfully - ALOT Talent Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Job Posted Successfully!</h2>
          <p>Dear ${employerName},</p>

          <p>Thank you for posting your job on ALOT Talent Hub. Your job posting has been submitted successfully and is now under review by our team.</p>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Job Details</h3>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>

          <p>Once your job posting aligns with our policies, we'll approve it and it will be live on our platform. You'll receive another email notification when your job is approved.</p>

          <p>
            <a href="${process.env.NEXTAUTH_URL}/jobs" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Job Post
            </a>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for choosing ALOT Talent Hub!<br>
            Best regards,<br>
            The ALOT Team
          </p>
        </div>
      `,
    });

    // Send notification to admin
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await sendEmail({
        to: admin.email,
        subject: 'New Job Post Pending Review - ALOT Talent Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">New Job Post Pending Review</h2>
            <p>A new job has been posted and requires admin review.</p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Job Details</h3>
              <p><strong>Job Title:</strong> ${jobTitle}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Posted by:</strong> ${employerName} (${employerEmail})</p>
              <p><strong>Posted on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>
              <a href="${process.env.NEXTAUTH_URL}/admin/jobs" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Job Posts
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ALOT Talent Hub.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification emails sent successfully'
    });

  } catch (error) {
    console.error('Error sending notification email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}