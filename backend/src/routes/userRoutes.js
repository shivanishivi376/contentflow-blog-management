import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { updatePasswordSchema, updateProfileSchema } from '../validators/user.validator.js';
import {
  getRecommendedBlogsController,
  getUserProfileController,
  updateUserPasswordController,
  updateUserProfileController
} from '../controllers/userController.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', getUserProfileController);
router.patch('/me', validateRequest(updateProfileSchema), updateUserProfileController);
router.patch('/me/password', validateRequest(updatePasswordSchema), updateUserPasswordController);
router.get('/me/recommendations', getRecommendedBlogsController);

export default router;
