import { plans, planTierEnum } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Inicializa planos no banco de dados (usado para teste e inicialização)
 */
export async function initializePlans() {
  try {
    const existingPlans = await db.select().from(plans);
    
    if (existingPlans.length === 0) {
      console.log("Criando planos padrão...");
      
      // Criar plano Free
      await db.insert(plans).values({
        name: 'Freemium',
        description: 'Plano gratuito para conhecer o sistema',
        price: '0',
        tier: 'free',
        features: JSON.stringify(['Acesso básico', 'Limite de usuários: 3', 'Suporte por e-mail']),
        isActive: true,
        isPopular: false,
      });
      
      // Criar plano Seed
      await db.insert(plans).values({
        name: 'Seed',
        description: 'Plano inicial para pequenas organizações',
        price: '149.90',
        tier: 'seed',
        features: JSON.stringify(['Até 10 usuários', 'Módulos básicos', 'Suporte por e-mail e chat']),
        isActive: true,
        isPopular: true,
      });
      
      // Criar plano Grow
      await db.insert(plans).values({
        name: 'Grow',
        description: 'Plano para organizações em crescimento',
        price: '299.90',
        tier: 'grow',
        features: JSON.stringify(['Até 30 usuários', 'Todos os módulos básicos', 'Módulos adicionais', 'Suporte prioritário']),
        isActive: true,
        isPopular: false,
      });
      
      // Criar plano Pro
      await db.insert(plans).values({
        name: 'Pro',
        description: 'Plano completo para organizações estabelecidas',
        price: '499.90',
        tier: 'pro',
        features: JSON.stringify(['Usuários ilimitados', 'Todos os módulos', 'Atendimento personalizado', 'API completa', 'Suporte 24/7']),
        isActive: true,
        isPopular: false,
      });
      
      console.log('Planos padrão criados com sucesso!');
    } else {
      console.log(`${existingPlans.length} planos já existem no sistema`);
    }
  } catch (error) {
    console.error('Erro ao inicializar planos:', error);
  }
}