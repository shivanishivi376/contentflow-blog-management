import AppError from '../utils/AppError.js';
import joiValidator from '../utils/joiValidator.js';

const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const targetData = req[property] ?? {};
  const { error, value } = joiValidator(schema, targetData, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return next(new AppError(error.details.map((detail) => detail.message).join(', '), 400, 'VALIDATION_ERROR'));
  }

  req[property] = value;
  return next();
};

export default validateRequest;
