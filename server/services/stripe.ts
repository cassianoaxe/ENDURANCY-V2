import { plans, planTierEnum, organizations, modules } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Inicializar Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;

/**
 * Inicializa planos no banco de dados (usado para teste e inicialização)
 */
export async function initializePlans() {
  try {
    const existingPlans = await db.select().from(plans);
    
    if (existingPlans.length === 0) {
      console.log("Criando planos padrão...");
      
      // Criar plano Free (Freemium)
      await db.insert(plans).values({
        name: 'Freemium',
        description: 'Experimente todas as opções por 30 dias',
        price: '0',
        tier: 'free',
        features: [
          'Todas as opções para testes', 
          'Acesso por 30 dias', 
          'Exceto portal do médico',
          'Suporte por e-mail'
        ],
        maxRecords: 100,
        trialDays: 30
      });
      
      // Criar plano Seed
      await db.insert(plans).values({
        name: 'Seed',
        description: 'Plano básico inicial para pequenas organizações',
        price: '499.00',
        tier: 'seed',
        features: [
          'Módulos básicos', 
          'Até 15 usuários', 
          'Suporte por e-mail e chat',
          'Dashboard e Onboarding',
          'Patrimônio (+R$99/mês)',
          'Financeiro'
        ],
        maxRecords: 500,
        trialDays: 0
      });
      
      // Criar plano Grow
      await db.insert(plans).values({
        name: 'Grow',
        description: 'Plano para organizações em crescimento com módulo de cultivo',
        price: '999.00',
        tier: 'grow',
        features: [
          'Todos os recursos do Seed', 
          'Módulo de Cultivo', 
          'Até 30 usuários', 
          'Suporte prioritário',
          'Controle de inventário',
          'Patrimônio (+R$99/mês)'
        ],
        maxRecords: 1000,
        trialDays: 0
      });
      
      // Criar plano Pro
      await db.insert(plans).values({
        name: 'Pro',
        description: 'Plano avançado incluindo módulo de produção',
        price: '1999.00',
        tier: 'pro',
        features: [
          'Todos os recursos do Grow', 
          'Módulo de Produção', 
          'Usuários ilimitados', 
          'Atendimento personalizado', 
          'API completa', 
          'Suporte 24/7',
          'Patrimônio incluso'
        ],
        maxRecords: 5000,
        trialDays: 0
      });
      
      // Criar plano Enterprise
      await db.insert(plans).values({
        name: 'Enterprise',
        description: 'Solução completa com todos os módulos disponíveis',
        price: '2999.00',
        tier: 'enterprise',
        features: [
          'Todos os módulos inclusos', 
          'Usuários ilimitados', 
          'Suporte VIP 24/7', 
          'Integrações personalizadas',
          'Onboarding premium',
          'Treinamento da equipe',
          'Recursos exclusivos'
        ],
        maxRecords: 10000,
        trialDays: 0
      });
      
      console.log('Planos padrão criados com sucesso!');
    } else {
      console.log(`${existingPlans.length} planos já existem no sistema`);
    }
  } catch (error) {
    console.error('Erro ao inicializar planos:', error);
  }
}

/**
 * Cria uma intenção de pagamento para um plano
 * @param planId ID do plano a ser assinado
 * @param customerId ID do cliente no Stripe
 * @param customerEmail Email do cliente
 */
export async function createPlanPaymentIntent(
  planId: number,
  customerId?: string,
  customerEmail?: string
): Promise<string | null> {
  try {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      console.error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no ambiente.');
      return null;
    }

    // Obter detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));

    if (!plan) {
      console.error(`Plano com ID ${planId} não encontrado`);
      return null;
    }

    // Converter preço para centavos (Stripe usa a menor unidade monetária)
    const amountInCents = Math.round(parseFloat(plan.price) * 100);

    // Criar ou obter cliente no Stripe
    let stripeCustomer;
    if (customerId) {
      // Se já temos o ID do cliente, apenas recuperamos
      stripeCustomer = await stripe.customers.retrieve(customerId);
    } else if (customerEmail) {
      // Caso contrário, criamos um novo cliente
      stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          planId: planId.toString(),
          planName: plan.name,
          planTier: plan.tier
        }
      });
    } else {
      throw new Error('É necessário fornecer customerId ou customerEmail');
    }

    // Criar a intenção de pagamento
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      customer: stripeCustomer.id,
      metadata: {
        planId: planId.toString(),
        planName: plan.name,
        planTier: plan.tier
      },
      description: `Assinatura do plano ${plan.name}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Erro ao criar intenção de pagamento:', error);
    return null;
  }
}

/**
 * Verifica o status de um pagamento
 * @param paymentIntentId ID da intenção de pagamento
 */
export async function checkPaymentStatus(paymentIntentId: string): Promise<'succeeded' | 'processing' | 'failed' | 'unknown'> {
  try {
    if (!stripe) {
      console.error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no ambiente.');
      return 'unknown';
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return 'succeeded';
    } else if (paymentIntent.status === 'processing') {
      return 'processing';
    } else if (
      paymentIntent.status === 'canceled' || 
      paymentIntent.status === 'requires_payment_method' ||
      paymentIntent.status === 'requires_action'
    ) {
      return 'failed';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return 'unknown';
  }
}

/**
 * Processa um pagamento de plano após confirmação
 * @param paymentIntentId ID da intenção de pagamento
 * @param organizationId ID da organização
 */
export async function processPlanPayment(paymentIntentId: string, organizationId: number): Promise<boolean> {
  try {
    if (!stripe) {
      console.error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no ambiente.');
      return false;
    }

    // Recuperar a intenção de pagamento
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Verificar se o pagamento foi bem-sucedido
    if (paymentIntent.status !== 'succeeded') {
      console.error(`Pagamento não foi concluído com sucesso. Status: ${paymentIntent.status}`);
      return false;
    }

    // Extrair os metadados
    const planId = paymentIntent.metadata.planId ? parseInt(paymentIntent.metadata.planId) : null;
    if (!planId) {
      console.error('Metadado planId não encontrado na intenção de pagamento');
      return false;
    }

    // Buscar o plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) {
      console.error(`Plano com ID ${planId} não encontrado`);
      return false;
    }

    // Atualizar a organização com o novo plano
    try {
      // Implementar lógica para atualizar o plano da organização
      // Esta parte depende da estrutura do seu banco de dados
      // Por exemplo:
      await db.update(organizations)
        .set({ 
          planId: planId,
          plan: plan.name,
          updatedAt: new Date()
        })
        .where(eq(organizations.id, organizationId));

      console.log(`Plano da organização ${organizationId} atualizado para ${plan.name}`);
      return true;
    } catch (dbError) {
      console.error('Erro ao atualizar plano da organização:', dbError);
      return false;
    }
  } catch (error) {
    console.error('Erro ao processar pagamento do plano:', error);
    return false;
  }
}

/**
 * Cria uma intenção de pagamento para um módulo específico
 * @param moduleId ID do módulo a ser adquirido
 * @param customerId ID do cliente no Stripe
 * @param customerEmail Email do cliente
 * @param price Preço do módulo
 */
export async function createModulePaymentIntent(
  moduleId: number,
  customerId?: string,
  customerEmail?: string,
  price: number = 9900 // Preço padrão é R$99,00 em centavos
): Promise<string | null> {
  try {
    if (!stripe) {
      console.error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no ambiente.');
      return null;
    }

    // Obter detalhes do módulo
    const [module] = await db.select().from(modules).where(eq(modules.id, moduleId));

    if (!module) {
      console.error(`Módulo com ID ${moduleId} não encontrado`);
      return null;
    }

    // Criar ou obter cliente no Stripe
    let stripeCustomer;
    if (customerId) {
      stripeCustomer = await stripe.customers.retrieve(customerId);
    } else if (customerEmail) {
      stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          moduleId: moduleId.toString(),
          moduleName: module.name
        }
      });
    } else {
      throw new Error('É necessário fornecer customerId ou customerEmail');
    }

    // Criar a intenção de pagamento
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price, // Já em centavos
      currency: 'brl',
      customer: stripeCustomer.id,
      metadata: {
        moduleId: moduleId.toString(),
        moduleName: module.name
      },
      description: `Ativação do módulo ${module.name}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Erro ao criar intenção de pagamento para módulo:', error);
    return null;
  }
}