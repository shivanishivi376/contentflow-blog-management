import { Router } from 'express';
import {
  forgotPasswordController,
  googleAuthController,
  loginController,
  logoutController,
  refreshController,
  resetPasswordController,
  signupController
} from '../controllers/authController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  signupSchema
} from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signupController);
router.post('/login', validateRequest(loginSchema), loginController);
router.post('/google', validateRequest(googleAuthSchema), googleAuthController);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshController);
router.post('/logout', validateRequest(refreshTokenSchema), logoutController);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPasswordController);

export default router;
