import { Router } from 'express';
import {
  getPublicBlogBySlugController,
  getPublicBlogsController,
  getPublicCategoriesController
} from '../controllers/publicController.js';

const router = Router();

// Public routes (No authentication middleware required)
router.get('/blogs', getPublicBlogsController);
router.get('/blogs/:slug', getPublicBlogBySlugController);
router.get('/categories', getPublicCategoriesController);

export default router;
