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
  });

  // Buscar histórico de pontos
  const { 
    data: pointsHistory, 
    isLoading: isLoadingPoints,
    refetch: refetchPoints 
  } = useQuery<AffiliatePoint[]>({ 
    queryKey: ['/api/affiliates/my-points'],
    staleTime: 5 * 60 * 1000,
  });

  // Buscar referências
  const { 
    data: referrals, 
    isLoading: isLoadingReferrals,
    refetch: refetchReferrals 
  } = useQuery<AffiliateReferral[]>({ 
    queryKey: ['/api/affiliates/my-referrals'],
    staleTime: 5 * 60 * 1000,
  });

  // Buscar recompensas disponíveis
  const { 
    data: rewards, 
    isLoading: isLoadingRewards,
    refetch: refetchRewards 
  } = useQuery<AffiliateReward[]>({ 
    queryKey: ['/api/affiliates/rewards'],
    staleTime: 5 * 60 * 1000,
  });

  // Buscar materiais promocionais
  const { 
    data: materials, 
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials 
  } = useQuery<PromotionalMaterial[]>({ 
    queryKey: ['/api/affiliates/promotional-materials'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutação para registrar uma referência
  const registerReferral = useMutation({
    mutationFn: async (data: { referralCode: string, userId: number }) => {
      const response = await apiRequest('POST', '/api/affiliates/register-referral', data);
      return response.json();
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
    onError: (error) => {
      toast({
        title: 'Erro ao registrar referência',
        description: error.message,
      });
    },
  });

  // Mutação para resgatar uma recompensa
  const redeemReward = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await apiRequest('POST', '/api/affiliates/redeem-reward', { rewardId });
      return response.json();
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
    onError: (error) => {
      toast({
        title: 'Erro ao resgatar recompensa',
        description: error.message,
      });
    },
  });

  // Função para refrescar todos os dados
  const refreshAll = () => {
    refetchAffiliate();
    refetchPoints();
    refetchReferrals();
    refetchRewards();
    refetchMaterials();
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
    registerReferral,
    redeemReward,
    
    // Funções auxiliares
    refreshAll,
    
    // Erros
    affiliateError,
  };
}