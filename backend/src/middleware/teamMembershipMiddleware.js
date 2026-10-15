import AppError from '../utils/AppError.js';
import { findTeamByMemberId } from '../repositories/teamRepository.js';

export const teamMembershipMiddleware = (options = { required: false }) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        if (options.required) {
          throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
        }
        req.teamMembership = null;
        return next();
      }

      const userId = req.user.id || req.user._id;
      const team = await findTeamByMemberId(userId);

      if (!team || !team.isActive) {
        if (options.required || req.user.accountType === 'TEAM') {
          throw new AppError('Active team membership required', 403, 'TEAM_MEMBERSHIP_REQUIRED');
        }
        req.teamMembership = null;
        return next();
      }

      const activeMember = team.members.find(
        (m) => String(m.user) === String(userId) && m.status === 'ACTIVE'
      );

      if (!activeMember) {
        if (options.required || req.user.accountType === 'TEAM') {
          throw new AppError('Active team membership required', 403, 'TEAM_MEMBERSHIP_REQUIRED');
        }
        req.teamMembership = null;
        return next();
      }

      req.teamMembership = {
        teamId: String(team._id),
        workflowRole: activeMember.workflowRole,
        isOwner: Boolean(activeMember.isOwner)
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default teamMembershipMiddleware;
