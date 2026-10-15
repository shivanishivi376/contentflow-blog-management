import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
  // Optional: present when user signs up from an invitation link.
  // The backend validates the token and enforces email matching if the invitation is email-specific.
  invitationToken: Joi.string().trim().optional()
});


export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required()
});

export const googleAuthSchema = Joi.object({
  credential: Joi.string().trim().min(20).max(8192).required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().trim().required(),
  password: Joi.string().min(8).max(128).required()
});
