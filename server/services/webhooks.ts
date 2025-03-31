import Stripe from 'stripe';
import { processSubscriptionWebhook } from './subscriptions';
import { Request, Response } from 'express';

// Inicializar o cliente Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('A variável de ambiente STRIPE_SECRET_KEY não está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook secret (idealmente deveria ser definido como variável de ambiente)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Processar um evento de webhook do Stripe
 */
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