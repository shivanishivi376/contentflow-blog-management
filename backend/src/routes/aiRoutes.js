import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { aiGenerateSchema, aiImproveSchema, aiMetadataSchema } from '../validators/ai.validator.js';
import {
  generateAIContentController,
  generateAIMetadataController,
  improveAITextController
} from '../controllers/aiController.js';

const router = Router();

router.use(authMiddleware);

router.post('/generate', validateRequest(aiGenerateSchema), generateAIContentController);
router.post('/improve', validateRequest(aiImproveSchema), improveAITextController);
router.post('/metadata', validateRequest(aiMetadataSchema), generateAIMetadataController);

export default router;
