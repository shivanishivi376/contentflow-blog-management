import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  bio: Joi.string().trim().max(500).allow('').optional(),
  profileImage: Joi.object({
    url: Joi.string().allow('').optional(),
    publicId: Joi.string().allow('').optional()
  }).optional(),
  interests: Joi.array().items(Joi.string().trim()).optional()
});

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required()
});
