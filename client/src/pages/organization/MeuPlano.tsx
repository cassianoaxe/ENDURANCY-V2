import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, CreditCard, Shield, Gift, ArrowRight, Package, ArrowUpRight, Leaf, BarChart, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Plan, Module, ModulePlan, Organization } from '@shared/schema';

export default function MeuPlano() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  // Referências para os botões de fechar diálogo
  const closeChangePlanDialogRef = useRef<HTMLButtonElement>(null);
  const closeAddModuleDialogRef = useRef<HTMLButtonElement>(null);

  // Buscar informações da organização atual
  const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations/current'],
    enabled: !!user,
  });

  // Buscar detalhes do plano atual
  const { data: currentPlan, isLoading: isPlanLoading } = useQuery<Plan>({
    queryKey: ['/api/plans', organization?.planId],
    enabled: !!organization?.planId,
  });

  // Buscar todos os planos disponíveis
  const { data: availablePlans, isLoading: isPlansLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    enabled: !!user,
  });

  // Buscar módulos ativos da organização
  const { data: activeModules, isLoading: isModulesLoading } = useQuery<Module[]>({
    queryKey: ['/api/organizations/modules/active'],
    enabled: !!user && !!user.organizationId,
  });

  // Buscar módulos disponíveis
  const { data: availableModules, isLoading: isAvailableModulesLoading } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    enabled: !!user,
  });

  // Mutação para solicitar troca de plano (envia para aprovação do administrador)
  const requestPlanChangeMutation = useMutation({
    mutationFn: async (planId: number) => {
      try {
        console.log("Enviando solicitação de mudança de plano para:", planId);
        
        // Adicionar mais logs para debug
        console.log("Detalhes da requisição:", {
          url: '/api/plan-change-requests',
          método: 'POST',
          corpo: { planId },
          usuário: user
        });
        
        const res = await apiRequest('POST', '/api/plan-change-requests', { planId });
        
        // Verificar resposta completa para debug
        console.log("Status da resposta:", res.status);
        console.log("Headers da resposta:", Object.fromEntries([...res.headers.entries()]));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Erro na resposta:", errorText);
          throw new Error(errorText || 'Erro ao solicitar mudança de plano');
        }
        
        // Tentar fazer parse da resposta com tratamento de erro - clone a resposta para evitar erros
        const clonedRes = res.clone();
        try {
          const text = await clonedRes.text();
          console.log("Resposta raw:", text);
          return text ? JSON.parse(text) : { success: true };
        } catch (parseError) {
          console.error("Erro ao parsear resposta JSON:", parseError);
          return { success: true }; // Retornar objeto básico em caso de erro de parse
        }
      } catch (error) {
        console.error("Erro na solicitação de plano:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Solicitação de mudança de plano enviada com sucesso:", data);
      
      // Mostrar mensagem de sucesso
      toast({
        title: 'Solicitação enviada com sucesso',
        description: 'Sua solicitação de mudança de plano foi enviada e está aguardando aprovação do administrador.',
        variant: 'default',
      });
      
      // Atualizar dados do usuário/organização
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/current'] });
      
      // Fechar o diálogo explicitamente usando timeout para garantir que a UI atualize
      setTimeout(() => {
        setShowChangePlanDialog(false);
        setIsUpgrading(false);
      }, 300);
    },
    onError: (error: any) => {
      console.error("Erro ao solicitar mudança de plano:", error);
      setIsUpgrading(false);
      
      // Obter mensagem de erro mais específica
      const errorMsg = error.message || 'Não foi possível completar a operação. Tente novamente mais tarde.';
      
      toast({
        title: 'Erro ao solicitar mudança de plano',
        description: errorMsg,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Garantir que, independentemente do resultado, o estado de loading seja limpo
      setIsUpgrading(false);
    }
  });
  
  // Mantendo a mutação original para compatibilidade (usado para planos gratuitos que não precisam de aprovação)
  const changePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest('POST', '/api/organizations/change-plan', { planId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      
      // Fechar a dialog com timeout para garantir que o usuário veja a mensagem
      setTimeout(() => {
        if (closeChangePlanDialogRef.current) {
          closeChangePlanDialogRef.current.click();
        }
        setShowChangePlanDialog(false);
      }, 500);
      
      toast({
        title: 'Plano atualizado com sucesso',
        description: 'Seu novo plano foi ativado na sua organização.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao trocar de plano',
        description: error.message || 'Não foi possível completar a operação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  // Iniciar processo de troca de plano
  const handlePlanChange = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowChangePlanDialog(true);
  };

  // Confirmar troca de plano (checkout)
  const confirmPlanChange = () => {
    if (!selectedPlan) return;
    
    setIsUpgrading(true);
    
    // Se o plano for gratuito, fazer troca direta
    if (selectedPlan.price === "0.00" || parseFloat(selectedPlan.price.toString()) === 0) {
      changePlanMutation.mutate(selectedPlan.id);
      return;
    }
    
    // Verificar se é upgrade ou downgrade para fins de logging
    const changeType = determinePlanChangeType(organization?.planTier || null, selectedPlan.tier);
    console.log(`Enviando solicitação de ${changeType === 'upgrade' ? 'upgrade' : 'downgrade'} para o plano:`, selectedPlan.id);
    
    // Para planos pagos, enviar solicitação para aprovação do administrador
    requestPlanChangeMutation.mutate(selectedPlan.id);
  };

  // Inicia processo de adição de módulo
  const handleAddModule = (module: Module) => {
    setSelectedModule(module);
    setShowAddModuleDialog(true);
  };

  // Confirma adição de módulo (checkout)
  const confirmAddModule = () => {
    if (!selectedModule) return;
    
    // Fechar manualmente o diálogo usando a referência do botão
    if (closeAddModuleDialogRef.current) {
      closeAddModuleDialogRef.current.click();
    }
    setShowAddModuleDialog(false);
    
    // Pequeno delay para garantir que o diálogo foi fechado antes de redirecionar
    setTimeout(() => {
      // Redirecionar para checkout com o módulo selecionado
      // Adicionar parâmetro indicando solicitação de mudança de módulo para o painel administrativo
      navigate(`/checkout?type=module&moduleId=${selectedModule.id}&organizationId=${user?.organizationId}&returnUrl=/login&changeRequest=true`);
    }, 300);
  };

  const isLoading = isOrgLoading || isPlanLoading || isPlansLoading || isModulesLoading || isAvailableModulesLoading;

  // Filtrar módulos disponíveis que não estão ativos
  const getAvailableModules = () => {
    if (!availableModules || !activeModules) return [];
    
    // Obter IDs dos módulos ativos
    const activeModuleIds = activeModules.map(m => m.id);
    
    // Filtrar para obter apenas módulos que podem ser adicionados
    return availableModules.filter(m => !activeModuleIds.includes(m.id) && m.is_active);
  };
  
  // Filtrar para mostrar apenas os planos específicos solicitados (Freemium, Seed, Grow, Pro)
  const getFilteredPlans = () => {
    if (!availablePlans) return [];
    
    // Filtrar apenas os planos solicitados
    return availablePlans.filter(plan => 
      ['free', 'seed', 'grow', 'pro'].includes(plan.tier)
    ).sort((a, b) => getPlanLevel(a.tier) - getPlanLevel(b.tier));
  };

  // Obter o nível do plano para comparação
  const getPlanLevel = (planTier: string): number => {
    const tierLevels: { [key: string]: number } = {
      'free': 1,
      'seed': 2,
      'grow': 3,
      'pro': 4
    };
    return tierLevels[planTier] || 1;
  };

  // Determinar se é upgrade, downgrade ou plano atual
  const determinePlanChangeType = (currentPlanTier: string | null, requestedPlanTier: string): 'upgrade' | 'downgrade' | 'same' => {
    if (!currentPlanTier) return 'upgrade'; // Se não tem plano atual, qualquer plano é upgrade
    
    const currentLevel = getPlanLevel(currentPlanTier);
    const requestedLevel = getPlanLevel(requestedPlanTier);
    
    // Se o plano atual é Pro (nível 4), todos os outros são downgrades
    if (currentPlanTier === 'pro' && requestedPlanTier !== 'pro') {
      return 'downgrade';
    }
    
    if (requestedLevel > currentLevel) return 'upgrade';
    if (requestedLevel < currentLevel) return 'downgrade';
    return 'same';
  };
  
  // Verificar se o plano atual é o mais alto (Pro)
  const isHighestPlan = (): boolean => {
    if (!organization?.planTier) return false;
    // "Pro" é o plano mais alto, qualquer organização com esse plano não pode fazer upgrade
    return organization.planTier === 'pro';
  };

  // Formatar preço
  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericPrice);
  };

  if (isLoading) {
    return (
      <OrganizationLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando informações do plano...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div className="container px-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e6f7e6] rounded-lg">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Meu Plano</h1>
              <p className="text-gray-500">Gerencie seu plano atual e adicione novos módulos para expandir suas funcionalidades.</p>
            </div>
          </div>
        </div>

        {/* Seção do Plano Atual */}
        <Card className="mb-8 border border-green-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Plano Atual: {currentPlan?.name || 'Plano Padrão'}</CardTitle>
                <CardDescription className="mt-1">
                  {currentPlan?.description || 'Seu plano padrão da plataforma Endurancy'}
                </CardDescription>
              </div>
              <Badge className={`text-sm py-1 px-3 
                ${currentPlan?.tier === 'free' ? 'bg-gray-100 text-gray-700' : 
                currentPlan?.tier === 'seed' ? 'bg-green-100 text-green-700' : 
                currentPlan?.tier === 'grow' ? 'bg-blue-100 text-blue-700' : 
                'bg-purple-100 text-purple-700'}`}
              >
                {currentPlan?.tier === 'free' ? 'Gratuito' : 
                 currentPlan?.tier === 'seed' ? 'Seed' : 
                 currentPlan?.tier === 'grow' ? 'Grow' : 'Pro'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Detalhes do Plano</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Preço mensal</span>
                    <span className="text-sm font-medium">{formatPrice(currentPlan?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Limite de cadastros</span>
                    <span className="text-sm font-medium">{currentPlan?.maxRecords || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Período de teste</span>
                    <span className="text-sm font-medium">{currentPlan?.trialDays || 0} dias</span>
                  </div>
                </div>
                
                {/* Status de solicitação de plano */}
                {organization?.requestedPlanId && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Solicitação pendente</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          Você solicitou mudança para o plano {organization.requestedPlanName || 'novo'}.
                          Aguardando aprovação do administrador.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <h3 className="text-sm font-medium">Recursos Inclusos</h3>
                <div className="grid md:grid-cols-2 gap-y-2">
                  {currentPlan?.features && Array.isArray(currentPlan.features) && 
                    currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                </div>
                
                {/* Histórico de Planos */}
                {organization?.planHistory && organization.planHistory.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Histórico de Alterações de Plano</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {organization.planHistory.map((history, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                {new Date(history.changeDate).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {history.previousPlanName || 'N/A'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {history.changeType === 'rejected' ? history.requestedPlanName : currentPlan?.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <Badge className={`text-xs ${
                                  history.changeType === 'upgrade' ? 'bg-green-100 text-green-700' : 
                                  history.changeType === 'downgrade' ? 'bg-yellow-100 text-yellow-700' : 
                                  history.changeType === 'rejected' ? 'bg-red-100 text-red-700' : 
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {history.changeType === 'upgrade' ? 'Upgrade' : 
                                   history.changeType === 'downgrade' ? 'Downgrade' : 
                                   history.changeType === 'rejected' ? 'Rejeitado' : 
                                   'Mudança'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium mb-1">Deseja mudar seu plano?</h3>
                <p className="text-sm text-gray-500">Faça upgrade para um plano com mais recursos ou faça downgrade se precisar.</p>
              </div>
              <Button onClick={() => window.location.hash = 'planos'} className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Ver Todos os Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Módulos Ativos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Módulos Ativos</CardTitle>
            <CardDescription>Módulos disponíveis na sua organização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeModules && activeModules.length > 0 ? (
                activeModules.map((module) => (
                  <Card key={module.id} className="border overflow-hidden bg-gray-50">
                    <CardHeader className="p-4 pb-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            {module.icon_name === 'Leaf' ? (
                              <Leaf className="h-4 w-4 text-primary" />
                            ) : (
                              <Package className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Nenhum módulo adicional ativo</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Seu plano inclui os módulos básicos. Adicione novos módulos para expandir as funcionalidades da sua organização.
                  </p>
                  <Button className="mt-4" onClick={() => window.location.hash = 'modulos'}>
                    Ver Módulos Disponíveis
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Abas de Planos e Módulos */}
        <div id="planos">
          <Tabs defaultValue="planos" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="planos">Todos os Planos</TabsTrigger>
              <TabsTrigger value="modulos" id="modulos">Módulos Adicionais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="planos">
              <h2 className="text-xl font-bold mb-6">Planos Disponíveis</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {availablePlans ? getFilteredPlans()
                  .map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`border overflow-hidden hover:shadow-md transition-all ${
                        plan.id === organization?.planId ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardHeader className={`
                        p-6 pb-4
                        ${plan.tier === 'free' ? 'bg-gray-50' : 
                        plan.tier === 'seed' ? 'bg-green-50' : 
                        plan.tier === 'grow' ? 'bg-blue-50' : 
                        'bg-purple-50'}
                      `}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                          </div>
                          <Badge className={`
                            ${plan.tier === 'free' ? 'bg-gray-100 text-gray-700' : 
                            plan.tier === 'seed' ? 'bg-green-100 text-green-700' : 
                            plan.tier === 'grow' ? 'bg-blue-100 text-blue-700' : 
                            'bg-purple-100 text-purple-700'}
                          `}>
                            {plan.tier === 'free' ? 'Gratuito' : 
                            plan.tier === 'seed' ? 'Seed' : 
                            plan.tier === 'grow' ? 'Grow' : 'Pro'}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="text-3xl font-bold">
                            {formatPrice(plan.price)}
                            <span className="text-sm font-normal text-gray-500">/mês</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Limite de {plan.maxRecords} cadastros</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {plan.features && Array.isArray(plan.features) && 
                            plan.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button 
                          className="w-full"
                          variant={plan.id === organization?.planId ? "outline" : organization?.requestedPlanId === plan.id ? "secondary" : "default"}
                          disabled={
                            changePlanMutation.isPending || 
                            plan.id === organization?.planId || 
                            organization?.requestedPlanId === plan.id || // Desativar se já existe uma solicitação para este plano
                            // Quando o plano atual é PRO, desativar todas as opções de upgrade
                            (organization?.planTier === 'pro' && getPlanLevel(plan.tier) <= getPlanLevel('pro')) ||
                            // Desabilitar opções de downgrade quando já estiver no plano free
                            (organization?.planTier === 'free' && getPlanLevel(plan.tier) <= getPlanLevel('free'))
                          }
                          onClick={() => handlePlanChange(plan)}
                        >
                          {plan.id === organization?.planId ? (
                            'Plano Atual'
                          ) : organization?.requestedPlanId === plan.id ? (
                            <>
                              <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                              Solicitação em Aprovação
                            </>
                          ) : (
                            <>
                              {changePlanMutation.isPending && plan.id === selectedPlan?.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Alterando...
                                </>
                              ) : (
                                // Se o plano atual é PRO, todos os outros planos são downgrade
                                organization?.planTier === 'pro' && plan.tier !== 'pro' ? 
                                'Fazer Downgrade' : 
                                // Caso contrário, verificar normalmente
                                determinePlanChangeType(organization?.planTier || null, plan.tier) === 'downgrade' ? 
                                'Fazer Downgrade' : 'Fazer Upgrade'
                              )}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                : (
                  <div className="col-span-full py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-gray-500">Carregando planos disponíveis...</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="modulos">
              <h2 className="text-xl font-bold mb-6">Módulos Adicionais</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {getAvailableModules().length > 0 ? (
                  getAvailableModules().map((module) => (
                    <Card key={module.id} className="border overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            {module.icon_name === 'Leaf' ? (
                              <Leaf className="h-5 w-5 text-primary" />
                            ) : module.icon_name === 'BarChart' ? (
                              <BarChart className="h-5 w-5 text-primary" />
                            ) : (
                              <Package className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.name}</CardTitle>
                            <CardDescription className="mt-0.5">Módulo adicional</CardDescription>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </CardHeader>
                      <CardContent className="p-6 pt-1">
                        <div className="flex items-center justify-between py-3 border-t border-b">
                          <span className="text-sm font-medium">Preço mensal</span>
                          <span className="font-bold">R$ 99,00</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button 
                          className="w-full"
                          onClick={() => handleAddModule(module)}
                        >
                          Adicionar Módulo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Todos os módulos disponíveis já estão ativos</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Sua organização já possui todos os módulos disponíveis ativados.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialog de Confirmação de Troca de Plano */}
        <Dialog open={showChangePlanDialog} onOpenChange={(isOpen) => {
          // Só permite fechar o diálogo se não estiver em processamento
          if (!requestPlanChangeMutation.isPending && !changePlanMutation.isPending) {
            setShowChangePlanDialog(isOpen);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Mudança de Plano</DialogTitle>
              <DialogDescription>
                Você está prestes a alterar seu plano atual para o plano {selectedPlan?.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedPlan?.name}</p>
                    <p className="text-sm text-gray-500">{selectedPlan?.description}</p>
                  </div>
                </div>
                <p className="font-bold">{selectedPlan ? formatPrice(selectedPlan.price) : ''}/mês</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">O que acontece ao trocar de plano:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>A solicitação de mudança será enviada para o administrador aprovar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Após aprovação, você terá acesso aos recursos do novo plano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Valores serão ajustados na sua próxima fatura</span>
                  </li>
                </ul>
              </div>
              
              {/* Informativo para planos pagos */}
              {parseFloat(selectedPlan?.price.toString() || "0") > 0 && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Importante</span>
                  </div>
                  <p className="mt-1 text-yellow-700">
                    Sua solicitação de alteração ficará pendente até que seja aprovada pelo administrador do sistema.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                disabled={requestPlanChangeMutation.isPending || changePlanMutation.isPending}
                onClick={() => setShowChangePlanDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmPlanChange}
                disabled={requestPlanChangeMutation.isPending || changePlanMutation.isPending}
                className="gap-2"
              >
                {requestPlanChangeMutation.isPending || changePlanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Confirmar Mudança
                  </>
                )}
              </Button>
            </DialogFooter>
            
            {/* Botão de fechar para referência, não visível mas acessível por ref */}
            <DialogClose ref={closeChangePlanDialogRef} className="hidden" />
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Adição de Módulo */}
        <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Módulo</DialogTitle>
              <DialogDescription>
                Você está prestes a adicionar o módulo {selectedModule?.name} à sua organização.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedModule?.name}</p>
                    <p className="text-sm text-gray-500">{selectedModule?.description}</p>
                  </div>
                </div>
                <p className="font-bold">R$ 99,00/mês</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Benefícios deste módulo:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Gift className="h-4 w-4 text-primary mt-0.5" />
                    <span>Funcionalidades adicionais específicas para sua organização</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="h-4 w-4 text-primary mt-0.5" />
                    <span>Acesso imediato após a confirmação do pagamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="h-4 w-4 text-primary mt-0.5" />
                    <span>Suporte prioritário para questões relacionadas ao módulo</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg bg-yellow-50 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Importante</span>
                </div>
                <p className="mt-1 text-yellow-700">
                  Sua solicitação de adição de módulo ficará pendente até que seja aprovada pelo administrador do sistema.
                </p>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setShowAddModuleDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmAddModule}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Prosseguir para Pagamento
              </Button>
            </DialogFooter>
            
            {/* Botão de fechar oculto para referência */}
            <DialogClose ref={closeAddModuleDialogRef} className="hidden" />
          </DialogContent>
        </Dialog>
      </div>
    </OrganizationLayout>
  );
}