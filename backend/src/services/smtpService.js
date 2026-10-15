import SMTPConfiguration from '../models/SMTPConfiguration.js';
import AppError from '../utils/AppError.js';
import { sendEmail } from '../integrations/smtp/emailService.js';

export const getSMTPConfig = async () => {
  const config = await SMTPConfiguration.findOne().select('+password').lean();

  if (!config) {
    return {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      username: process.env.SMTP_USERNAME || '',
      passwordSet: Boolean(process.env.SMTP_PASSWORD),
      senderEmail: process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USERNAME || '',
      senderName: process.env.SMTP_SENDER_NAME || 'Blog Platform',
      isEmailNotificationEnabled: true,
      isConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME)
    };
  }

  return {
    _id: config._id,
    host: config.host,
    port: config.port,
    username: config.username,
    passwordSet: Boolean(config.password),
    senderEmail: config.senderEmail,
    senderName: config.senderName,
    isEmailNotificationEnabled: config.isEmailNotificationEnabled,
    isConfigured: true,
    updatedAt: config.updatedAt
  };
};

export const updateSMTPConfig = async (payload, adminId) => {
  let config = await SMTPConfiguration.findOne().select('+password');

  const updateData = {
    host: payload.host.trim(),
    port: Number(payload.port),
    username: payload.username.trim(),
    senderEmail: payload.senderEmail.trim().toLowerCase(),
    senderName: payload.senderName.trim(),
    isEmailNotificationEnabled: payload.isEmailNotificationEnabled ?? true
  };

  if (adminId) {
    updateData.updatedBy = adminId;
  }

  if (payload.password && payload.password.trim() !== '') {
    updateData.password = payload.password;
  } else if (!config && process.env.SMTP_PASSWORD) {
    updateData.password = process.env.SMTP_PASSWORD;
  } else if (!config) {
    throw new AppError('SMTP password is required for initial configuration', 400, 'SMTP_PASSWORD_REQUIRED');
  }

  if (config) {
    Object.assign(config, updateData);
    await config.save();
  } else {
    config = await SMTPConfiguration.create(updateData);
  }

  return getSMTPConfig();
};

export const testSMTPConnection = async (testEmail) => {
  try {
    const result = await sendEmail({
      to: testEmail,
      subject: 'SMTP Test Email - Content Flow',
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #4f46e5;">SMTP Connection Successful!</h2>
          <p>This is a test email sent from your <strong>Content Flow</strong>.</p>
          <p>If you are receiving this message, your SMTP credentials and email settings are configured correctly.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <small style="color: #6b7280;">Sent at ${new Date().toISOString()}</small>
        </div>
      `,
      text: 'SMTP Connection Successful! Your email settings are working correctly.',
      forceSend: true
    });

    return result;
  } catch (error) {
    throw new AppError(`SMTP Test failed: ${error.message}`, 400, 'SMTP_TEST_FAILED');
  }
};

export const deleteSMTPConfig = async (adminId) => {
  await SMTPConfiguration.deleteMany({});
};
