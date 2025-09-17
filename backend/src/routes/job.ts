import { Router } from 'express';
import { body } from 'express-validator';
import { jobController } from '../controllers/jobController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schemas
const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Titlul trebuie să aibă între 5 și 100 de caractere'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Descrierea trebuie să aibă între 20 și 1000 de caractere'),
  body('category')
    .notEmpty()
    .withMessage('Categoria este obligatorie'),
  body('subcategory')
    .optional()
    .notEmpty()
    .withMessage('Subcategoria nu poate fi goală'),
  body('location')
    .isObject()
    .withMessage('Locația trebuie să fie un obiect valid'),
  body('budget')
    .isObject()
    .withMessage('Bugetul trebuie să fie un obiect valid'),
  body('priority')
    .optional()
    .isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    .withMessage('Prioritatea trebuie să fie LOW, NORMAL, HIGH sau URGENT'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Data programată trebuie să fie o dată validă'),
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Titlul trebuie să aibă între 5 și 100 de caractere'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Descrierea trebuie să aibă între 20 și 1000 de caractere'),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Categoria nu poate fi goală'),
  body('subcategory')
    .optional()
    .notEmpty()
    .withMessage('Subcategoria nu poate fi goală'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Locația trebuie să fie un obiect valid'),
  body('budget')
    .optional()
    .isObject()
    .withMessage('Bugetul trebuie să fie un obiect valid'),
  body('priority')
    .optional()
    .isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    .withMessage('Prioritatea trebuie să fie LOW, NORMAL, HIGH sau URGENT'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
    .withMessage('Statusul trebuie să fie ACTIVE, IN_PROGRESS, COMPLETED, CANCELLED sau EXPIRED'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Data programată trebuie să fie o dată validă'),
];

const applyForJobValidation = [
  body('proposal')
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage('Propunerea trebuie să aibă între 20 și 500 de caractere'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Prețul trebuie să fie un număr pozitiv'),
  body('currency')
    .optional()
    .isIn(['RON', 'EUR', 'USD'])
    .withMessage('Moneda trebuie să fie RON, EUR sau USD'),
  body('estimatedTime')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Timpul estimat trebuie să aibă între 5 și 50 de caractere'),
];

// Public routes (no authentication required)
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (authentication required)
router.post('/', authMiddleware, createJobValidation, validateRequest, jobController.createJob);
router.put('/:id', authMiddleware, updateJobValidation, validateRequest, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

// Job application routes
router.post('/:id/apply', authMiddleware, applyForJobValidation, validateRequest, jobController.applyForJob);
router.get('/:id/applications', authMiddleware, jobController.getJobApplications);

export default router;
