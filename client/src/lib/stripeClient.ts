import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Creates a payment intent for the given plan
 */
export const createPaymentIntent = async (planId: number) => {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return await response.json();
};

/**
 * Confirm a payment with Stripe
 */
export const confirmPayment = async (paymentIntentId: string, organizationId: number) => {
  const response = await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentIntentId, organizationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to confirm payment');
  }

  return await response.json();
};

/**
 * Fetch all available plans
 */
export const fetchPlans = async () => {
  const response = await fetch('/api/plans');
  
  if (!response.ok) {
    throw new Error('Failed to fetch plans');
  }
  
  return await response.json();
};