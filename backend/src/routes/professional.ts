import { Router } from 'express';
import { body } from 'express-validator';
import { professionalController } from '../controllers/professionalController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schemas
const updateProfessionalValidation = [
  body('categories')
    .optional()
    .isString()
    .withMessage('Categoriile trebuie să fie un string'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tariful orar trebuie să fie un număr pozitiv'),
  body('currency')
    .optional()
    .isIn(['RON', 'EUR', 'USD'])
    .withMessage('Moneda trebuie să fie RON, EUR sau USD'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experiența trebuie să fie un număr întreg pozitiv'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Biografia nu poate depăși 1000 de caractere'),
  body('portfolio')
    .optional()
    .isString()
    .withMessage('Portofoliul trebuie să fie un string'),
  body('certifications')
    .optional()
    .isString()
    .withMessage('Certificările trebuie să fie un string'),
  body('insurance')
    .optional()
    .isBoolean()
    .withMessage('Asigurarea trebuie să fie true sau false'),
  body('workingHours')
    .optional()
    .isString()
    .withMessage('Orele de lucru trebuie să fie un string'),
  body('serviceAreas')
    .optional()
    .isString()
    .withMessage('Zonele de serviciu trebuie să fie un string'),
];

const updateAvailabilityValidation = [
  body('isAvailable')
    .isBoolean()
    .withMessage('Disponibilitatea trebuie să fie true sau false'),
];

// Public routes
router.get('/', professionalController.getProfessionals);
router.get('/:id', professionalController.getProfessionalById);
router.get('/:id/reviews', professionalController.getProfessionalReviews);

// Protected routes
router.put('/profile', authMiddleware, updateProfessionalValidation, validateRequest, professionalController.updateProfessionalProfile);
router.get('/jobs/my', authMiddleware, professionalController.getProfessionalJobs);
router.get('/applications/my', authMiddleware, professionalController.getProfessionalApplications);
router.put('/availability', authMiddleware, updateAvailabilityValidation, validateRequest, professionalController.updateAvailability);

export default router;
