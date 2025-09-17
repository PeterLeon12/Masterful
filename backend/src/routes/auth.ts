import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Parola trebuie să aibă cel puțin 8 caractere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Parola trebuie să conțină cel puțin o literă mică, o literă mare și o cifră'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Numele trebuie să aibă între 2 și 50 de caractere'),
  body('role')
    .isIn(['CLIENT', 'PROFESSIONAL'])
    .withMessage('Rolul trebuie să fie CLIENT sau PROFESSIONAL'),
  body('phone')
    .optional()
    .isMobilePhone('ro-RO')
    .withMessage('Numărul de telefon nu este valid'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
  body('password')
    .notEmpty()
    .withMessage('Parola este obligatorie'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token-ul este obligatoriu'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Noua parolă trebuie să aibă cel puțin 8 caractere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Noua parolă trebuie să conțină cel puțin o literă mică, o literă mare și o cifră'),
];



// Routes
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/logout', authController.logout);

// Password reset routes
router.post('/forgot-password', forgotPasswordValidation, validateRequest, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, authController.resetPassword);

// Profile management routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

// Social login routes (optional)
router.post('/google', authController.googleLogin);
router.post('/apple', authController.appleLogin);

// Password change (requires authentication)
router.post('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Parola actuală este obligatorie'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Noua parolă trebuie să aibă cel puțin 8 caractere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Noua parolă trebuie să conțină cel puțin o literă mică, o literă mare și o cifră'),
], validateRequest, authController.changePassword);

export default router;
