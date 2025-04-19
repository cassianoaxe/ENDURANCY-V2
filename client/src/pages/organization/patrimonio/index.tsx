'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { 
  Building, 
  Wrench, 
  Package, 
  Calculator, 
  BarChart3, 
  PlusCircle, 
  AlertTriangle,
  Calendar,
  Clock,
  Landmark,
  MapPin,
  FileText,
  HelpCircle
} from 'lucide-react';

// Importando o componente de tour
import PatrimonioTour from './components/patrimonio-tour';

export default function PatrimonioPage() {
  // Estado para controlar a exibição do tour
  const [tourOpen, setTourOpen] = useState(false);
  
  // Consulta de estatísticas do módulo
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/patrimonio/dashboard'],
  });

  // Função para iniciar o tour
  const startTour = () => {
    setTourOpen(true);
  };

  // Função para fechar o tour
  const closeTour = () => {
    setTourOpen(false);
  };

  return (
    <div className="container mx-auto py-6" data-tour="patrimonio-dashboard">
      <PageHeader
        heading="Gestão de Patrimônio"
        text="Gerencie todos os ativos, instalações e depreciações da sua organização."
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/ativos/novo">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Ativo
            </Link>
          </Button>
          
          <Button variant="secondary" asChild>
            <Link to="/organization/patrimonio/instalacoes/nova">
              <Building className="mr-2 h-4 w-4" /> Nova Instalação
            </Link>
          </Button>
          
          <Button variant="outline" onClick={startTour}>
            <HelpCircle className="mr-2 h-4 w-4" /> Tour Guiado
          </Button>
        </div>
      </PageHeader>
      
      {/* Tour guiado do módulo */}
      <PatrimonioTour 
        isOpen={tourOpen}
        onClose={closeTour}
        startStep="dashboard"
      />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assets">Ativos</TabsTrigger>
          <TabsTrigger value="facilities">Instalações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-tour="patrimonio-estatisticas">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
                <CardDescription>Quantidade de equipamentos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats?.totalAssets || 0}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/organization/patrimonio/ativos">
                    <Package className="mr-2 h-4 w-4" /> Ver Ativos
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Instalações</CardTitle>
                <CardDescription>Imóveis e instalações físicas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats?.totalFacilities || 0}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/organization/patrimonio/instalacoes">
                    <Building className="mr-2 h-4 w-4" /> Ver Instalações
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
                <CardDescription>Agendadas para os próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats?.upcomingMaintenance || 0}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/organization/patrimonio/manutencoes">
                    <Wrench className="mr-2 h-4 w-4" /> Ver Manutenções
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Patrimonial</CardTitle>
                <CardDescription>Total atual após depreciação</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(stats?.totalAssetValue || 0)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/organization/patrimonio/depreciacao">
                    <Calculator className="mr-2 h-4 w-4" /> Ver Depreciação
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ativos por Estado</CardTitle>
                <CardDescription>
                  Distribuição dos equipamentos por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span>Ativos</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByStatus?.active || 0}</span>
                      </div>
                      <Progress value={70} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-orange-500" />
                          <span>Em Manutenção</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByStatus?.maintenance || 0}</span>
                      </div>
                      <Progress value={15} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span>Inativos</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByStatus?.inactive || 0}</span>
                      </div>
                      <Progress value={10} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span>Em Garantia</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByStatus?.warranty || 0}</span>
                      </div>
                      <Progress value={5} className="h-2 bg-muted" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ativos por Categoria</CardTitle>
                <CardDescription>
                  Distribuição dos principais tipos de ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-violet-500" />
                          <span>Laboratoriais</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByType?.lab || 0}</span>
                      </div>
                      <Progress value={40} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span>Cultivo</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByType?.cultivation || 0}</span>
                      </div>
                      <Progress value={25} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-amber-500" />
                          <span>Tecnologia</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByType?.tech || 0}</span>
                      </div>
                      <Progress value={20} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-500" />
                          <span>Outros</span>
                        </div>
                        <span className="font-medium">{stats?.assetsByType?.others || 0}</span>
                      </div>
                      <Progress value={15} className="h-2 bg-muted" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manutenções Próximas</CardTitle>
                <CardDescription>
                  Agendadas para os próximos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : stats?.upcomingMaintenances && stats.upcomingMaintenances.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcomingMaintenances.map((maintenance: any, index: number) => (
                      <div key={index} className="flex items-start justify-between border-b pb-3">
                        <div className="space-y-1">
                          <p className="font-medium">{maintenance.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(maintenance.scheduledDate).toLocaleDateString('pt-BR')}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>{maintenance.assetName}</span>
                          </div>
                        </div>
                        <div className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          maintenance.priority === 'alta' 
                            ? 'bg-red-100 text-red-700'
                            : maintenance.priority === 'média'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {maintenance.priority.charAt(0).toUpperCase() + maintenance.priority.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">Sem manutenções agendadas</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Não há manutenções programadas para os próximos 30 dias
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/organization/patrimonio/manutencoes">
                    Ver todas as manutenções
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de Patrimônio</CardTitle>
                <CardDescription>
                  Itens que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : stats?.alerts && stats.alerts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.alerts.map((alert: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4 border-b pb-3">
                        <div className="rounded-full p-1 bg-amber-100">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Landmark className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">Nenhum alerta ativo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu patrimônio está em dia e sem alertas pendentes
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/organization/patrimonio/relatorios">
                    Ver relatórios completos
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assets" className="mt-6">
          <Card data-tour="patrimonio-ativos-card">
            <CardHeader>
              <CardTitle>Ativos e Equipamentos</CardTitle>
              <CardDescription>
                Gerencie todos os seus equipamentos, máquinas e outros ativos físicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/ativos">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Package className="h-8 w-8" />
                      <span className="text-sm font-medium">Listar todos os ativos</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/ativos/novo">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <PlusCircle className="h-8 w-8" />
                      <span className="text-sm font-medium">Cadastrar novo ativo</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/ativos/categorias">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <BarChart3 className="h-8 w-8" />
                      <span className="text-sm font-medium">Categorias de ativos</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/ativos/inventario">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Landmark className="h-8 w-8" />
                      <span className="text-sm font-medium">Inventário patrimonial</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="facilities" className="mt-6">
          <Card data-tour="patrimonio-instalacoes-card">
            <CardHeader>
              <CardTitle>Instalações e Imóveis</CardTitle>
              <CardDescription>
                Gerencie suas instalações físicas, terrenos e edificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/instalacoes">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Building className="h-8 w-8" />
                      <span className="text-sm font-medium">Listar instalações</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/instalacoes/nova">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <PlusCircle className="h-8 w-8" />
                      <span className="text-sm font-medium">Nova instalação</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/instalacoes/mapa">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <MapPin className="h-8 w-8" />
                      <span className="text-sm font-medium">Mapa de localidades</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/instalacoes/documentos">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <FileText className="h-8 w-8" />
                      <span className="text-sm font-medium">Documentação legal</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções</CardTitle>
              <CardDescription>
                Planeje e acompanhe as manutenções de seus ativos e instalações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/manutencoes">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Wrench className="h-8 w-8" />
                      <span className="text-sm font-medium">Todas as manutenções</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/manutencoes/nova">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <PlusCircle className="h-8 w-8" />
                      <span className="text-sm font-medium">Agendar manutenção</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/manutencoes/calendario">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Calendar className="h-8 w-8" />
                      <span className="text-sm font-medium">Calendário</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link to="/organization/patrimonio/depreciacao">
                    <div className="flex flex-col items-center justify-center w-full space-y-2">
                      <Calculator className="h-8 w-8" />
                      <span className="text-sm font-medium">Depreciação</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}