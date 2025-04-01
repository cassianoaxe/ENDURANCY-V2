import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Package, Shield, BriefcaseBusiness, ExternalLink, PlusCircle, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import OrganizationSidebar from '@/components/organization/OrganizationSidebar';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  billingCycle: string;
  maxRecords: number;
  features: string[];
  is_popular?: boolean;
  tier: 'free' | 'seed' | 'grow' | 'pro';
}

interface Module {
  id: number;
  name: string;
  description: string;
  price: string;
  type: string;
  is_active: boolean;
  features: string[];
}

interface OrganizationPlan {
  plan: Plan;
  expiresAt: string;
  registrationsUsed: number;
  registrationsTotal: number;
  activeModules: Module[];
}

export default function MeuPlano() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plano-atual");
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Buscar dados do plano atual da organização
  const { data: organizationPlan, isLoading: isOrgPlanLoading } = useQuery<OrganizationPlan>({
    queryKey: ['/api/organization/plan'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar todos os planos disponíveis
  const { data: availablePlans, isLoading: isPlansLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  // Buscar módulos adicionais disponíveis
  const { data: availableModules, isLoading: isModulesLoading } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  const handleRequestPlanChange = async (planId: number) => {
    try {
      const response = await apiRequest("POST", "/api/organization/request-plan-change", { planId });
      
      if (response.ok) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de mudança de plano foi enviada com sucesso e está aguardando aprovação.",
          variant: "default",
        });
        setChangePlanModalOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao solicitar mudança de plano");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao solicitar a mudança de plano.",
        variant: "destructive",
      });
    }
  };

  const handleRequestModuleActivation = async (moduleId: number) => {
    try {
      const response = await apiRequest("POST", "/api/organization/request-module-activation", { moduleId });
      
      if (response.ok) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de ativação de módulo foi enviada com sucesso e está aguardando aprovação.",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao solicitar ativação de módulo");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao solicitar a ativação do módulo.",
        variant: "destructive",
      });
    }
  };

  // Helper para verificar se um módulo está ativo
  const isModuleActive = (moduleId: number) => {
    if (!organizationPlan?.activeModules) return false;
    return organizationPlan.activeModules.some(m => m.id === moduleId);
  };

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Filtrar módulos que não são básicos (já incluídos no plano)
  const getAddonModules = () => {
    if (!availableModules) return [];
    const basicModules = ['onboarding', 'analytics', 'dashboard', 'associados', 'vendas', 'financeiro', 'complypay'];
    return availableModules.filter(module => !basicModules.includes(module.type));
  };

  if (isOrgPlanLoading || isPlansLoading || isModulesLoading) {
    return (
      <div className="flex min-h-screen">
        <OrganizationSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Carregando" />
          </div>
        </div>
      </div>
    );
  }

  // Calcular porcentagem de uso do limite de cadastros
  const registrationUsagePercent = organizationPlan ? 
    Math.round((organizationPlan.registrationsUsed / organizationPlan.registrationsTotal) * 100) : 0;

  // Determinar cor do indicador de uso
  const getUsageColorClass = (percent: number) => {
    if (percent < 70) return "bg-green-500";
    if (percent < 90) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="flex min-h-screen">
      <OrganizationSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meu Plano</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seu plano e módulos adicionais
            </p>
          </div>

          <Tabs defaultValue="plano-atual" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="plano-atual">Plano Atual</TabsTrigger>
              <TabsTrigger value="mudar-plano">Mudar de Plano</TabsTrigger>
              <TabsTrigger value="modulos-adicionais">Módulos Adicionais</TabsTrigger>
            </TabsList>

            {/* Plano Atual */}
            <TabsContent value="plano-atual" className="space-y-6">
              {organizationPlan && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl">
                            Plano {organizationPlan.plan.name}
                            {organizationPlan.plan.is_popular && (
                              <Badge className="ml-2 bg-amber-500" variant="secondary">Popular</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{organizationPlan.plan.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{organizationPlan.plan.price}</div>
                          <div className="text-sm text-muted-foreground">{organizationPlan.plan.billingCycle}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-base mb-3 flex items-center">
                            <Package className="mr-2 h-5 w-5 text-primary" />
                            Uso do Plano
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1 text-sm">
                                <span>Limite de cadastros</span>
                                <span>{organizationPlan.registrationsUsed} de {organizationPlan.registrationsTotal}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getUsageColorClass(registrationUsagePercent)} rounded-full`}
                                  style={{ width: `${registrationUsagePercent}%` }}
                                />
                              </div>
                              {registrationUsagePercent >= 90 && (
                                <p className="text-xs text-red-500 mt-1">
                                  Você está próximo do limite! Considere fazer upgrade do plano.
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Validade do plano</span>
                                <span>{formatDate(organizationPlan.expiresAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-base mb-3 flex items-center">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                            Recursos Incluídos
                          </h3>
                          <ul className="space-y-2">
                            {organizationPlan.plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        ID do Plano: {organizationPlan.plan.id}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("mudar-plano")}
                      >
                        Mudar de Plano
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Módulos Ativos */}
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Módulos Ativos</h2>
                    {organizationPlan.activeModules && organizationPlan.activeModules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {organizationPlan.activeModules.map((module) => (
                          <Card key={module.id} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                              <CardTitle>{module.name}</CardTitle>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-1">
                                {module.features?.slice(0, 3).map((feature, idx) => (
                                  <li key={idx} className="flex items-start text-xs">
                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                                {module.features?.length > 3 && (
                                  <li className="text-xs text-muted-foreground pl-5">
                                    + {module.features.length - 3} recursos
                                  </li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-6">
                          <div className="text-center">
                            <h3 className="text-lg font-medium">Nenhum módulo adicional ativo</h3>
                            <p className="text-muted-foreground mt-2">
                              Você ainda não contratou módulos adicionais para sua organização.
                            </p>
                            <Button 
                              className="mt-4" 
                              onClick={() => setActiveTab("modulos-adicionais")}
                            >
                              Explorar Módulos
                              <PlusCircle className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}

              {!organizationPlan && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro ao carregar plano</AlertTitle>
                  <AlertDescription>
                    Não foi possível carregar as informações do seu plano. Tente novamente mais tarde.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Mudar de Plano */}
            <TabsContent value="mudar-plano" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Comparativo de Planos</h2>
                <p className="text-muted-foreground mt-1">
                  Escolha o plano que melhor atende às necessidades da sua organização
                </p>
              </div>

              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Solicitação de Mudança</AlertTitle>
                <AlertDescription>
                  Ao solicitar uma mudança de plano, um administrador do sistema precisará aprovar antes que seja efetivada. Você receberá uma notificação quando a solicitação for processada.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans?.map((plan) => {
                  const isCurrentPlan = organizationPlan?.plan.id === plan.id;
                  return (
                    <Card 
                      key={plan.id} 
                      className={`overflow-hidden ${plan.is_popular ? 'border-primary shadow-md' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''}`}
                    >
                      {plan.is_popular && (
                        <div className="bg-primary text-primary-foreground text-center text-sm py-1">
                          Mais Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-2">
                          <div className="text-3xl font-bold">{plan.price}</div>
                          <div className="text-sm text-muted-foreground">{plan.billingCycle}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="font-medium mb-2">Limite de Cadastros</div>
                          <Badge variant="outline" className="text-base font-normal">
                            Até {plan.maxRecords.toLocaleString()} cadastros
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium mb-2">Recursos</div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {isCurrentPlan ? (
                          <Button className="w-full" variant="secondary" disabled>
                            Plano Atual
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleRequestPlanChange(plan.id)}
                          >
                            Solicitar Plano
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Módulos Adicionais */}
            <TabsContent value="modulos-adicionais" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Módulos Adicionais</h2>
                <p className="text-muted-foreground mt-1">
                  Amplie a funcionalidade da plataforma com módulos adicionais
                </p>
              </div>

              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Contratação de Módulos</AlertTitle>
                <AlertDescription>
                  Cada módulo adicional custa R$ 99/mês. Ao solicitar um novo módulo, um administrador do sistema precisará aprovar a solicitação.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getAddonModules().map((module) => {
                  const isActive = isModuleActive(module.id);
                  return (
                    <Card key={module.id} className={`border ${isActive ? 'border-green-500' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{module.name}</CardTitle>
                          {isActive && (
                            <Badge className="bg-green-500">Ativo</Badge>
                          )}
                        </div>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="text-xl font-bold">R$ 99,00</div>
                          <div className="text-sm text-muted-foreground">por mês</div>
                        </div>
                        <Separator className="my-4" />
                        <div>
                          <div className="font-medium mb-2">Recursos</div>
                          <ul className="space-y-2">
                            {module.features?.map((feature, idx) => (
                              <li key={idx} className="flex">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {isActive ? (
                          <Button className="w-full" variant="secondary" disabled>
                            Já Ativado
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleRequestModuleActivation(module.id)}
                          >
                            Solicitar Ativação
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}