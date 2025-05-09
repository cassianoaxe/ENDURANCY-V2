import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

interface Affiliate {
  id: number;
  userId: number;
  organizationId: number;
  affiliateCode: string;
  type: 'patient' | 'organization' | 'company' | 'association';
  level: 'beginner' | 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AffiliatePoint {
  id: number;
  affiliateId: number;
  points: number;
  activityType: 'registration' | 'referral_signup' | 'referral_purchase' | 'milestone' | 'bonus' | 'purchase' | 'redemption';
  description: string;
  referenceId?: number;
  createdAt: string;
}

interface AffiliateReferral {
  id: number;
  referrerId: number;
  referredId: number;
  referredUserId: number;
  isActive: boolean;
  createdAt: string;
}

interface AffiliateReward {
  id: number;
  organizationId: number;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  limitedQuantity: boolean;
  quantityAvailable?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AffiliateRedemption {
  id: number;
  affiliateId: number;
  rewardId: number;
  pointsSpent: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  code?: string;
  usedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PromotionalMaterial {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAffiliate() {
  const { toast } = useToast();

  // Buscar dados do afiliado do usuário atual
  const { 
    data: affiliate, 
    isLoading: isLoadingAffiliate, 
    error: affiliateError,
    refetch: refetchAffiliate
  } = useQuery<Affiliate>({ 
    queryKey: ['/api/affiliates/my-affiliate'],
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false, // Evitar solicitações repetidas
    refetchOnReconnect: false, // Não refetch ao reconectar
    retry: 1, // Limitar tentativas de retry
    enabled: true, // Esta query sempre estará habilitada
  });
  
  // Mutação para registrar como afiliado
  const registerAsAffiliate = useMutation<{ affiliateCode: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('/api/affiliates/register', { 
        method: 'POST' 
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Registro de afiliado concluído',
        description: `Você foi registrado como afiliado com sucesso. Seu código de afiliado é ${data.affiliateCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliates/my-affiliate'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar como afiliado',
        description: error.message,
      });
    },
  });

  // Buscar histórico de pontos
  const { 
    data: pointsHistory, 
    isLoading: isLoadingPoints,
    refetch: refetchPoints 
  } = useQuery<AffiliatePoint[]>({ 
    queryKey: ['/api/affiliates/points-history'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!affiliate, // Carrega apenas quando o usuário for um afiliado
  });

  // Buscar referências
  const { 
    data: referrals, 
    isLoading: isLoadingReferrals,
    refetch: refetchReferrals 
  } = useQuery<AffiliateReferral[]>({ 
    queryKey: ['/api/affiliates/referrals'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!affiliate, // Carrega apenas quando o usuário for um afiliado
  });

  // Buscar recompensas disponíveis
  const { 
    data: rewards, 
    isLoading: isLoadingRewards,
    refetch: refetchRewards 
  } = useQuery<AffiliateReward[]>({ 
    queryKey: ['/api/affiliates/rewards'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!affiliate, // Carrega apenas quando o usuário for um afiliado
  });

  // Buscar materiais promocionais
  const { 
    data: materials, 
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials 
  } = useQuery<PromotionalMaterial[]>({ 
    queryKey: ['/api/affiliates/promotional-materials'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!affiliate, // Carrega apenas quando o usuário for um afiliado
  });

  // Mutação para registrar uma referência
  const registerReferral = useMutation<any, Error, { referralCode: string, userId: number }>({
    mutationFn: async (data: { referralCode: string, userId: number }) => {
      const response = await apiRequest('/api/affiliates/register-referral', {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Referência registrada com sucesso',
        description: 'A referência foi registrada e os pontos foram adicionados.',
      });
      // Atualizar os dados após o registro
      refetchAffiliate();
      refetchPoints();
      refetchReferrals();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar referência',
        description: error.message,
      });
    },
  });

  // Mutação para resgatar uma recompensa
  const redeemReward = useMutation<{ code: string }, Error, number>({
    mutationFn: async (rewardId: number) => {
      const response = await apiRequest('/api/affiliates/redeem-reward', {
        method: 'POST',
        data: { rewardId }
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Recompensa resgatada com sucesso',
        description: `Seu código de resgate é: ${data.code}`,
      });
      // Atualizar os dados após o resgate
      refetchAffiliate();
      refetchPoints();
      refetchRewards();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao resgatar recompensa',
        description: error.message,
      });
    },
  });

  // Função para refrescar todos os dados
  const refreshAll = () => {
    // Sempre atualiza os dados do afiliado
    refetchAffiliate();
    
    // Só atualiza os outros dados se o usuário já for um afiliado
    if (affiliate) {
      refetchPoints();
      refetchReferrals();
      refetchRewards();
      refetchMaterials();
    }
  };

  return {
    // Dados
    affiliate,
    pointsHistory,
    referrals,
    rewards,
    materials,
    
    // Estados de carregamento
    isLoadingAffiliate,
    isLoadingPoints,
    isLoadingReferrals,
    isLoadingRewards,
    isLoadingMaterials,
    
    // Funções de mutação
    registerAsAffiliate,
    registerReferral,
    redeemReward,
    
    // Funções auxiliares
    refreshAll,
    
    // Erros
    affiliateError,
  };
}