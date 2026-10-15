import { Router } from 'express';
import actorAuthMiddleware from '../middleware/actorAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  keywordCreateSchema,
  keywordUpdateSchema
} from '../validators/keyword.validator.js';
import {
  createKeywordController,
  deleteKeywordController,
  getKeywordByIdController,
  listKeywordsController,
  updateKeywordController
} from '../controllers/keywordController.js';

const router = Router();

router.get('/', actorAuthMiddleware({ required: false }), listKeywordsController);
router.get('/:id', actorAuthMiddleware({ required: false }), getKeywordByIdController);

router.post(
  '/',
  actorAuthMiddleware({ required: true }),
  validateRequest(keywordCreateSchema),
  createKeywordController
);
router.patch(
  '/:id',
  actorAuthMiddleware({ required: true }),
  validateRequest(keywordUpdateSchema),
  updateKeywordController
);
router.delete('/:id', actorAuthMiddleware({ required: true }), deleteKeywordController);

export default router;
