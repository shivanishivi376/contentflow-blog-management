import { Router } from 'express';
import { completeOnboardingController } from '../controllers/onboardingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { onboardingCompleteSchema } from '../validators/onboarding.validator.js';

const router = Router();

router.post('/complete', authMiddleware, validateRequest(onboardingCompleteSchema), completeOnboardingController);

export default router;
