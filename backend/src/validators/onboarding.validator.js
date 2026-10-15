import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const onboardingCompleteSchema = Joi.object({
  accountType: Joi.string().valid('INDIVIDUAL', 'TEAM').required(),
  interests: Joi.array().items(objectId).min(1).unique().required(),
  teamName: Joi.when('accountType', {
    is: 'TEAM',
    then: Joi.string().trim().min(2).max(100).required(),
    otherwise: Joi.string().trim().max(100).allow('', null).optional()
  }),
  workflowRole: Joi.when('accountType', {
    is: 'TEAM',
    then: Joi.string().valid('Writer', 'Reviewer', 'Publisher').required(),
    otherwise: Joi.string().valid('Writer', 'Reviewer', 'Publisher').allow(null).optional()
  })
});
