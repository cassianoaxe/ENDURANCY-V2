import { apiRequest } from './queryClient';
import { Plan } from '@shared/schema';

/**
 * Cria uma assinatura para um plano
 */
export const createSubscription = async (planId: number, organizationId: number) => {
  try {
    return await apiRequest('/api/subscriptions/create', { 
      method: 'POST',
      data: {
        planId, 
        organizationId 
      }
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    throw error;
  }
};

/**
 * Cancela uma assinatura
 */
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const data = await apiRequest('/api/subscriptions/cancel', { 
      method: 'POST',
      data: {
        subscriptionId 
      }
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw error;
  }
};

/**
 * Atualiza o plano de uma assinatura
 */
export const updateSubscriptionPlan = async (subscriptionId: string, planId: number) => {
  try {
    return await apiRequest('/api/subscriptions/update', { 
      method: 'POST',
      data: {
        subscriptionId,
        planId
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar plano da assinatura:', error);
    throw error;
  }
};

/**
 * Busca todos os planos disponíveis
 */
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    return await apiRequest('/api/plans', {
      method: 'GET'
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
};

/**
 * Componente para assinatura de um plano
 */
export const createSubscriptionPayment = async (planId: number, organizationId: number) => {
  try {
    // Criar uma assinatura
    const { subscriptionId, clientSecret } = await createSubscription(planId, organizationId);
    
    if (!clientSecret) {
      throw new Error('Client secret não retornado');
    }
    
    return {
      subscriptionId,
      clientSecret
    };
  } catch (error) {
    console.error('Erro ao criar pagamento de assinatura:', error);
    throw error;
  }
};