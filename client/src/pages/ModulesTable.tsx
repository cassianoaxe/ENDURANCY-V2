import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Leaf, LineChart, Heart, Briefcase, Scale, Eye, Brain, 
  Search, Settings, PlusCircle, Check, MoreHorizontal, Layers, ListChecks, Activity
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  sales_count: number;
  subscriptions_count: number;
  monthly_revenue: number;
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
  switch (iconName.toLowerCase()) {
    case 'shoppingcart': return <ShoppingCart className={className} />;
    case 'leaf': return <Leaf className={className} />;
    case 'linechart': return <LineChart className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'briefcase': return <Briefcase className={className} />;
    case 'scale': return <Scale className={className} />;
    case 'eye': return <Eye className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'listchecks': return <ListChecks className={className} />;
    case 'layers': return <Layers className={className} />;
    default: return <Layers className={className} />;
  }
};

// Helper para obter a cor baseada no status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'test': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'development': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-green-600 bg-green-50 border-green-200';
  }
};

// Helper para formatar o preço
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};

export default function ModulesTable() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtrar módulos com base na tab ativa e pesquisa
  const filteredModules = modules.filter(module => {
    // Filtro por busca
    if (searchQuery && !module.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !module.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
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

  // Obter o número de módulos por status para estatísticas
  const statusCounts = {
    total: modules.length,
    ativos: modules.filter(m => m.is_active && m.status === 'active').length,
    inativos: modules.filter(m => !m.is_active).length,
    emTeste: modules.filter(m => m.is_active && m.status === 'test').length,
    emDesenvolvimento: modules.filter(m => m.is_active && m.status === 'development').length
  };
  
  // Cálculo de métricas de assinaturas e receita
  const totalSubscriptions = modules.reduce((sum, module) => sum + module.subscriptions_count, 0);
  const totalSales = modules.reduce((sum, module) => sum + module.sales_count, 0);
  const totalMonthlyRevenue = modules.reduce((sum, module) => sum + module.monthly_revenue, 0);

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Módulos</h1>
            <p className="text-gray-600 mt-2">Gerencie todos os módulos e funcionalidades disponíveis na plataforma.</p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                window.history.pushState({}, '', '/modules');
                window.dispatchEvent(new Event('popstate'));
              }}
            >
              Ver em cards
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Módulo
            </Button>
          </div>
        </div>
        
        {/* Estatísticas de Receita e Assinaturas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receita Mensal Total</p>
                  <p className="text-2xl font-bold">{formatPrice(totalMonthlyRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">De todos os módulos ativos</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <LineChart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Assinaturas</p>
                  <p className="text-2xl font-bold">{totalSubscriptions}</p>
                  <p className="text-xs text-gray-500 mt-1">Assinantes ativos</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Vendas</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                  <p className="text-xs text-gray-500 mt-1">De todos os tempos</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Módulos</p>
                  <p className="text-2xl font-bold">{statusCounts.total}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Módulos Ativos</p>
                  <p className="text-2xl font-bold">{statusCounts.ativos}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Módulos Inativos</p>
                  <p className="text-2xl font-bold">{statusCounts.inativos}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <Layers className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Em Teste</p>
                  <p className="text-2xl font-bold">{statusCounts.emTeste}</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Em Desenvolvimento</p>
                  <p className="text-2xl font-bold">{statusCounts.emDesenvolvimento}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <ListChecks className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>Módulos Disponíveis</CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Buscar módulos..." 
                    className="pl-8 w-full sm:w-[250px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="ativos">Ativos</TabsTrigger>
                    <TabsTrigger value="inativos">Inativos</TabsTrigger>
                    <TabsTrigger value="em_teste">Em teste</TabsTrigger>
                    <TabsTrigger value="em_desenvolvimento">Em desenv.</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            {isLoadingModules || isLoadingPlans ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Módulo</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Planos</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Assinaturas</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Vendas</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Receita Mensal</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500">Ativo</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModules.map((module) => {
                        const plans = getPlansByModuleId(module.id);
                        const plansCount = plans.length;
                        const lowestPrice = plans.length > 0 
                          ? Math.min(...plans.map(p => Number(p.price)))
                          : 0;
                        
                        return (
                          <tr key={module.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-primary/10">
                                  <AvatarFallback className="text-primary">
                                    {getModuleIcon(module.icon_name, "h-4 w-4")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{module.name}</p>
                                  <p className="text-xs text-gray-500 line-clamp-1">{module.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className={`${getStatusColor(module.status)}`}>
                                {module.status === 'test' && 'Em teste'}
                                {module.status === 'development' && 'Em desenvolvimento'}
                                {module.status === 'active' && 'Ativo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{plansCount}</span>
                                <span className="text-xs text-gray-500">
                                  {plansCount === 1 ? 'plano' : 'planos'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{module.subscriptions_count}</span>
                                <span className="text-xs text-gray-500">assinaturas</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{module.sales_count}</span>
                                <span className="text-xs text-gray-500">vendas</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{formatPrice(module.monthly_revenue)}</p>
                                <p className="text-xs text-gray-500">por mês</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Switch 
                                id={`module-status-${module.id}`}
                                checked={module.is_active} 
                                onCheckedChange={(isActive) => updateModuleStatusMutation.mutate({ moduleId: module.id, isActive })}
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Visualizar detalhes</DropdownMenuItem>
                                  <DropdownMenuItem>Gerenciar planos</DropdownMenuItem>
                                  <DropdownMenuItem>Editar módulo</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Excluir módulo</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {filteredModules.length === 0 && !isLoadingModules && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Layers className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum módulo encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Não encontramos nenhum módulo correspondente à sua pesquisa.' 
                    : 'Não há módulos disponíveis nesta categoria.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between py-4">
            <Button variant="outline">Exportar dados</Button>
            <div className="text-sm text-gray-500">
              Exibindo {filteredModules.length} de {modules.length} módulos
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}