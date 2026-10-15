import Joi from 'joi';
import { ALLOWED_STATUSES } from '../constants/blogStatus.js';
import { WORKFLOW_ACTIONS } from '../constants/workflow.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const workflowTransitionSchema = Joi.object({
  action: Joi.string().valid(...Object.values(WORKFLOW_ACTIONS)).optional(),
  status: Joi.string().valid(...ALLOWED_STATUSES).optional(),
  reason: Joi.string().trim().max(500).allow('').optional(),
  assignedUser: Joi.string().pattern(objectIdPattern).optional()
}).or('action', 'status');

