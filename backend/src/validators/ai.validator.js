import Joi from 'joi';

export const aiGenerateSchema = Joi.object({
  topic: Joi.string().trim().min(3).max(300).required(),
  context: Joi.string().trim().allow('').optional(),
  tone: Joi.string().trim().default('informative'),
  length: Joi.string().trim().default('medium')
});

export const aiImproveSchema = Joi.object({
  text: Joi.string().trim().min(3).required(),
  action: Joi.string().trim().valid('improve', 'rewrite', 'expand', 'shorten', 'tone').default('improve'),
  tone: Joi.string().trim().default('professional')
});

export const aiMetadataSchema = Joi.object({
  title: Joi.string().trim().allow('').optional(),
  content: Joi.string().trim().allow('').optional()
});
