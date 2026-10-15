import jwt from 'jsonwebtoken';

const getSecret = (type) => {
  const secret =
    type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(`${type === 'refresh' ? 'JWT_REFRESH_SECRET' : 'JWT_ACCESS_SECRET'} is not defined`);
  }

  return secret;
};

const getExpiry = (type) => {
  if (type === 'refresh') {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  return process.env.JWT_ACCESS_EXPIRES_IN || '15m';
};

export const signAccessToken = (payload) =>
  jwt.sign(payload, getSecret('access'), {
    expiresIn: getExpiry('access')
  });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, getSecret('refresh'), {
    expiresIn: getExpiry('refresh')
  });

export const verifyAccessToken = (token) => jwt.verify(token, getSecret('access'));

export const verifyRefreshToken = (token) => jwt.verify(token, getSecret('refresh'));
