import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  permissionCreateSchema,
  permissionUpdateSchema
} from '../validators/permission.validator.js';
import {
  createPermissionController,
  deletePermissionController,
  getPermissionByIdController,
  listPermissionsController,
  updatePermissionController
} from '../controllers/permissionController.js';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/', listPermissionsController);
router.get('/:id', getPermissionByIdController);
router.post('/', validateRequest(permissionCreateSchema), createPermissionController);
router.patch('/:id', validateRequest(permissionUpdateSchema), updatePermissionController);
router.delete('/:id', deletePermissionController);

export default router;
