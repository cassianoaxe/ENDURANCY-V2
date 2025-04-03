import { Request, Response, Router } from 'express';
import { db } from '../db';
import { organizations, modules, organizationModules, plans } from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

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
    
    // Atualizar a organização com o novo plano
    await db.update(organizations)
      .set({
        planId: planId,
        planTier: requestedPlan.tier,
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
      where: eq(organizations.id, organizationId)
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organização não encontrada"
      });
    }
    
    // Atualizar a organização para remover a solicitação pendente
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
    console.log(`Enviando e-mail de confirmação de mudança de plano para ${email}`);
    console.log(`Assunto: Confirmação de atualização de plano - ${orgName}`);
    console.log(`Conteúdo: Seu plano foi atualizado para ${planName}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
    return false;
  }
}

// Função para enviar e-mail de rejeição de mudança de plano
async function sendPlanChangeRejectionEmail(email: string, orgName: string) {
  try {
    console.log(`Enviando e-mail de rejeição de mudança de plano para ${email}`);
    console.log(`Assunto: Solicitação de atualização de plano não aprovada - ${orgName}`);
    console.log(`Conteúdo: Sua solicitação de mudança de plano não foi aprovada.`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de rejeição:', error);
    return false;
  }
}

export default router;