import { plans, planTierEnum } from '@shared/schema';
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