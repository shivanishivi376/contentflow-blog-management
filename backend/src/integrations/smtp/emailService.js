import nodemailer from 'nodemailer';
import SMTPConfiguration from '../../models/SMTPConfiguration.js';

export const getTransporterAndSender = async () => {
  let dbConfig = await SMTPConfiguration.findOne().select('+password').lean();

  let host = dbConfig?.host || process.env.SMTP_HOST;
  let port = dbConfig?.port || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587);
  let username = dbConfig?.username || process.env.SMTP_USERNAME;
  let password = dbConfig?.password || process.env.SMTP_PASSWORD;
  let senderEmail = dbConfig?.senderEmail || process.env.SMTP_SENDER_EMAIL || username;
  let senderName = dbConfig?.senderName || process.env.SMTP_SENDER_NAME || 'Content Flow';
  let isEmailNotificationEnabled = dbConfig ? dbConfig.isEmailNotificationEnabled : true;

  if (!host || !username || !password) {
    return {
      transporter: null,
      senderEmail,
      senderName,
      isEmailNotificationEnabled,
      reason: 'SMTP configuration missing'
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: username,
      pass: password
    },
    // Force IPv4 connection to prevent IPv6 (2404:6800:...) ETIMEDOUT errors on Gmail/Google SMTP and local networks
    family: 4,
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 10000,   // 10s greeting timeout
    socketTimeout: 15000,     // 15s socket timeout
    tls: {
      rejectUnauthorized: false
    }
  });


  return {
    transporter,
    senderEmail,
    senderName,
    isEmailNotificationEnabled,
    reason: null
  };
};

export const sendEmail = async ({ to, subject, html, text, forceSend = false }) => {
  const { transporter, senderEmail, senderName, isEmailNotificationEnabled, reason } = await getTransporterAndSender();

  if (!isEmailNotificationEnabled && !forceSend) {
    console.log(`[EmailService] Email notification disabled globally. Skipping email to ${to}`);
    return { success: false, skipped: true, reason: 'Email notifications disabled' };
  }

  if (!transporter) {
    console.warn(`[EmailService] Cannot send email to ${to}: ${reason}`);
    return { success: false, skipped: true, reason };
  }

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Email sent to ${to}. MessageId: ${info.messageId}`);

  return { success: true, messageId: info.messageId };
};

export const sendInvitationEmail = async ({ toEmail, teamName, invitationLink, roleName, inviterName }) => {
  return sendEmail({
    to: toEmail,
    subject: `You've been invited to join ${teamName} on Content Flow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">Team Invitation</h2>
        <p>Hello,</p>
        <p><strong>${inviterName || 'A team owner'}</strong> has invited you to join the team <strong>${teamName}</strong> as a <strong>${roleName}</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${invitationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${invitationLink}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">If you were not expecting this invitation, you can safely ignore this email.</p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async ({ toEmail, userName, resetLink, resetToken }) => {
  return sendEmail({
    to: toEmail,
    subject: 'Password Reset Request - Content Flow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>We received a request to reset your password for your account on <strong>Content Flow</strong>.</p>
        <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetLink}</p>
        <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">If you prefer to enter the reset token manually:</p>
        <code style="background: #f3f4f6; padding: 6px 12px; border-radius: 4px; display: inline-block; font-size: 14px; color: #1f2937;">${resetToken}</code>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password by opening this link: ${resetLink} (Token: ${resetToken})`
  });
};

