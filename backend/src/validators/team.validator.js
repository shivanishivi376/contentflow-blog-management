import Joi from 'joi';

export const teamCreateSchema = Joi.object({
  teamName: Joi.string().trim().min(2).max(100).required(),
  workflowRole: Joi.string().valid('Writer', 'Reviewer', 'Publisher').required()
});

export const teamInviteSchema = Joi.object({
  // email is optional: omit for a copy-link invitation (any user may accept).
  // Provide email for an email-specific invitation (only that address may accept).
  email: Joi.string().trim().email().optional().allow('', null),
  assignedRole: Joi.string().valid('Writer', 'Reviewer', 'Publisher').required()
});

