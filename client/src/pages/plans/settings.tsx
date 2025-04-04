import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plan, Module, PlanModule } from "@shared/schema";

import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Plus,
  Edit,
  ArrowLeft,
  X,
  PlusCircle,
  Trash,
  Package,
  Grid3X3,
  AlertCircle,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlanSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("modules");
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);

  // Buscar todos os planos
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  // Buscar todos os módulos
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
  });

  // Buscar todas as relações entre módulos e planos
  const { data: planModules = [], isLoading: isLoadingPlanModules } = useQuery<PlanModule[]>({
    queryKey: ['/api/plan-modules'],
  });

  const getAvailableModules = (planId: number) => {
    // Obter IDs dos módulos que já estão associados a este plano
    const assignedModuleIds = planModules
      .filter(mp => mp.plan_id === planId)
      .map(mp => mp.module_id);

    // Retornar módulos que não estão na lista de associados
    return modules.filter(module => !assignedModuleIds.includes(module.id));
  };

  const getAssignedModules = (planId: number) => {
    // Obter IDs dos módulos que estão associados a este plano
    const assignedModuleIds = planModules
      .filter(mp => mp.plan_id === planId)
      .map(mp => mp.module_id);

    // Retornar módulos que estão na lista de associados
    return modules.filter(module => assignedModuleIds.includes(module.id));
  };

  // Mutation para adicionar um módulo a um plano
  const addModuleToPlanMutation = useMutation({
    mutationFn: async ({ planId, moduleId }: { planId: number, moduleId: number }) => {
      const response = await fetch(`/api/plan-modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan_id: planId, 
          module_id: moduleId,
          name: `${planId}-${moduleId}`,
          description: "Relação plano-módulo"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar módulo ao plano');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-modules'] });
      setIsAddModuleDialogOpen(false);
      toast({
        title: "Módulo adicionado",
        description: "O módulo foi adicionado ao plano com sucesso.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para remover um módulo de um plano
  const removeModuleFromPlanMutation = useMutation({
    mutationFn: async ({ planId, moduleId }: { planId: number, moduleId: number }) => {
      // Encontrar o ID da relação entre o plano e o módulo
      const planModuleRelation = planModules.find(
        mp => mp.plan_id === planId && mp.module_id === moduleId
      );
      
      if (!planModuleRelation) {
        throw new Error('Relação plano-módulo não encontrada');
      }

      const response = await fetch(`/api/plan-modules/${planModuleRelation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover módulo do plano');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-modules'] });
      toast({
        title: "Módulo removido",
        description: "O módulo foi removido do plano com sucesso.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddModuleToPlan = (planId: number, moduleId: number) => {
    addModuleToPlanMutation.mutate({ planId, moduleId });
  };

  const handleRemoveModuleFromPlan = (planId: number, moduleId: number) => {
    removeModuleFromPlanMutation.mutate({ planId, moduleId });
  };

  const tierToLabel = (tier: string) => {
    switch (tier) {
      case 'free': return 'Freemium';
      case 'seed': return 'Seed';
      case 'grow': return 'Grow';
      case 'pro': return 'Pro';
      default: return tier;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-400';
      case 'seed': return 'bg-green-500';
      case 'grow': return 'bg-blue-500';
      case 'pro': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/plans")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planos
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configurações Técnicas de Planos</h1>
            <p className="text-muted-foreground">Configure os módulos e limitações técnicas para cada plano disponível</p>
          </div>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nesta página você pode configurar aspectos técnicos dos planos, como quais módulos estão disponíveis em cada plano e quais são os limites operacionais.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Módulos por Plano
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Package className="mr-2 h-4 w-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Módulos por Plano</CardTitle>
                <CardDescription>
                  Configure quais módulos estão disponíveis em cada plano
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPlans || isLoadingModules || isLoadingPlanModules ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Plano</TableHead>
                        <TableHead>Módulos Incluídos</TableHead>
                        <TableHead className="text-right w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTierColor(plan.tier)}`}></div>
                              <span>{plan.name}</span>
                              <Badge variant="outline">{tierToLabel(plan.tier)}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {getAssignedModules(plan.id).map((module) => (
                                <Badge 
                                  key={module.id} 
                                  variant="secondary"
                                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                                >
                                  {module.name}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                    onClick={() => handleRemoveModuleFromPlan(plan.id, module.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              {getAssignedModules(plan.id).length === 0 && (
                                <span className="text-sm text-muted-foreground">
                                  Nenhum módulo atribuído
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Plus className="mr-2 h-3 w-3" />
                                  Adicionar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Adicionar Módulo ao Plano</DialogTitle>
                                  <DialogDescription>
                                    Selecione um módulo para adicionar ao plano {plan.name}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto py-2">
                                  {getAvailableModules(plan.id).length === 0 ? (
                                    <div className="text-center py-4">
                                      <span className="text-muted-foreground">
                                        Todos os módulos já estão atribuídos a este plano.
                                      </span>
                                    </div>
                                  ) : (
                                    getAvailableModules(plan.id).map((module) => (
                                      <div key={module.id} className="flex justify-between items-center p-3 border rounded-md">
                                        <div>
                                          <h4 className="font-medium">{module.name}</h4>
                                          <p className="text-sm text-muted-foreground">{module.description}</p>
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleAddModuleToPlan(plan.id, module.id)}
                                        >
                                          <Plus className="mr-2 h-3 w-3" />
                                          Adicionar
                                        </Button>
                                      </div>
                                    ))
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {}}>
                                    Fechar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => navigate("/plans")}>
                  Voltar para Planos
                </Button>
                <Button variant="outline" onClick={() => navigate("/modules")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Gerenciar Módulos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Permissões por Plano</CardTitle>
                <CardDescription>
                  Configure limites e permissões específicas para cada plano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Recurso</TableHead>
                      {plans.map((plan) => (
                        <TableHead key={plan.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getTierColor(plan.tier)}`}></div>
                            {plan.name}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Usuários</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.id}>
                          <Input 
                            type="number" 
                            className="w-20" 
                            defaultValue={
                              plan.tier === 'free' ? "3" : 
                              plan.tier === 'seed' ? "10" : 
                              plan.tier === 'grow' ? "25" : 
                              "Ilimitado"
                            } 
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Espaço de Armazenamento</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.id}>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              className="w-20" 
                              defaultValue={
                                plan.tier === 'free' ? "500" : 
                                plan.tier === 'seed' ? "5" : 
                                plan.tier === 'grow' ? "20" : 
                                "100"
                              } 
                            />
                            <span className="text-sm text-muted-foreground">
                              {plan.tier === 'free' ? "MB" : "GB"}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Acesso a API</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.id}>
                          <Switch 
                            checked={plan.tier !== 'free'} 
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Suporte Prioritário</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.id}>
                          <Switch 
                            checked={plan.tier === 'grow' || plan.tier === 'pro'} 
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Integrações Avançadas</TableCell>
                      {plans.map((plan) => (
                        <TableCell key={plan.id}>
                          <Switch 
                            checked={plan.tier === 'pro'} 
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => navigate("/plans")}>
                  Cancelar
                </Button>
                <Button>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}