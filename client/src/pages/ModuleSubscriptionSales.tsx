import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ArrowUpRight, 
  BarChart3, 
  Users, 
  Package, 
  CircleDollarSign, 
  PlusCircle, 
  FileDown, 
  Calendar 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/components/layout/Layout";

// Sample data - would be replaced with real API data
const moduleSubscriptionData = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Fev', revenue: 20000 },
  { month: 'Mar', revenue: 28000 },
  { month: 'Abr', revenue: 32000 },
  { month: 'Mai', revenue: 45000 },
  { month: 'Jun', revenue: 52000 },
  { month: 'Jul', revenue: 58000 },
];

const moduleDistributionData = [
  { name: 'Financeiro', value: 40, color: '#4CAF50' },
  { name: 'RH', value: 25, color: '#2196F3' },
  { name: 'Logística', value: 20, color: '#FFC107' },
  { name: 'Suporte', value: 15, color: '#9C27B0' },
];

// Dados de distribuição de planos por módulo
const modulesPlanDistribution = [
  { module: 'Financeiro', plan: 'Básico', count: 15 },
  { module: 'Financeiro', plan: 'Profissional', count: 35 },
  { module: 'Financeiro', plan: 'Enterprise', count: 50 },
  { module: 'RH', plan: 'Básico', count: 25 },
  { module: 'RH', plan: 'Profissional', count: 45 },
  { module: 'RH', plan: 'Enterprise', count: 30 },
  { module: 'Logística', plan: 'Básico', count: 40 },
  { module: 'Logística', plan: 'Profissional', count: 35 },
  { module: 'Logística', plan: 'Enterprise', count: 25 },
  { module: 'Suporte', plan: 'Básico', count: 20 },
  { module: 'Suporte', plan: 'Profissional', count: 40 },
  { module: 'Suporte', plan: 'Enterprise', count: 40 },
];

const recentSubscriptions = [
  { 
    id: 1, 
    organization: 'Empresa ABC', 
    module: 'Financeiro', 
    plan: 'Enterprise', 
    amount: 599.90, 
    date: '01/07/2023',
    status: 'active'
  },
  { 
    id: 2, 
    organization: 'Clínica XYZ', 
    module: 'RH', 
    plan: 'Profissional', 
    amount: 289.90, 
    date: '05/07/2023',
    status: 'active'
  },
  { 
    id: 3, 
    organization: 'Distribuidora 123', 
    module: 'Logística', 
    plan: 'Básico', 
    amount: 149.90, 
    date: '12/07/2023',
    status: 'active'
  },
  { 
    id: 4, 
    organization: 'Consultório ABCD', 
    module: 'Suporte', 
    plan: 'Enterprise', 
    amount: 599.90, 
    date: '18/07/2023',
    status: 'active'
  },
  { 
    id: 5, 
    organization: 'Industria XYZ', 
    module: 'Financeiro', 
    plan: 'Profissional', 
    amount: 289.90, 
    date: '25/07/2023',
    status: 'active'
  },
];

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'];

export default function ModuleSubscriptionSales() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch module subscription statistics
  const { data: moduleStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/module-subscriptions/stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/module-subscriptions/stats?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Falha ao carregar estatísticas de assinaturas');
      return response.json();
    },
  });

  // Fetch recent subscriptions
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useQuery({
    queryKey: ['/api/module-subscriptions/recent'],
    queryFn: async () => {
      // Enquanto não temos endpoint dedicado, usamos os dados mockados
      // Quando o endpoint estiver pronto, substituir por:
      // const response = await fetch('/api/module-subscriptions/recent');
      // if (!response.ok) throw new Error('Falha ao carregar assinaturas recentes');
      // return response.json();
      return recentSubscriptions;
    },
  });

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vendas de Assinaturas de Módulos</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho de vendas dos planos de módulos da plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {!isStatsLoading ? `R$ ${moduleStats?.totalRevenue.toLocaleString('pt-BR')}` : "Carregando..."}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {!isStatsLoading ? moduleStats?.activeSubscriptions : "Carregando..."}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {!isStatsLoading ? `R$ ${moduleStats?.mrr.toLocaleString('pt-BR')}` : "Carregando..."}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita recorrente mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {!isStatsLoading ? `${moduleStats?.conversionRate}%` : "Carregando..."}
              </div>
              <p className="text-xs text-muted-foreground">
                De teste para assinatura paga
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Módulos</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Assinaturas</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Planos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moduleSubscriptionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Receita" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Módulo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moduleDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moduleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Assinaturas Recentes</CardTitle>
                <CardDescription>Últimas assinaturas de módulos realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organização</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!isSubscriptionsLoading ? (
                        subscriptions?.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.organization}</TableCell>
                            <TableCell>{sub.module}</TableCell>
                            <TableCell>{sub.plan}</TableCell>
                            <TableCell>R$ {sub.amount.toLocaleString('pt-BR')}</TableCell>
                            <TableCell>{sub.date}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                Ativo
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" className="text-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ver Todas as Assinaturas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho de Módulos</CardTitle>
                  <CardDescription>Análise de performance por módulo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Participação (%)" 
                          fill="#3b82f6" 
                        >
                          {moduleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Módulo</CardTitle>
                  <CardDescription>Distribuição da receita mensal por módulo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Financeiro', value: 12500 },
                          { name: 'RH', value: 8200 },
                          { name: 'Logística', value: 6400 },
                          { name: 'Suporte', value: 5700 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`} />
                        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Receita Mensal" 
                          fill="#3b82f6" 
                        >
                          {moduleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos por Módulo</CardTitle>
                <CardDescription>Análise detalhada de assinaturas de planos por módulo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modulesPlanDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="module" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} assinaturas`, 'Quantidade']} />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Assinaturas" 
                        fill="#8884d8" 
                        stackId="a"
                      >
                        {modulesPlanDistribution.map((entry, index) => {
                          let color;
                          if (entry.plan === 'Básico') color = '#4CAF50';
                          else if (entry.plan === 'Profissional') color = '#2196F3';
                          else if (entry.plan === 'Enterprise') color = '#9C27B0';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Detalhamento de Planos por Módulo</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            Básico
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Profissional
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            Enterprise
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from(new Set(modulesPlanDistribution.map(item => item.module))).map(module => (
                          <tr key={module}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Básico')?.count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Profissional')?.count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Enterprise')?.count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas Ativas</CardTitle>
                <CardDescription>Total de assinaturas ativas por organização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organização</TableHead>
                        <TableHead>Total de Módulos</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Data de Renovação</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Empresa ABC</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>R$ 1.189,70</TableCell>
                        <TableCell>01/08/2023</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                            Ativo
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Clínica XYZ</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>R$ 439,80</TableCell>
                        <TableCell>05/08/2023</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                            Ativo
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Distribuidora 123</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>R$ 149,90</TableCell>
                        <TableCell>12/08/2023</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                            Pendente
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="plans" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Planos por Popularidade</CardTitle>
                  <CardDescription>Distribuição de assinaturas por tipo de plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Básico', value: 30, color: '#4CAF50' },
                            { name: 'Profissional', value: 45, color: '#2196F3' },
                            { name: 'Enterprise', value: 25, color: '#9C27B0' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Básico', value: 30, color: '#4CAF50' },
                            { name: 'Profissional', value: 45, color: '#2196F3' },
                            { name: 'Enterprise', value: 25, color: '#9C27B0' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receita por Plano</CardTitle>
                  <CardDescription>Distribuição da receita mensal por tipo de plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Básico', value: 4500 },
                          { name: 'Profissional', value: 18200 },
                          { name: 'Enterprise', value: 10100 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`} />
                        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Receita" 
                          fill="#3b82f6" 
                        >
                          {[
                            { name: 'Básico', value: 4500, color: '#4CAF50' },
                            { name: 'Profissional', value: 18200, color: '#2196F3' },
                            { name: 'Enterprise', value: 10100, color: '#9C27B0' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos por Módulo</CardTitle>
                <CardDescription>Análise da relação entre planos e módulos assinados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modulesPlanDistribution}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="module" type="category" />
                      <Tooltip formatter={(value) => [`${value} assinaturas`, 'Quantidade']} />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        stackId="a" 
                        name="Assinaturas" 
                        fill="#3b82f6" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Detalhamento por Plano e Módulo</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano Básico</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano Profissional</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano Enterprise</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from(new Set(modulesPlanDistribution.map(item => item.module))).map(module => {
                          const basicCount = modulesPlanDistribution.find(
                            item => item.module === module && item.plan === 'Básico'
                          )?.count || 0;
                          
                          const proCount = modulesPlanDistribution.find(
                            item => item.module === module && item.plan === 'Profissional'
                          )?.count || 0;
                          
                          const entCount = modulesPlanDistribution.find(
                            item => item.module === module && item.plan === 'Enterprise'
                          )?.count || 0;
                          
                          const total = basicCount + proCount + entCount;
                          
                          return (
                            <tr key={module}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{basicCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}