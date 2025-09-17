import { Router } from 'express';
import { uploadController, upload } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/avatar', upload.single('avatar'), uploadController.uploadAvatar);
router.post('/document', upload.single('document'), uploadController.uploadDocument);
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultiple);
router.delete('/:filename', uploadController.deleteFile);

export default router;
