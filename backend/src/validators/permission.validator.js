import Joi from 'joi';

const permissionCodePattern = /^[A-Z][A-Z0-9_]*$/;

export const permissionCreateSchema = Joi.object({
  code: Joi.string().trim().uppercase().pattern(permissionCodePattern).required(),
  description: Joi.string().trim().max(255).allow('').default('')
});

export const permissionUpdateSchema = Joi.object({
  code: Joi.string().trim().uppercase().pattern(permissionCodePattern).required(),
  description: Joi.string().trim().max(255).allow('').default('')
});
