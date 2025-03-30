import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';
import { Plan, ModulePlan } from '@shared/schema';

// Carrega a chave pública do Stripe a partir das variáveis de ambiente
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.warn('Stripe publishable key não encontrada. Os pagamentos não funcionarão corretamente.');
}

// Inicializa o cliente Stripe apenas uma vez para evitar múltiplas instâncias
export const stripePromise = stripeKey 
  ? loadStripe(stripeKey) 
  : null;

/**
 * Busca todos os planos disponíveis na plataforma
 */
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await apiRequest('GET', '/api/plans');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
};

/**
 * Cria um intent de pagamento para um plano
 */
export const createPlanPaymentIntent = async (planId: number) => {
  try {
    const response = await apiRequest('POST', '/api/payments/create-plan-intent', { planId });
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Erro ao criar intent de pagamento para plano:', error);
    throw error;
  }
};

/**
 * Cria um intent de pagamento para um módulo add-on
 */
export const createModulePaymentIntent = async (modulePlanId: number, organizationId?: number) => {
  try {
    const response = await apiRequest('POST', '/api/payments/create-module-intent', { 
      modulePlanId, 
      organizationId 
    });
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Erro ao criar intent de pagamento para módulo:', error);
    throw error;
  }
};

/**
 * Confirma um pagamento de plano
 */
export const confirmPlanPayment = async (paymentIntentId: string, organizationId: number) => {
  try {
    const response = await apiRequest('POST', '/api/payments/confirm-plan-payment', {
      paymentIntentId,
      organizationId
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao confirmar pagamento do plano:', error);
    throw error;
  }
};

/**
 * Confirma um pagamento de módulo
 */
export const confirmModulePayment = async (paymentIntentId: string) => {
  try {
    const response = await apiRequest('POST', '/api/payments/confirm-module-payment', {
      paymentIntentId
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao confirmar pagamento do módulo:', error);
    throw error;
  }
};

/**
 * Verifica o status de um pagamento
 */
export const checkPaymentStatus = async (paymentIntentId: string) => {
  try {
    const response = await apiRequest('GET', `/api/payments/check-status/${paymentIntentId}`);
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw error;
  }
};