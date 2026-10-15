import { getMyTeamDashboard, removeTeamMember } from '../services/teamService.js';
import { createInvitationLink, revokeInvitation } from '../services/invitationService.js';

export const getMyTeamController = async (req, res, next) => {
  try {
    const team = await getMyTeamDashboard(req.auth.userId);

    return res.status(200).json({
      success: true,
      message: 'Team fetched successfully',
      data: {
        team
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createTeamInvitationLinkController = async (req, res, next) => {
  try {
    const invitation = await createInvitationLink({
      teamId: req.params.teamId,
      ownerId: req.auth.userId,
      email: req.body.email,
      assignedRole: req.body.assignedRole,
      frontendUrl: process.env.FRONTEND_URL
    });

    return res.status(201).json({
      success: true,
      message: 'Invitation link created successfully',
      data: {
        invitation,
        invitationLink: invitation.invitationLink
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};


export const revokeTeamInvitationController = async (req, res, next) => {
  try {
    const invitation = await revokeInvitation({
      invitationId: req.params.invitationId,
      ownerId: req.auth.userId
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation revoked successfully',
      data: {
        invitation
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const removeTeamMemberController = async (req, res, next) => {
  try {
    const result = await removeTeamMember({
      teamId: req.params.teamId,
      ownerId: req.auth.userId,
      memberUserId: req.params.userId
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

