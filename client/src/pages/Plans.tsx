import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plan } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, Package, Users, ArrowUpRight, Settings, 
  AlertCircle, Lock, Server, Layers, List, BadgeCheck,
  Sliders, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

// Interface para os módulos associados a um plano
interface Module {
  id: number;
  name: string;
  type: string;
  description: string;
  price: string;
  status: 'active' | 'inactive';
}

export default function Plans() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("todos");
  const queryClient = useQueryClient();

  // Buscar todos os planos
  const { data: plans = [], isLoading, error } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error(`Erro ao carregar planos: ${response.statusText}`);
      }
      return await response.json();
    }
  });

  // Adicionar log quando os planos forem carregados
  useEffect(() => {
    if (plans && plans.length > 0) {
      console.log("Planos carregados com sucesso:", plans);
    }
    if (error) {
      console.error("Erro ao carregar planos:", error);
    }
  }, [plans, error]);

  // Buscar estatísticas de assinantes
  const { data: planStats } = useQuery<{
    totalPlans: number;
    activeSubscribers: number;
    conversionRate: number;
    revenueMonthly: number;
  }>({
    queryKey: ['/api/plans/stats'],
    queryFn: async () => {
      const response = await fetch('/api/plans/stats');
      if (!response.ok) {
        throw new Error(`Erro ao carregar estatísticas: ${response.statusText}`);
      }
      return await response.json();
    }
  });

  // Gerenciar módulos do plano com proteção contra rate limiting
  const managePlanModules = (planId: number) => {
    // Adicionar logs detalhados para diagnóstico
    console.log("Iniciando navegação para configuração de módulos do plano:", planId);

    // Mostrar toast de carregamento
    toast({
      title: "Redirecionando...",
      description: "Aguarde enquanto preparamos a configuração de módulos.",
      duration: 3000,
    });
    
    // Definir um timeout curto para evitar problemas de rate limiting
    setTimeout(() => {
      // Forçar navegação com window.location em vez de navigate hook
      window.location.href = `/plans/${planId}/modules`;
    }, 800);
  };

  // Filtrar planos com base na tab selecionada
  const getFilteredPlans = () => {
    if (activeTab === "todos") return plans;
    return plans.filter(plan => plan.tier === activeTab);
  };

  // Obter o ícone correspondente ao tipo de módulo
  const getModuleIcon = (moduleType: string) => {
    switch (moduleType.toLowerCase()) {
      case 'financeiro':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'complypay':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'segurança':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'produção':
        return <Server className="h-4 w-4 text-indigo-500" />;
      case 'cultivo':
        return <Layers className="h-4 w-4 text-green-500" />;
      case 'patrimônio':
        return <Package className="h-4 w-4 text-orange-500" />;
      case 'pesquisa':
        return <List className="h-4 w-4 text-purple-500" />;
      case 'crm':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <BadgeCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive p-4 rounded-md mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Erro ao carregar planos:</h3>
            </div>
            <p className="mt-2">{(error as Error).message}</p>
          </div>
        )}

        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Planos</h1>
          <p className="text-muted-foreground max-w-2xl">
            Configure os módulos disponíveis em cada plano de assinatura da plataforma. 
            Somente usuários com permissão de Super Admin podem gerenciar planos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats?.totalPlans || plans.length}</div>
              <p className="text-xs text-muted-foreground">
                {plans.length > 0 ? `${plans.length} planos disponíveis` : "Carregando..."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats?.activeSubscribers || "..."}</div>
              <p className="text-xs text-muted-foreground">
                Organizações com assinaturas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats?.conversionRate ? `${planStats.conversionRate}%` : "..."}</div>
              <p className="text-xs text-muted-foreground">
                De trial para assinante
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {planStats?.revenueMonthly 
                  ? `R$ ${planStats.revenueMonthly.toLocaleString('pt-BR')}` 
                  : "R$ ..."}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita recorrente mensal (MRR)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <CardTitle>Configuração de Planos</CardTitle>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações Globais
                </Button>
              </div>
              
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="free">Freemium</TabsTrigger>
                  <TabsTrigger value="seed">Seed</TabsTrigger>
                  <TabsTrigger value="grow">Grow</TabsTrigger>
                  <TabsTrigger value="pro">Pro</TabsTrigger>
                  <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredPlans().map((plan) => (
                  <Card key={plan.id} className="flex flex-col border overflow-hidden shadow-sm hover:shadow transition-shadow">
                    <div 
                      className={`h-2 w-full 
                        ${plan.tier === 'free' ? 'bg-gray-400' : 
                          plan.tier === 'seed' ? 'bg-green-500' : 
                          plan.tier === 'grow' ? 'bg-blue-500' : 
                          plan.tier === 'pro' ? 'bg-indigo-500' : 
                          plan.tier === 'enterprise' ? 'bg-red-600' : 
                          'bg-purple-600'}`}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="truncate">{plan.name}</CardTitle>
                          <CardDescription className="mt-1 text-xs">{plan.description}</CardDescription>
                        </div>
                        <div>
                          {plan.tier === 'grow' && (
                            <Badge>Popular</Badge>
                          )}
                          {plan.tier === 'enterprise' && (
                            <Badge variant="destructive">Premium</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {plan.tier === 'free' ? 'Grátis' : `R$ ${Number(plan.price).toLocaleString('pt-BR')}`}
                        </span>
                        {plan.tier !== 'free' && (
                          <span className="text-sm text-muted-foreground ml-1">/mês</span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <Separator />
                    
                    <CardContent className="flex-grow pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Módulos Inclusos</h4>
                        <Badge variant="outline" className="text-xs">
                          {plan.modules?.length || 0} módulos
                        </Badge>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto pr-1">
                        <ul className="space-y-2">
                          {plan.modules && plan.modules.length > 0 ? (
                            plan.modules.map((module, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm bg-secondary/30 p-2 rounded-md">
                                <div className="mt-0.5 flex-shrink-0">
                                  {getModuleIcon(module.type)}
                                </div>
                                <div>
                                  <div className="font-medium">{module.name}</div>
                                  <div className="text-xs text-muted-foreground">{module.description}</div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-center justify-center gap-2 text-sm text-muted-foreground h-20">
                              <X className="h-4 w-4" />
                              <span>Nenhum módulo associado</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 pb-4">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => managePlanModules(plan.id)}
                      >
                        <Sliders className="mr-2 h-4 w-4" />
                        Configurar Módulos
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && getFilteredPlans().length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-lg text-muted-foreground mb-4">Nenhum plano encontrado nesta categoria.</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="bg-secondary/30 rounded-lg p-6 border border-border">
          <div className="flex items-start gap-3">
            <div className="bg-secondary rounded-full p-2">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">Importante: Sobre a configuração de planos</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Os planos da plataforma são pré-configurados e não podem ser excluídos ou criados novamente. 
                Somente a adição ou remoção de módulos é permitida para manter a estrutura de preços e benefícios.
              </p>
              <p className="text-sm">
                Para modificar a estrutura básica dos planos ou alterar os preços base, entre em contato com o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}