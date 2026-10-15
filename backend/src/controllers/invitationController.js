import { acceptInvitation, getInvitationByToken } from '../services/invitationService.js';

export const getInvitationController = async (req, res, next) => {
  try {
    const invitation = await getInvitationByToken(req.params.token);

    return res.status(200).json({
      success: true,
      message: 'Invitation fetched successfully',
      data: { invitation },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const acceptInvitationController = async (req, res, next) => {
  try {
    const result = await acceptInvitation({
      token: req.params.token,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
