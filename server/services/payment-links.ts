import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { sendMail, sendTemplateEmail } from './email';
import { eq, and } from 'drizzle-orm';
import { organizations, plans, orders } from '@shared/schema';
import { completeOrganizationActivation } from './auto-organization-setup';

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://endurancy25.replit.app/assets/logo.svg" alt="Endurancy Logo" style="max-width: 150px;">
        </div>
        
        <h2 style="color: #2e7d32; text-align: center;">Confirmação de Pagamento</h2>
        
        <p>Olá, <strong>${params.adminName}</strong>!</p>
        
        <p>Recebemos seu cadastro para a organização <strong>${params.organizationName}</strong> no plano <strong>${plan.name}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Detalhes do Plano:</h3>
          <p><strong>Organização:</strong> ${params.organizationName}</p>
          <p><strong>Plano:</strong> ${plan.name}</p>
          <p><strong>Valor mensal:</strong> R$ ${plan.price.toFixed(2).replace('.', ',')}</p>
        </div>
        
        <p>Para ativar sua conta, clique no botão abaixo para completar o pagamento:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Finalizar Pagamento</a>
        </div>
        
        <p style="color: #d32f2f; font-size: 14px; background-color: #ffebee; padding: 10px; border-radius: 4px;">
          <strong>Importante:</strong> Este link é válido por apenas 24 horas. Após esse período, será necessário solicitar um novo link.
        </p>
        
        <p>Ou copie e cole o link diretamente no seu navegador:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">${paymentUrl}</p>
        
        <p>Se você não solicitou esta conta, por favor ignore este email ou entre em contato com nosso suporte.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; color: #777; font-size: 12px; text-align: center;">
          <p>Este é um email automático, por favor não responda.</p>
          <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
        </div>
      </div>
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
 * Processar confirmação de pagamento a partir de um token
 * Versão simplificada que não usa Stripe, apenas confirma o pagamento e ativa a organização
 */
export async function processPaymentFromToken(token: string, paymentType: string = 'boleto'): Promise<{
  success: boolean;
  message: string;
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
    
    // Gerar um ID de transação interno
    const transactionId = `TRANS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Verificar o status atual da organização
    const currentStatus = organization.status;
    console.log(`Processando pagamento - Organização ${organization.id} - Status atual: ${currentStatus}`);
    
    // Atualizar o plano da organização e alterar status para 'active'
    await db.update(organizations)
      .set({ 
        planId: plan.id,
        status: 'active', // Alterando de 'pending' para 'active' após confirmação de pagamento
        planTier: plan.tier,
        planHistory: [
          ...(organization.planHistory || []),
          {
            date: new Date().toISOString(),
            planId: plan.id,
            planName: plan.name,
            action: currentStatus === 'pending' ? 'activated' : 'upgraded',
            price: plan.price,
            previousPlanId: organization.planId,
            paymentMethod: paymentType,
            transactionId: transactionId,
            statusBefore: currentStatus,
            statusAfter: 'active'
          }
        ]
      })
      .where(eq(organizations.id, organization.id));
    
    // Registrar o pedido/ordem
    await db.insert(orders).values({
      organizationId: organization.id,
      planId: plan.id,
      amount: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
      status: 'completed',
      paymentMethod: paymentType,
      transactionId: transactionId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Marcar o token como utilizado
    const tokenIndex = paymentTokens.findIndex(pt => pt.token === token);
    if (tokenIndex >= 0) {
      paymentTokens[tokenIndex].used = true;
    }
    
    // Ativar a organização automaticamente (configurar módulos e criar usuário admin)
    try {
      const activationResult = await completeOrganizationActivation(organization.id, plan.id);
      console.log(`Ativação automática da organização ${organization.id} foi ${activationResult ? 'bem-sucedida' : 'falhou'}`);
      
      // Enviar email de confirmação de ativação
      if (activationResult) {
        // Buscar a URL base para os links
        const baseUrl = process.env.BASE_URL || 'http://localhost';
        const accessLink = `${baseUrl}/login`;
        
        // Enviar email de ativação da organização
        await sendTemplateEmail(
          validation.email,
          `Sua organização ${organization.name} foi ativada - Acesso imediato`,
          'organization_activated',
          {
            adminName: organization.adminName || 'Administrador',
            organizationName: organization.name,
            username: validation.email, // O email é usado como nome de usuário por padrão
            accessLink,
          }
        );
      }
    } catch (activationError) {
      console.error(`Erro durante a ativação automática da organização ${organization.id}:`, activationError);
      // Não impedir o fluxo principal se a ativação falhar - um admin pode fazer isso manualmente depois
    }
    
    return {
      success: true,
      message: 'Pagamento confirmado e organização ativada com sucesso'
    };
  } catch (error: any) {
    console.error('Erro ao processar confirmação de pagamento:', error);
    
    return {
      success: false,
      message: 'Erro ao processar a confirmação do pagamento: ' + (error.message || 'Erro desconhecido')
    };
  }
}

/**
 * Função para tratamento de falha no pagamento - acionar plano gratuito
 */
/**
 * Enviar link de pagamento via interface do admin
 */
export async function sendPaymentLinkFromAdmin(organizationId: number): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Buscar a organização
    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));
      
    if (!organization) {
      return {
        success: false,
        message: 'Organização não encontrada'
      };
    }
    
    // Verificar se a organização tem um plano atribuído
    if (!organization.planId) {
      return {
        success: false,
        message: 'Organização não possui plano atribuído'
      };
    }
    
    // Buscar o plano atual
    const [plan] = await db.select()
      .from(plans)
      .where(eq(plans.id, organization.planId));
    
    if (!plan) {
      return {
        success: false,
        message: 'Plano não encontrado'
      };
    }
    
    // Verificar se existe um email para envio
    const emailToUse = organization.email || organization.adminEmail;
    
    if (!emailToUse) {
      return {
        success: false,
        message: 'A organização não possui email para contato'
      };
    }
    
    // Enviar o link de pagamento
    const sent = await createAndSendPaymentLink({
      organizationId: organization.id,
      planId: organization.planId,
      email: emailToUse,
      adminName: organization.adminName || 'Administrador',
      organizationName: organization.name
    });
    
    if (!sent) {
      return {
        success: false,
        message: 'Erro ao enviar o email com link de pagamento'
      };
    }
    
    return {
      success: true,
      message: `Link de pagamento enviado com sucesso para ${emailToUse}`
    };
  } catch (error: any) {
    console.error('Erro ao enviar link de pagamento:', error);
    return {
      success: false,
      message: 'Erro ao processar o envio: ' + (error.message || 'Erro desconhecido')
    };
  }
}

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
        planTier: 'free',
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
    
    // Ativar a organização automaticamente com o plano gratuito
    try {
      const activationResult = await completeOrganizationActivation(organization.id, freemiumPlan.id);
      console.log(`Ativação automática (plano gratuito) da organização ${organization.id} foi ${activationResult ? 'bem-sucedida' : 'falhou'}`);
      
      if (activationResult && organization.email) {
        // Buscar a URL base para os links
        const baseUrl = process.env.BASE_URL || 'http://localhost';
        const accessLink = `${baseUrl}/login`;
        
        // Enviar email informando sobre a ativação com plano gratuito
        await sendTemplateEmail(
          organization.email,
          `Sua organização ${organization.name} foi ativada com o Plano Gratuito`,
          'organization_activated_free',
          {
            adminName: organization.adminName || 'Administrador',
            organizationName: organization.name,
            username: organization.email, // O email é usado como nome de usuário por padrão
            accessLink,
            upgradePlanLink: `${baseUrl}/organization/meu-plano`
          }
        );
      }
    } catch (activationError) {
      console.error(`Erro durante a ativação automática da organização ${organization.id} com plano gratuito:`, activationError);
      // Não impedir o fluxo principal se a ativação falhar - um admin pode fazer isso manualmente depois
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao acionar plano gratuito após falha de pagamento:', error);
    return false;
  }
}