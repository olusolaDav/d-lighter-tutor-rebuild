import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create transporter using ZeptoMail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  auth: {
    user: "emailapikey",
    pass: process.env.ZEPTOMAIL_API_KEY || "wSsVR60j+EP3Bqd6mDCoIrxuy1QAAl+gQ0wsilD06HP0S/DD8cczkkzKDAOlTfJMR2VhQTtHpLMgyRxR02dfhtsrnlFUWiiF9mqRe1U4J3x17qnvhDzDWm5UkxOILo0Izw5ikmlpF8si+g==",
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      studentAge,
      subjects,
      gradeLevel,
      country,
      otherCountry,
      preferredDays,
      preferredTime,
      curriculum,
      plan,
      learningGoal,
    } = body

    // Compute the final country value
    const finalCountry = country === "Other" && otherCountry ? otherCountry : country

    // Validate required fields
    if (!name || !email || !phone || !studentAge || !subjects?.length || !gradeLevel || !country || !preferredDays?.length || !preferredTime || !curriculum) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate otherCountry if country is "Other"
    if (country === "Other" && !otherCountry) {
      return NextResponse.json(
        { success: false, error: "Please specify your country" },
        { status: 400 }
      )
    }

    // Format the email content with nice HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Trial Class Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎓 New Trial Class Request
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                A new parent has requested a FREE trial class
              </p>
            </td>
          </tr>
          
          <!-- Parent Details Section -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                  <span style="background-color: #ffd700; color: #1e3a5f; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">👤</span>
                  Parent Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Country:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${finalCountry}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Student Details Section -->
          <tr>
            <td style="padding: 0 32px 16px;">
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <h2 style="margin: 0 0 16px; color: #166534; font-size: 18px; font-weight: 600;">
                  <span style="background-color: #22c55e; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">👨‍🎓</span>
                  Student Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Age:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${studentAge} years old</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Grade/Class:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${gradeLevel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Curriculum:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${curriculum}</td>
                  </tr>
                  ${plan ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Interested Plan:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 16px; font-size: 12px;">${plan}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Subjects:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      ${subjects.map((s: string) => `<span style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin: 2px 4px 2px 0;">${s}</span>`).join('')}
                    </td>
                  </tr>
                  ${learningGoal ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Learning Goal:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      <span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 8px 12px; border-radius: 8px; font-size: 13px;">${learningGoal}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Schedule Preferences Section -->
          <tr>
            <td style="padding: 0 32px 16px;">
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px;">
                <h2 style="margin: 0 0 16px; color: #92400e; font-size: 18px; font-weight: 600;">
                  <span style="background-color: #f59e0b; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">📅</span>
                  Schedule Preferences
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Preferred Days:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                      ${preferredDays.map((d: string) => `<span style="display: inline-block; background-color: #fde68a; color: #92400e; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin: 2px 4px 2px 0;">${d}</span>`).join('')}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Preferred Time:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${preferredTime}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Action Buttons -->
          <tr>
            <td style="padding: 16px 32px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      💬 Reply via WhatsApp
                    </a>
                  </td>
                  <td align="center" style="padding: 8px;">
                    <a href="mailto:${email}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      ✉️ Reply via Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This email was sent from the D-lighter Tutor Website.<br>
                © ${new Date().getFullYear()} D-lighter Tutor. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // Plain text version
    const textContent = `
NEW TRIAL CLASS REQUEST
========================

PARENT DETAILS
--------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Country: ${finalCountry}

STUDENT DETAILS
---------------
Age: ${studentAge} years old
Grade/Class: ${gradeLevel}
Curriculum: ${curriculum}
${plan ? `Interested Plan: ${plan}` : ''}
Subjects: ${subjects.join(", ")}
${learningGoal ? `Learning Goal: ${learningGoal}` : ''}

SCHEDULE PREFERENCES
--------------------
Preferred Days: ${preferredDays.join(", ")}
Preferred Time: ${preferredTime}

---
This email was sent from the D-lighter Tutor Website.
    `.trim()

    // Send email to admin using ZeptoMail SMTP
    await transporter.sendMail({
      from: '"D-lighter Tutor" <noreply@d-lightertutor.com>',
      to: ["dlightertutor2@gmail.com", "dlightertutor@gmail.com", "biodun4destiny@gmail.com"],
      replyTo: email,
      subject: `🎓 New Trial Class Request from ${name} (${finalCountry})${plan ? ` - ${plan} Plan` : ''}`,
      text: textContent,
      html: htmlContent,
    })

    // Send confirmation email to parent
    const parentHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Thank You, ${name.split(' ')[0]}!
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                We've received your trial class request
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Thank you for choosing D-lighter Tutor for your child's education journey! We're excited to help your child thrive.
              </p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                  ✅ What happens next?
                </p>
                <ul style="margin: 12px 0 0; padding-left: 20px; color: #1e293b; font-size: 14px; line-height: 1.8;">
                  <li>Our team will review your request within 24 hours</li>
                  <li>We'll match your child with the perfect tutor</li>
                  <li>You'll receive a WhatsApp/email with scheduling details</li>
                </ul>
              </div>
              
              <p style="margin: 24px 0 16px; color: #1e293b; font-size: 16px; line-height: 1.6;">
                In the meantime, feel free to reach out if you have any questions:
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://wa.me/2348129517392" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px; color: #1e293b; font-size: 14px; font-weight: 600;">
                D-lighter Tutor
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                Expert Tutoring for African Children in the Diaspora
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    await transporter.sendMail({
      from: '"D-lighter Tutor" <noreply@d-lightertutor.com>',
      to: email,
      subject: "🎉 We've received your trial class request - D-lighter Tutor",
      html: parentHtmlContent,
    })

    return NextResponse.json({
      success: true,
      message: "Your request has been submitted successfully! Check your email for confirmation.",
    })

  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email. Please try again or contact us directly on WhatsApp." 
      },
      { status: 500 }
    )
  }
}
