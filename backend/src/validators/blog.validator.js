import Joi from 'joi';
import { ALLOWED_STATUSES } from '../constants/blogStatus.js';
import { WORKFLOW_ACTIONS } from '../constants/workflow.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const blogCreateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(500).allow('').default(''),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  category: Joi.string().pattern(objectIdPattern).required(),
  subcategory: Joi.string().pattern(objectIdPattern).required(),
  primaryKeywords: Joi.array()
    .items(Joi.string().pattern(objectIdPattern))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one primary keyword is required',
      'any.required': 'Primary keyword is required'
    }),
  secondaryKeywords: Joi.array().items(Joi.string().pattern(objectIdPattern)).default([]),
  featuredImage: Joi.string().allow('').default(''),
  content: Joi.string().allow('').default(''),
  metaTitle: Joi.string().allow('').optional(),
  metaDescription: Joi.string().allow('').optional(),
  metadata: Joi.object().optional()
});

export const blogUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  category: Joi.string().pattern(objectIdPattern).optional(),
  subcategory: Joi.string().pattern(objectIdPattern).optional(),
  primaryKeywords: Joi.array()
    .items(Joi.string().pattern(objectIdPattern))
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one primary keyword is required'
    }),
  secondaryKeywords: Joi.array().items(Joi.string().pattern(objectIdPattern)).optional(),
  featuredImage: Joi.string().allow('').optional(),
  content: Joi.string().allow('').optional(),
  metaTitle: Joi.string().allow('').optional(),
  metaDescription: Joi.string().allow('').optional(),
  status: Joi.string().valid(...ALLOWED_STATUSES).optional(),
  writer: Joi.string().pattern(objectIdPattern).optional(),
  reviewer: Joi.string().pattern(objectIdPattern).optional(),
  publisher: Joi.string().pattern(objectIdPattern).optional(),
  metadata: Joi.object().optional()
});

export const blogAssignmentSchema = Joi.object({
  writer: Joi.string().pattern(objectIdPattern).required(),
  reviewer: Joi.string().pattern(objectIdPattern).required(),
  publisher: Joi.string().pattern(objectIdPattern).required()
}).custom((value, helpers) => {
  const { writer, reviewer, publisher } = value;
  const set = new Set([writer, reviewer, publisher]);
  if (set.size !== 3) {
    return helpers.message('Writer, Reviewer, and Publisher must be 3 distinct users');
  }
  return value;
});

export const blogContentSchema = Joi.object({
  content: Joi.string().allow('').required()
});

export const blogActionSchema = Joi.object({
  action: Joi.string().valid(...Object.values(WORKFLOW_ACTIONS)).required(),
  reason: Joi.string().trim().max(500).allow('').optional()
});

