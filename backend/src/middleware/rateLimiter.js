import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: 'Rate limit exceeded'
    }
  }
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to public API. Please try again later.',
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: 'Rate limit exceeded'
    }
  }
});
