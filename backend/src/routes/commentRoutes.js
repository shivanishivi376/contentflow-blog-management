import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { commentCreateSchema, commentReplySchema, commentUpdateSchema } from '../validators/comment.validator.js';
import {
  createCommentController,
  deleteCommentController,
  listBlogCommentsController,
  replyToCommentController,
  resolveCommentController,
  updateCommentController
} from '../controllers/commentController.js';

const router = Router();

router.get('/blogs/:id', listBlogCommentsController);

router.use(authMiddleware);

router.post('/', validateRequest(commentCreateSchema), createCommentController);
router.patch('/:id', validateRequest(commentUpdateSchema), updateCommentController);
router.delete('/:id', deleteCommentController);
router.post('/:id/replies', validateRequest(commentReplySchema), replyToCommentController);
router.post('/:id/resolve', resolveCommentController);

export default router;
