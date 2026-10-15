import Joi from 'joi';

export const subcategoryCreateSchema = Joi.object({
  categoryId: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: Joi.string().trim().max(255).allow('').default('')
});

export const subcategoryUpdateSchema = Joi.object({
  categoryId: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: Joi.string().trim().max(255).allow('').default('')
});
