import { Router } from 'express';
import actorAuthMiddleware from '../middleware/actorAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  subcategoryCreateSchema,
  subcategoryUpdateSchema
} from '../validators/subcategory.validator.js';
import {
  createSubcategoryController,
  deleteSubcategoryController,
  getSubcategoryByIdController,
  listSubcategoriesController,
  updateSubcategoryController
} from '../controllers/subcategoryController.js';

const router = Router();

router.get('/', actorAuthMiddleware({ required: false }), listSubcategoriesController);
router.get('/:id', actorAuthMiddleware({ required: false }), getSubcategoryByIdController);

router.post(
  '/',
  actorAuthMiddleware({ required: true }),
  validateRequest(subcategoryCreateSchema),
  createSubcategoryController
);
router.patch(
  '/:id',
  actorAuthMiddleware({ required: true }),
  validateRequest(subcategoryUpdateSchema),
  updateSubcategoryController
);
router.delete('/:id', actorAuthMiddleware({ required: true }), deleteSubcategoryController);

export default router;
