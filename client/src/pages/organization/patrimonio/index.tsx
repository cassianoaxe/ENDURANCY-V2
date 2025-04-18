'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building, Warehouse, Wrench, Calculator, BarChart3, Clock, FileText, Plus,
  Settings, List, Grid, ArrowUpRight, CalendarDays
} from 'lucide-react';
import { PageHeader, PageSubHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { columns as installationColumns } from './columns/installation-columns';
import { columns as assetColumns } from './columns/asset-columns';

export default function PatrimonioPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState('ativos');

  // Consulta de instalações
  const {
    data: instalacoes,
    isLoading: isLoadingInstalacoes
  } = useQuery({
    queryKey: ['/api/patrimonio/instalacoes'],
    enabled: activeTab === 'instalacoes',
  });

  // Consulta de ativos
  const {
    data: ativos,
    isLoading: isLoadingAtivos
  } = useQuery({
    queryKey: ['/api/patrimonio/ativos'],
    enabled: activeTab === 'ativos',
  });

  // Consulta de manutenções
  const {
    data: manutencoes,
    isLoading: isLoadingManutencoes
  } = useQuery({
    queryKey: ['/api/patrimonio/manutencoes'],
    enabled: activeTab === 'manutencoes',
  });

  // Consulta do resumo para o dashboard
  const {
    data: resumo,
    isLoading: isLoadingResumo
  } = useQuery({
    queryKey: ['/api/patrimonio/dashboard-resumo'],
    enabled: activeTab === 'dashboard',
  });

  const resumoDados = resumo || {
    totalAtivos: 0,
    valorTotal: 0,
    depreciacao: 0,
    valorAtual: 0,
    totalInstalacoes: 0,
    manutencoesPendentes: 0,
    proximasManutencoes: []
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Gerenciamento de Patrimônio"
        text="Controle e acompanhe todos os seus ativos e instalações."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setView(view === 'table' ? 'grid' : 'table')}>
            {view === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <Button asChild>
            <Link to={activeTab === 'ativos' ? '/organization/patrimonio/ativos/novo' : 
                     activeTab === 'instalacoes' ? '/organization/patrimonio/instalacoes/nova' :
                     activeTab === 'manutencoes' ? '/organization/patrimonio/manutencoes/nova' : '#'}>
              <Plus className="mr-2 h-4 w-4" /> {
                activeTab === 'ativos' ? 'Novo Ativo' :
                activeTab === 'instalacoes' ? 'Nova Instalação' :
                activeTab === 'manutencoes' ? 'Nova Manutenção' : 'Novo'
              }
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="ativos" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ativos">
            <Wrench className="h-4 w-4 mr-2" />
            Ativos
          </TabsTrigger>
          <TabsTrigger value="instalacoes">
            <Building className="h-4 w-4 mr-2" />
            Instalações
          </TabsTrigger>
          <TabsTrigger value="manutencoes">
            <Clock className="h-4 w-4 mr-2" />
            Manutenções
          </TabsTrigger>
          <TabsTrigger value="depreciacao">
            <Calculator className="h-4 w-4 mr-2" />
            Depreciação
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PageSubHeader
            heading="Dashboard de Patrimônio"
            text="Resumo geral dos seus ativos e instalações."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
                <CardDescription>Quantidade de equipamentos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumo ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-3xl font-bold">{resumoDados.totalAtivos}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Distribuídos em {resumoDados.totalInstalacoes} instalações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Total do Patrimônio</CardTitle>
                <CardDescription>Valor de aquisição de todos os ativos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumo ? (
                  <Skeleton className="h-12 w-32" />
                ) : (
                  <div className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoDados.valorTotal)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Depreciação acumulada: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoDados.depreciacao)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Manutenções Pendentes</CardTitle>
                <CardDescription>Manutenções programadas e em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumo ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-3xl font-bold">{resumoDados.manutencoesPendentes}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Próxima manutenção em {resumoDados.proximasManutencoes?.[0]?.diasRestantes || 0} dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Manutenções</CardTitle>
                <CardDescription>Manutenções programadas para os próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumo ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : resumoDados.proximasManutencoes?.length > 0 ? (
                  <ul className="space-y-2">
                    {resumoDados.proximasManutencoes.slice(0, 5).map((manutencao: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{manutencao.ativoNome}</p>
                          <p className="text-sm text-muted-foreground">{manutencao.tipoManutencao} - {manutencao.data}</p>
                        </div>
                        <Badge variant={manutencao.diasRestantes < 7 ? "destructive" : "outline"}>
                          {manutencao.diasRestantes} dias
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma manutenção programada para os próximos 30 dias</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/organization/patrimonio/manutencoes">
                    Ver todas as manutenções <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ativos com Maior Depreciação</CardTitle>
                <CardDescription>Ativos com maior taxa de depreciação mensal</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumo ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {(resumo?.ativosComMaiorDepreciacao || []).map((ativo: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{ativo.name}</p>
                          <p className="text-sm text-muted-foreground">Taxa: {ativo.depreciationRate}% ao mês</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ativo.currentValue)}
                          </p>
                          <p className="text-xs text-muted-foreground">Valor atual</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/organization/patrimonio/depreciacao">
                    Calcular depreciação <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ativos">
          <PageSubHeader
            heading="Ativos e Equipamentos"
            text="Visualize e gerencie todos os seus ativos."
          />
          
          {isLoadingAtivos ? (
            <div className="space-y-2 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : view === 'table' ? (
            <DataTable columns={assetColumns} data={ativos || []} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(ativos || []).map((ativo: any) => (
                <Card key={ativo.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ativo.name}</CardTitle>
                      <Badge variant={
                        ativo.status === 'ativo' ? 'success' :
                        ativo.status === 'em_manutenção' ? 'warning' :
                        ativo.status === 'inativo' ? 'secondary' : 'destructive'
                      }>
                        {ativo.status}
                      </Badge>
                    </div>
                    <CardDescription>{ativo.description || 'Sem descrição'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo:</p>
                        <p>{ativo.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nº de Série:</p>
                        <p>{ativo.serialNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor:</p>
                        <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ativo.acquisitionValue || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Atual:</p>
                        <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ativo.currentValue || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/ativos/${ativo.id}`}>
                          Detalhes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/ativos/${ativo.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="instalacoes">
          <PageSubHeader
            heading="Instalações"
            text="Gerencie todas as suas instalações e localidades."
          />
          
          {isLoadingInstalacoes ? (
            <div className="space-y-2 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : view === 'table' ? (
            <DataTable columns={installationColumns} data={instalacoes || []} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(instalacoes || []).map((instalacao: any) => (
                <Card key={instalacao.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{instalacao.name}</CardTitle>
                      <Badge variant={
                        instalacao.status === 'ativo' ? 'success' :
                        instalacao.status === 'em_manutenção' ? 'warning' :
                        instalacao.status === 'inativo' ? 'secondary' : 'destructive'
                      }>
                        {instalacao.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {instalacao.type} - {instalacao.city}, {instalacao.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Endereço:</p>
                        <p>{instalacao.address}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Área Total:</p>
                        <p>{instalacao.totalArea} m²</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capacidade:</p>
                        <p>{instalacao.capacity || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ocupação:</p>
                        <p>{(instalacao.occupancyRate || 0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}`}>
                          Detalhes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manutencoes">
          <PageSubHeader
            heading="Manutenções"
            text="Programação e histórico de manutenções de equipamentos."
          />
          
          {isLoadingManutencoes ? (
            <div className="space-y-2 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(manutencoes || []).map((manutencao: any) => (
                <Card key={manutencao.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Manutenção #{manutencao.id}</CardTitle>
                      <Badge variant={
                        manutencao.status === 'concluída' ? 'success' :
                        manutencao.status === 'em_andamento' ? 'warning' :
                        manutencao.status === 'agendada' ? 'secondary' : 'destructive'
                      }>
                        {manutencao.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {manutencao.maintenanceType} - {manutencao.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ativo:</p>
                        <p>{manutencao.assetName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prioridade:</p>
                        <p>{manutencao.priority}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data Programada:</p>
                        <p>{new Date(manutencao.scheduledDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo:</p>
                        <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(manutencao.cost || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/manutencoes/${manutencao.id}`}>
                          Detalhes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organization/patrimonio/manutencoes/${manutencao.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="depreciacao">
          <PageSubHeader
            heading="Cálculo de Depreciação"
            text="Calcule a depreciação dos seus ativos e gere relatórios."
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Depreciação Anual</CardTitle>
              <CardDescription>
                Calcule a depreciação dos ativos pelo método linear, soma dos dígitos ou outros métodos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <Button asChild>
                  <Link to="/organization/patrimonio/depreciacao/calculadora">
                    <Calculator className="mr-2 h-4 w-4" />
                    Acessar Calculadora de Depreciação
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relatórios de Depreciação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/organization/patrimonio/relatorios/depreciacao-mensal">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Depreciação Mensal
                          </Link>
                        </Button>
                      </li>
                      <li>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/organization/patrimonio/relatorios/depreciacao-anual">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Depreciação Anual
                          </Link>
                        </Button>
                      </li>
                      <li>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/organization/patrimonio/relatorios/projecao-depreciacoes">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Projeção de Depreciações
                          </Link>
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações de Depreciação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/organization/patrimonio/configuracoes/metodos-depreciacao">
                            <Settings className="mr-2 h-4 w-4" />
                            Métodos de Depreciação
                          </Link>
                        </Button>
                      </li>
                      <li>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/organization/patrimonio/configuracoes/taxas-depreciacao">
                            <Calculator className="mr-2 h-4 w-4" />
                            Taxas de Depreciação
                          </Link>
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <PageSubHeader
            heading="Relatórios"
            text="Gere relatórios detalhados sobre seus ativos e instalações."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Ativos</CardTitle>
                <CardDescription>
                  Relatórios relacionados aos ativos e equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/inventario-ativos">
                        <List className="mr-2 h-4 w-4" />
                        Inventário de Ativos
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/ativos-por-instalacao">
                        <Building className="mr-2 h-4 w-4" />
                        Ativos por Instalação
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/ativos-por-tipo">
                        <Wrench className="mr-2 h-4 w-4" />
                        Ativos por Tipo
                      </Link>
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Manutenção</CardTitle>
                <CardDescription>
                  Relatórios relacionados às manutenções e serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/historico-manutencoes">
                        <Clock className="mr-2 h-4 w-4" />
                        Histórico de Manutenções
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/custos-manutencao">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Custos de Manutenção
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/planejamento-manutencoes">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Planejamento de Manutenções
                      </Link>
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Financeiros</CardTitle>
                <CardDescription>
                  Relatórios relacionados aos aspectos financeiros do patrimônio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/valor-patrimonio">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Valor do Patrimônio
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/depreciacao">
                        <Calculator className="mr-2 h-4 w-4" />
                        Depreciação
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/organization/patrimonio/relatorios/custos-operacionais">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Custos Operacionais
                      </Link>
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}