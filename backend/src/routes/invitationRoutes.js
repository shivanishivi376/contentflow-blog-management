import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { acceptInvitationSchema } from '../validators/invitation.validator.js';
import {
  acceptInvitationController,
  getInvitationController
} from '../controllers/invitationController.js';

const router = express.Router();

// Public: anyone can fetch invitation details by token to render the landing page.
router.get('/:token', getInvitationController);

// Protected: only authenticated users can accept an invitation.
// The request body is intentionally empty — team and role are resolved from the stored invitation.
router.post('/:token/accept', authMiddleware, validateRequest(acceptInvitationSchema), acceptInvitationController);

export default router;
