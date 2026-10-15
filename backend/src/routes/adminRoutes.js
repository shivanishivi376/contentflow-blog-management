import { Router } from 'express';
import {
  adminLoginController,
  adminMeController,
  deleteTeamController,
  deleteUserController,
  updateUserStatusController
} from '../controllers/adminController.js';
import {
  getAdminOverviewAnalyticsController,
  listAllTeamsController,
  listAllUsersController
} from '../controllers/analyticsController.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { adminLoginSchema } from '../validators/admin.validator.js';

const router = Router();

router.post('/login', validateRequest(adminLoginSchema), adminLoginController);

router.use(adminAuthMiddleware);

router.get('/me', adminMeController);
router.get('/analytics/overview', getAdminOverviewAnalyticsController);
router.get('/users', listAllUsersController);
router.patch('/users/:id/status', updateUserStatusController);
router.delete('/users/:id', deleteUserController);
router.get('/teams', listAllTeamsController);
router.delete('/teams/:id', deleteTeamController);

export default router;


