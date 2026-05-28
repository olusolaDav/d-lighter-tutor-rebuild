import nodemailer from 'nodemailer';

type EmailAddress = string | { email: string; name?: string };

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  subject?: string;
  html?: string;
  htmlContent?: string;
  text?: string;
  textContent?: string;
  template?: string;
  data?: Record<string, any>;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'emailapikey',
    pass: process.env.ZEPTOMAIL_API_KEY,
  },
  authMethod: 'LOGIN',
  tls: {
    rejectUnauthorized: true,
  },
});

const toNodeMailerAddress = (recipient: EmailAddress) => {
  if (typeof recipient === 'string') {
    return recipient;
  }

  return recipient.name ? { name: recipient.name, address: recipient.email } : recipient.email;
};

const formatTemplate = (template: string, data: Record<string, any> = {}) => {
  const title = template
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

  const entries = Object.entries(data)
    .map(([key, value]) => `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;"><strong>${key}</strong></td><td style="padding:8px 0;color:#111827;">${String(value ?? '')}</td></tr>`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#ffffff;color:#111827;">
      <h2 style="margin:0 0 16px;font-size:24px;">${title}</h2>
      <p style="margin:0 0 20px;color:#4b5563;">This message was generated automatically from the system.</p>
      ${entries ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">${entries}</table>` : ''}
    </div>
  `;
};

const resolveTemplate = (options: SendEmailOptions) => {
  if (options.htmlContent || options.html) {
    return {
      subject: options.subject ?? 'Notification from D-lighter Tutor',
      html: options.htmlContent ?? options.html ?? '',
      text: options.textContent ?? options.text,
    };
  }

  if (options.template) {
    const subjectMap: Record<string, string> = {
      'talent-profile-created': 'Talent Profile Created - D-lighter Tutor',
      'talent-profile-approved': 'Talent Profile Approved - D-lighter Tutor',
      'talent-profile-rejected': 'Talent Profile Update - D-lighter Tutor',
    };

    return {
      subject: options.subject ?? subjectMap[options.template] ?? 'Notification from D-lighter Tutor',
      html: formatTemplate(options.template, options.data),
      text: JSON.stringify(options.data ?? {}, null, 2),
    };
  }

  return {
    subject: options.subject ?? 'Notification from D-lighter Tutor',
    html: '',
    text: options.textContent ?? options.text,
  };
};

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { subject, html, text } = resolveTemplate(options);

    await transporter.sendMail({
      from: {
        name: 'D-lighter Tutor Admin',
        address: 'admin@d-lightertutor.com',
      },
      to: Array.isArray(options.to) ? options.to.map(toNodeMailerAddress) : toNodeMailerAddress(options.to),
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.map(toNodeMailerAddress) : toNodeMailerAddress(options.cc)) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.map(toNodeMailerAddress) : toNodeMailerAddress(options.bcc)) : undefined,
      subject,
      html,
      text,
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}