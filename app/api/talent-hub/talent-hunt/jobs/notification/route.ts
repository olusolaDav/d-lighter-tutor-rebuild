
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { jobId, employerName, employerEmail, jobTitle } = await request.json();

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Job Submission Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Job Posted Successfully!</h1>
          </div>
          <div class="content">
            <p>Dear ${employerName},</p>
            
            <p>Thank you for posting your job "<strong>${jobTitle}</strong>" on our platform!</p>
            
            <p>Your job submission has been received and is currently under review by our team. We'll ensure it aligns with our job posting policies before making it live.</p>
            
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Our team will review your job posting within 24-48 hours</li>
              <li>Once approved, your job will be live and visible to our talent community</li>
              <li>You'll receive notifications when candidates apply</li>
              <li>You can manage applications through your dashboard</li>
            </ul>
            
            <p>You can track the status of your job posting and view applications through your dashboard.</p>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Alot Digital Agency Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Alot Digital Agency. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: [{ email: employerEmail, name: employerName }],
      from: { email: process.env.EMAIL_FROM || 'hr@alotdigitalagency.com', name: 'Alot Digital Agency' },
      subject: `Job Posted Successfully - ${jobTitle}`,
      htmlContent: emailHTML,
    });

    return NextResponse.json({
      success: true,
      message: 'Email notification sent successfully',
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
