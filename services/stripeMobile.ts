import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { ENV } from '../config/environment';

// Stripe configuration for mobile
export const STRIPE_CONFIG = {
  publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
  merchantId: 'merchant.com.rork.romanianmarketplaceapp', // iOS merchant ID
  urlScheme: 'romanianmarketplaceapp', // iOS URL scheme
};

// Stripe payment methods for mobile
export class StripeMobileService {
  private stripe: any;

  constructor() {
    this.stripe = useStripe();
  }

  // Initialize payment sheet for one-time payments
  async initializePaymentSheet(paymentIntent: {
    clientSecret: string;
    customerId?: string;
    customerEphemeralKeySecret?: string;
  }) {
    const { error } = await this.stripe.initPaymentSheet({
      merchantDisplayName: 'Masterful',
      paymentIntentClientSecret: paymentIntent.clientSecret,
      customerId: paymentIntent.customerId,
      customerEphemeralKeySecret: paymentIntent.customerEphemeralKeySecret,
      defaultBillingDetails: {
        name: 'Customer Name',
      },
      allowsDelayedPaymentMethods: true,
    });

    if (error) {
      throw new Error(`Payment sheet initialization failed: ${error.message}`);
    }
  }

  // Present payment sheet
  async presentPaymentSheet() {
    const { error } = await this.stripe.presentPaymentSheet();

    if (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }

    return { success: true };
  }

  // Create payment intent (this would typically be done on your backend)
  async createPaymentIntent(amount: number, currency: string = 'ron') {
    // In a real app, you'd call your backend API here
    // For now, we'll return a mock response
    return {
      clientSecret: 'pi_mock_client_secret',
      customerId: 'cus_mock_customer_id',
      customerEphemeralKeySecret: 'ek_mock_ephemeral_key',
    };
  }

  // Handle payment success
  async handlePaymentSuccess(paymentIntentId: string) {
    // Update job status, send notifications, etc.
    console.log('Payment successful:', paymentIntentId);
  }

  // Handle payment failure
  async handlePaymentFailure(error: any) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// Export singleton instance
export const stripeMobileService = new StripeMobileService();
