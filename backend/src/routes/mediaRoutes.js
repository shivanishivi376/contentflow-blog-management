import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { deleteMediaController, uploadMediaController } from '../controllers/mediaController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', uploadSingleImage, uploadMediaController);
router.delete('/:id', deleteMediaController);

export default router;
