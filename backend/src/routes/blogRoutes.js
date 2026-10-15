import { Router } from 'express';
import authMiddleware, { optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import teamMembershipMiddleware from '../middleware/teamMembershipMiddleware.js';
import { teamPermissionMiddleware } from '../middleware/permissionMiddleware.js';
import { PERMISSION_CODES } from '../constants/permissions.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  blogAssignmentSchema,
  blogContentSchema,
  blogCreateSchema,
  blogUpdateSchema
} from '../validators/blog.validator.js';
import { workflowTransitionSchema } from '../validators/workflow.validator.js';
import { aiGenerateSchema } from '../validators/ai.validator.js';
import {
  addBlogCommentController,
  assignBlogRolesController,
  createBlogController,
  deleteBlogController,
  generateBlogAIContentController,
  getBlogByIdController,
  listBlogCommentsController,
  listBlogsController,
  publishBlogController,
  resolveBlogCommentController,
  retryPublishBlogController,
  transitionBlogStatusController,
  updateBlogContentController,
  updateBlogController
} from '../controllers/blogController.js';
import {
  getBlogVersionByIdController,
  listBlogVersionsController,
  restoreBlogVersionController
} from '../controllers/versionController.js';
import {
  listExternalPublicationsController,
  publishToDevToController
} from '../controllers/externalPublicationController.js';

const router = Router();

router.get('/', optionalAuthMiddleware, listBlogsController);
router.get('/:id', optionalAuthMiddleware, getBlogByIdController);

router.use(authMiddleware);
router.use(teamMembershipMiddleware());

router.post(
  '/',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_CREATE),
  validateRequest(blogCreateSchema),
  createBlogController
);
router.patch('/:id', validateRequest(blogUpdateSchema), updateBlogController);
router.delete('/:id', deleteBlogController);

// Team Role Assignment
router.post('/:id/assignment', validateRequest(blogAssignmentSchema), assignBlogRolesController);

// Content Autosave
router.patch(
  '/:id/content',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_WRITE),
  validateRequest(blogContentSchema),
  updateBlogContentController
);

// AI Text Generation for Blog Content
router.post(
  '/:id/content/ai-generate',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_AI_WRITE),
  validateRequest(aiGenerateSchema),
  generateBlogAIContentController
);

// Status Transition & Publish Actions
router.post('/:id/status', validateRequest(workflowTransitionSchema), transitionBlogStatusController);
router.patch('/:id/status', validateRequest(workflowTransitionSchema), transitionBlogStatusController);
router.post(
  '/:id/publish',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_PUBLISH),
  publishBlogController
);
router.post(
  '/:id/publish/retry',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_PUBLISH),
  retryPublishBlogController
);

// Version History routes
router.get(
  '/:id/versions',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_VERSION_HISTORY),
  listBlogVersionsController
);
router.get(
  '/:id/versions/:versionId',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_VERSION_HISTORY),
  getBlogVersionByIdController
);
router.post(
  '/:id/versions/:versionId/restore',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_WRITE),
  restoreBlogVersionController
);

// Blog Comments routes
router.get('/:id/comments', listBlogCommentsController);
router.post('/:id/comments', addBlogCommentController);
router.patch('/:id/comments/:commentId/resolve', resolveBlogCommentController);

// External Publishing routes
router.post(
  '/:id/publish/devto',
  teamPermissionMiddleware(PERMISSION_CODES.BLOG_DEVTO_PUBLISH),
  publishToDevToController
);
router.get('/:id/external-publications', listExternalPublicationsController);

export default router;


