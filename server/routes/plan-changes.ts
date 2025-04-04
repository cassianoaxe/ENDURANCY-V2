import { Request, Response, Router } from 'express';
import { db } from '../db';
import { organizations, modules, organizationModules, plans } from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { pool } from '../db'; // Garantir que o pool é importado
import nodemailer from 'nodemailer';
// Configs já carregadas no arquivo principal

// Função para determinação de tipo de mudança de plano (upgrade/downgrade)
function determinePlanChangeType(currentTier: string, requestedTier: string): 'upgrade' | 'downgrade' | 'same' {
  const tierValues: Record<string, number> = {
    'free': 1,
    'seed': 2,
    'grow': 3,
    'pro': 4
  };
  
  const currentValue = tierValues[currentTier] || 1;
  const requestedValue = tierValues[requestedTier] || 1;
  
  if (requestedValue > currentValue) {
    return 'upgrade';
  } else if (requestedValue < currentValue) {
    return 'downgrade';
  } else {
    return 'same';
  }
}

const router = Router();

// Endpoint para obter todas as solicitações de mudança de plano pendentes
router.get('/plan-change-requests', async (req: Request, res: Response) => {
  try {
    // Buscar todas as organizações com status "pending_plan_change"
    const pendingRequests = await db.select({
      id: organizations.id,
      name: organizations.name,
      adminName: organizations.adminName,
      email: organizations.email,
      type: organizations.type,
      status: organizations.status,
      currentPlanId: organizations.planId,
      requestedPlanId: organizations.requestedPlanId,
      requestDate: organizations.updatedAt,
    })
    .from(organizations)
    .where(eq(organizations.status, 'pending_plan_change'));

    // Formatar a resposta para incluir informações do plano atual e requisitado
    const formattedRequests = await Promise.all(pendingRequests.map(async (req) => {
      let currentPlanName = "Free";
      let requestedPlanName = "";
      
      // Obter o nome do plano requisitado, se existir
      if (req.requestedPlanId) {
        const requestedPlan = await db.query.plans.findFirst({
          where: eq(plans.id, req.requestedPlanId)
        });
        
        if (requestedPlan) {
          requestedPlanName = requestedPlan.name;
        }
      }
      
      return {
        ...req,
        currentPlanName,
        requestedPlanName
      };
    }));

    // Retornar os dados formatados
    return res.status(200).json({
      success: true,
      totalRequests: formattedRequests.length,
      requests: formattedRequests
    });
  } catch (error) {
    console.error("Erro ao obter solicitações de mudança de plano:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar solicitações de mudança de plano"
    });
  }
});

// Endpoint para aprovar uma solicitação de mudança de plano
router.post('/plan-change-requests/approve', async (req: Request, res: Response) => {
  const { organizationId, planId } = req.body;
  
  if (!organizationId || !planId) {
    return res.status(400).json({
      success: false,
      message: "Dados incompletos: organizationId e planId são obrigatórios"
    });
  }
  
  try {
    // Buscar a organização
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId)
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organização não encontrada"
      });
    }
    
    // Buscar o plano solicitado
    const requestedPlan = await db.query.plans.findFirst({
      where: eq(plans.id, planId)
    });
    
    if (!requestedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plano solicitado não encontrado"
      });
    }
    
    // Determinar tipo de mudança de plano (upgrade/downgrade)
    const currentPlan = await db.query.plans.findFirst({
      where: eq(plans.id, organization.planId)
    });
    
    const changeType = determinePlanChangeType(
      currentPlan?.tier || 'free',
      requestedPlan.tier
    );
    
    console.log(`Alteração de plano: ${currentPlan?.name || 'Free'} (${currentPlan?.tier || 'free'}) -> ${requestedPlan.name} (${requestedPlan.tier}) - Tipo: ${changeType}`);
    
    // Preparar dados para o histórico de alterações
    const planHistoryEntry = {
      previousPlanId: organization.planId,
      previousPlanName: currentPlan?.name || 'Free',
      newPlanId: planId,
      newPlanName: requestedPlan.name,
      changeType: changeType,
      changeDate: new Date().toISOString(),
      reason: "Solicitação de mudança de plano aprovada"
    };
    
    // Recuperar histórico existente ou criar novo array
    let planHistory = [];
    if (organization.planHistory && Array.isArray(organization.planHistory)) {
      planHistory = [...organization.planHistory];
    }
    
    // Adicionar nova entrada ao histórico
    planHistory.push(planHistoryEntry);
    
    console.log(`Histórico de plano atualizado com ${planHistory.length} entradas`);
    
    // Atualizar a organização com o novo plano e histórico
    // Nota: planHistory é um campo JSON que não está no schema, adicionar apenas para armazenamento
    console.log("Atualizando organização com novo plano:", planId, "tier:", requestedPlan.tier);
    await db.update(organizations)
      .set({
        planId: planId,
        planTier: requestedPlan.tier as any, // Cast necessário para compatibilidade
        status: "active",
        requestedPlanId: null,
        updatedAt: new Date()
      })
      .where(eq(organizations.id, organizationId));
    
    // Obter módulos atuais da organização
    const currentModules = await db.query.organizationModules.findMany({
      where: eq(organizationModules.organizationId, organizationId)
    });
    
    // Determinare quais módulos devem ser adicionados com base no tier do plano
    const modulesToAdd = [];
    
    // Sempre adicionar módulos obrigatórios (se ainda não existirem)
    const requiredModuleTypes = ['dashboard', 'onboarding'];
    const requiredModules = await db.query.modules.findMany({
      where: (modules, { inArray }) => inArray(modules.type, requiredModuleTypes)
    });
    
    // Adicionar os módulos obrigatórios à lista
    for (const module of requiredModules) {
      const exists = currentModules.some(m => m.moduleId === module.id);
      if (!exists) {
        modulesToAdd.push({
          organizationId: organizationId,
          moduleId: module.id,
          status: 'active',
          active: true,
          startDate: new Date(),
          createdAt: new Date()
        });
      }
    }
    
    // Adicionar módulos específicos com base no tier do plano
    if (requestedPlan.tier === 'pro') {
      // Para o plano Pro, adicionamos todos os módulos premium
      const premiumModuleTypes = ['analytics', 'financeiro', 'vendas', 'crm', 'producao'];
      const premiumModules = await db.query.modules.findMany({
        where: (modules, { inArray }) => inArray(modules.type, premiumModuleTypes)
      });
      
      for (const module of premiumModules) {
        const exists = currentModules.some(m => m.moduleId === module.id);
        if (!exists) {
          modulesToAdd.push({
            organizationId: organizationId,
            moduleId: module.id,
            status: 'active',
            active: true,
            startDate: new Date(),
            createdAt: new Date()
          });
        }
      }
    } else if (requestedPlan.tier === 'grow') {
      // Para o plano Grow, adicionamos módulos intermediários
      const growModuleTypes = ['analytics', 'financeiro', 'vendas'];
      const growModules = await db.query.modules.findMany({
        where: (modules, { inArray }) => inArray(modules.type, growModuleTypes)
      });
      
      for (const module of growModules) {
        const exists = currentModules.some(m => m.moduleId === module.id);
        if (!exists) {
          modulesToAdd.push({
            organizationId: organizationId,
            moduleId: module.id,
            status: 'active',
            active: true,
            startDate: new Date(),
            createdAt: new Date()
          });
        }
      }
    } else if (requestedPlan.tier === 'seed') {
      // Para o plano Seed, adicionamos módulos básicos
      const seedModuleTypes = ['analytics', 'vendas'];
      const seedModules = await db.query.modules.findMany({
        where: (modules, { inArray }) => inArray(modules.type, seedModuleTypes)
      });
      
      for (const module of seedModules) {
        const exists = currentModules.some(m => m.moduleId === module.id);
        if (!exists) {
          modulesToAdd.push({
            organizationId: organizationId,
            moduleId: module.id,
            status: 'active',
            active: true,
            startDate: new Date(),
            createdAt: new Date()
          });
        }
      }
    }
    
    // Inserir os novos módulos
    if (modulesToAdd.length > 0) {
      for (const module of modulesToAdd) {
        await db.insert(organizationModules).values({
          organizationId: module.organizationId,
          moduleId: module.moduleId,
          status: 'active' as const,
          active: module.active,
          startDate: module.startDate,
          createdAt: module.createdAt
        });
      }
    }
    
    // Enviar e-mail de confirmação de mudança de plano
    await sendPlanChangeConfirmationEmail(organization.email, organization.name, requestedPlan.name);
    
    return res.status(200).json({
      success: true,
      message: "Plano atualizado com sucesso",
      organizationId,
      planId,
      planName: requestedPlan.name,
      planTier: requestedPlan.tier,
      modulesAdded: modulesToAdd.length
    });
  } catch (error) {
    console.error("Erro ao aprovar mudança de plano:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar aprovação de mudança de plano"
    });
  }
});

// Endpoint para rejeitar uma solicitação de mudança de plano
router.post('/plan-change-requests/reject', async (req: Request, res: Response) => {
  const { organizationId } = req.body;
  
  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "ID da organização é obrigatório"
    });
  }
  
  try {
    // Buscar a organização
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      with: {
        plan: true
      }
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organização não encontrada"
      });
    }
    
    // Verificar se existe uma solicitação pendente
    if (!organization.requestedPlanId) {
      return res.status(400).json({
        success: false,
        message: "Esta organização não tem uma solicitação de mudança de plano pendente"
      });
    }
    
    console.log(`Processando rejeição de solicitação para organização ${organizationId}`);
    
    // Buscar detalhes do plano solicitado para histórico
    const requestedPlan = await db.query.plans.findFirst({
      where: eq(plans.id, organization.requestedPlanId)
    });
    
    // Preparar dados para o histórico de alterações
    const planHistoryEntry = {
      previousPlanId: organization.planId,
      previousPlanName: organization.plan?.name || 'Desconhecido',
      requestedPlanId: organization.requestedPlanId,
      requestedPlanName: requestedPlan?.name || 'Desconhecido',
      changeType: 'rejected',
      changeDate: new Date().toISOString(),
      reason: "Solicitação de mudança de plano rejeitada pelo administrador"
    };
    
    console.log(`Adicionando registro ao histórico: ${JSON.stringify(planHistoryEntry)}`);
    
    // Recuperar histórico existente ou criar novo array
    let planHistory = [];
    if (organization.planHistory && Array.isArray(organization.planHistory)) {
      planHistory = [...organization.planHistory];
    }
    
    // Adicionar nova entrada ao histórico
    planHistory.push(planHistoryEntry);
    
    // Atualizar a organização para remover a solicitação pendente
    console.log(`Atualizando organização para remover solicitação pendente. ID: ${organizationId}`);
    await db.update(organizations)
      .set({
        status: "active",
        requestedPlanId: null,
        updatedAt: new Date()
      })
      .where(eq(organizations.id, organizationId));
    
    // Enviar e-mail informando sobre a rejeição do plano
    await sendPlanChangeRejectionEmail(organization.email, organization.name);
    
    return res.status(200).json({
      success: true,
      message: "Solicitação de mudança de plano rejeitada com sucesso",
      organizationId
    });
  } catch (error) {
    console.error("Erro ao rejeitar mudança de plano:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar rejeição de mudança de plano"
    });
  }
});

// Função para enviar e-mail de confirmação de mudança de plano
async function sendPlanChangeConfirmationEmail(email: string, orgName: string, planName: string) {
  try {
    // Criar transportador de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASSWORD || 'password'
      }
    });

    // Preparar dados do email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@endurancy.app',
      to: email,
      subject: `Confirmação de atualização de plano - ${orgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Confirmação de Atualização de Plano</h2>
          <p style="color: #555; line-height: 1.6;">Olá,</p>
          <p style="color: #555; line-height: 1.6;">A solicitação de mudança de plano para <strong>${orgName}</strong> foi aprovada com sucesso!</p>
          <p style="color: #555; line-height: 1.6;">Seu plano foi atualizado para: <strong>${planName}</strong></p>
          <p style="color: #555; line-height: 1.6;">Os novos recursos e funcionalidades já estão disponíveis em sua conta. Faça login para explorar todas as possibilidades do seu novo plano.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://endurancy.app'}/login" style="background-color: #4e46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar Minha Conta</a>
          </div>
          <p style="color: #555; line-height: 1.6;">Se você tiver alguma dúvida ou precisar de suporte, entre em contato com nossa equipe de atendimento.</p>
          <p style="color: #555; line-height: 1.6;">Atenciosamente,<br>Equipe Endurancy</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    console.log(`Enviando e-mail de confirmação de mudança de plano para ${email}`);
    
    // Em ambiente de desenvolvimento, apenas simular o envio
    if (process.env.NODE_ENV === 'development') {
      console.log('Email simulado (desenvolvimento):');
      console.log(`Para: ${email}`);
      console.log(`Assunto: ${mailOptions.subject}`);
      console.log('Conteúdo HTML omitido para legibilidade');
      return true;
    }
    
    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
    return false;
  }
}

// Função para enviar e-mail de rejeição de mudança de plano
async function sendPlanChangeRejectionEmail(email: string, orgName: string) {
  try {
    // Criar transportador de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASSWORD || 'password'
      }
    });

    // Preparar dados do email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@endurancy.app',
      to: email,
      subject: `Solicitação de atualização de plano não aprovada - ${orgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Solicitação de Plano Não Aprovada</h2>
          <p style="color: #555; line-height: 1.6;">Olá,</p>
          <p style="color: #555; line-height: 1.6;">Informamos que a solicitação de mudança de plano para <strong>${orgName}</strong> não foi aprovada neste momento.</p>
          <p style="color: #555; line-height: 1.6;">Você pode entrar em contato com nossa equipe de suporte para mais informações ou fazer uma nova solicitação com outros parâmetros.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://endurancy.app'}/login" style="background-color: #4e46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar Minha Conta</a>
          </div>
          <p style="color: #555; line-height: 1.6;">Obrigado pela compreensão.</p>
          <p style="color: #555; line-height: 1.6;">Atenciosamente,<br>Equipe Endurancy</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    console.log(`Enviando e-mail de rejeição de mudança de plano para ${email}`);
    
    // Em ambiente de desenvolvimento, apenas simular o envio
    if (process.env.NODE_ENV === 'development') {
      console.log('Email simulado (desenvolvimento):');
      console.log(`Para: ${email}`);
      console.log(`Assunto: ${mailOptions.subject}`);
      console.log('Conteúdo HTML omitido para legibilidade');
      return true;
    }
    
    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de rejeição:', error);
    return false;
  }
}

export default router;