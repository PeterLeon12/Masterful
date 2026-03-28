import { loadStripe } from '@stripe/stripe-js';
import { supabaseApiClient } from './supabaseApi';

// Initialize Stripe
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_monthly_plan', // Replace with actual Stripe price ID
    features: [
      'Unlimited job postings',
      'Access to all professionals',
      'Real-time messaging',
      'Priority support',
      'Advanced notifications',
      'Detailed analytics'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 299.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_yearly_plan', // Replace with actual Stripe price ID
    features: [
      'Everything in Monthly',
      '2 months free',
      'Exclusive features',
      'Priority customer support',
      'Advanced analytics',
      'Custom integrations'
    ]
  }
];

export class StripeService {
  private stripe: any = null;

  async initialize() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  async createCheckoutSession(planId: string, userId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      const stripe = await this.initialize();
      if (!stripe) {
        return { success: false, error: 'Stripe not initialized' };
      }

      // Create checkout session via your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          planId,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        return { success: false, error };
      }

      return { success: true, sessionId };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: 'Failed to create checkout session' };
    }
  }

  async redirectToCheckout(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await this.initialize();
      if (!stripe) {
        return { success: false, error: 'Stripe not initialized' };
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      return { success: false, error: 'Failed to redirect to checkout' };
    }
  }

  async createCustomerPortalSession(userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const { url, error } = await response.json();

      if (error) {
        return { success: false, error };
      }

      return { success: true, url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { success: false, error: 'Failed to create portal session' };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<{ success: boolean; subscription?: any; error?: string }> {
    try {
      const response = await supabaseApiClient.getProfile();
      if (!response.success) {
        return { success: false, error: 'Failed to get user profile' };
      }

      // Check if user has active subscription
      // This would typically come from your database
      const user = response.data;
      const hasActiveSubscription = user.subscription_status === 'active';

      return {
        success: true,
        subscription: hasActiveSubscription ? {
          status: 'active',
          plan: user.subscription_plan || 'monthly',
          current_period_end: user.subscription_end_date,
        } : null
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { success: false, error: 'Failed to get subscription status' };
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const { error } = await response.json();

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }
}

export const stripeService = new StripeService();
export default stripeService;
