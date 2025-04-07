import { createTransport } from 'nodemailer';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { plans, organizations, modules, organization_modules, orders, plan_modules } from '@shared/schema';

// Configuração do servidor SMTP
const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'seu-email@gmail.com',
    pass: process.env.SMTP_PASS || 'sua-senha',
  },
});

/**
 * Configura o transporter do Nodemailer para envio de emails
 * Em ambiente de produção, use um serviço de email real
 */
async function setupEmailTransporter() {
  // Em produção, verificar a conexão
  if (process.env.NODE_ENV === 'production') {
    try {
      await transporter.verify();
      console.log('Conexão SMTP verificada e pronta');
    } catch (error) {
      console.error('Erro ao verificar conexão SMTP:', error);
      // Em produção, pode-se lançar erro ou configurar fallback
    }
  }
}

// Inicializar o transporter
setupEmailTransporter();

/**
 * Gera um token único para identificar um link de pagamento
 */
function generateToken(): string {
  return randomUUID();
}

/**
 * Gera um link de pagamento para uma organização e plano específicos
 * @param organizationId ID da organização
 * @param planId ID do plano
 * @returns URL do link de pagamento
 */
export async function generatePaymentLink(organizationId: number, planId: number): Promise<string> {
  // Verificar se há um pedido pendente para esta combinação
  const existingOrders = await db.select()
    .from(orders)
    .where(
      and(
        eq(orders.organizationId, organizationId),
        eq(orders.planId, planId),
        eq(orders.status, 'pending')
      )
    );
  
  // Se já existe um pedido pendente, reuso o token dele
  if (existingOrders.length > 0) {
    const latestOrder = existingOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    if (latestOrder.paymentToken) {
      return `${process.env.APP_URL || 'http://localhost:3000'}/pagamento/confirmacao/${latestOrder.paymentToken}`;
    }
  }
  
  // Gerar novo token
  const token = generateToken();
  return `${process.env.APP_URL || 'http://localhost:3000'}/pagamento/confirmacao/${token}`;
}

/**
 * Envia um email com o link de pagamento para o cliente
 * @param email Email do destinatário
 * @param organizationName Nome da organização
 * @param planName Nome do plano
 * @param planPrice Preço do plano
 * @param paymentLink Link de pagamento
 */
export async function sendPaymentEmail(
  email: string,
  name: string,
  organizationName: string,
  planName: string,
  planPrice: number,
  paymentLink: string
): Promise<void> {
  try {
    const formattedPrice = planPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://endurancy25.replit.app/assets/logo.svg" alt="Endurancy Logo" style="max-width: 150px;">
        </div>
        
        <h2 style="color: #2e7d32; text-align: center;">Confirmação de Pagamento</h2>
        
        <p>Olá, <strong>${name}</strong>!</p>
        
        <p>Recebemos uma solicitação para ativação do plano <strong>${planName}</strong> para sua organização <strong>${organizationName}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Detalhes do Pedido:</h3>
          <p><strong>Organização:</strong> ${organizationName}</p>
          <p><strong>Plano:</strong> ${planName}</p>
          <p><strong>Valor:</strong> ${formattedPrice}</p>
        </div>
        
        <p>Para confirmar o pagamento e ativar seu plano, clique no botão abaixo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Confirmar Pagamento</a>
        </div>
        
        <p>Ou acesse o link diretamente:</p>
        <p><a href="${paymentLink}">${paymentLink}</a></p>
        
        <p>Caso não tenha solicitado este plano, por favor ignore este email ou entre em contato com nosso suporte.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; color: #777; font-size: 12px;">
          <p>Este é um email automático, por favor não responda.</p>
          <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"Endurancy" <${process.env.SMTP_USER || 'noreply@endurancy.com'}>`,
      to: email,
      subject: `Confirmação de Pagamento - Plano ${planName}`,
      html: htmlContent
    });
    
    console.log(`Email enviado com sucesso para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Não foi possível enviar o email de confirmação');
  }
}

/**
 * Processa a confirmação de um pagamento com base no token
 * @param paymentToken Token único do pagamento
 * @returns Objeto com o resultado da operação
 */
export async function processPaymentConfirmation(paymentToken: string): Promise<{ 
  success: boolean;
  message: string;
  order?: any;
}> {
  try {
    // Encontrar o pedido pelo token
    const [order] = await db.select().from(orders)
      .where(eq(orders.paymentToken, paymentToken))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    
    if (!order) {
      return {
        success: false,
        message: "Pedido não encontrado. O token pode ser inválido ou expirado."
      };
    }
    
    // Verificar se o pedido já foi pago
    if (order.status === 'completed') {
      return {
        success: true,
        message: "Este pagamento já foi confirmado anteriormente.",
        order
      };
    }
    
    // Buscar organização
    const [organization] = await db.select().from(organizations)
      .where(eq(organizations.id, order.organizationId));
    
    if (!organization) {
      return {
        success: false,
        message: "Organização não encontrada."
      };
    }
    
    // Buscar plano
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, order.planId));
    
    if (!plan) {
      return {
        success: false,
        message: "Plano não encontrado."
      };
    }
    
    // Atualizar o status do pedido para 'completed'
    await db.update(orders)
      .set({
        status: 'completed',
        updatedAt: new Date(),
        paidAt: new Date()
      })
      .where(eq(orders.id, order.id));
    
    // Atualizar o plano da organização
    await db.update(organizations)
      .set({
        planId: order.planId,
        plan_updated_at: new Date()
      })
      .where(eq(organizations.id, order.organizationId));
    
    // Configurar os módulos disponíveis para a organização com base no plano
    await configurePlanModules(order.organizationId, order.planId);
    
    return {
      success: true,
      message: "Pagamento confirmado com sucesso! Os módulos do seu plano foram ativados.",
      order: {
        ...order,
        status: 'completed',
        organizationName: organization.name,
        planName: plan.name,
        total: parseFloat(order.total)
      }
    };
  } catch (error) {
    console.error('Erro ao processar confirmação de pagamento:', error);
    return {
      success: false,
      message: "Erro ao processar o pagamento. Por favor, tente novamente."
    };
  }
}

/**
 * Configura os módulos para uma organização com base no plano escolhido
 * @param organizationId ID da organização
 * @param planId ID do plano
 */
export async function configurePlanModules(organizationId: number, planId: number): Promise<void> {
  try {
    // Buscar todos os módulos disponíveis
    const allModules = await db.select().from(modules);
    
    // Buscar módulos ativos para o plano
    const planModules = await db.select()
      .from(plan_modules)
      .where(eq(plan_modules.plan_id, planId));
    
    // Criar conjunto com IDs dos módulos disponíveis no plano
    const planModuleIds = new Set(planModules.map(pm => pm.module_id));
    
    // Buscar módulos atualmente configurados para a organização
    const existingOrgModules = await db.select()
      .from(organization_modules)
      .where(eq(organization_modules.organizationId, organizationId));
    
    // Criar conjunto com IDs dos módulos já configurados para a organização
    const existingModuleIds = new Set(existingOrgModules.map(om => om.moduleId));
    
    // Para cada módulo disponível no sistema
    for (const module of allModules) {
      // Verificar se o módulo está disponível no plano
      const isModuleInPlan = planModuleIds.has(module.id);
      
      // Verificar se o módulo já está configurado para a organização
      const isModuleConfigured = existingModuleIds.has(module.id);
      
      if (isModuleInPlan) {
        // Se o módulo está no plano
        if (isModuleConfigured) {
          // Atualizar módulo existente (ativar)
          await db.update(organization_modules)
            .set({
              isEnabled: true,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(organization_modules.organizationId, organizationId),
                eq(organization_modules.moduleId, module.id)
              )
            );
        } else {
          // Criar nova configuração de módulo
          await db.insert(organization_modules).values({
            organizationId,
            moduleId: module.id,
            name: module.name,
            status: 'active',
            isEnabled: true,
            planId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        // Se o módulo não está no plano, mas está configurado (desativar)
        if (isModuleConfigured) {
          await db.update(organization_modules)
            .set({
              isEnabled: false,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(organization_modules.organizationId, organizationId),
                eq(organization_modules.moduleId, module.id)
              )
            );
        }
      }
    }
  } catch (error) {
    console.error('Erro ao configurar módulos do plano:', error);
    throw new Error('Falha ao configurar módulos para a organização');
  }
}