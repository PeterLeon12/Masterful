import { Request, Response } from 'express';
import { stripeService } from '../services/stripeService';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export const paymentController = {
  // Create Stripe Connect account for professional
  async createConnectAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { email, country = 'RO' } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email-ul este obligatoriu',
          code: 'MISSING_EMAIL',
        });
      }

      // Check if user is a professional
      const user = await databaseService.findUserById(userId);
      if (!user || user.role !== 'PROFESSIONAL') {
        return res.status(403).json({
          success: false,
          message: 'Doar profesioniștii pot crea conturi Stripe Connect',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Create Stripe Connect account
      const account = await stripeService.createConnectAccount(userId, email, country);

      // Store account ID in database
      const professional = await databaseService.findProfessionalByUserId(userId);
      if (professional) {
        await databaseService.updateProfessional(professional.id, {
          stripeAccountId: account.id,
        });
      }

      logger.info(`Stripe Connect account created for professional: ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Cont Stripe Connect creat cu succes',
        data: { accountId: account.id },
      });
    } catch (error) {
      logger.error('Create Connect account error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea contului Stripe Connect',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Create account link for onboarding
  async createAccountLink(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { refreshUrl, returnUrl } = req.body;

      if (!refreshUrl || !returnUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL-urile de refresh și return sunt obligatorii',
          code: 'MISSING_URLS',
        });
      }

      // Get professional's Stripe account ID
      const professional = await databaseService.findProfessionalByUserId(userId);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({
          success: false,
          message: 'Cont Stripe Connect nu a fost găsit',
          code: 'STRIPE_ACCOUNT_NOT_FOUND',
        });
      }

      // Create account link
      const accountLink = await stripeService.createAccountLink(
        professional.stripeAccountId,
        refreshUrl,
        returnUrl
      );

      return res.status(200).json({
        success: true,
        data: { accountLink },
      });
    } catch (error) {
      logger.error('Create account link error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea link-ului de cont',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Get account status
  async getAccountStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      // Get professional's Stripe account ID
      const professional = await databaseService.findProfessionalByUserId(userId);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({
          success: false,
          message: 'Cont Stripe Connect nu a fost găsit',
          code: 'STRIPE_ACCOUNT_NOT_FOUND',
        });
      }

      // Get account status
      const status = await stripeService.getAccountStatus(professional.stripeAccountId);

      return res.status(200).json({
        success: true,
        data: { status },
      });
    } catch (error) {
      logger.error('Get account status error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la verificarea statusului contului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Create payment intent for job
  async createPaymentIntent(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { jobId, amount, currency = 'RON' } = req.body;

      if (!jobId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Job ID și suma sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Verify job exists and user is the client
      const job = await databaseService.findJobById(jobId);
      if (!job || job.clientId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit sau nu ai permisiunea să plătești',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        currency,
        jobId,
        userId
      );

      // Store payment intent in database
      await databaseService.createPayment({
        jobId,
        clientId: userId,
        professionalId: job.professionalId || '',
        amount,
        currency,
        status: 'PENDING',
        paymentMethod: 'CARD',
        stripePaymentIntentId: paymentIntent.id,
      });

      return res.status(201).json({
        success: true,
        message: 'Payment intent creat cu succes',
        data: { 
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      logger.error('Create payment intent error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea payment intent-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Confirm payment
  async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID este obligatoriu',
          code: 'MISSING_PAYMENT_INTENT_ID',
        });
      }

      // Get payment intent status
      const status = await stripeService.getPaymentIntentStatus(paymentIntentId);

      if (status.status === 'succeeded') {
        // Update payment status in database
        await databaseService.updatePaymentByStripeId(paymentIntentId, {
          status: 'COMPLETED',
        });

        // Update job status to IN_PROGRESS
        const payment = await databaseService.findPaymentByStripeId(paymentIntentId);
        if (payment) {
          await databaseService.updateJob(payment.jobId, {
            status: 'IN_PROGRESS',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Plata a fost confirmată cu succes',
          data: { status: status.status },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Plata nu a fost finalizată cu succes',
          code: 'PAYMENT_NOT_SUCCEEDED',
        });
      }
    } catch (error) {
      logger.error('Confirm payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la confirmarea plății',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Create transfer to professional
  async createTransfer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { jobId, amount, currency = 'RON' } = req.body;

      if (!jobId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Job ID și suma sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Verify job exists and user is the client
      const job = await databaseService.findJobById(jobId);
      if (!job || job.clientId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit sau nu ai permisiunea să faci transfer',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Get professional's Stripe account ID
      const professional = await databaseService.findProfessionalByUserId(job.professionalId!);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({
          success: false,
          message: 'Professional nu are cont Stripe Connect configurat',
          code: 'STRIPE_ACCOUNT_NOT_FOUND',
        });
      }

      // Create transfer
      const transfer = await stripeService.createTransfer(
        amount,
        currency,
        professional.stripeAccountId,
        jobId
      );

      // Update payment status
      const payment = await databaseService.findPaymentByJobId(jobId);
      if (payment) {
        await databaseService.updatePayment(payment.id, {
          status: 'TRANSFERRED',
        });
      }

      // Update job status to COMPLETED
      await databaseService.updateJob(jobId, {
        status: 'COMPLETED',
      });

      return res.status(201).json({
        success: true,
        message: 'Transfer creat cu succes',
        data: { transferId: transfer.id },
      });
    } catch (error) {
      logger.error('Create transfer error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea transferului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Create refund
  async createRefund(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { paymentIntentId, amount, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID este obligatoriu',
          code: 'MISSING_PAYMENT_INTENT_ID',
        });
      }

      // Create refund
      const refund = await stripeService.createRefund(paymentIntentId, amount, reason);

      // Update payment status
      await databaseService.updatePaymentByStripeId(paymentIntentId, {
        status: 'REFUNDED',
      });

      return res.status(201).json({
        success: true,
        message: 'Rambursare creată cu succes',
        data: { refundId: refund.id },
      });
    } catch (error) {
      logger.error('Create refund error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea rambursării',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Get payment history
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const payments = await databaseService.findUserPayments(userId, {
        limit: Number(limit),
        offset,
      });

      return res.status(200).json({
        success: true,
        data: { payments },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: payments.length === Number(limit),
        },
      });
    } catch (error) {
      logger.error('Get payment history error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea istoricului plăților',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
