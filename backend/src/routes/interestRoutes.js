import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  interestCreateSchema,
  interestUpdateSchema
} from '../validators/interest.validator.js';
import {
  createInterestController,
  deleteInterestController,
  getInterestByIdController,
  listInterestsController,
  updateInterestController
} from '../controllers/interestController.js';

const router = Router();

router.get('/', listInterestsController);
router.get('/:id', getInterestByIdController);

router.use(adminAuthMiddleware);

router.post('/', validateRequest(interestCreateSchema), createInterestController);
router.patch('/:id', validateRequest(interestUpdateSchema), updateInterestController);
router.delete('/:id', deleteInterestController);

export default router;
