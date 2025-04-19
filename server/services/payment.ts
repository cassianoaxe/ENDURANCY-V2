import { plans, planTierEnum, organizations, modules } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import axios from 'axios';

// Inicializar ComplyPay (Zoop)
const COMPLYPAY_API_KEY = process.env.COMPLYPAY_API_KEY;
const COMPLYPAY_MARKETPLACE_ID = process.env.COMPLYPAY_MARKETPLACE_ID;
const COMPLYPAY_BASE_URL = process.env.COMPLYPAY_BASE_URL || 'https://api.zoop.ws/v1';

/**
 * Inicializa planos no banco de dados (usado para teste e inicialização)
 */
/**
 * Cria uma intent de pagamento para um plano
 * @param planId ID do plano a ser assinado
 * @param organizationId ID da organização que está assinando o plano
 * @param metadata Metadados adicionais para o pagamento
 * @returns Cliente secret para integração com Stripe no frontend
 */
export async function createPlanPaymentIntent(
  planId: number,
  organizationId: number,
  metadata: Record<string, any> = {}
): Promise<string> {
  try {
    if (!COMPLYPAY_API_KEY || !COMPLYPAY_MARKETPLACE_ID) {
      console.log('ComplyPay não configurado - retornando token simulado para ambiente de desenvolvimento');
      return `token_mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Buscar informações do plano
    const [planInfo] = await db.select().from(plans).where(eq(plans.id, planId));
    
    if (!planInfo) {
      throw new Error(`Plano com ID ${planId} não encontrado`);
    }

    // Criar transação com ComplyPay (Zoop)
    const response = await axios.post(
      `${COMPLYPAY_BASE_URL}/marketplaces/${COMPLYPAY_MARKETPLACE_ID}/transactions`,
      {
        amount: Math.round(parseFloat(planInfo.price) * 100), // Converter para centavos
        currency: 'BRL',
        description: `Assinatura do plano ${planInfo.name}`,
        payment_type: 'credit',
        on_behalf_of: organizationId.toString(),
        statement_descriptor: 'ComplyPay*Assinatura',
        metadata: {
          planId: planId.toString(),
          organizationId: organizationId.toString(),
          planName: planInfo.name,
          planTier: planInfo.tier,
          ...metadata
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${COMPLYPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.token || response.data.id;
  } catch (error) {
    console.error('Erro ao criar token de pagamento para plano:', error);
    throw error;
  }
}

/**
 * Verifica o status de um pagamento
 * @param paymentIntentId ID da payment intent
 * @returns Status do pagamento
 */
export async function checkPaymentStatus(transactionId: string): Promise<string> {
  try {
    if (!COMPLYPAY_API_KEY || !COMPLYPAY_MARKETPLACE_ID) {
      console.log('ComplyPay não configurado - simulando status de pagamento para desenvolvimento');
      return 'approved';
    }

    const response = await axios.get(
      `${COMPLYPAY_BASE_URL}/marketplaces/${COMPLYPAY_MARKETPLACE_ID}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${COMPLYPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Mapear status da Zoop para nomenclatura interna
    const statusMap: Record<string, string> = {
      'succeeded': 'approved',
      'approved': 'approved',
      'pre_authorized': 'pending',
      'pending': 'pending',
      'declined': 'declined',
      'canceled': 'canceled',
      'failed': 'failed',
      'voided': 'voided',
    };

    return statusMap[response.data.status] || response.data.status;
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw error;
  }
}

/**
 * Processa o pagamento de um plano após confirmação
 * @param transactionId ID da transação
 */
export async function processPlanPayment(transactionId: string): Promise<void> {
  try {
    if (!COMPLYPAY_API_KEY || !COMPLYPAY_MARKETPLACE_ID) {
      console.log('ComplyPay não configurado - simulando processamento de pagamento para desenvolvimento');
      return;
    }

    const response = await axios.get(
      `${COMPLYPAY_BASE_URL}/marketplaces/${COMPLYPAY_MARKETPLACE_ID}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${COMPLYPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.status !== 'approved' && response.data.status !== 'succeeded') {
      throw new Error(`Pagamento não foi concluído. Status atual: ${response.data.status}`);
    }

    const planId = Number(response.data.metadata.planId);
    const organizationId = Number(response.data.metadata.organizationId);

    // Atualizar organização com o novo plano
    await db.update(organizations)
      .set({
        planId: planId,
        planStartDate: new Date(),
        plan_status: 'active' // usando snake_case conforme schema
      })
      .where(eq(organizations.id, organizationId));

    console.log(`Pagamento processado com sucesso para organização ${organizationId}, plano ${planId}`);
  } catch (error) {
    console.error('Erro ao processar pagamento do plano:', error);
    throw error;
  }
}

/**
 * Função para criar intent de pagamento para módulo individual
 */
export async function createModulePaymentIntent(
  moduleId: number,
  organizationId: number,
  metadata: Record<string, any> = {}
): Promise<string> {
  try {
    if (!COMPLYPAY_API_KEY || !COMPLYPAY_MARKETPLACE_ID) {
      console.log('ComplyPay não configurado - retornando token simulado para ambiente de desenvolvimento');
      return `token_mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Buscar informações do módulo
    const [moduleInfo] = await db.select().from(modules).where(eq(modules.id, moduleId));
    
    if (!moduleInfo) {
      throw new Error(`Módulo com ID ${moduleId} não encontrado`);
    }

    // Definir preço base para módulos
    let modulePrice = 99; // Preço base para a maioria dos módulos (R$ 99,00)
    
    // Ajustar preço com base no tipo de módulo
    if (moduleInfo.type === 'patrimonio') {
      modulePrice = 99; // Módulo de património custa R$ 99,00/mês
    } else if (moduleInfo.type === 'producao') {
      modulePrice = 299; // Módulo de produção é mais caro
    }

    // Criar transação com ComplyPay (Zoop)
    const response = await axios.post(
      `${COMPLYPAY_BASE_URL}/marketplaces/${COMPLYPAY_MARKETPLACE_ID}/transactions`,
      {
        amount: modulePrice * 100, // Converter para centavos
        currency: 'BRL',
        description: `Assinatura do módulo ${moduleInfo.name}`,
        payment_type: 'credit',
        on_behalf_of: organizationId.toString(),
        statement_descriptor: 'ComplyPay*Modulo',
        metadata: {
          moduleId: moduleId.toString(),
          organizationId: organizationId.toString(),
          moduleName: moduleInfo.name,
          moduleType: moduleInfo.type,
          ...metadata
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${COMPLYPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.token || response.data.id;
  } catch (error) {
    console.error('Erro ao criar token de pagamento para módulo:', error);
    throw error;
  }
}

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