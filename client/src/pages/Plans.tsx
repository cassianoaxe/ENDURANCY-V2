import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Check, Package, Users, ArrowUpRight, Settings, PlusCircle, Edit, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

export default function Plans() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("todos");

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

  // Acessar página de checkout de um plano
  const goToCheckout = (plan: Plan) => {
    navigate(`/checkout?type=plan&itemId=${plan.id}&returnUrl=/plans`);
  };

  // Filtrar planos com base na tab selecionada
  const getFilteredPlans = () => {
    if (activeTab === "todos") return plans;
    return plans.filter(plan => plan.tier === activeTab);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-muted-foreground">Gerencie os planos e assinaturas disponíveis na plataforma.</p>
          </div>
          <Button onClick={() => navigate("/plans/create")}>
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
                {plans.length > 0 ? `${plans.filter(p => p.isActive).length} planos ativos` : "Carregando..."}
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
                <Button variant="outline" onClick={() => navigate("/plans/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Planos
                </Button>
              </div>
              
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="free">Freemium</TabsTrigger>
                  <TabsTrigger value="seed">Seed</TabsTrigger>
                  <TabsTrigger value="grow">Grow</TabsTrigger>
                  <TabsTrigger value="pro">Pro</TabsTrigger>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredPlans().map((plan) => (
                  <Card key={plan.id} className="flex flex-col border overflow-hidden">
                    <div 
                      className={`h-2 w-full 
                        ${plan.tier === 'free' ? 'bg-gray-400' : 
                          plan.tier === 'seed' ? 'bg-green-500' : 
                          plan.tier === 'grow' ? 'bg-blue-500' : 
                          'bg-indigo-500'}`}
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription className="mt-1">{plan.description}</CardDescription>
                        </div>
                        {plan.isPopular && (
                          <Badge>Popular</Badge>
                        )}
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
                      <h4 className="text-sm font-medium mb-2">Inclui:</h4>
                      <ul className="space-y-2">
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="flex-col gap-3 pt-2">
                      <Button 
                        className="w-full" 
                        variant={plan.isPopular ? "default" : "outline"}
                        onClick={() => goToCheckout(plan)}
                      >
                        {plan.tier === 'free' ? 'Começar avaliação' : 'Assinar agora'}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/plans/${plan.id}`)}>
                        <span className="text-xs">Ver detalhes</span>
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
                  <Button onClick={() => navigate("/plans/create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Plano {activeTab !== 'todos' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : ''}
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
