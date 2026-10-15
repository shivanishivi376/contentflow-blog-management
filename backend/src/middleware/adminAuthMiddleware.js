import AppError from '../utils/AppError.js';
import { verifyAuthToken } from '../utils/token.js';
import { findAdminById, toSafeAdmin } from '../repositories/adminRepository.js';

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const decoded = verifyAuthToken(token, 'access');

    if (decoded?.role !== 'ADMIN' || !decoded?.adminId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const admin = await findAdminById(decoded.adminId);

    if (!admin || !admin.isActive) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    req.admin = toSafeAdmin(admin);
    req.adminAuth = {
      adminId: String(admin._id),
      role: 'ADMIN'
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default adminAuthMiddleware;
