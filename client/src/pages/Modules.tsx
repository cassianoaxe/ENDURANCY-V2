import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Leaf, LineChart, Heart, Briefcase, Scale, Eye, Brain } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Definição dos tipos
interface Module {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  slug: string;
  is_active: boolean;
  type: string;
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

// Helper para renderizar o ícone correto com base no nome do ícone
const getModuleIcon = (iconName: string, className: string = "h-5 w-5") => {
  switch (iconName) {
    case 'ShoppingCart': return <ShoppingCart className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'LineChart': return <LineChart className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Brain': return <Brain className={className} />;
    default: return <ShoppingCart className={className} />;
  }
};

export default function Modules() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('todos');

  // Consulta para buscar todos os módulos
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
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

  // Mutação para atualizar o status de um módulo (ativo/inativo)
  const updateModuleStatusMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: number, isActive: boolean }) => {
      const response = await fetch(`/api/modules/${moduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar status do módulo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
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

  // Filtrar módulos com base na tab ativa
  const filteredModules = modules.filter(module => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'ativos') return module.is_active;
    if (activeTab === 'inativos') return !module.is_active;
    return true;
  });

  // Agrupar planos por módulo
  const getPlansByModuleId = (moduleId: number) => {
    return modulePlans.filter(plan => plan.module_id === moduleId);
  };

  // Determinar plano popular para um módulo
  const getPopularPlan = (moduleId: number) => {
    return modulePlans.find(plan => plan.module_id === moduleId && plan.is_popular);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Gerenciamento de Módulos</h1>
        
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="todos" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="todos">Todos os Módulos</TabsTrigger>
              <TabsTrigger value="ativos">Módulos Ativos</TabsTrigger>
              <TabsTrigger value="inativos">Módulos Inativos</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              {isLoadingModules || isLoadingPlans ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map((module) => {
                    const plans = getPlansByModuleId(module.id);
                    const popularPlan = getPopularPlan(module.id);
                    
                    return (
                      <Card key={module.id} className={`overflow-hidden border-t-4 ${module.is_active ? 'border-t-green-500' : 'border-t-gray-300'}`}>
                        <CardHeader className="relative pb-2">
                          <div className="absolute right-4 top-4">
                            <Switch 
                              id={`module-status-${module.id}`}
                              checked={module.is_active} 
                              onCheckedChange={(isActive) => updateModuleStatusMutation.mutate({ moduleId: module.id, isActive })}
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
                          <h3 className="font-semibold text-sm mb-3">Planos disponíveis:</h3>
                          <div className="space-y-3">
                            {plans.map((plan) => (
                              <div key={plan.id} className="flex justify-between items-center">
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
                                {plan.is_popular && (
                                  <Badge className="absolute -right-1 -top-1 bg-primary text-white px-2 py-0.5 rounded-bl text-xs transform rotate-45">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">Detalhes</Button>
                          <Button disabled={!module.is_active}>Editar Planos</Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {filteredModules.length === 0 && !isLoadingModules && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-lg text-muted-foreground">Nenhum módulo encontrado nesta categoria.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}