import AppError from '../utils/AppError.js';
import { verifyAuthToken } from '../utils/token.js';
import { findUserById, toSafeUser } from '../repositories/userRepository.js';

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const decoded = verifyAuthToken(token, 'access');

    if (!decoded?.userId) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }

    const user = await findUserById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401, 'USER_NOT_AUTHORIZED');
    }

    req.user = toSafeUser(user);
    req.auth = {
      userId: String(user._id),
      tokenId: decoded.tokenId || null
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (token) {
      const decoded = verifyAuthToken(token, 'access');

      if (decoded?.userId) {
        const user = await findUserById(decoded.userId);

        if (user && user.isActive) {
          req.user = toSafeUser(user);
          req.auth = {
            userId: String(user._id),
            tokenId: decoded.tokenId || null
          };
        }
      }
    }

    return next();
  } catch (error) {
    // If optional token is invalid or expired, continue without setting req.user
    return next();
  }
};

export default authMiddleware;

