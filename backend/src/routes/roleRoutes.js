import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { roleCreateSchema, roleUpdateSchema } from '../validators/role.validator.js';
import {
  createRoleController,
  deleteRoleController,
  getRoleByIdController,
  listRolesController,
  updateRoleController
} from '../controllers/roleController.js';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/', listRolesController);
router.get('/:id', getRoleByIdController);
router.post('/', validateRequest(roleCreateSchema), createRoleController);
router.patch('/:id', validateRequest(roleUpdateSchema), updateRoleController);
router.delete('/:id', deleteRoleController);

export default router;
