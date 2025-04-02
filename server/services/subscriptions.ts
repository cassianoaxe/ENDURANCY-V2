import Stripe from 'stripe';
import { db } from '../db';
import { plans, organizations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Inicializar o cliente Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('A variável de ambiente STRIPE_SECRET_KEY não está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Criar ou recuperar um cliente do Stripe para uma organização
 */
export async function getOrCreateStripeCustomer(organizationId: number): Promise<string> {
  try {
    console.log(`Buscando organização com ID: ${organizationId}`);
    // Buscar a organização
    const orgs = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    console.log(`Resultado da consulta: ${JSON.stringify(orgs, null, 2)}`);
    
    if (!orgs || orgs.length === 0) {
      console.error(`Organização com ID ${organizationId} não encontrada`);
      throw new Error('Organização não encontrada');
    }
    
    const organization = orgs[0];
    
    console.log(`Organização encontrada: ${organization.name}`);
    
    // Se já tiver um customer ID, retornar
    if (organization.stripeCustomerId) {
      console.log(`Retornando Stripe Customer ID existente: ${organization.stripeCustomerId}`);
      return organization.stripeCustomerId;
    }
    
    // Buscar o usuário admin da organização para informações de contato
    const [admin] = await db
      .select()
      .from(users)
      .where(
        eq(users.organizationId, organizationId)
      )
      .where(
        eq(users.role, 'org_admin')
      )
      .limit(1);
    
    // Criar um novo cliente no Stripe
    const customer = await stripe.customers.create({
      name: organization.name,
      email: admin?.email || organization.email || 'contato@example.com',
      description: `Organização ID: ${organization.id}`,
      metadata: {
        organizationId: organization.id.toString(),
      },
    });
    
    // Atualizar a organização com o ID do cliente
    await db
      .update(organizations)
      .set({ stripeCustomerId: customer.id })
      .where(eq(organizations.id, organizationId));
    
    return customer.id;
  } catch (error) {
    console.error('Erro ao criar/recuperar cliente Stripe:', error);
    throw error;
  }
}

/**
 * Criar uma assinatura para um plano
 */
export async function createSubscription(
  organizationId: number,
  planId: number
): Promise<{ subscriptionId: string; clientSecret: string }> {
  try {
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    // Obter ou criar o cliente Stripe
    const customerId = await getOrCreateStripeCustomer(organizationId);
    
    // Criar um produto primeiro
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || `Plano ${plan.name}`,
    });
    
    // Preço mensal fixo para o plano (em centavos)
    const priceData = {
      currency: 'brl',
      product: product.id,
      unit_amount: Math.round(plan.price * 100), // Converter para centavos
      recurring: {
        interval: 'month',
      },
    };
    
    // Criar um preço para o plano
    const price = await stripe.prices.create(priceData);
    
    // Criar a assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: price.id },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        organizationId: organizationId.toString(),
        planId: planId.toString(),
        planName: plan.name,
      },
    });
    
    // Extrair o client secret do payment intent
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    
    // Retornar o ID da assinatura e o client secret para o frontend
    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret || '',
    };
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    throw error;
  }
}

/**
 * Cancelar uma assinatura
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw error;
  }
}

/**
 * Atualizar o plano de uma assinatura
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  planId: number
): Promise<Stripe.Subscription> {
  try {
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    // Buscar a assinatura atual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Criar um produto primeiro
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || `Plano ${plan.name}`,
    });
    
    // Preço mensal fixo para o plano (em centavos)
    const priceData = {
      currency: 'brl',
      product: product.id,
      unit_amount: Math.round(plan.price * 100), // Converter para centavos
      recurring: {
        interval: 'month',
      },
    };
    
    // Criar um preço para o plano
    const price = await stripe.prices.create(priceData);
    
    // Atualizar a assinatura com o novo plano
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: price.id,
          },
        ],
        metadata: {
          ...subscription.metadata,
          planId: planId.toString(),
          planName: plan.name,
        },
      }
    );
    
    return updatedSubscription;
  } catch (error) {
    console.error('Erro ao atualizar plano da assinatura:', error);
    throw error;
  }
}

/**
 * Obter detalhes de uma assinatura
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  try {
    // Recuperar a assinatura do Stripe com dados expandidos
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'customer', 'items.data.price.product']
    });
    
    // Informações básicas da assinatura
    const subscriptionDetails = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      created: new Date(subscription.created * 1000),
      planId: subscription.metadata.planId,
      planName: subscription.metadata.planName,
      organizationId: subscription.metadata.organizationId,
      priceId: subscription.items.data[0]?.price.id,
      amount: subscription.items.data[0]?.price.unit_amount ? 
        subscription.items.data[0].price.unit_amount / 100 : 0,
      currency: subscription.items.data[0]?.price.currency || 'brl',
      interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      paymentMethod: null
    };
    
    // Adicionar informações do método de pagamento, se disponível
    if (subscription.default_payment_method) {
      const pm = subscription.default_payment_method as Stripe.PaymentMethod;
      if (pm.card) {
        subscriptionDetails.paymentMethod = {
          id: pm.id,
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }
    }
    
    return subscriptionDetails;
  } catch (error) {
    console.error('Erro ao buscar detalhes da assinatura:', error);
    throw error;
  }
}

/**
 * Processar um webhook do Stripe para eventos de assinatura
 */
export async function processSubscriptionWebhook(event: Stripe.Event): Promise<void> {
  try {
    let subscription: Stripe.Subscription;
    let organizationId: number;
    let planId: number;
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        subscription = event.data.object as Stripe.Subscription;
        
        // Extrair organizationId e planId dos metadados
        if (!subscription.metadata.organizationId || !subscription.metadata.planId) {
          console.warn('Metadados incompletos no evento de assinatura:', subscription.id);
          return;
        }
        
        organizationId = parseInt(subscription.metadata.organizationId, 10);
        planId = parseInt(subscription.metadata.planId, 10);
        
        // Buscar detalhes do plano
        const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
        
        if (!plan) {
          console.warn('Plano não encontrado para assinatura:', subscription.id);
          return;
        }
        
        // Atualizar a organização com os dados da assinatura
        await db
          .update(organizations)
          .set({
            stripeSubscriptionId: subscription.id,
            planId: planId,
            planTier: plan.tier,
            planStartDate: new Date(subscription.current_period_start * 1000),
            planExpiryDate: new Date(subscription.current_period_end * 1000),
            subscriptionStatus: subscription.status,
          })
          .where(eq(organizations.id, organizationId));
        
        console.log(`Atualizado status da assinatura para organização ${organizationId}`);
        break;
      
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription;
        
        if (!subscription.metadata.organizationId) {
          console.warn('OrganizationId não encontrado nos metadados da assinatura:', subscription.id);
          return;
        }
        
        organizationId = parseInt(subscription.metadata.organizationId, 10);
        
        // Marcar a assinatura como cancelada na organização
        await db
          .update(organizations)
          .set({
            subscriptionStatus: 'canceled',
            // Não limpar outros campos para manter o histórico
          })
          .where(eq(organizations.id, organizationId));
        
        console.log(`Assinatura cancelada para organização ${organizationId}`);
        break;
      
      default:
        // Ignorar outros tipos de eventos
        break;
    }
  } catch (error) {
    console.error('Erro ao processar webhook de assinatura:', error);
    throw error;
  }
}