import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationLayout } from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Heart,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  Target,
  UserPlus,
  FileText,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

export default function SocialDashboard() {
  const [timeRange, setTimeRange] = React.useState('month');
  
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/social/dashboard', { timeRange }],
    retry: false,
    enabled: true,
  });

  // Fetch recent donations
  const { data: recentDonations } = useQuery({
    queryKey: ['/api/social/donations/recent'],
    retry: false,
    enabled: true,
  });

  // Fetch recent expenses
  const { data: recentExpenses } = useQuery({
    queryKey: ['/api/social/expenses/recent'],
    retry: false,
    enabled: true,
  });

  // Fetch active campaigns
  const { data: activeCampaigns } = useQuery({
    queryKey: ['/api/social/campaigns/active'],
    retry: false,
    enabled: true,
  });

  const formatCurrency = (value: number) => {
    return value?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }) || 'R$ 0,00';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Dummy data for charts (replace with actual data when available)
  const donationsVsExpensesData = [
    { name: 'Jan', doações: 4000, despesas: 2400 },
    { name: 'Fev', doações: 3000, despesas: 1398 },
    { name: 'Mar', doações: 2000, despesas: 3800 },
    { name: 'Abr', doações: 2780, despesas: 3908 },
    { name: 'Mai', doações: 1890, despesas: 4800 },
    { name: 'Jun', doações: 2390, despesas: 3800 },
  ];

  const expensesCategoryData = [
    { name: 'Administrativo', value: 400 },
    { name: 'Materiais', value: 300 },
    { name: 'Eventos', value: 300 },
    { name: 'Assistência', value: 200 },
    { name: 'Infraestrutura', value: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    const dashboardData = stats || {
      totalDonations: 0,
      totalExpenses: 0,
      donationsCount: 0,
      expensesCount: 0,
      beneficiariesCount: 0,
      volunteersCount: 0,
      campaignsCount: 0,
      balance: 0,
      donationsChange: 10,
      expensesChange: -5,
      beneficiariesChange: 2,
      volunteersChange: 8,
    };

    return (
      <div className="space-y-6">
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Doações
                </CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {formatCurrency(dashboardData.totalDonations || 0)}
                </CardDescription>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-1">
                {dashboardData.donationsChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">
                      +{dashboardData.donationsChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 text-sm font-medium">
                      {dashboardData.donationsChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground text-xs">vs. período anterior</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {dashboardData.donationsCount || 0} doações no período
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Despesas
                </CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {formatCurrency(dashboardData.totalExpenses || 0)}
                </CardDescription>
              </div>
              <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-1">
                {dashboardData.expensesChange <= 0 ? (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">
                      {Math.abs(dashboardData.expensesChange).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 text-sm font-medium">
                      +{dashboardData.expensesChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground text-xs">vs. período anterior</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {dashboardData.expensesCount || 0} despesas no período
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Beneficiários
                </CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {dashboardData.beneficiariesCount || 0}
                </CardDescription>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-1">
                {dashboardData.beneficiariesChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">
                      +{dashboardData.beneficiariesChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 text-sm font-medium">
                      {dashboardData.beneficiariesChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground text-xs">vs. período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Voluntários
                </CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {dashboardData.volunteersCount || 0}
                </CardDescription>
              </div>
              <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-1">
                {dashboardData.volunteersChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium">
                      +{dashboardData.volunteersChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 text-sm font-medium">
                      {dashboardData.volunteersChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground text-xs">vs. período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Resumo Financeiro</CardTitle>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="font-bold">
                  Saldo: {formatCurrency(dashboardData.balance || 0)}
                </span>
              </div>
            </div>
            <CardDescription>
              Visão geral das doações vs. despesas nos últimos {timeRange === 'month' ? '6 meses' : timeRange === 'week' ? '6 semanas' : '6 dias'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={donationsVsExpensesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === "doações" ? "Doações" : "Despesas"
                    ]} 
                  />
                  <Legend />
                  <Bar dataKey="doações" fill="#4CAF50" name="Doações" />
                  <Bar dataKey="despesas" fill="#f44336" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <div className="flex space-x-2">
              <Button 
                variant={timeRange === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('day')}
              >
                Diário
              </Button>
              <Button 
                variant={timeRange === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Semanal
              </Button>
              <Button 
                variant={timeRange === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Mensal
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Campaigns */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Campanhas Ativas</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = "/organization/social/campanhas"}>
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {activeCampaigns?.length || 0} campanhas em andamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(activeCampaigns || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">Nenhuma campanha ativa</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie uma campanha para mobilizar doações e voluntários
                  </p>
                  <Button onClick={() => window.location.href = "/organization/social/campanhas/nova"}>
                    Nova Campanha
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeCampaigns || []).slice(0, 3).map((campaign, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{campaign?.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {campaign?.description}
                          </p>
                        </div>
                        <Badge>{campaign?.daysLeft} dias restantes</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Meta: {formatCurrency(campaign?.goalAmount || 0)}</span>
                          <span>{campaign?.progressPercentage}%</span>
                        </div>
                        <Progress value={campaign?.progressPercentage || 0} className="h-2" />
                      </div>
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <div>
                          <span className="text-muted-foreground">Arrecadado: </span>
                          <span>{formatCurrency(campaign?.currentAmount || 0)}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/organization/social/campanhas/${campaign?.id}`}>
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das despesas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-3">
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "/organization/social/despesas"}>
                <BarChart2 className="mr-2 h-4 w-4" />
                Ver Relatório Detalhado
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Doações Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = "/organization/social/doacoes"}>
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(recentDonations || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhuma doação registrada recentemente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentDonations || []).slice(0, 5).map((donation, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{donation?.donorName || 'Anônimo'}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(donation?.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(donation?.amount || 0)}</div>
                        <div className="text-xs">
                          {donation?.campaignName ? (
                            <Badge variant="outline">{donation.campaignName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Doação geral</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Despesas Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = "/organization/social/despesas"}>
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(recentExpenses || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhuma despesa registrada recentemente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentExpenses || []).slice(0, 5).map((expense, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <div className="font-medium">{expense?.description}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(expense?.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(expense?.amount || 0)}</div>
                        <div className="text-xs">
                          <Badge
                            variant="outline"
                            className={`${
                              expense?.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                              expense?.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {expense?.status === 'paid' ? 'Pago' : 
                             expense?.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <OrganizationLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Módulo Social</h1>
            <p className="text-muted-foreground">
              Gerencie as atividades sociais da associação
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/organization/social/configuracoes"}>
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button onClick={() => window.location.href = "/organization/social/beneficiarios/novo"}>
              <Users className="mr-2 h-4 w-4" />
              Cadastrar Beneficiário
            </Button>
          </div>
        </div>

        {renderDashboardContent()}
      </div>
    </OrganizationLayout>
  );
}