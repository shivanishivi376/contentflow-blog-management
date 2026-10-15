import Joi from 'joi';

export const roleCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  description: Joi.string().trim().max(255).allow('').default(''),
  permissionIds: Joi.array().items(Joi.string().trim()).default([])
});

export const roleUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  description: Joi.string().trim().max(255).allow('').default(''),
  permissionIds: Joi.array().items(Joi.string().trim()).default([])
});
