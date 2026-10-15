import Joi from 'joi';

export const keywordCreateSchema = Joi.object({
  categoryId: Joi.string().trim().required(),
  subcategoryId: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  keywordType: Joi.string().valid('primary', 'secondary').required(),
  description: Joi.string().trim().max(255).allow('').default('')
});

export const keywordUpdateSchema = Joi.object({
  categoryId: Joi.string().trim().required(),
  subcategoryId: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  keywordType: Joi.string().valid('primary', 'secondary').required(),
  description: Joi.string().trim().max(255).allow('').default('')
});
