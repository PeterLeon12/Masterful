import { Router } from 'express';
import { body } from 'express-validator';
import { messageController } from '../controllers/messageController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schemas
const sendMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Conținutul mesajului trebuie să aibă între 1 și 1000 de caractere'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'FILE', 'LOCATION'])
    .withMessage('Tipul mesajului trebuie să fie TEXT, IMAGE, FILE sau LOCATION'),
];

const markAsReadValidation = [
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('ID-urile mesajelor sunt obligatorii'),
  body('messageIds.*')
    .isString()
    .withMessage('Fiecare ID de mesaj trebuie să fie un string'),
];

// All message routes require authentication
router.use(authMiddleware);

// Message routes
router.get('/conversations', messageController.getConversations);
router.get('/:jobId', messageController.getMessages);
router.post('/:jobId', sendMessageValidation, validateRequest, messageController.sendMessage);
router.put('/:jobId/read', markAsReadValidation, validateRequest, messageController.markAsRead);

export default router;
