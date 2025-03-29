import Stripe from 'stripe';
import { plans } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Creates a payment intent for the given plan and returns client secret
 */
export async function createPaymentIntent(planId: number): Promise<string> {
  try {
    // Get plan details from database
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }
    
    // Convert plan price from decimal to integer cents (Stripe uses smallest currency unit)
    const amount = Math.round(Number(plan.price) * 100);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl', // Using Brazilian Real
      description: `Payment for ${plan.name} plan`,
      metadata: {
        planId: plan.id.toString(),
        planName: plan.name,
      },
    });
    
    return paymentIntent.client_secret as string;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Retrieves a payment intent by its ID
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

/**
 * Creates a customer in Stripe
 */
export async function createCustomer(name: string, email: string) {
  try {
    const customer = await stripe.customers.create({
      name,
      email,
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/**
 * Creates a subscription for a customer
 */
export async function createSubscription(customerId: string, priceId: string) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Initializes sample plans in the database (used for testing)
 */
export async function initializePlans() {
  try {
    const existingPlans = await db.select().from(plans);
    
    if (existingPlans.length === 0) {
      // Create sample plans
      await db.insert(plans).values({
        name: 'Básico',
        description: 'Plano básico para pequenas organizações',
        price: '99.90',
        features: ['Registro de até 10 usuários', 'Suporte básico', 'Relatórios mensais'],
      });
      
      await db.insert(plans).values({
        name: 'Intermediário',
        description: 'Plano intermediário para organizações em crescimento',
        price: '199.90',
        features: ['Registro de até 50 usuários', 'Suporte prioritário', 'Relatórios semanais', 'Acesso a APIs'],
      });
      
      await db.insert(plans).values({
        name: 'Avançado',
        description: 'Plano avançado para grandes organizações',
        price: '399.90',
        features: ['Usuários ilimitados', 'Suporte 24/7', 'Relatórios personalizados', 'API completa', 'Treinamento dedicado'],
      });
      
      console.log('Sample plans created');
    }
  } catch (error) {
    console.error('Error initializing plans:', error);
  }
}

export default stripe;