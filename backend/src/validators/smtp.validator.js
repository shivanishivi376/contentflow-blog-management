import Joi from 'joi';

export const smtpUpdateSchema = Joi.object({
  host: Joi.string().trim().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  username: Joi.string().trim().required(),
  password: Joi.string().allow('').optional(),
  senderEmail: Joi.string().email().trim().required(),
  senderName: Joi.string().trim().required(),
  isEmailNotificationEnabled: Joi.boolean().default(true)
});

export const smtpTestSchema = Joi.object({
  testEmail: Joi.string().email().trim().required()
});
