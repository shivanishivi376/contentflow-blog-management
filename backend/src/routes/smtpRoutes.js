import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { smtpTestSchema, smtpUpdateSchema } from '../validators/smtp.validator.js';
import {
  getSMTPConfigController,
  testSMTPConnectionController,
  updateSMTPConfigController,
  deleteSMTPConfigController
} from '../controllers/smtpController.js';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/', getSMTPConfigController);
router.put('/', validateRequest(smtpUpdateSchema), updateSMTPConfigController);
router.post('/test', validateRequest(smtpTestSchema), testSMTPConnectionController);
router.delete('/', deleteSMTPConfigController);

export default router;
