import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { sendMail } from './email';
import { eq, and } from 'drizzle-orm';
import { organizations, plans, orders } from '@shared/schema';

// Configurar a integração com o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any
});

// Armazenamento temporário dos tokens de pagamento (em produção seria melhor usar Redis/banco de dados)
interface PaymentToken {
  token: string;
  organizationId: number;
  planId: number;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const paymentTokens: PaymentToken[] = [];

// Tempo de expiração para tokens (24 horas)
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Criar e enviar link de pagamento para um usuário
 */
export async function createAndSendPaymentLink(params: {
  organizationId: number;
  planId: number;
  email: string;
  adminName: string;
  organizationName: string;
}): Promise<boolean> {
  try {
    // Criar o token único para este link de pagamento
    const token = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRATION_MS);
    
    // Armazenar o token com suas informações relacionadas
    paymentTokens.push({
      token,
      organizationId: params.organizationId,
      planId: params.planId,
      email: params.email,
      createdAt: now,
      expiresAt,
      used: false
    });
    
    // Buscar detalhes do plano para incluir no email
    const [plan] = await db.select().from(plans).where(eq(plans.id, params.planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    // Criar a URL de pagamento
    const paymentUrl = `${process.env.BASE_URL || 'http://localhost'}/payment/${token}`;
    
    // Enviar email com o link de pagamento
    const emailContent = `
      <h2>Link para Pagamento - Endurancy</h2>
      <p>Olá, ${params.adminName}!</p>
      <p>Recebemos seu cadastro para a organização <strong>${params.organizationName}</strong> no plano <strong>${plan.name}</strong>.</p>
      <p>Para ativar sua conta, clique no link abaixo para completar o pagamento:</p>
      <p style="margin: 20px 0;">
        <a href="${paymentUrl}" style="background-color: #10b981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Finalizar Pagamento
        </a>
      </p>
      <p><strong>Valor mensal:</strong> R$ ${plan.price.toFixed(2).replace('.', ',')}</p>
      <p>Este link é válido por 24 horas. Após esse período, será necessário gerar um novo link de pagamento.</p>
      <p>Se você não solicitou esta conta, por favor ignore este email.</p>
      <p>Atenciosamente,<br>Equipe Endurancy</p>
    `;
    
    await sendMail({
      to: params.email,
      subject: `Link de Pagamento - ${params.organizationName}`,
      html: emailContent,
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao criar e enviar link de pagamento:', error);
    return false;
  }
}

/**
 * Validar um token de pagamento
 */
export async function validatePaymentToken(token: string): Promise<{
  valid: boolean;
  organizationId?: number;
  planId?: number;
  email?: string;
}> {
  try {
    // Buscar o token na lista
    const paymentToken = paymentTokens.find(pt => pt.token === token);
    
    if (!paymentToken) {
      return { valid: false };
    }
    
    // Verificar se o token expirou
    const now = new Date();
    if (now > paymentToken.expiresAt) {
      return { valid: false };
    }
    
    // Verificar se o token já foi utilizado
    if (paymentToken.used) {
      return { valid: false };
    }
    
    // Token válido, retornar informações relacionadas
    return {
      valid: true,
      organizationId: paymentToken.organizationId,
      planId: paymentToken.planId,
      email: paymentToken.email
    };
  } catch (error) {
    console.error('Erro ao validar token de pagamento:', error);
    return { valid: false };
  }
}

/**
 * Processar pagamento a partir de um token
 */
export async function processPaymentFromToken(token: string, paymentMethodId: string): Promise<{
  success: boolean;
  message: string;
  clientSecret?: string;
}> {
  try {
    // Validar o token
    const validation = await validatePaymentToken(token);
    
    if (!validation.valid || !validation.organizationId || !validation.planId) {
      return {
        success: false,
        message: 'Token inválido ou expirado'
      };
    }
    
    // Buscar detalhes da organização e do plano
    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, validation.organizationId));
      
    const [plan] = await db.select()
      .from(plans)
      .where(eq(plans.id, validation.planId));
    
    if (!organization || !plan) {
      return {
        success: false,
        message: 'Organização ou plano não encontrado'
      };
    }
    
    // Criar o cliente no Stripe (ou usar o cliente existente)
    let customerId = organization.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: validation.email,
        name: organization.name,
        metadata: {
          organizationId: organization.id.toString()
        }
      });
      
      customerId = customer.id;
      
      // Atualizar o ID do cliente no banco de dados
      await db.update(organizations)
        .set({ stripeCustomerId: customerId })
        .where(eq(organizations.id, organization.id));
    }
    
    // Anexar o método de pagamento ao cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Definir como método de pagamento padrão
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Criar uma assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plan.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Valor em centavos
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Atualizar o plano da organização
    await db.update(organizations)
      .set({ 
        planId: plan.id,
        status: 'active',
        planHistory: [
          ...(organization.planHistory || []),
          {
            date: new Date().toISOString(),
            planId: plan.id,
            planName: plan.name,
            action: 'upgraded',
            price: plan.price,
            previousPlanId: organization.planId,
            paymentMethod: 'credit_card',
            stripeSubscriptionId: subscription.id
          }
        ]
      })
      .where(eq(organizations.id, organization.id));
    
    // Registrar o pedido/ordem
    await db.insert(orders).values({
      organizationId: organization.id,
      planId: plan.id,
      amount: plan.price,
      status: 'completed',
      paymentMethod: 'credit_card',
      stripePaymentId: subscription.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Marcar o token como utilizado
    const tokenIndex = paymentTokens.findIndex(pt => pt.token === token);
    if (tokenIndex >= 0) {
      paymentTokens[tokenIndex].used = true;
    }
    
    // Verificar se é necessário autenticação adicional
    const invoice = subscription.latest_invoice as any;
    if (invoice && invoice.payment_intent && invoice.payment_intent.status === 'requires_action') {
      return {
        success: true,
        message: 'Autenticação adicional necessária',
        clientSecret: invoice.payment_intent.client_secret
      };
    }
    
    return {
      success: true,
      message: 'Pagamento processado com sucesso'
    };
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    
    // Verificar se é um erro do Stripe
    if (error.type && error.type.startsWith('Stripe')) {
      return {
        success: false,
        message: error.message || 'Erro no processamento do cartão'
      };
    }
    
    return {
      success: false,
      message: 'Erro ao processar o pagamento'
    };
  }
}

/**
 * Função para tratamento de falha no pagamento - acionar plano gratuito
 */
export async function handlePaymentFailure(organizationId: number): Promise<boolean> {
  try {
    // Buscar a organização
    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));
      
    if (!organization) {
      console.error('Organização não encontrada para fallback de plano gratuito');
      return false;
    }
    
    // Buscar o plano Freemium/Básico
    const [freemiumPlan] = await db.select()
      .from(plans)
      .where(eq(plans.tier, 'free'));
    
    if (!freemiumPlan) {
      console.error('Plano Freemium não encontrado para fallback');
      return false;
    }
    
    // Atualizar a organização para o plano gratuito
    await db.update(organizations)
      .set({ 
        planId: freemiumPlan.id,
        status: 'active',
        planHistory: [
          ...(organization.planHistory || []),
          {
            date: new Date().toISOString(),
            planId: freemiumPlan.id,
            planName: freemiumPlan.name,
            action: 'fallback',
            price: 0,
            previousPlanId: organization.planId,
            paymentMethod: 'none',
            reason: 'payment_failure'
          }
        ]
      })
      .where(eq(organizations.id, organizationId));
      
    // Registrar o pedido gratuito
    await db.insert(orders).values({
      organizationId: organization.id,
      planId: freemiumPlan.id,
      amount: 0,
      status: 'completed',
      paymentMethod: 'none',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao acionar plano gratuito após falha de pagamento:', error);
    return false;
  }
}