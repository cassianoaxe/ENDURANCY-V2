import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Leaf, LineChart, Heart, Briefcase, Scale, Eye, Brain, Layers, Plus, ArrowUpDown, CreditCard } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

// Tipagem dos módulos e planos
interface Module {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  slug: string;
  is_active: boolean;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ModulePlan {
  id: number;
  module_id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  max_users: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

interface OrganizationModule {
  id: number;
  organizationId: number;
  moduleId: number;
  planId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Função auxiliar para renderizar ícones
const getModuleIcon = (iconName: string, className: string = "") => {
  switch (iconName) {
    case 'Leaf': return <Leaf className={className} />;
    case 'LineChart': return <LineChart className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Layers': return <Layers className={className} />;
    default: return <ShoppingCart className={className} />;
  }
};

export default function UserModules() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [selectedModulePlan, setSelectedModulePlan] = useState<{moduleId: number, planId: number} | null>(null);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedOrgModule, setSelectedOrgModule] = useState<OrganizationModule | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Consulta para buscar os módulos da organização do usuário
  const { data: organizationModules = [], isLoading: isLoadingOrgModules } = useQuery<OrganizationModule[]>({
    queryKey: ['/api/organization-modules', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await fetch(`/api/organization-modules/${user.organizationId}`);
      if (!response.ok) throw new Error('Falha ao carregar módulos da organização');
      return response.json();
    },
    enabled: !!user?.organizationId
  });

  // Consulta para buscar todos os módulos disponíveis
  const { data: allModules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules');
      if (!response.ok) throw new Error('Falha ao carregar módulos');
      return response.json();
    }
  });

  // Consulta para buscar todos os planos de módulos
  const { data: modulePlans = [], isLoading: isLoadingPlans } = useQuery<ModulePlan[]>({
    queryKey: ['/api/module-plans'],
    queryFn: async () => {
      const response = await fetch('/api/module-plans');
      if (!response.ok) throw new Error('Falha ao carregar planos');
      return response.json();
    }
  });

  // Mutação para ativar/desativar um módulo da organização
  const toggleModuleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const response = await fetch(`/api/organization-modules/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar status do módulo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules', user?.organizationId] });
      toast({
        title: 'Módulo atualizado',
        description: 'O status do módulo foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutação para atualizar o plano de um módulo
  const updateModulePlanMutation = useMutation({
    mutationFn: async ({ id, planId }: { id: number, planId: number }) => {
      const response = await fetch(`/api/organization-modules/${id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar plano do módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules', user?.organizationId] });
      setChangePlanDialogOpen(false);
      setSelectedOrgModule(null);
      setSelectedPlanId(null);
      toast({
        title: 'Plano atualizado',
        description: 'O plano do módulo foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para adicionar um módulo à organização
  const addOrganizationModuleMutation = useMutation({
    mutationFn: async (data: { organizationId: number, moduleId: number, planId: number }) => {
      const response = await fetch('/api/organization-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules', user?.organizationId] });
      setIsAddModuleDialogOpen(false);
      setSelectedModulePlan(null);
      toast({
        title: 'Módulo adicionado',
        description: 'O módulo foi adicionado à sua organização com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Filtrar módulos disponíveis para adicionar (status "active" e que ainda não estão na organização)
  const availableModules = allModules.filter(module => 
    module.status === 'active' && 
    module.is_active && 
    !organizationModules.some(om => om.moduleId === module.id)
  );

  // Filtrar módulos da organização com base na tab ativa
  const filteredOrgModules = organizationModules.filter(orgModule => {
    const module = allModules.find(m => m.id === orgModule.moduleId);
    if (!module) return false;
    
    if (activeTab === 'todos') return true;
    if (activeTab === 'ativos') return orgModule.active;
    if (activeTab === 'inativos') return !orgModule.active;
    return true;
  });

  // Obter detalhes de um módulo pelo ID
  const getModuleDetails = (moduleId: number) => {
    return allModules.find(module => module.id === moduleId);
  };

  // Obter detalhes de um plano pelo ID
  const getPlanDetails = (planId: number) => {
    return modulePlans.find(plan => plan.id === planId);
  };

  // Agrupar planos por módulo
  const getPlansByModuleId = (moduleId: number) => {
    return modulePlans.filter(plan => plan.module_id === moduleId);
  };

  // Adicionar um novo módulo à organização
  const handleAddModule = () => {
    if (!selectedModulePlan || !user?.organizationId) return;
    
    addOrganizationModuleMutation.mutate({
      organizationId: user.organizationId,
      moduleId: selectedModulePlan.moduleId,
      planId: selectedModulePlan.planId
    });
  };
  
  // Atualizar o plano de um módulo
  const handleUpdatePlan = () => {
    if (!selectedOrgModule || !selectedPlanId) return;
    
    updateModulePlanMutation.mutate({
      id: selectedOrgModule.id,
      planId: selectedPlanId
    });
  };
  
  // Abrir o diálogo de alteração de plano
  const openChangePlanDialog = (orgModule: OrganizationModule) => {
    setSelectedOrgModule(orgModule);
    setSelectedPlanId(orgModule.planId);
    setChangePlanDialogOpen(true);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Módulos da Organização</h1>
        <p className="text-gray-600 mb-6">Gerencie os módulos ativos em sua organização.</p>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <CardTitle>Módulos da Organização</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddModuleDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </div>
              
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativos">Ativos</TabsTrigger>
                  <TabsTrigger value="inativos">Inativos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingOrgModules || isLoadingModules || isLoadingPlans ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrgModules.map((orgModule) => {
                  const module = getModuleDetails(orgModule.moduleId);
                  const plan = getPlanDetails(orgModule.planId);
                  
                  if (!module || !plan) return null;
                  
                  // Definir cor de borda baseada no status do módulo
                  const getBorderColor = () => {
                    if (!orgModule.active) return 'border-t-gray-300';
                    return 'border-t-green-500';
                  };
                  
                  return (
                    <Card key={orgModule.id} className={`overflow-hidden border-t-4 ${getBorderColor()}`}>
                      <CardHeader className="relative pb-2">
                        <div className="absolute right-4 top-4">
                          <Switch 
                            id={`module-status-${orgModule.id}`}
                            checked={orgModule.active} 
                            onCheckedChange={(active) => toggleModuleStatusMutation.mutate({ id: orgModule.id, active })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {getModuleIcon(module.icon_name, "h-6 w-6 text-primary")}
                          <CardTitle>{module.name}</CardTitle>
                        </div>
                        
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </CardHeader>
                      
                      <Separator />
                      
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-sm mb-3">Plano atual:</h3>
                        <div className="p-3 bg-muted rounded">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {plan.max_users} usuários
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">R$ {Number(plan.price).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">/{plan.billing_cycle}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="font-semibold text-sm mb-1">Status:</h3>
                          <p>{orgModule.active ? 'Ativo' : 'Inativo'}</p>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="font-semibold text-sm mb-1">Adicionado em:</h3>
                          <p className="text-sm">
                            {new Date(orgModule.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => openChangePlanDialog(orgModule)}
                        >
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Alterar Plano
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {filteredOrgModules.length === 0 && !isLoadingOrgModules && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-lg text-muted-foreground">Nenhum módulo encontrado nesta categoria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddModuleDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Módulo
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo para adicionar módulo à organização */}
      <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Módulo à Organização</DialogTitle>
            <DialogDescription>
              Escolha um módulo disponível e um plano para adicionar à sua organização.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Módulos Disponíveis</h3>
            
            {availableModules.length === 0 ? (
              <p className="text-muted-foreground">Não há módulos disponíveis para adicionar.</p>
            ) : (
              <div className="grid gap-4">
                {availableModules.map(module => {
                  const modulePlans = getPlansByModuleId(module.id);
                  
                  return (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getModuleIcon(module.icon_name, "h-5 w-5 text-primary")}
                        <h4 className="font-medium">{module.name}</h4>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                      
                      <h5 className="text-sm font-medium mb-2">Planos disponíveis:</h5>
                      <div className="space-y-2">
                        {modulePlans.map(plan => (
                          <div 
                            key={plan.id} 
                            className={`p-3 rounded border cursor-pointer ${
                              selectedModulePlan?.moduleId === module.id && selectedModulePlan?.planId === plan.id ? 
                              'border-primary bg-primary/5' : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedModulePlan({ moduleId: module.id, planId: plan.id })}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">Até {plan.max_users} usuários</p>
                              </div>
                              <div className="text-right">
                                <p>R$ {Number(plan.price).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">/{plan.billing_cycle}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModuleDialogOpen(false);
                setSelectedModulePlan(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddModule}
              disabled={addOrganizationModuleMutation.isPending || !selectedModulePlan}
            >
              {addOrganizationModuleMutation.isPending ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                  Adicionando...
                </div> 
                : 'Adicionar Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para alterar o plano de um módulo */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Alterar Plano do Módulo</DialogTitle>
            <DialogDescription>
              Escolha um novo plano para este módulo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedOrgModule && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    {getModuleDetails(selectedOrgModule.moduleId)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getModuleDetails(selectedOrgModule.moduleId)?.description}
                  </p>
                </div>
                
                <h4 className="text-sm font-medium mb-3">Selecione um plano:</h4>
                
                <RadioGroup 
                  value={selectedPlanId?.toString()} 
                  onValueChange={(value) => setSelectedPlanId(Number(value))}
                  className="space-y-3"
                >
                  {getPlansByModuleId(selectedOrgModule.moduleId).map((plan) => (
                    <div 
                      key={plan.id}
                      className={`flex items-start p-3 rounded border ${selectedPlanId === plan.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <RadioGroupItem id={`plan-${plan.id}`} value={plan.id.toString()} className="mt-1" />
                      <div className="ml-3 flex-1">
                        <Label 
                          htmlFor={`plan-${plan.id}`} 
                          className="flex w-full justify-between cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">
                              {plan.name}
                              {plan.is_popular && (
                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Popular</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">Até {plan.max_users} usuários</p>
                            {plan.features?.length > 0 && (
                              <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="text-right whitespace-nowrap pl-4">
                            <p className="font-bold">R$ {Number(plan.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">/{plan.billing_cycle}</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">Informação de pagamento</p>
                      <p className="text-sm text-yellow-700">
                        A alteração de plano resultará em uma cobrança pro-rata na próxima fatura.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setChangePlanDialogOpen(false);
                setSelectedOrgModule(null);
                setSelectedPlanId(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdatePlan}
              disabled={updateModulePlanMutation.isPending || !selectedPlanId || selectedPlanId === selectedOrgModule?.planId}
            >
              {updateModulePlanMutation.isPending ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                  Atualizando...
                </div> 
                : 'Atualizar Plano'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}