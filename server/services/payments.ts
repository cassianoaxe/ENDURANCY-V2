import Stripe from 'stripe';
import { db } from '../db';
import { plans, modulePlans, organizations, organizationModules, financialTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Inicializar o cliente Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('A variável de ambiente STRIPE_SECRET_KEY não está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Cria um intent de pagamento para planos
 */
export async function createPlanPaymentIntent(planId: number): Promise<string> {
  try {
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Criar intent de pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Converter para centavos
      currency: 'brl',
      metadata: {
        planId: plan.id.toString(),
        planName: plan.name,
        type: 'plan'
      },
    });

    return paymentIntent.client_secret || '';
  } catch (error) {
    console.error('Erro ao criar intent de pagamento para plano:', error);
    throw error;
  }
}

/**
 * Cria um intent de pagamento para módulos add-on
 */
export async function createModulePaymentIntent(modulePlanId: number, organizationId?: number): Promise<string> {
  try {
    // Buscar detalhes do plano do módulo
    const [modulePlan] = await db.select().from(modulePlans).where(eq(modulePlans.id, modulePlanId));
    
    if (!modulePlan) {
      throw new Error('Plano de módulo não encontrado');
    }

    // Validar que a organização existe se fornecida
    if (organizationId) {
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
      
      if (!organization) {
        throw new Error('Organização não encontrada');
      }
    }

    // Criar intent de pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(modulePlan.price * 100), // Converter para centavos
      currency: 'brl',
      metadata: {
        modulePlanId: modulePlan.id.toString(),
        moduleId: modulePlan.module_id.toString(),
        organizationId: organizationId?.toString() || '',
        type: 'module'
      },
    });

    return paymentIntent.client_secret || '';
  } catch (error) {
    console.error('Erro ao criar intent de pagamento para módulo:', error);
    throw error;
  }
}

/**
 * Processa o pagamento confirmado para um plano
 */
export async function processPlanPayment(paymentIntentId: string, organizationId: number): Promise<boolean> {
  try {
    // Recuperar o payment intent do Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Pagamento não concluído');
    }
    
    const planId = parseInt(paymentIntent.metadata.planId || '0', 10);
    
    if (!planId) {
      throw new Error('ID do plano não encontrado nos metadados');
    }

    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Atualizar a organização com o novo plano
    await db.update(organizations)
      .set({
        planId: planId,
        planTier: plan.tier,
        planStartDate: new Date(),
        // Definir data de expiração com base no período do plano
        planExpiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 dias
        stripeCustomerId: paymentIntent.customer as string || null,
        stripeSubscriptionId: null, // Para assinaturas futuras
      })
      .where(eq(organizations.id, organizationId));
    
    // Registrar a transação financeira
    const amount = Number(plan.price);
    await registerFinancialTransaction(
      organizationId,
      amount,
      `Pagamento de assinatura do plano ${plan.name}`,
      'Assinaturas',
      paymentIntentId
    );

    return true;
  } catch (error) {
    console.error('Erro ao processar pagamento do plano:', error);
    throw error;
  }
}

/**
 * Processa o pagamento confirmado para um módulo add-on
 */
export async function processModulePayment(paymentIntentId: string): Promise<boolean> {
  try {
    // Recuperar o payment intent do Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Pagamento não concluído');
    }
    
    const modulePlanId = parseInt(paymentIntent.metadata.modulePlanId || '0', 10);
    const moduleId = parseInt(paymentIntent.metadata.moduleId || '0', 10);
    const organizationId = parseInt(paymentIntent.metadata.organizationId || '0', 10);
    
    if (!modulePlanId || !moduleId || !organizationId) {
      throw new Error('Metadados incompletos no pagamento');
    }

    // Buscar detalhes do plano do módulo
    const [modulePlan] = await db.select().from(modulePlans).where(eq(modulePlans.id, modulePlanId));
    
    if (!modulePlan) {
      throw new Error('Plano de módulo não encontrado');
    }
    
    // Buscar detalhes do módulo para a descrição
    const [module] = await db.select().from(modules).where(eq(modules.id, moduleId));
    
    if (!module) {
      throw new Error('Módulo não encontrado');
    }

    // Adicionar o módulo à organização
    await db.insert(organizationModules).values({
      organizationId,
      moduleId,
      planId: modulePlanId,
      active: true,
      status: 'active',
      billingDay: new Date().getDate(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Registrar a transação financeira
    const amount = Number(modulePlan.price);
    await registerFinancialTransaction(
      organizationId,
      amount,
      `Aquisição do módulo ${module.name} - Plano ${modulePlan.name}`,
      'Módulos Add-on',
      paymentIntentId
    );

    return true;
  } catch (error) {
    console.error('Erro ao processar pagamento do módulo:', error);
    throw error;
  }
}

/**
 * Registra uma transação financeira para um pagamento confirmado
 */
async function registerFinancialTransaction(
  organizationId: number, 
  amount: number, 
  description: string, 
  category: string,
  paymentIntentId: string
): Promise<void> {
  try {
    // Registrar a transação financeira como receita
    await db.insert(financialTransactions).values({
      organizationId,
      description,
      type: 'receita',
      category,
      amount,
      status: 'pago',
      dueDate: new Date(),
      paymentDate: new Date(),
      documentNumber: paymentIntentId,
      paymentMethod: 'cartão de crédito',
      notes: `Pagamento através do Stripe (ID: ${paymentIntentId})`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Transação financeira registrada para pagamento: ${paymentIntentId}`);
  } catch (error) {
    // Log do erro, mas não interromper o fluxo principal
    console.error('Erro ao registrar transação financeira:', error);
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function checkPaymentStatus(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
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