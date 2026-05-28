
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please login to report jobs' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { reason, description } = requestData;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Please select a reason for reporting' },
        { status: 400 }
      );
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user already reported this job
    const existingReport = job.reports?.find(
      (report: any) => report.userId.toString() === user.id
    );

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this job' },
        { status: 400 }
      );
    }

    // Initialize reports array if it doesn't exist
    if (!job.reports) {
      job.reports = [];
    }

    // Add report
    job.reports.push({
      userId: user.id,
      reason,
      description,
      status: 'pending',
      createdAt: new Date(),
    });

    await job.save();

    // Get user info for notification
    const reportingUser = await User.findById(user.id);
    
    // Send email notification to admin
    try {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await sendEmail({
          to: admin.email,
          subject: 'Job Post Reported - ALOT Talent Hub',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Job Post Reported</h2>
              <p>A job post has been reported by a user and requires review.</p>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Report Details</h3>
                <p><strong>Job Title:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company?.name}</p>
                <p><strong>Reported by:</strong> ${reportingUser?.firstName} ${reportingUser?.lastName} (${reportingUser?.email})</p>
                <p><strong>Reason:</strong> ${reason}</p>
                ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>
                <a href="${process.env.NEXTAUTH_URL}/admin/jobs/${job._id}" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Job Post
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
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Job reported successfully. We will review it shortly.'
    });

  } catch (error) {
    console.error('Error reporting job:', error);
    return NextResponse.json(
      { success: false, error: `Failed to report job: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
