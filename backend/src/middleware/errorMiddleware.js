import mongoose from 'mongoose';
import Joi from 'joi';
import AppError from '../utils/AppError.js';

const getMongoDuplicateMessage = (error) => {
  const field = Object.keys(error.keyValue || {})[0];

  if (field) {
    return `${field} already exists`;
  }

  return 'Duplicate record already exists';
};

const mapError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new AppError(error.message, 400, 'VALIDATION_ERROR');
  }

  if (error instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${error.path}`, 400, 'INVALID_IDENTIFIER');
  }

  if (error instanceof Joi.ValidationError || error?.isJoi) {
    return new AppError(
      error.details.map((detail) => detail.message).join(', '),
      400,
      'VALIDATION_ERROR'
    );
  }

  if (error?.code === 11000) {
    return new AppError(getMongoDuplicateMessage(error), 409, 'DUPLICATE_RECORD');
  }

  if (error?.name === 'TokenExpiredError') {
    return new AppError('Authentication token expired', 401, 'TOKEN_EXPIRED');
  }

  if (error?.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error?.type === 'entity.too.large' || error?.name === 'PayloadTooLargeError') {
    return new AppError('Payload size is too large. Please use a smaller image file.', 413, 'PAYLOAD_TOO_LARGE');
  }

  return new AppError(error?.message || 'Internal server error', 500, 'INTERNAL_SERVER_ERROR');
};

const errorMiddleware = (error, req, res, next) => {
  const mappedError = mapError(error);
  const statusCode = mappedError.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: mappedError.message,
    data: null,
    error: {
      code: mappedError.code || 'INTERNAL_SERVER_ERROR'
    }
  });
};

export default errorMiddleware;
