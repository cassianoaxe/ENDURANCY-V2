import Stripe from 'stripe';
import { processSubscriptionWebhook } from './subscriptions';
import { Request, Response } from 'express';
import { db } from '../db';
import { organizations, plans } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Inicializar o cliente Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('A variável de ambiente STRIPE_SECRET_KEY não está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook secret (idealmente deveria ser definido como variável de ambiente)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Processar o fallback para o plano Freemium quando um pagamento falhar
 * Isso garante que a organização ainda seja criada, mas com o plano gratuito
 */
async function processFreemiumFallback(organizationId: number): Promise<void> {
  try {
    // Buscar a organização
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    
    if (!organization) {
      throw new Error(`Organização com ID ${organizationId} não encontrada`);
    }
    
    // Buscar o plano Freemium (free)
    const [freemiumPlan] = await db.select().from(plans).where(eq(plans.tier, 'free'));
    
    if (!freemiumPlan) {
      throw new Error('Plano Freemium não encontrado');
    }
    
    // Atualizar a organização para o plano Freemium
    await db.update(organizations)
      .set({
        planId: freemiumPlan.id,
        planTier: 'free',
        planStartDate: new Date(),
        planExpiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 dias
        status: 'active', // Ativar a organização automaticamente
        // Registrar o evento de fallback no histórico do plano
        planHistory: JSON.stringify([
          ...(organization.planHistory ? JSON.parse(organization.planHistory as string) : []),
          {
            date: new Date().toISOString(),
            action: 'fallback_payment_failed',
            planId: freemiumPlan.id,
            planName: freemiumPlan.name,
            tier: 'free',
            previousPlanId: organization.planId || null,
            reason: 'Pagamento falhou - ativação automática no plano Freemium'
          }
        ])
      })
      .where(eq(organizations.id, organizationId));
      
    console.log(`Organização ${organizationId} atualizada para o plano Freemium após falha no pagamento`);
  } catch (error) {
    console.error('Erro ao processar fallback para Freemium:', error);
    throw error;
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    return res.status(400).send('⚠️ Webhook Error: No Stripe signature header');
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      // Verificar a assinatura se tiver um webhook secret
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } else {
      // Usar o payload diretamente se não tiver um webhook secret
      // (menos seguro, mas útil para desenvolvimento)
      event = req.body as Stripe.Event;
      console.warn('⚠️ Webhook sem verificação de assinatura - não use em produção!');
    }
  } catch (err: any) {
    console.error(`⚠️ Erro na assinatura do webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Processar eventos de assinatura
        await processSubscriptionWebhook(event);
        break;
      
      case 'payment_intent.succeeded':
        // Processar pagamentos bem-sucedidos
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 PaymentIntent: ${paymentIntent.id} bem-sucedido!`);
        break;
      
      case 'payment_intent.payment_failed':
        // Processar falhas de pagamento
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Pagamento falhou: ${failedIntent.id}`);
        
        // Verificar se está relacionado a um registro de organização
        if (failedIntent.metadata && failedIntent.metadata.type === 'plan' && failedIntent.metadata.isNewOrganization === 'true') {
          try {
            // Extrair organizationId dos metadados
            const organizationId = parseInt(failedIntent.metadata.organizationId || '0', 10);
            
            if (organizationId) {
              // Implementar o fallback para plano Freemium
              await processFreemiumFallback(organizationId);
              console.log(`✓ Organização ${organizationId} configurada com plano Freemium após falha no pagamento`);
            }
          } catch (fallbackError) {
            console.error(`Erro ao processar fallback para Freemium: ${fallbackError}`);
          }
        }
        break;
      
      default:
        // Registrar tipos de eventos não processados para referência
        console.log(`Evento não processado: ${event.type}`);
    }

    // Responder com sucesso
    res.json({ received: true });
  } catch (err: any) {
    console.error(`❌ Erro ao processar webhook: ${err.message}`);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
}