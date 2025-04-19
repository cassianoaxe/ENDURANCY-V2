import { useState } from "react";
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
  Check, Package, Users, ArrowUpRight, Settings, BarChart3,
  PlusCircle, Edit, ChevronRight, Trash2, AlertTriangle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Plans() {
  const [, navigate] = useLocation();
  
  // Função para navegar para a criação de planos
  const goToCreatePlan = () => {
    console.log("Navegando para /plans/create");
    window.history.pushState({}, '', '/plans/create');
    window.dispatchEvent(new Event('popstate'));
  };
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const queryClient = useQueryClient();

  // Buscar todos os planos
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  // Buscar estatísticas de assinantes
  const { data: planStats } = useQuery<{
    totalPlans: number;
    activeSubscribers: number;
    conversionRate: number;
    revenueMonthly: number;
  }>({
    queryKey: ['/api/plans/stats'],
  });

  // Mutation para deletar um plano
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir plano');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso.",
        variant: "default"
      });
      setPlanToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir plano",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Abrir diálogo de confirmação para excluir um plano
  const confirmDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  // Executar a exclusão do plano
  const handleDeletePlan = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete.id);
    }
    setDeleteDialogOpen(false);
  };

  // Acessar página de checkout de um plano
  const goToCheckout = (plan: Plan) => {
    window.location.href = `/checkout?type=plan&itemId=${plan.id}&returnUrl=/plans`;
  };

  // Filtrar planos com base na tab selecionada
  const getFilteredPlans = () => {
    if (activeTab === "todos") return plans;
    return plans.filter(plan => plan.tier === activeTab);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-muted-foreground">Gerencie os planos e assinaturas disponíveis na plataforma.</p>
          </div>
          <Button onClick={goToCreatePlan}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
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

        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <CardTitle>Planos Disponíveis</CardTitle>
                <Button variant="outline" onClick={() => {
                  window.history.pushState({}, '', '/plans/settings');
                  window.dispatchEvent(new Event('popstate'));
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Planos
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
                  <Card key={plan.id} className="flex flex-col border overflow-hidden">
                    <div 
                      className={`h-2 w-full 
                        ${plan.tier === 'free' ? 'bg-gray-400' : 
                          plan.tier === 'seed' ? 'bg-green-500' : 
                          plan.tier === 'grow' ? 'bg-blue-500' : 
                          plan.tier === 'pro' ? 'bg-indigo-500' : 
                          plan.tier === 'enterprise' ? 'bg-red-600' : 
                          'bg-purple-600'}`}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">{plan.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 text-xs">{plan.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {plan.tier === 'grow' && (
                            <Badge>Popular</Badge>
                          )}
                          {plan.tier === 'enterprise' && (
                            <Badge variant="destructive">Premium</Badge>
                          )}
                          <div className="flex space-x-1 bg-secondary/50 p-1 rounded-md shadow-sm">
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-secondary" 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.history.pushState({}, '', `/plans/${plan.id}/edit`);
                                window.dispatchEvent(new Event('popstate'));
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeletePlan(plan);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                      <h4 className="text-sm font-medium mb-2">Módulos inclusos:</h4>
                      <ul className="space-y-2">
                        {plan.modules && plan.modules.length > 0 ? (
                          // Exibe os módulos associados ao plano
                          plan.modules.map((module, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{module.name} - {module.description}</span>
                            </li>
                          ))
                        ) : (
                          // Se não houver módulos, exibe as features do plano (caso existam)
                          plan.features?.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="flex-col gap-3 pt-2">
                      <Button 
                        className={`w-full ${plan.tier === 'enterprise' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        variant={plan.tier === 'grow' || plan.tier === 'enterprise' ? "default" : "outline"}
                        onClick={() => goToCheckout(plan)}
                      >
                        {plan.tier === 'free' ? 'Começar avaliação' : 
                         plan.tier === 'enterprise' ? 'Assinar Enterprise' : 'Assinar agora'}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => {
                        window.history.pushState({}, '', `/plans/${plan.id}/edit`);
                        window.dispatchEvent(new Event('popstate'));
                      }}>
                        <span className="text-xs">Editar plano</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
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
                  <Button onClick={goToCreatePlan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Plano {activeTab !== 'todos' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : ''}
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo de confirmação para excluir plano */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmar exclusão
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano <strong>{planToDelete?.name}</strong>?
              <div className="mt-2 text-destructive">
                Esta ação não pode ser desfeita.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlanMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Excluindo...
                </div>
              ) : (
                "Sim, excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
