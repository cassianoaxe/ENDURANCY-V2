import { apiRequest } from '@/lib/queryClient';
import { Plan } from '@shared/schema';

export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await apiRequest('/api/plans', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
};

export const fetchPublicPlans = async (): Promise<Plan[]> => {
  try {
    const response = await apiRequest('/api/public/plans', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Erro ao buscar planos públicos:', error);
    throw error;
  }
};

export const createPaymentIntent = async (planId: number, organizationId: number): Promise<{ clientSecret: string }> => {
  try {
    const response = await apiRequest('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ planId, organizationId }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao criar intent de pagamento:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId: string, organizationId: number): Promise<{ success: boolean, message?: string }> => {
  try {
    const response = await apiRequest('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, organizationId }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    throw error;
  }
};

export const createOrganizationSubscription = async (planId: number, organizationId: number): Promise<{ success: boolean, message?: string }> => {
  try {
    const response = await apiRequest('/api/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify({ planId, organizationId }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    throw error;
  }
};