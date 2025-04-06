import { db } from '../db';
import { plans, organizations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Serviço para gerenciar planos e assinaturas sem Stripe
 */

/**
 * Atualizar o plano de uma organização
 */
export async function updateOrganizationPlan(
  organizationId: number,
  planId: number
): Promise<boolean> {
  try {
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    // Buscar a organização
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    
    if (!organization) {
      throw new Error(`Organização com ID ${organizationId} não encontrada`);
    }
    
    // Calcular nova data de expiração (30 dias a partir de hoje)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Atualizar a organização com o novo plano
    await db.update(organizations)
      .set({
        planId: planId,
        planTier: plan.tier,
        planStartDate: new Date(),
        planExpiryDate: expiryDate,
        status: 'active',
        // Registrar o evento no histórico do plano
        planHistory: JSON.stringify([
          ...(organization.planHistory ? JSON.parse(organization.planHistory as string) : []),
          {
            date: new Date().toISOString(),
            action: 'upgraded',
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            previousPlanId: organization.planId || null,
            price: plan.price,
            reason: 'Mudança de plano solicitada pelo usuário'
          }
        ])
      })
      .where(eq(organizations.id, organizationId));
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar plano da organização:', error);
    throw error;
  }
}

/**
 * Cancelar o plano atual e reverter para o plano gratuito
 */
export async function cancelPlan(organizationId: number): Promise<boolean> {
  try {
    // Buscar a organização
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    
    if (!organization) {
      throw new Error(`Organização com ID ${organizationId} não encontrada`);
    }
    
    // Buscar o plano gratuito
    const [freePlan] = await db.select().from(plans).where(eq(plans.tier, 'free'));
    
    if (!freePlan) {
      throw new Error('Plano gratuito não encontrado');
    }
    
    // Atualizar a organização para o plano gratuito
    await db.update(organizations)
      .set({
        planId: freePlan.id,
        planTier: 'free',
        planStartDate: new Date(),
        planExpiryDate: null, // Plano gratuito não expira
        planHistory: JSON.stringify([
          ...(organization.planHistory ? JSON.parse(organization.planHistory as string) : []),
          {
            date: new Date().toISOString(),
            action: 'cancelled',
            planId: freePlan.id,
            planName: freePlan.name,
            tier: 'free',
            previousPlanId: organization.planId || null,
            price: 0,
            reason: 'Cancelamento solicitado pelo usuário'
          }
        ])
      })
      .where(eq(organizations.id, organizationId));
    
    return true;
  } catch (error) {
    console.error('Erro ao cancelar plano:', error);
    throw error;
  }
}

/**
 * Obter detalhes do plano atual de uma organização
 */
export async function getOrganizationPlanDetails(organizationId: number): Promise<any> {
  try {
    // Buscar a organização com dados do plano
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    
    if (!organization) {
      throw new Error(`Organização com ID ${organizationId} não encontrada`);
    }
    
    if (!organization.planId) {
      // Se a organização não tiver um plano atribuído, retornar apenas os dados básicos
      return {
        organizationId,
        hasPlan: false,
        organizationName: organization.name,
        planDetails: null
      };
    }
    
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, organization.planId));
    
    if (!plan) {
      throw new Error(`Plano com ID ${organization.planId} não encontrado`);
    }
    
    // Buscar todos os planos para verificar possíveis upgrades
    const allPlans = await db.select().from(plans).where(eq(plans.isActive, true));
    
    // Determinar planos disponíveis para upgrade/downgrade
    const availablePlans = allPlans.filter(p => p.id !== plan.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        price: p.price,
        isUpgrade: getTierLevel(p.tier) > getTierLevel(organization.planTier || 'free'),
        tierLevel: getTierLevel(p.tier)
      }))
      .sort((a, b) => a.tierLevel - b.tierLevel);
    
    // Formatar o histórico de plano se existir
    const planHistory = organization.planHistory
      ? JSON.parse(organization.planHistory as string)
      : [];
    
    return {
      organizationId,
      hasPlan: true,
      organizationName: organization.name,
      planDetails: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        tier: plan.tier,
        tierLevel: getTierLevel(plan.tier),
        price: plan.price,
        startDate: organization.planStartDate,
        expiryDate: organization.planExpiryDate,
        isActive: organization.status === 'active',
        features: plan.features ? JSON.parse(plan.features as string) : [],
        availablePlans,
        planHistory
      }
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do plano da organização:', error);
    throw error;
  }
}

/**
 * Função auxiliar para determinar o nível do tier
 */
function getTierLevel(tier: string | null): number {
  switch (tier) {
    case 'pro': return 4;
    case 'grow': return 3;
    case 'seed': return 2;
    case 'free': return 1;
    default: return 0;
  }
}