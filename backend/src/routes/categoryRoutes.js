import { Router } from 'express';
import actorAuthMiddleware from '../middleware/actorAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema
} from '../validators/category.validator.js';
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryByIdController,
  listCategoriesController,
  updateCategoryController
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', actorAuthMiddleware({ required: false }), listCategoriesController);
router.get('/:id', actorAuthMiddleware({ required: false }), getCategoryByIdController);

router.post(
  '/',
  actorAuthMiddleware({ required: true }),
  validateRequest(categoryCreateSchema),
  createCategoryController
);
router.patch(
  '/:id',
  actorAuthMiddleware({ required: true }),
  validateRequest(categoryUpdateSchema),
  updateCategoryController
);
router.delete('/:id', actorAuthMiddleware({ required: true }), deleteCategoryController);

export default router;
