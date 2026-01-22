import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OTPEmailData {
  recipientName: string;
  otp: string;
  purpose: 'login' | 'registration' | 'password_reset';
  expiryMinutes?: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zeptomail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'emailapikey',
        pass: process.env.ZEPTOMAIL_API_KEY,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: 'D-lighter Tutor Admin',
          address: 'admin@d-lightertutor.com'
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private generateOTPEmailTemplate(data: OTPEmailData, recipientEmail: string): string {
    const { recipientName, otp, purpose, expiryMinutes = 10 } = data;
    
    const purposeMap = {
      login: 'Login Verification',
      registration: 'Email Verification', 
      password_reset: 'Password Reset'
    };

    const purposeText = purposeMap[purpose];
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${purposeText} - D-lighter Tutor Admin</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .otp-section { text-align: center; margin: 30px 0; }
            .otp-code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #667eea; 
                background-color: #f8f9fa;
                padding: 20px 30px;
                border-radius: 10px;
                border: 2px dashed #667eea;
                display: inline-block;
                letter-spacing: 8px;
                margin: 20px 0;
            }
            .expiry-text { color: #e74c3c; font-weight: 600; margin-top: 15px; }
            .instructions { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .security-notice { 
                background-color: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 20px 0;
                color: #856404;
            }
            .footer { 
                background-color: #f8f9fa; 
                padding: 25px; 
                text-align: center; 
                color: #6c757d; 
                font-size: 14px; 
            }
            .footer a { color: #667eea; text-decoration: none; }
            .divider { height: 1px; background-color: #e9ecef; margin: 25px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>D-lighter Tutor</h1>
                <p style="color: #f8f9fa; margin: 5px 0 0 0; font-size: 16px;">Admin Portal</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello <strong>${recipientName}</strong>,
                </div>
                
                <p>You've requested ${purposeText.toLowerCase()} for your admin account. Please use the verification code below to continue:</p>
                
                <div class="otp-section">
                    <div class="otp-code">${otp}</div>
                    <p class="expiry-text">⏰ This code expires in ${expiryMinutes} minutes</p>
                </div>
                
                <div class="instructions">
                    <h3 style="margin-top: 0; color: #333;">How to use this code:</h3>
                    <ol style="margin-bottom: 0;">
                        <li>Return to the admin login page</li>
                        <li>Enter this 6-digit verification code</li>
                        <li>Click "Verify" to complete your ${purpose === 'registration' ? 'registration' : purpose === 'password_reset' ? 'password reset' : 'login'}</li>
                    </ol>
                </div>
                
                <div class="security-notice">
                    <strong>🔒 Security Notice:</strong><br>
                    • Never share this code with anyone<br>
                    • D-lighter Tutor staff will never ask for this code<br>
                    • If you didn't request this, please ignore this email
                </div>
                
                <div class="divider"></div>
                
                <p style="color: #6c757d; font-size: 14px;">
                    If you're having trouble, contact our support team at 
                    <a href="mailto:support@d-lightertutor.com">support@d-lightertutor.com</a>
                </p>
            </div>
            
            <div class="footer">
                <p><strong>D-lighter Tutor Admin Portal</strong></p>
                <p>Expert online tutoring for African children in diaspora</p>
                <p>
                    <a href="https://d-lightertutor.com">Website</a> | 
                    <a href="mailto:support@d-lightertutor.com">Support</a>
                </p>
                <p style="margin-top: 15px; color: #adb5bd; font-size: 12px;">
                    This email was sent to ${recipientEmail} from D-lighter Tutor Admin Portal.<br>
                    © ${new Date().getFullYear()} D-lighter Tutor. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async sendOTPEmail(email: string, data: OTPEmailData): Promise<boolean> {
    const subject = `${data.purpose === 'login' ? 'Login' : data.purpose === 'registration' ? 'Email' : 'Password Reset'} Verification Code - D-lighter Tutor Admin`;
    
    const html = this.generateOTPEmailTemplate(data, email);
    
    const text = `
Hello ${data.recipientName},

Your verification code for D-lighter Tutor Admin Portal is: ${data.otp}

This code expires in ${data.expiryMinutes || 10} minutes.

If you didn't request this, please ignore this email.

Best regards,
D-lighter Tutor Team
    `.trim();

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendWelcomeEmail(email: string, adminName: string, role: string): Promise<boolean> {
    const subject = 'Welcome to D-lighter Tutor Admin Portal';
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - D-lighter Tutor Admin</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .welcome-box { 
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 25px 0;
            }
            .feature-list { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin: 10px 0; }
            .feature-icon { color: #28a745; margin-right: 10px; font-size: 18px; }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }
            .footer { 
                background-color: #f8f9fa; 
                padding: 25px; 
                text-align: center; 
                color: #6c757d; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>D-lighter Tutor</h1>
                <p style="color: #f8f9fa; margin: 5px 0 0 0;">Admin Portal</p>
            </div>
            
            <div class="content">
                <div class="welcome-box">
                    <h2 style="margin: 0 0 15px 0;">Welcome to the Team! 🎉</h2>
                    <p style="margin: 0; font-size: 18px;">You're now a ${role.replace('_', ' ')} at D-lighter Tutor</p>
                </div>
                
                <h3>Hello ${adminName},</h3>
                
                <p>Congratulations! Your admin account has been successfully created. You now have access to the D-lighter Tutor Admin Portal where you can help manage our mission to provide quality education to African children worldwide.</p>
                
                <div class="feature-list">
                    <h4 style="margin-top: 0;">Your Access Includes:</h4>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>Dashboard analytics and insights</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>Lead and booking management</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>Content management system</span>
                    </div>
                    ${role === 'super_admin' ? `
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>User and admin management</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>System settings and configuration</span>
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center;">
                    <a href="https://d-lightertutor.com/admin" class="cta-button">Access Admin Portal</a>
                </div>
                
                <p><strong>Important Security Tips:</strong></p>
                <ul>
                    <li>Use the two-factor authentication for enhanced security</li>
                    <li>Never share your login credentials</li>
                    <li>Log out when finished, especially on shared devices</li>
                    <li>Report any suspicious activity immediately</li>
                </ul>
                
                <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
                
                <p>Welcome aboard!</p>
                
                <p><strong>The D-lighter Tutor Team</strong></p>
            </div>
            
            <div class="footer">
                <p><strong>D-lighter Tutor Admin Portal</strong></p>
                <p>Expert online tutoring for African children in diaspora</p>
                <p>© ${new Date().getFullYear()} D-lighter Tutor. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  async sendPasswordResetConfirmation(email: string, adminName: string): Promise<boolean> {
    const subject = 'Password Reset Successful - D-lighter Tutor Admin';
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .success-box { 
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 25px 0;
            }
            .footer { background-color: #f8f9fa; padding: 25px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Successful</h1>
            </div>
            
            <div class="content">
                <div class="success-box">
                    <h3 style="margin: 0 0 10px 0;">✅ Password Updated Successfully</h3>
                    <p style="margin: 0;">Your admin account password has been reset.</p>
                </div>
                
                <h3>Hello ${adminName},</h3>
                
                <p>This email confirms that your password for the D-lighter Tutor Admin Portal has been successfully reset.</p>
                
                <p><strong>Security Information:</strong></p>
                <ul>
                    <li>Reset completed at: ${new Date().toLocaleString()}</li>
                    <li>If you did not perform this action, please contact support immediately</li>
                    <li>Remember to keep your password secure and don't share it with anyone</li>
                </ul>
                
                <p>You can now log in to your admin account using your new password.</p>
                
                <p>Best regards,<br><strong>The D-lighter Tutor Team</strong></p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} D-lighter Tutor. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

export const emailService = new EmailService();