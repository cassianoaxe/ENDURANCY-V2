import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileText,
  Link as LinkIcon,
  Loader2,
  PlusCircle,
  Settings,
  User,
  Users,
  XCircle,
  BarChart3,
  LineChart,
  UserPlus,
  Pill,
  CreditCard,
  Share2,
  Building,
  CalendarCheck,
  DollarSign,
  ShieldCheck,
  Star
} from "lucide-react";

// Tipo para o farmacêutico responsável técnico
interface Pharmacist {
  id: number;
  userId: number;
  name: string;
  email: string;
  license: string;
  isActive: boolean;
}

// Tipo para o plano de assinatura
interface SubscriptionPlan {
  id: number;
  name: string;
  tier: 'free' | 'seed' | 'grow' | 'pro' | 'enterprise';
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxUsers: number;
  isPopular: boolean;
}

// Tipo para uma assinatura
interface Subscription {
  id: number;
  organizationId: number;
  organizationName: string;
  planId: number;
  planName: string;
  planTier: 'free' | 'seed' | 'grow' | 'pro' | 'enterprise';
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'canceled' | 'expired';
  autoRenew: boolean;
  paymentMethod: string;
  lastPayment?: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
  };
}

// Tipo para o status do módulo
interface ModuleStatus {
  id: number;
  active: boolean;
  settings: {
    patientPortalUrl?: string;
    doctorPortalUrl?: string;
    pharmacistPortalUrl?: string;
    allowPatientRegistration: boolean;
    allowDoctorRegistration: boolean;
    requirePharmacistApproval: boolean;
    autoApproveVerifiedDoctors: boolean;
  }
}

function MedicalPortalDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Buscar status do módulo
  const { data: moduleStatus, isLoading: isModuleStatusLoading } = useQuery({
    queryKey: ['/api/organization/modules/medical-portal/status'],
  });

  // Buscar farmacêuticos RT
  const { data: pharmacists, isLoading: isPharmacistsLoading } = useQuery({
    queryKey: ['/api/organization/pharmacists'],
  });

  // Buscar métricas do portal médico
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['/api/organization/modules/medical-portal/metrics'],
  });

  // Buscar planos de assinatura do portal médico
  const { data: subscriptionPlans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['/api/organization/modules/medical-portal/plans'],
  });

  // Buscar assinaturas ativas do portal médico
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useQuery({
    queryKey: ['/api/organization/modules/medical-portal/subscriptions'],
  });

  // Mutação para atualizar configurações do módulo
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/organization/modules/medical-portal/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar configurações');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/modules/medical-portal/status'] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do portal médico foram atualizadas com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para ativar/desativar módulo
  const toggleModuleMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const response = await fetch('/api/organization/modules/medical-portal/toggle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do módulo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/modules/medical-portal/status'] });
      toast({
        title: data.active ? "Módulo ativado" : "Módulo desativado",
        description: data.active 
          ? "O portal médico está agora disponível." 
          : "O portal médico foi desativado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status do módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para adicionar farmacêutico RT
  const addPharmacistMutation = useMutation({
    mutationFn: async (pharmacistData: any) => {
      const response = await fetch('/api/organization/pharmacists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pharmacistData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar farmacêutico RT');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/pharmacists'] });
      toast({
        title: "Farmacêutico RT adicionado",
        description: "O farmacêutico responsável técnico foi adicionado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar farmacêutico RT",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isModuleStatusLoading || isPharmacistsLoading || isMetricsLoading || isPlansLoading || isSubscriptionsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portal Médico</h1>
          <p className="text-muted-foreground">
            Gerencie o portal médico, farmacêuticos RT e configurações para integração com o portal do paciente.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={moduleStatus?.active || false}
              onCheckedChange={(checked) => toggleModuleMutation.mutate(checked)}
              disabled={toggleModuleMutation.isPending}
            />
            <span className="font-medium">
              {moduleStatus?.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate("/organization/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações Avançadas
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="pharmacists" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Farmacêuticos RT
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Configurações
          </TabsTrigger>
          <TabsTrigger 
            value="subscriptions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Assinaturas
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Status do Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {moduleStatus?.active ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold">Portal Ativo</p>
                        <p className="text-muted-foreground text-sm">O portal médico está operacional</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <p className="font-semibold">Portal Inativo</p>
                        <p className="text-muted-foreground text-sm">O portal médico está desativado</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={moduleStatus?.active ? "outline" : "default"}
                  className="w-full"
                  onClick={() => toggleModuleMutation.mutate(!moduleStatus?.active)}
                  disabled={toggleModuleMutation.isPending}
                >
                  {toggleModuleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : moduleStatus?.active ? (
                    <XCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {moduleStatus?.active ? "Desativar Portal" : "Ativar Portal"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Farmacêuticos RT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="font-semibold">{pharmacists?.length || 0} Registrados</p>
                    <p className="text-muted-foreground text-sm">
                      {pharmacists?.filter(p => p.isActive)?.length || 0} ativos
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("pharmacists")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Gerenciar Farmacêuticos
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Prescrições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="font-semibold">{metrics?.prescriptions?.total || 0} Total</p>
                    <p className="text-muted-foreground text-sm">
                      {metrics?.prescriptions?.pending || 0} pendentes de aprovação
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/organization/medical-portal/prescriptions")}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Ver Prescrições
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Links de Acesso ao Portal</CardTitle>
              <CardDescription>
                Compartilhe estes links com médicos, farmacêuticos e pacientes para acessar o portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Portal do Médico</Label>
                <div className="flex">
                  <Input 
                    value={moduleStatus?.settings?.doctorPortalUrl || "Não configurado"} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button variant="outline" className="rounded-l-none border-l-0">
                    <Link className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Portal do Farmacêutico</Label>
                <div className="flex">
                  <Input 
                    value={moduleStatus?.settings?.pharmacistPortalUrl || "Não configurado"} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button variant="outline" className="rounded-l-none border-l-0">
                    <Link className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Portal do Paciente</Label>
                <div className="flex">
                  <Input 
                    value={moduleStatus?.settings?.patientPortalUrl || "Não configurado"} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button variant="outline" className="rounded-l-none border-l-0">
                    <Link className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar URLs
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas atividades no portal médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.recentActivities?.length ? (
                <div className="space-y-4">
                  {metrics.recentActivities.map((activity: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma atividade recente registrada</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="mx-auto">
                Ver todo o histórico de atividades
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Assinaturas */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Assinatura</CardTitle>
                <CardDescription>
                  Planos disponíveis para acesso ao portal médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionPlans?.length ? (
                  <div className="space-y-4">
                    {subscriptionPlans.map((plan: SubscriptionPlan) => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg flex items-center">
                              {plan.name}
                              {plan.isPopular && (
                                <Badge className="ml-2" variant="secondary">Popular</Badge>
                              )}
                            </h3>
                            <p className="text-muted-foreground">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">
                              R$ {plan.price.toFixed(2)}
                              <span className="text-sm text-muted-foreground font-normal">
                                /{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                              </span>
                            </p>
                            <Badge 
                              variant="outline" 
                              className={
                                plan.tier === 'free' ? 'bg-gray-50 text-gray-500' :
                                plan.tier === 'seed' ? 'bg-green-50 text-green-600' :
                                plan.tier === 'grow' ? 'bg-blue-50 text-blue-600' :
                                plan.tier === 'pro' ? 'bg-purple-50 text-purple-600' :
                                'bg-amber-50 text-amber-600'
                              }
                            >
                              {plan.tier === 'free' ? 'Freemium' :
                               plan.tier === 'seed' ? 'Seed' :
                               plan.tier === 'grow' ? 'Grow' :
                               plan.tier === 'pro' ? 'Professional' :
                               'Enterprise'}
                            </Badge>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-medium">Recursos inclusos:</p>
                          <ul className="space-y-1">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="text-sm flex gap-2 items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 text-sm flex justify-between">
                          <span>Máximo de usuários: <strong>{plan.maxUsers}</strong></span>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Nenhum plano encontrado</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Cadastre planos de assinatura para disponibilizar o módulo do portal médico.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => navigate("/organization/medical-portal/plans/add")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assinaturas Ativas</CardTitle>
                <CardDescription>
                  Organizações com acesso ao portal médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions?.length ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription: Subscription) => (
                      <div key={subscription.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{subscription.organizationName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Plano: <span className="font-medium">{subscription.planName}</span>
                            </p>
                          </div>
                          <Badge
                            variant={
                              subscription.status === 'active' ? 'default' :
                              subscription.status === 'pending' ? 'secondary' :
                              subscription.status === 'canceled' ? 'destructive' :
                              'outline'
                            }
                          >
                            {subscription.status === 'active' ? 'Ativa' :
                             subscription.status === 'pending' ? 'Pendente' :
                             subscription.status === 'canceled' ? 'Cancelada' :
                             'Expirada'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Data de início</p>
                            <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data de término</p>
                            <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Forma de pagamento</p>
                            <p>{subscription.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Renovação automática</p>
                            <p>{subscription.autoRenew ? 'Sim' : 'Não'}</p>
                          </div>
                        </div>
                        {subscription.lastPayment && (
                          <div className="mt-3 bg-muted p-2 rounded-md text-sm">
                            <p className="font-medium">Último pagamento</p>
                            <div className="flex justify-between mt-1">
                              <p>R$ {subscription.lastPayment.amount.toFixed(2)}</p>
                              <p>{new Date(subscription.lastPayment.date).toLocaleDateString()}</p>
                              <Badge 
                                variant="outline" 
                                className={
                                  subscription.lastPayment.status === 'paid' ? 'bg-green-50 text-green-600' :
                                  subscription.lastPayment.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                  'bg-red-50 text-red-600'
                                }
                              >
                                {subscription.lastPayment.status === 'paid' ? 'Pago' :
                                 subscription.lastPayment.status === 'pending' ? 'Pendente' : 'Falhou'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <CreditCard className="h-3.5 w-3.5 mr-1" />
                            Pagamentos
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3.5 w-3.5 mr-1" />
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Nenhuma assinatura encontrada</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Ainda não há organizações com assinaturas ativas do portal médico.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => navigate("/organization/medical-portal/subscriptions/add")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Assinatura
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Farmacêuticos RT */}
        <TabsContent value="pharmacists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmacêuticos Responsáveis Técnicos</CardTitle>
              <CardDescription>
                Gerencie os farmacêuticos que podem aprovar prescrições e documentos no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pharmacists?.length ? (
                <div className="space-y-4">
                  {pharmacists.map((pharmacist: Pharmacist) => (
                    <div key={pharmacist.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{pharmacist.name}</h3>
                          <p className="text-sm text-muted-foreground">{pharmacist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={pharmacist.isActive ? "default" : "secondary"}>
                            {pharmacist.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">CRF: {pharmacist.license}</p>
                        </div>
                        <Switch 
                          checked={pharmacist.isActive}
                          // Na implementação real, adicionar mutation para alternar status
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhum Farmacêutico RT Registrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Adicione farmacêuticos responsáveis técnicos para gerenciar prescrições e aprovar documentos no sistema.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate("/organization/medical-portal/pharmacists/add")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Farmacêutico RT
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Portal Médico</CardTitle>
              <CardDescription>
                Configure o funcionamento do portal médico, URLs de acesso e políticas de aprovação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">URLs de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorPortalUrl">URL do Portal do Médico</Label>
                    <Input 
                      id="doctorPortalUrl" 
                      value={moduleStatus?.settings?.doctorPortalUrl || ""} 
                      placeholder="https://medicos.suaorganizacao.com.br"
                      // Na implementação real, adicionar onChange para atualizar estado
                    />
                    <p className="text-sm text-muted-foreground">
                      URL onde médicos acessarão o portal para criar prescrições
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pharmacistPortalUrl">URL do Portal do Farmacêutico</Label>
                    <Input 
                      id="pharmacistPortalUrl" 
                      value={moduleStatus?.settings?.pharmacistPortalUrl || ""} 
                      placeholder="https://farmacia.suaorganizacao.com.br"
                      // Na implementação real, adicionar onChange para atualizar estado
                    />
                    <p className="text-sm text-muted-foreground">
                      URL onde farmacêuticos acessarão o portal para aprovar prescrições
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patientPortalUrl">URL do Portal do Paciente</Label>
                    <Input 
                      id="patientPortalUrl" 
                      value={moduleStatus?.settings?.patientPortalUrl || ""} 
                      placeholder="https://pacientes.suaorganizacao.com.br" 
                      // Na implementação real, adicionar onChange para atualizar estado
                    />
                    <p className="text-sm text-muted-foreground">
                      URL onde pacientes acessarão o portal para visualizar prescrições aprovadas
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Políticas de Acesso</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowPatientRegistration">Permitir cadastro de pacientes</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que novos pacientes se cadastrem diretamente no portal
                      </p>
                    </div>
                    <Switch 
                      id="allowPatientRegistration"
                      checked={moduleStatus?.settings?.allowPatientRegistration || false}
                      // Na implementação real, adicionar onCheckedChange para atualizar estado
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowDoctorRegistration">Permitir cadastro de médicos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que novos médicos solicitem acesso ao portal
                      </p>
                    </div>
                    <Switch 
                      id="allowDoctorRegistration"
                      checked={moduleStatus?.settings?.allowDoctorRegistration || false}
                      // Na implementação real, adicionar onCheckedChange para atualizar estado
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePharmacistApproval">Exigir aprovação de farmacêutico RT</Label>
                      <p className="text-sm text-muted-foreground">
                        Todas as prescrições devem ser aprovadas por um farmacêutico RT antes de ficarem disponíveis
                      </p>
                    </div>
                    <Switch 
                      id="requirePharmacistApproval"
                      checked={moduleStatus?.settings?.requirePharmacistApproval || false}
                      // Na implementação real, adicionar onCheckedChange para atualizar estado
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoApproveVerifiedDoctors">Aprovação automática para médicos verificados</Label>
                      <p className="text-sm text-muted-foreground">
                        Prescrições de médicos verificados são aprovadas automaticamente
                      </p>
                    </div>
                    <Switch 
                      id="autoApproveVerifiedDoctors"
                      checked={moduleStatus?.settings?.autoApproveVerifiedDoctors || false}
                      // Na implementação real, adicionar onCheckedChange para atualizar estado
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="mr-2">
                Cancelar
              </Button>
              <Button>
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições por Período</CardTitle>
                <CardDescription>
                  Total de prescrições registradas por período
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                <LineChart className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground ml-3">Gráfico de prescrições por período</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Relatório Detalhado
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aprovações por Farmacêutico</CardTitle>
                <CardDescription>
                  Total de aprovações por farmacêutico RT
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground ml-3">Gráfico de aprovações por farmacêutico</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Pills className="h-4 w-4 mr-2" />
                  Ver Relatório Detalhado
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Desempenho</CardTitle>
              <CardDescription>
                Principais métricas do portal médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Prescrições</p>
                  <h3 className="text-2xl font-bold">{metrics?.prescriptions?.total || 0}</h3>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Médicos Ativos</p>
                  <h3 className="text-2xl font-bold">{metrics?.activeDoctors || 0}</h3>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Tempo Médio de Aprovação</p>
                  <h3 className="text-2xl font-bold">{metrics?.avgApprovalTime || "N/A"}</h3>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                  <h3 className="text-2xl font-bold">{metrics?.approvalRate || "0%"}</h3>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Exportar Relatórios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MedicalPortalPage() {
  return (
    <OrganizationLayout>
      <MedicalPortalDashboard />
    </OrganizationLayout>
  );
}