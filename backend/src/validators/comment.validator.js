import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const commentCreateSchema = Joi.object({
  blog: Joi.string().pattern(objectIdPattern).required(),
  content: Joi.string().trim().min(1).max(1000).required(),
  parentComment: Joi.string().pattern(objectIdPattern).optional()
});

export const commentUpdateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required()
});

export const commentReplySchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required()
});
