import Stripe from 'stripe';
import { logger } from '../utils/logger';

if (!process.env['STRIPE_SECRET_KEY']) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
  apiVersion: '2023-10-16',
});

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // Create a Stripe Connect account for a professional
  async createConnectAccount(professionalId: string, email: string, country: string = 'RO') {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          professionalId,
        },
      });

      logger.info(`Stripe Connect account created for professional: ${professionalId}`);
      return account;
    } catch (error) {
      logger.error('Error creating Stripe Connect account:', error);
      throw error;
    }
  }

  // Create account link for onboarding
  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      logger.error('Error creating account link:', error);
      throw error;
    }
  }

  // Get account status
  async getAccountStatus(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      };
    } catch (error) {
      logger.error('Error getting account status:', error);
      throw error;
    }
  }

  // Create payment intent for job payment
  async createPaymentIntent(amount: number, currency: string, jobId: string, clientId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          jobId,
          clientId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created for job: ${jobId}, amount: ${amount} ${currency}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create transfer to professional (after job completion)
  async createTransfer(amount: number, currency: string, destinationAccountId: string, jobId: string) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination: destinationAccountId,
        metadata: {
          jobId,
          type: 'job_payment',
        },
      });

      logger.info(`Transfer created for job: ${jobId}, amount: ${amount} ${currency}`);
      return transfer;
    } catch (error) {
      logger.error('Error creating transfer:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    try {
      const refundData: any = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        refundData.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundData);

      logger.info(`Refund created for payment intent: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  // Get payment intent status
  async getPaymentIntentStatus(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      logger.error('Error getting payment intent status:', error);
      throw error;
    }
  }

  // Create customer for client
  async createCustomer(email: string, name: string, clientId: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          clientId,
        },
      });

      logger.info(`Stripe customer created for client: ${clientId}`);
      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  // Setup payment method for customer
  async setupPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      logger.error('Error setting up payment method:', error);
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(accountId: string) {
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      return balance;
    } catch (error) {
      logger.error('Error getting account balance:', error);
      throw error;
    }
  }

  // Create webhook endpoint
  async createWebhookEndpoint(url: string, events: string[]) {
    try {
      const webhook = await this.stripe.webhookEndpoints.create({
        url,
        enabled_events: events as any,
      });

      logger.info(`Webhook endpoint created: ${url}`);
      return webhook;
    } catch (error) {
      logger.error('Error creating webhook endpoint:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, secret: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
