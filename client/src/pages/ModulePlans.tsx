import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Check, Info, Star, AlertCircle } from "lucide-react";
import { Module, ModulePlan } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function ModulePlans() {
  const { moduleId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Buscar detalhes do módulo
  const { data: module, isLoading: isModuleLoading, error: moduleError } = useQuery<Module>({
    queryKey: ['/api/modules', moduleId],
    enabled: !!moduleId,
  });
  
  // Buscar planos do módulo
  const { data: modulePlans, isLoading: isPlansLoading, error: plansError } = useQuery<ModulePlan[]>({
    queryKey: ['/api/module-plans/by-module', moduleId],
    enabled: !!moduleId,
  });
  
  // Estado ativo da tab
  const [activeTab, setActiveTab] = useState("mensal");
  
  // Redirecionar para checkout
  const goToCheckout = (plan: ModulePlan) => {
    const organizationId = user?.organizationId;
    if (!organizationId) {
      navigate(`/checkout?type=module&itemId=${plan.id}&returnUrl=/module-plans/${moduleId}`);
    } else {
      navigate(`/checkout?type=module&itemId=${plan.id}&organizationId=${organizationId}&returnUrl=/module-plans/${moduleId}`);
    }
  };
  
  const isLoading = isModuleLoading || isPlansLoading;
  const error = moduleError || plansError;
  
  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-5xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Filtar planos por ciclo de faturamento
  const monthlyPlans = modulePlans?.filter(plan => plan.billing_cycle === 'monthly') || [];
  const yearlyPlans = modulePlans?.filter(plan => plan.billing_cycle === 'yearly') || [];
  
  // Determinar planos a exibir com base na tab ativa
  const plansToShow = activeTab === "mensal" ? monthlyPlans : yearlyPlans;
  
  return (
    <div className="container max-w-5xl mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/modules')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para módulos
      </Button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{module?.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {module?.description}
        </p>
      </div>
      
      {/* Tabs para ciclo de cobrança */}
      <Tabs 
        defaultValue="mensal" 
        className="max-w-3xl mx-auto mb-10"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="mensal">Planos Mensais</TabsTrigger>
          <TabsTrigger value="anual">Planos Anuais <Badge variant="outline" className="ml-2">Economize 20%</Badge></TabsTrigger>
        </TabsList>
        
        <TabsContent value="mensal" className="space-y-6">
          {monthlyPlans.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nenhum plano mensal disponível</AlertTitle>
              <AlertDescription>
                Este módulo não possui planos mensais disponíveis no momento.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {monthlyPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onSubscribe={() => goToCheckout(plan)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="anual" className="space-y-6">
          {yearlyPlans.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nenhum plano anual disponível</AlertTitle>
              <AlertDescription>
                Este módulo não possui planos anuais disponíveis no momento.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {yearlyPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onSubscribe={() => goToCheckout(plan)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PlanCardProps {
  plan: ModulePlan;
  onSubscribe: () => void;
}

function PlanCard({ plan, onSubscribe }: PlanCardProps) {
  return (
    <Card className={`flex flex-col h-full ${plan.is_popular ? 'border-primary shadow-md' : ''}`}>
      {plan.is_popular && (
        <div className="bg-primary text-primary-foreground text-xs uppercase tracking-wider text-center py-1.5 font-medium">
          <span className="flex items-center justify-center">
            <Star className="h-3.5 w-3.5 mr-1.5" /> Mais Popular
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-4">
          <span className="text-3xl font-bold">R$ {typeof plan.price === 'number' ? plan.price.toFixed(2).replace('.', ',') : plan.price}</span>
          <span className="text-muted-foreground">
            /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
          </span>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <p className="font-medium">Recursos incluídos:</p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          size="lg"
          variant={plan.is_popular ? "default" : "outline"}
          onClick={onSubscribe}
        >
          Assinar agora
        </Button>
      </CardFooter>
    </Card>
  );
}