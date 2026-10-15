import { getSMTPConfig, testSMTPConnection, updateSMTPConfig, deleteSMTPConfig } from '../services/smtpService.js';

export const getSMTPConfigController = async (req, res, next) => {
  try {
    const smtpConfig = await getSMTPConfig();

    return res.status(200).json({
      success: true,
      message: 'SMTP configuration fetched successfully',
      data: {
        smtpConfig
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSMTPConfigController = async (req, res, next) => {
  try {
    const adminId = req.admin?._id || req.adminAuth?.adminId || req.user?.id;
    const smtpConfig = await updateSMTPConfig(req.body, adminId);

    return res.status(200).json({
      success: true,
      message: 'SMTP configuration updated successfully',
      data: {
        smtpConfig
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const testSMTPConnectionController = async (req, res, next) => {
  try {
    const result = await testSMTPConnection(req.body.testEmail);

    return res.status(200).json({
      success: true,
      message: 'SMTP test email sent successfully',
      data: {
        result
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSMTPConfigController = async (req, res, next) => {
  try {
    const adminId = req.admin?._id || req.adminAuth?.adminId || req.user?.id;
    await deleteSMTPConfig(adminId);

    return res.status(200).json({
      success: true,
      message: 'SMTP configuration unlinked successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
