'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Nota: Em uma implementação real, importaríamos componentes de gráficos de bibliotecas como recharts
import { 
  ChevronDown, 
  Download, 
  FileBarChart, 
  LineChart as LineChartIcon,
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  CalendarRange
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Substitutos para os componentes de gráficos reais
// Em uma aplicação real, você usaria bibliotecas como recharts, chartjs, etc.
const AreaChartPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full h-64 bg-muted/20 rounded-md border flex items-center justify-center">
    <div className="text-center">
      <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Gráfico de Área</p>
      <p className="text-xs text-muted-foreground mt-1">
        {data?.labels?.[0]} a {data?.labels?.[data?.labels?.length - 1]}
      </p>
    </div>
  </div>
);

const BarChartPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full h-64 bg-muted/20 rounded-md border flex items-center justify-center">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Gráfico de Barras</p>
      <p className="text-xs text-muted-foreground mt-1">
        {data?.length} categorias
      </p>
    </div>
  </div>
);

const PieChartPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full h-64 bg-muted/20 rounded-md border flex items-center justify-center">
    <div className="text-center">
      <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Gráfico de Pizza</p>
      <p className="text-xs text-muted-foreground mt-1">
        {data?.length} fatias
      </p>
    </div>
  </div>
);

const LineChartPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full h-64 bg-muted/20 rounded-md border flex items-center justify-center">
    <div className="text-center">
      <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Gráfico de Linha</p>
      <p className="text-xs text-muted-foreground mt-1">
        {data?.datasets?.length} séries de dados
      </p>
    </div>
  </div>
);

// Dados mockados para análise financeira
const DADOS_RECEITAS_DESPESAS = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Receitas',
      data: [45000, 52000, 49000, 60000, 55000, 63000],
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgb(34, 197, 94)',
    },
    {
      label: 'Despesas',
      data: [38000, 42000, 40000, 45000, 43000, 48000],
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgb(239, 68, 68)',
    },
  ],
};

const DADOS_FLUXO_CAIXA = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Fluxo de Caixa',
      data: [7000, 10000, 9000, 15000, 12000, 15000],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
    },
  ],
};

const DADOS_DESPESAS_POR_CATEGORIA = [
  { name: 'Salários', value: 28000, color: '#4ade80' },
  { name: 'Fornecedores', value: 12000, color: '#2dd4bf' },
  { name: 'Marketing', value: 5000, color: '#a78bfa' },
  { name: 'Infraestrutura', value: 8000, color: '#f87171' },
  { name: 'Impostos', value: 6000, color: '#facc15' },
  { name: 'Outros', value: 3000, color: '#f97316' },
];

const DADOS_RECEITAS_POR_CATEGORIA = [
  { name: 'Vendas Diretas', value: 35000, color: '#4ade80' },
  { name: 'Assinaturas', value: 18000, color: '#2dd4bf' },
  { name: 'Serviços', value: 12000, color: '#a78bfa' },
  { name: 'Outros', value: 3000, color: '#f87171' },
];

const INDICADORES_FINANCEIROS = [
  { 
    id: 1, 
    nome: 'Margem de Lucro', 
    valor: 22.5, 
    unidade: '%', 
    tendencia: 'aumento', 
    variacao: 1.8 
  },
  { 
    id: 2, 
    nome: 'ROI', 
    valor: 15.3, 
    unidade: '%', 
    tendencia: 'aumento', 
    variacao: 0.7 
  },
  { 
    id: 3, 
    nome: 'Liquidez Corrente', 
    valor: 2.1, 
    unidade: '', 
    tendencia: 'estavel', 
    variacao: 0.1 
  },
  { 
    id: 4, 
    nome: 'Ciclo Operacional', 
    valor: 45, 
    unidade: 'dias', 
    tendencia: 'diminuicao', 
    variacao: -3 
  },
  { 
    id: 5, 
    nome: 'Endividamento', 
    valor: 32.8, 
    unidade: '%', 
    tendencia: 'diminuicao', 
    variacao: -1.5 
  },
];

const PROJECOES_FINANCEIRAS = {
  labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Receitas (Projeção)',
      data: [65000, 67000, 70000, 72000, 75000, 80000],
      borderColor: 'rgb(34, 197, 94)',
      borderDash: [5, 5],
    },
    {
      label: 'Despesas (Projeção)',
      data: [50000, 51000, 52000, 53000, 54000, 56000],
      borderColor: 'rgb(239, 68, 68)',
      borderDash: [5, 5],
    },
  ],
};

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
};

export default function AnaliseFinanceira() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('semestre');
  const [anoSelecionado, setAnoSelecionado] = useState('2025');
  
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análise Financeira</h1>
            <p className="text-muted-foreground">
              Visualize indicadores e tendências financeiras
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Exportar Relatório
            </Button>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receita Total</span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">
                  {formatarMoeda(324000)}
                </div>
                <div className="flex items-center text-xs text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12.5% vs período anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Despesa Total</span>
                  <DollarSign className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold">
                  {formatarMoeda(256000)}
                </div>
                <div className="flex items-center text-xs text-red-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>8.2% vs período anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lucro Líquido</span>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  {formatarMoeda(68000)}
                </div>
                <div className="flex items-center text-xs text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>15.3% vs período anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Margem de Lucro</span>
                  <CalendarRange className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  21%
                </div>
                <div className="flex items-center text-xs text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>2.1% vs período anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="receitas-despesas">Receitas e Despesas</TabsTrigger>
            <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
            <TabsTrigger value="projecoes">Projeções</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visao-geral">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Receitas vs Despesas</CardTitle>
                  <CardDescription>
                    Comparativo entre receitas e despesas no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AreaChartPlaceholder data={DADOS_RECEITAS_DESPESAS} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Fluxo de Caixa</CardTitle>
                  <CardDescription>
                    Evolução do fluxo de caixa no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChartPlaceholder data={DADOS_FLUXO_CAIXA} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Despesas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição das despesas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChartPlaceholder data={DADOS_DESPESAS_POR_CATEGORIA} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Receitas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição das receitas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChartPlaceholder data={DADOS_RECEITAS_POR_CATEGORIA} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="receitas-despesas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Evolução de Receitas</CardTitle>
                  <CardDescription>
                    Crescimento das receitas ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartPlaceholder data={DADOS_RECEITAS_DESPESAS.datasets[0]} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Evolução de Despesas</CardTitle>
                  <CardDescription>
                    Crescimento das despesas ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartPlaceholder data={DADOS_RECEITAS_DESPESAS.datasets[1]} />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Detalhamento por Categoria</CardTitle>
                  <CardDescription>
                    Análise detalhada de receitas e despesas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">% do Total</TableHead>
                        <TableHead className="text-right">Vs. Período Anterior</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="font-semibold">Receitas</TableCell>
                      </TableRow>
                      {DADOS_RECEITAS_POR_CATEGORIA.map((item, index) => (
                        <TableRow key={`receita-${index}`}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(item.value)}</TableCell>
                          <TableCell className="text-right">
                            {(item.value / DADOS_RECEITAS_POR_CATEGORIA.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-green-500">+12.3%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="font-semibold">Despesas</TableCell>
                      </TableRow>
                      {DADOS_DESPESAS_POR_CATEGORIA.map((item, index) => (
                        <TableRow key={`despesa-${index}`}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(item.value)}</TableCell>
                          <TableCell className="text-right">
                            {(item.value / DADOS_DESPESAS_POR_CATEGORIA.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-red-500">+8.7%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="indicadores">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Indicadores Financeiros</CardTitle>
                  <CardDescription>
                    Principais indicadores de performance financeira
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Indicador</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Variação</TableHead>
                        <TableHead>Tendência</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {INDICADORES_FINANCEIROS.map((indicador) => (
                        <TableRow key={indicador.id}>
                          <TableCell className="font-medium">{indicador.nome}</TableCell>
                          <TableCell className="text-right">{indicador.valor}{indicador.unidade}</TableCell>
                          <TableCell className={`text-right ${
                            indicador.tendencia === 'aumento' 
                              ? 'text-green-500' 
                              : indicador.tendencia === 'diminuicao' 
                                ? (indicador.nome === 'Ciclo Operacional' || indicador.nome === 'Endividamento' ? 'text-green-500' : 'text-red-500') 
                                : 'text-muted-foreground'
                          }`}>
                            {indicador.variacao > 0 ? '+' : ''}{indicador.variacao}{indicador.unidade}
                          </TableCell>
                          <TableCell>
                            {indicador.tendencia === 'aumento' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : indicador.tendencia === 'diminuicao' ? (
                              <TrendingDown className={`h-4 w-4 ${
                                indicador.nome === 'Ciclo Operacional' || indicador.nome === 'Endividamento' 
                                  ? 'text-green-500' 
                                  : 'text-red-500'
                              }`} />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              indicador.tendencia === 'aumento' 
                                ? 'bg-green-100 text-green-800' 
                                : indicador.tendencia === 'diminuicao' 
                                  ? (indicador.nome === 'Ciclo Operacional' || indicador.nome === 'Endividamento' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800') 
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {indicador.tendencia === 'aumento' 
                                ? 'Positivo' 
                                : indicador.tendencia === 'diminuicao' 
                                  ? (indicador.nome === 'Ciclo Operacional' || indicador.nome === 'Endividamento' 
                                    ? 'Positivo' 
                                    : 'Negativo') 
                                  : 'Estável'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Evolução da Margem de Lucro</CardTitle>
                    <CardDescription>
                      Variação da margem de lucro ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChartPlaceholder data={{ 
                      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], 
                      datasets: [{ label: 'Margem de Lucro' }] 
                    }} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Evolução do ROI</CardTitle>
                    <CardDescription>
                      Variação do retorno sobre investimento ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChartPlaceholder data={{ 
                      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], 
                      datasets: [{ label: 'ROI' }] 
                    }} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projecoes">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Projeções Financeiras</CardTitle>
                  <CardDescription>
                    Projeções de receitas e despesas para os próximos meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChartPlaceholder data={PROJECOES_FINANCEIRAS} />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Projeção de Lucro</CardTitle>
                    <CardDescription>
                      Previsão de lucro para os próximos períodos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Jul 2025</span>
                        <span className="font-semibold">{formatarMoeda(65000 - 50000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ago 2025</span>
                        <span className="font-semibold">{formatarMoeda(67000 - 51000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Set 2025</span>
                        <span className="font-semibold">{formatarMoeda(70000 - 52000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Out 2025</span>
                        <span className="font-semibold">{formatarMoeda(72000 - 53000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Nov 2025</span>
                        <span className="font-semibold">{formatarMoeda(75000 - 54000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dez 2025</span>
                        <span className="font-semibold">{formatarMoeda(80000 - 56000)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Projeção de Crescimento</CardTitle>
                    <CardDescription>
                      Estimativa de crescimento para o próximo período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Receitas</span>
                        <div className="flex items-center text-green-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-semibold">+15.2%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Despesas</span>
                        <div className="flex items-center text-green-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-semibold">+10.5%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lucro</span>
                        <div className="flex items-center text-green-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-semibold">+22.7%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Margem de Lucro</span>
                        <div className="flex items-center text-green-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-semibold">+1.5%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Cenários de Projeção</CardTitle>
                    <CardDescription>
                      Análise de diferentes cenários financeiros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Cenário Otimista</h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Receita Anual:</span>
                            <span>{formatarMoeda(850000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucro Líquido:</span>
                            <span>{formatarMoeda(210000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margem:</span>
                            <span>24.7%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Cenário Base</h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Receita Anual:</span>
                            <span>{formatarMoeda(780000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucro Líquido:</span>
                            <span>{formatarMoeda(175000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margem:</span>
                            <span>22.4%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Cenário Conservador</h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Receita Anual:</span>
                            <span>{formatarMoeda(720000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lucro Líquido:</span>
                            <span>{formatarMoeda(145000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margem:</span>
                            <span>20.1%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}