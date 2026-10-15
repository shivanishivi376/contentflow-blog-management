import crypto from 'crypto';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.js';

export const createAuthTokens = (payload) => ({
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload)
});

export const verifyAuthToken = (token, tokenType = 'access') =>
  tokenType === 'refresh' ? verifyRefreshToken(token) : verifyAccessToken(token);

export const getTokenExpiry = (tokenType = 'access') => {
  if (tokenType === 'refresh') {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  return process.env.JWT_ACCESS_EXPIRES_IN || '15m';
};

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const generateRandomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

