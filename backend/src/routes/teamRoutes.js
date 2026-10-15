import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { teamInviteSchema } from '../validators/team.validator.js';
import {
  createTeamInvitationLinkController,
  getMyTeamController,
  removeTeamMemberController,
  revokeTeamInvitationController
} from '../controllers/teamController.js';

const router = express.Router();

router.get('/me', authMiddleware, getMyTeamController);
router.post(
  '/:teamId/invitations/link',
  authMiddleware,
  validateRequest(teamInviteSchema),
  createTeamInvitationLinkController
);
router.delete(
  '/:teamId/invitations/:invitationId',
  authMiddleware,
  revokeTeamInvitationController
);
router.delete(
  '/:teamId/members/:userId',
  authMiddleware,
  removeTeamMemberController
);

export default router;

