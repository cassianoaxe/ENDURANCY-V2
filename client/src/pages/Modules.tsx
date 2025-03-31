import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Leaf, LineChart, Heart, Briefcase, Scale, Eye, Brain,
  Edit, Save, X 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definição dos tipos
interface Module {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  slug: string;
  is_active: boolean;
  type: string;
  status: string; // 'active', 'test', 'development'
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
  // Status do módulo - usando a coluna 'status' para filtrar
  const filteredModules = modules.filter(module => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'ativos') return module.is_active && module.status === 'active';
    if (activeTab === 'inativos') return !module.is_active;
    if (activeTab === 'em_teste') return module.is_active && module.status === 'test';
    if (activeTab === 'em_desenvolvimento') return module.is_active && module.status === 'development';
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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Módulos</h1>
        <p className="text-gray-600 mb-6">Gerencie os módulos e funcionalidades disponíveis na plataforma.</p>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <CardTitle>Módulos Disponíveis</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.history.pushState({}, '', '/modules-table');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    Ver em tabela
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="hidden sm:inline mr-2">Adicionar</span> Módulo
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden sm:grid grid-cols-5 w-full">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativos">Ativos</TabsTrigger>
                  <TabsTrigger value="inativos">Inativos</TabsTrigger>
                  <TabsTrigger value="em_teste">Em teste</TabsTrigger>
                  <TabsTrigger value="em_desenvolvimento">Em desenvolvimento</TabsTrigger>
                </TabsList>
                
                <TabsList className="grid sm:hidden grid-cols-2 gap-1 w-full mb-2">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativos">Ativos</TabsTrigger>
                </TabsList>
                <TabsList className="grid sm:hidden grid-cols-3 gap-1 w-full">
                  <TabsTrigger value="inativos">Inativos</TabsTrigger>
                  <TabsTrigger value="em_teste">Em teste</TabsTrigger>
                  <TabsTrigger value="em_desenvolvimento">Em desenv.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingModules || isLoadingPlans ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredModules.map((module) => {
                  const plans = getPlansByModuleId(module.id);
                  const popularPlan = getPopularPlan(module.id);
                  
                  // Definir cor de borda baseada no status do módulo
                  const getBorderColor = () => {
                    if (!module.is_active) return 'border-t-gray-300';
                    if (module.status === 'test') return 'border-t-amber-500';
                    if (module.status === 'development') return 'border-t-blue-500';
                    return 'border-t-green-500';
                  };
                  
                  return (
                    <Card key={module.id} className={`overflow-hidden border-t-4 ${getBorderColor()}`}>
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
                        
                        {/* Status badge */}
                        {module.is_active && module.status === 'test' && (
                          <Badge variant="outline" className="absolute right-16 top-4 border-amber-500 text-amber-700">
                            Em teste
                          </Badge>
                        )}
                        {module.is_active && module.status === 'development' && (
                          <Badge variant="outline" className="absolute right-16 top-4 border-blue-500 text-blue-700">
                            Em desenvolvimento
                          </Badge>
                        )}
                        
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}