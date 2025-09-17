import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation rules
const updateProfileValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Numele trebuie să aibă între 2 și 50 de caractere'),
  body('phone')
    .optional()
    .isMobilePhone('ro-RO')
    .withMessage('Numărul de telefon nu este valid'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar-ul trebuie să fie o URL validă'),
];

// Routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validateRequest, userController.updateProfile);
router.delete('/account', userController.deleteAccount);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:notificationId/read', userController.markNotificationAsRead);
router.get('/dashboard/stats', userController.getDashboardStats);

export default router;
