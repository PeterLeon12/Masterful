import { Router } from 'express';
import { body } from 'express-validator';
import { paymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation rules
const createConnectAccountValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Codul țării trebuie să aibă 2 caractere'),
];

const createAccountLinkValidation = [
  body('refreshUrl')
    .isURL()
    .withMessage('URL-ul de refresh nu este valid'),
  body('returnUrl')
    .isURL()
    .withMessage('URL-ul de return nu este valid'),
];

const createPaymentIntentValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID este obligatoriu'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Suma trebuie să fie mai mare de 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Codul monedei trebuie să aibă 3 caractere'),
];

const confirmPaymentValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID este obligatoriu'),
];

const createTransferValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID este obligatoriu'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Suma trebuie să fie mai mare de 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Codul monedei trebuie să aibă 3 caractere'),
];

const createRefundValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID este obligatoriu'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Suma trebuie să fie mai mare de 0'),
  body('reason')
    .optional()
    .isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
    .withMessage('Motivul rambursării nu este valid'),
];

// Routes
router.post('/connect/account', createConnectAccountValidation, validateRequest, paymentController.createConnectAccount);
router.post('/connect/account-link', createAccountLinkValidation, validateRequest, paymentController.createAccountLink);
router.get('/connect/status', paymentController.getAccountStatus);

router.post('/intent', createPaymentIntentValidation, validateRequest, paymentController.createPaymentIntent);
router.post('/confirm', confirmPaymentValidation, validateRequest, paymentController.confirmPayment);

router.post('/transfer', createTransferValidation, validateRequest, paymentController.createTransfer);
router.post('/refund', createRefundValidation, validateRequest, paymentController.createRefund);

router.get('/history', paymentController.getPaymentHistory);

export default router;
