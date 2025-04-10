import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  FileClock,
  User,
  UserPlus,
  Users,
  Settings,
  FileText,
  Clipboard,
  Pill,
  PlusCircle,
  AlertCircle,
  BarChart3,
  ChevronRight,
  LineChart,
  Activity,
  PackageCheck,
  Loader2,
  Link as LinkIcon
} from "lucide-react";

interface FarmacistaRT {
  id: number;
  userId: number;
  name: string;
  email: string;
  license: string;
  isActive: boolean;
}

interface ModuleStatus {
  id: number;
  active: boolean;
  settings: {
    farmaciaPortalUrl?: string;
    allowPharmacistRegistration: boolean;
    requirePharmacistApproval: boolean;
  }
}

function FarmaciaDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Buscar status do módulo
  const { data: moduleStatus, isLoading: isModuleStatusLoading } = useQuery({
    queryKey: ['/api/organization/modules/farmacia/status'],
  });

  // Buscar farmacêuticos RT
  const { data: farmacistasRT, isLoading: isFarmacistasRTLoading } = useQuery({
    queryKey: ['/api/organization/farmacistas'],
  });

  // Buscar métricas da farmácia
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['/api/organization/modules/farmacia/metrics'],
  });

  // Mutação para atualizar configurações do módulo
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/organization/modules/farmacia/settings', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/organization/modules/farmacia/status'] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do módulo Farmácia foram atualizadas com sucesso.",
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
      const response = await fetch('/api/organization/modules/farmacia/toggle', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/organization/modules/farmacia/status'] });
      toast({
        title: data.active ? "Módulo ativado" : "Módulo desativado",
        description: data.active 
          ? "O módulo Farmácia está agora disponível." 
          : "O módulo Farmácia foi desativado com sucesso.",
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
  const addFarmacistaRTMutation = useMutation({
    mutationFn: async (farmacistaData: any) => {
      const response = await fetch('/api/organization/farmacistas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmacistaData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar farmacêutico RT');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/farmacistas'] });
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

  if (isModuleStatusLoading || isFarmacistasRTLoading || isMetricsLoading) {
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
          <h1 className="text-3xl font-bold">Módulo Farmácia</h1>
          <p className="text-muted-foreground">
            Gerencie a farmácia, farmacêuticos RT e configurações para integração com o dispensário.
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
            value="farmacistas" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Farmacêuticos RT
          </TabsTrigger>
          <TabsTrigger 
            value="inventory" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Estoque
          </TabsTrigger>
          <TabsTrigger 
            value="prescriptions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Prescrições
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Status do Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {moduleStatus?.active ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold">Farmácia Ativa</p>
                        <p className="text-muted-foreground text-sm">O módulo de farmácia está operacional</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <p className="font-semibold">Farmácia Inativa</p>
                        <p className="text-muted-foreground text-sm">O módulo de farmácia está desativado</p>
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
                  {moduleStatus?.active ? "Desativar Farmácia" : "Ativar Farmácia"}
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
                    <p className="font-semibold">{farmacistasRT?.length || 0} Registrados</p>
                    <p className="text-muted-foreground text-sm">
                      {farmacistasRT?.filter(p => p.isActive)?.length || 0} ativos
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("farmacistas")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Gerenciar Farmacêuticos RT
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
                  onClick={() => navigate("/organization/farmacia/prescricoes")}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Ver Prescrições
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas atividades da farmácia
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

        {/* Farmacêuticos RT */}
        <TabsContent value="farmacistas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmacêuticos Responsáveis Técnicos</CardTitle>
              <CardDescription>
                Gerencie os farmacêuticos que podem aprovar prescrições e documentos no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {farmacistasRT?.length ? (
                <div className="space-y-4">
                  {farmacistasRT.map((farmacista: FarmacistaRT) => (
                    <div key={farmacista.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{farmacista.name}</h3>
                          <p className="text-sm text-muted-foreground">{farmacista.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={farmacista.isActive ? "default" : "secondary"}>
                            {farmacista.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">CRF: {farmacista.license}</p>
                        </div>
                        <Switch 
                          checked={farmacista.isActive}
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
              <Button onClick={() => navigate("/organization/farmacia/farmacistas/add")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Farmacêutico RT
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Estoque */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estoque da Farmácia</CardTitle>
              <CardDescription>
                Gerencie o inventário de produtos da farmácia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <PackageCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Módulo de Estoque</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Gerencie o estoque de produtos da farmácia, incluindo medicamentos, produtos de saúde e itens dispensáveis.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate("/organization/farmacia/estoque")}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Ir para Gestão de Estoque
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Prescrições */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Prescrições</CardTitle>
              <CardDescription>
                Aprove e gerencie prescrições médicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Módulo de Prescrições</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Aprove prescrições médicas, gerencie pedidos de dispensação e acompanhe o histórico de pacientes.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate("/organization/farmacia/prescricoes")}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Ir para Prescrições
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Farmácia</CardTitle>
              <CardDescription>
                Configure o funcionamento da farmácia, URLs de acesso e políticas de aprovação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">URLs de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacistPortalUrl">URL do Portal da Farmácia</Label>
                    <Input 
                      id="pharmacistPortalUrl" 
                      value={moduleStatus?.settings?.farmaciaPortalUrl || ""} 
                      placeholder="https://farmacia.suaorganizacao.com.br"
                      // Na implementação real, adicionar onChange para atualizar estado
                    />
                    <p className="text-sm text-muted-foreground">
                      URL onde farmacêuticos acessarão o portal para gerenciar a farmácia
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
                      <Label htmlFor="allowPharmacistRegistration">Permitir cadastro de farmacêuticos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que novos farmacêuticos solicitem acesso ao portal
                      </p>
                    </div>
                    <Switch 
                      id="allowPharmacistRegistration"
                      checked={moduleStatus?.settings?.allowPharmacistRegistration || false}
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
      </Tabs>
    </div>
  );
}

export default function FarmaciaPage() {
  return (
    <OrganizationLayout>
      <FarmaciaDashboard />
    </OrganizationLayout>
  );
}