import AppError from '../utils/AppError.js';
import { verifyAuthToken } from '../utils/token.js';
import { findUserById, toSafeUser } from '../repositories/userRepository.js';
import { findAdminById, toSafeAdmin } from '../repositories/adminRepository.js';
import { findTeamByMemberId } from '../repositories/teamRepository.js';

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }
  return authorizationHeader.slice(7).trim();
};

export const actorAuthMiddleware = (options = { required: true }) => {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req.headers.authorization);

      if (!token) {
        if (options.required) {
          throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
        }
        req.actor = null;
        return next();
      }

      const decoded = verifyAuthToken(token, 'access');

      // 1. Admin Token Check
      if (decoded?.role === 'ADMIN' && decoded?.adminId) {
        const admin = await findAdminById(decoded.adminId);
        if (!admin || !admin.isActive) {
          throw new AppError('Admin account not found or inactive', 401, 'ADMIN_NOT_AUTHORIZED');
        }

        req.admin = toSafeAdmin(admin);
        req.adminAuth = {
          adminId: String(admin._id),
          role: 'ADMIN'
        };
        req.actor = {
          type: 'ADMIN',
          id: String(admin._id),
          isMainAdmin: Boolean(admin.isMainAdmin),
          admin: req.admin
        };
        return next();
      }

      // 2. User Token Check
      if (decoded?.userId) {
        const user = await findUserById(decoded.userId);
        if (!user || !user.isActive) {
          throw new AppError('User not found or inactive', 401, 'USER_NOT_AUTHORIZED');
        }

        req.user = toSafeUser(user);
        req.auth = {
          userId: String(user._id),
          tokenId: decoded.tokenId || null
        };

        let teamMembership = null;
        const team = await findTeamByMemberId(user._id);
        if (team && team.isActive) {
          const activeMember = team.members.find(
            (m) => String(m.user) === String(user._id) && m.status === 'ACTIVE'
          );
          if (activeMember) {
            teamMembership = {
              teamId: String(team._id),
              workflowRole: activeMember.workflowRole,
              isOwner: Boolean(activeMember.isOwner)
            };
          }
        }

        req.teamMembership = teamMembership;
        req.actor = {
          type: 'USER',
          id: String(user._id),
          accountType: user.accountType,
          teamMembership,
          user: req.user
        };
        return next();
      }

      if (options.required) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }

      req.actor = null;
      return next();
    } catch (error) {
      if (!options.required && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
        req.actor = null;
        return next();
      }
      return next(error);
    }
  };
};

export default actorAuthMiddleware;
