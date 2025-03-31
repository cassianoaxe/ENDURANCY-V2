import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CheckCheck, CheckCircle, Clock, CreditCard, Hourglass, Package, Plus, ShieldAlert, Slash, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Organization {
  id: number;
  name: string;
  planId: number;
  registrationsCount: number;
  registrationsLimit: number;
  activationDate: string;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  tier: 'free' | 'seed' | 'grow' | 'pro';
  registrationsLimit: number;
  isFeatured: boolean;
  isPopular: boolean;
  features: string[];
}

interface Module {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  isActive: boolean;
  isIncludedInPlan: boolean;
  isAddon: boolean;
}

interface PlanUpgradeRequest {
  organizationId: number;
  currentPlanId: number;
  requestedPlanId: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'negado';
}

interface ModuleRequest {
  id: number;
  organizationId: number;
  moduleId: number;
  action: 'add' | 'remove';
  reason: string;
  status: 'pendente' | 'aprovado' | 'negado';
  createdAt: string;
}

export function PlanDetails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedAction, setSelectedAction] = useState<'add' | 'remove'>('add');
  const [reason, setReason] = useState('');

  // Fetch organization information
  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['/api/organization/current'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/organization/current');
      return response.json();
    },
  });

  // Fetch current plan
  const { data: currentPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['/api/plans/current'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/plans/current');
      return response.json();
    },
  });

  // Fetch available plans
  const { data: availablePlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/plans/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/plans/available');
      return response.json();
    },
  });

  // Fetch active modules
  const { data: activeModules, isLoading: isLoadingActiveModules } = useQuery({
    queryKey: ['/api/modules/active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/modules/active');
      return response.json();
    },
  });

  // Fetch available modules
  const { data: availableModules, isLoading: isLoadingAvailableModules } = useQuery({
    queryKey: ['/api/modules/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/modules/available');
      return response.json();
    },
  });

  // Fetch existing plan upgrade request
  const { data: planUpgradeRequest, isLoading: isLoadingPlanRequest } = useQuery({
    queryKey: ['/api/plan-requests/current'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/plan-requests/current');
        return response.json();
      } catch (error: any) {
        // Se obter erro 404, significa que não há solicitação pendente, o que é normal
        if (error.message.includes('404')) {
          return null;
        }
        toast({
          title: 'Erro ao carregar solicitações de plano',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  // Fetch existing module requests
  const { data: moduleRequests, isLoading: isLoadingModuleRequests } = useQuery({
    queryKey: ['/api/module-requests/current'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/module-requests/current');
        return response.json();
      } catch (error: any) {
        // Se obter erro 404, significa que não há solicitação pendente, o que é normal
        if (error.message.includes('404')) {
          return null;
        }
        toast({
          title: 'Erro ao carregar solicitações de módulos',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  // Submit plan upgrade request
  const planUpgradeMutation = useMutation({
    mutationFn: async (data: { planId: number; reason: string }) => {
      const response = await apiRequest('POST', '/api/plan-requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de mudança de plano foi enviada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plan-requests/current'] });
      setPlanDialogOpen(false);
      setReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar solicitação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit module request
  const moduleRequestMutation = useMutation({
    mutationFn: async (data: { moduleId: number; action: 'add' | 'remove'; reason: string }) => {
      const response = await apiRequest('POST', '/api/module-requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de módulo foi enviada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-requests/current'] });
      setModuleDialogOpen(false);
      setSelectedModule(null);
      setReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar solicitação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle plan change request
  const handlePlanRequest = () => {
    if (!selectedPlan) return;
    
    planUpgradeMutation.mutate({
      planId: selectedPlan.id,
      reason,
    });
  };

  // Handle module request
  const handleModuleRequest = () => {
    if (!selectedModule) return;
    
    moduleRequestMutation.mutate({
      moduleId: selectedModule.id,
      action: selectedAction,
      reason,
    });
  };

  const handleOpenPlanDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setReason('');
    setPlanDialogOpen(true);
  };

  const handleOpenModuleDialog = (module: Module, action: 'add' | 'remove') => {
    setSelectedModule(module);
    setSelectedAction(action);
    setReason('');
    setModuleDialogOpen(true);
  };

  if (isLoadingOrg || isLoadingPlan || isLoadingPlans || isLoadingActiveModules || isLoadingAvailableModules) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const usagePercentage = organization?.registrationsCount 
    ? Math.min(Math.round((organization.registrationsCount / organization.registrationsLimit) * 100), 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seu Plano Atual
            </span>
            {currentPlan?.tier === 'free' && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                Versão Trial
              </Badge>
            )}
            {currentPlan?.tier === 'seed' && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Plano Seed
              </Badge>
            )}
            {currentPlan?.tier === 'grow' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Plano Grow
              </Badge>
            )}
            {currentPlan?.tier === 'pro' && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                Plano Pro
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {currentPlan?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Preço Mensal</h4>
              <p className="text-xl font-bold">
                {currentPlan?.tier === 'free' 
                  ? 'Gratuito' 
                  : `R$ ${currentPlan?.price.toFixed(2)}`}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data de Ativação</h4>
              <p className="text-lg">
                {organization?.activationDate 
                  ? new Date(organization.activationDate).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso de cadastros ({organization?.registrationsCount} de {organization?.registrationsLimit})</span>
              <span>{usagePercentage}%</span>
            </div>
            <Progress value={usagePercentage} className={`h-2 ${usagePercentage > 80 ? 'bg-red-100' : 'bg-gray-100'}`} />
            {usagePercentage > 80 && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Você está se aproximando do limite de cadastros do seu plano.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recursos incluídos</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan?.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentPlan?.tier !== 'pro' && (
            <Button 
              onClick={() => {
                // Filtrar planos que são de nível superior ao atual
                const upgradePlans = availablePlans?.filter((p: Plan) => {
                  if (currentPlan?.tier === 'free') return ['seed', 'grow', 'pro'].includes(p.tier);
                  if (currentPlan?.tier === 'seed') return ['grow', 'pro'].includes(p.tier);
                  if (currentPlan?.tier === 'grow') return ['pro'].includes(p.tier);
                  return false;
                });
                
                if (upgradePlans && upgradePlans.length > 0) {
                  handleOpenPlanDialog(upgradePlans[0]);
                }
              }}
              disabled={!!planUpgradeRequest || planUpgradeMutation.isPending}
              className="w-full"
            >
              {planUpgradeRequest ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Solicitação de upgrade pendente
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Solicitar Upgrade de Plano
                </div>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Available Plans for Upgrade */}
      {currentPlan?.tier !== 'pro' && !planUpgradeRequest && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Planos Disponíveis para Upgrade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans?.filter((plan: Plan) => {
              // Só mostrar planos que são de nível superior ao atual
              if (currentPlan?.tier === 'free') return ['seed', 'grow', 'pro'].includes(plan.tier);
              if (currentPlan?.tier === 'seed') return ['grow', 'pro'].includes(plan.tier);
              if (currentPlan?.tier === 'grow') return ['pro'].includes(plan.tier);
              return false;
            }).map((plan: Plan) => (
              <Card key={plan.id} className={`border ${plan.isPopular ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    {plan.isPopular && (
                      <Badge className="bg-primary">Popular</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-2xl font-bold">R$ {plan.price.toFixed(2)}<span className="text-sm font-normal">/mês</span></p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleOpenPlanDialog(plan)} 
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                  >
                    Solicitar Upgrade
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current active modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Módulos Ativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules?.length === 0 && (
            <p className="text-muted-foreground col-span-full">
              Nenhum módulo adicional ativado. Solicite a ativação de módulos para expandir as funcionalidades.
            </p>
          )}
          
          {activeModules?.map((module: Module) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  {module.isIncludedInPlan ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Incluído no plano
                    </Badge>
                  ) : (
                    <div className="text-lg font-semibold">
                      R$ {module.price.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                    </div>
                  )}
                </p>
              </CardContent>
              {!module.isIncludedInPlan && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => handleOpenModuleDialog(module, 'remove')}
                    disabled={!!moduleRequests?.find((req: ModuleRequest) => req.moduleId === module.id)}
                    className="w-full"
                  >
                    <Slash className="h-4 w-4 mr-2" />
                    Solicitar Cancelamento
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Available modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Módulos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableModules?.length === 0 && (
            <p className="text-muted-foreground col-span-full">
              Nenhum módulo adicional disponível para o seu plano atual.
            </p>
          )}
          
          {availableModules?.map((module: Module) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  R$ {module.price.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenModuleDialog(module, 'add')}
                  disabled={!!moduleRequests?.find((req: ModuleRequest) => req.moduleId === module.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Adição
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Module requests in progress */}
      {moduleRequests && moduleRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Solicitações de Módulos em Andamento</h3>
          <div className="space-y-2">
            {moduleRequests.map((request: ModuleRequest) => {
              const module = [...(activeModules || []), ...(availableModules || [])].find((m: Module) => m.id === request.moduleId);
              return (
                <Card key={request.id} className="border-amber-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{module?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.action === 'add' ? 'Adição solicitada' : 'Cancelamento solicitado'} em {new Date(request.createdAt!).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                        <Hourglass className="h-3 w-3" />
                        Pendente
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan upgrade request dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Upgrade de Plano</DialogTitle>
            <DialogDescription>
              Você está solicitando upgrade para o plano {selectedPlan?.name}. 
              Esta solicitação será revisada pela administração.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h4 className="font-medium">Detalhes do Plano</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Preço Mensal</p>
                  <p className="font-medium">R$ {selectedPlan?.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cadastros</p>
                  <p className="font-medium">Até {selectedPlan?.registrationsLimit}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recursos</h4>
              <ScrollArea className="h-32 border rounded-md p-2">
                <ul className="space-y-2">
                  {selectedPlan?.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Motivo da Solicitação</h4>
              <Textarea 
                placeholder="Explique o motivo da solicitação de upgrade..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePlanRequest} 
              disabled={!reason.trim() || planUpgradeMutation.isPending}
            >
              {planUpgradeMutation.isPending ? (
                <><span className="animate-spin mr-2">⋯</span> Enviando...</>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module request dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === 'add' ? 'Solicitar Adição de Módulo' : 'Solicitar Cancelamento de Módulo'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === 'add' 
                ? `Você está solicitando a adição do módulo ${selectedModule?.name}. Esta solicitação será revisada pela administração.`
                : `Você está solicitando o cancelamento do módulo ${selectedModule?.name}. Esta solicitação será revisada pela administração.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h4 className="font-medium">Detalhes do Módulo</h4>
              <div>
                <p className="text-sm text-muted-foreground">Preço Mensal</p>
                <p className="font-medium">R$ {selectedModule?.price.toFixed(2)}</p>
              </div>
              <p className="text-sm">{selectedModule?.description}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Motivo da Solicitação</h4>
              <Textarea 
                placeholder={selectedAction === 'add' 
                  ? "Explique o motivo da solicitação de adição..." 
                  : "Explique o motivo da solicitação de cancelamento..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleModuleRequest} 
              disabled={!reason.trim() || moduleRequestMutation.isPending}
              variant={selectedAction === 'add' ? 'default' : 'destructive'}
            >
              {moduleRequestMutation.isPending ? (
                <><span className="animate-spin mr-2">⋯</span> Enviando...</>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}