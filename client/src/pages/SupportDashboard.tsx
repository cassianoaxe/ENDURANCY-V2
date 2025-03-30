import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowUpRight, 
  BarChart3, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Filter,
  TicketIcon,
  RefreshCw,
  PlusCircle,
  XCircle,
  Download,
  BarChart2,
  Timer,
  Zap,
  Smile,
  FileText
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Tipos
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'novo' | 'em_analise' | 'em_desenvolvimento' | 'aguardando_resposta' | 'resolvido' | 'fechado' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  category: 'bug' | 'melhoria' | 'duvida' | 'financeiro' | 'acesso' | 'seguranca' | 'performance' | 'desenvolvimento' | 'outros';
  organizationId: number;
  organization?: string;
  createdById: number;
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

interface Organization {
  id: number;
  name: string;
  planTier: string;
  ticketCount: number;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  ticketId?: number;
}

interface DashboardStats {
  total: number;
  open: number;
  resolved: number;
  inProgress: number;
  critical: number;
  responseTime: number;
  resolutionTime: number;
  byCategoryCount: Record<string, number>;
  byStatusCount: Record<string, number>;
  byOrganizationCount: Record<string, number>;
  recentActivity: Ticket[];
  // Novas métricas de SLA
  slaCompliance: number;
  slaMissed: number;
  avgFirstResponseTime: number;
  avgResolutionTimeByPriority: Record<string, number>;
  ticketVolumeByDay: Record<string, number>;
  avgRating: number;
  firstContactResolution: number;
}

// Formatador de data/hora
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Formatador de status
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ');
};

// Cores de status
const statusColors: Record<string, string> = {
  novo: 'bg-gray-100 text-gray-800',
  em_analise: 'bg-blue-100 text-blue-800',
  em_desenvolvimento: 'bg-indigo-100 text-indigo-800',
  aguardando_resposta: 'bg-yellow-100 text-yellow-800',
  resolvido: 'bg-green-100 text-green-800',
  fechado: 'bg-gray-100 text-gray-500',
  cancelado: 'bg-red-100 text-red-800',
};

// Cores de prioridade
const priorityColors: Record<string, string> = {
  baixa: 'bg-green-100 text-green-800',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

// Componente para obter iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Componente principal
export default function SupportDashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState('7d');
  const [filterOrg, setFilterOrg] = useState('all');

  // Simular estatísticas de dashboard que viriam da API
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/support/stats', timeRange, filterOrg],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/support/stats?timeRange=${timeRange}&organization=${filterOrg}`);
      return res.json();
    },
    enabled: !!user,
    // Fallback para desenvolvimento até que a API real esteja pronta
    placeholderData: {
      total: 25,
      open: 8,
      resolved: 12,
      inProgress: 5,
      critical: 3,
      responseTime: 4.2,
      resolutionTime: 36.5,
      byCategoryCount: {
        bug: 9,
        melhoria: 6,
        duvida: 4,
        financeiro: 2,
        acesso: 1,
        seguranca: 1,
        performance: 1,
        desenvolvimento: 1,
        outros: 0
      },
      byStatusCount: {
        novo: 3,
        em_analise: 2,
        em_desenvolvimento: 3,
        aguardando_resposta: 5,
        resolvido: 7,
        fechado: 5,
        cancelado: 0
      },
      byOrganizationCount: {},
      recentActivity: [],
      // Novas métricas de SLA
      slaCompliance: 87,
      slaMissed: 13,
      avgFirstResponseTime: 2.7,
      avgResolutionTimeByPriority: {
        baixa: 72.5,
        media: 48.2,
        alta: 24.3,
        critica: 8.7
      },
      ticketVolumeByDay: {
        '2025-03-24': 3,
        '2025-03-25': 4,
        '2025-03-26': 2,
        '2025-03-27': 5,
        '2025-03-28': 6,
        '2025-03-29': 3,
        '2025-03-30': 2
      },
      avgRating: 4.8,
      firstContactResolution: 42
    }
  });

  // Buscar tickets
  const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', filterOrg],
    enabled: !!user,
  });

  // Buscar organizações
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    enabled: !!user,
  });

  // Buscar notificações
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<NotificationItem[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    // Fallback para desenvolvimento até que a API real esteja pronta
    placeholderData: [
      {
        id: 1,
        title: 'Novo ticket crítico',
        message: 'Um novo ticket com prioridade crítica foi criado pela Associação Canábica Medicinal.',
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
        ticketId: 7
      },
      {
        id: 2,
        title: 'Prazo de resposta excedido',
        message: 'O ticket #4 está aguardando resposta há mais de 24 horas.',
        type: 'error',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        ticketId: 4
      },
      {
        id: 3,
        title: 'Ticket resolvido',
        message: 'O ticket #5 foi marcado como resolvido.',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        ticketId: 5
      },
      {
        id: 4,
        title: 'Ticket de desenvolvimento atualizado',
        message: 'O ticket #8 de desenvolvimento recebeu um novo comentário.',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        ticketId: 8
      }
    ]
  });

  // Tickets recentes para mostrar na atividade recente
  const recentTickets = tickets?.slice(0, 5) || [];

  // Filtrar tickets não lidos
  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  // Selecionar categorias para gráfico
  const categoryCounts = dashboardStats?.byCategoryCount || {};
  const categoryData = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Selecionar status para gráfico
  const statusCounts = dashboardStats?.byStatusCount || {};
  const statusData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Calcular porcentagem de tickets resolvidos
  const resolutionRate = dashboardStats ? 
    Math.round((dashboardStats.resolved / dashboardStats.total) * 100) : 0;
    
  // Preparar dados para gráficos
  const ticketVolumeData = dashboardStats?.ticketVolumeByDay ? 
    Object.entries(dashboardStats.ticketVolumeByDay).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      tickets: count
    })).sort((a, b) => a.date.localeCompare(b.date)) : [];
    
  // Preparar dados para gráfico de resolução por prioridade
  const resolutionTimeByPriorityData = dashboardStats?.avgResolutionTimeByPriority ? 
    Object.entries(dashboardStats.avgResolutionTimeByPriority).map(([priority, time]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      horas: time
    })) : [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Suporte</h1>
          <p className="text-muted-foreground">
            Visão geral de tickets, desempenho e atividades de suporte
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Período" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-[220px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Todas as organizações" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as organizações</SelectItem>
              {organizations?.map(org => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setLocation('/tickets/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tickets</p>
                <p className="text-3xl font-bold">{dashboardStats?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TicketIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Abertos</p>
                <p className="text-3xl font-bold">{dashboardStats?.open || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={dashboardStats ? (dashboardStats.open / dashboardStats.total) * 100 : 0} 
                className="h-2 bg-muted" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Resolução</p>
                <p className="text-3xl font-bold">{resolutionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={resolutionRate} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Críticos</p>
                <p className="text-3xl font-bold">{dashboardStats?.critical || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={dashboardStats ? (dashboardStats.critical / dashboardStats.total) * 100 : 0} 
                className="h-2 bg-muted" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Análise de Tickets</CardTitle>
            <CardDescription>Distribuição de tickets por status e categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status">Por Status</TabsTrigger>
                <TabsTrigger value="category">Por Categoria</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                {statusData.map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <div className="w-36 flex-shrink-0">
                      <Badge className={statusColors[status] || 'bg-gray-100'}>
                        {formatStatus(status)}
                      </Badge>
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="relative w-full h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary/70"
                          style={{ width: `${(count / dashboardStats!.total) * 100}%` }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-3">
                          <span className="text-xs font-medium text-foreground">{count}</span>
                          <span className="text-xs font-medium text-foreground">
                            {Math.round((count / dashboardStats!.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="category" className="space-y-4">
                {categoryData.map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-36 flex-shrink-0">
                      <span className="text-sm font-medium">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="relative w-full h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary/70"
                          style={{ width: `${(count / dashboardStats!.total) * 100}%` }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-3">
                          <span className="text-xs font-medium text-foreground">{count}</span>
                          <span className="text-xs font-medium text-foreground">
                            {Math.round((count / dashboardStats!.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Alertas e atualizações de suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingNotifications ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 border rounded-lg flex items-start gap-3 ${
                      !notification.isRead ? 'bg-muted/50 border-primary/20' : 'bg-background'
                    }`}
                  >
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${notification.type === 'info' ? 'bg-blue-100 text-blue-500' : 
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' : 
                        notification.type === 'success' ? 'bg-green-100 text-green-500' : 
                        'bg-red-100 text-red-500'}
                    `}>
                      {notification.type === 'info' ? <MessageSquare className="h-4 w-4" /> : 
                        notification.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : 
                        notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
                        <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      {notification.ticketId && (
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs mt-1" 
                          onClick={() => setLocation(`/tickets/${notification.ticketId}`)}
                        >
                          Ver ticket <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  Nenhuma notificação disponível
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full text-sm">Ver todas as notificações</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Nova seção de SLA e métricas avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Métricas de SLA
            </CardTitle>
            <CardDescription>Contratos de nível de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Conformidade com SLA</span>
                  <Badge variant={dashboardStats?.slaCompliance! >= 80 ? "success" : "destructive"}>
                    {dashboardStats?.slaCompliance || 0}%
                  </Badge>
                </div>
                <Progress 
                  value={dashboardStats?.slaCompliance} 
                  className={`h-2 ${dashboardStats?.slaCompliance! >= 80 ? 'bg-green-100' : 'bg-red-100'}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets resolvidos dentro do prazo acordado
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">SLAs Perdidos</span>
                  <Badge variant="outline">{dashboardStats?.slaMissed || 0}%</Badge>
                </div>
                <Progress 
                  value={dashboardStats?.slaMissed} 
                  className="h-2 bg-red-100" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets que ultrapassaram o prazo de resolução
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tempo até Primeira Resposta</span>
                  <span className="text-sm font-semibold">{dashboardStats?.avgFirstResponseTime || 0} horas</span>
                </div>
                <Progress 
                  value={Math.min(100, (5 / (dashboardStats?.avgFirstResponseTime || 1)) * 100)} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo médio para primeira interação com cliente
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Resolução no Primeiro Contato</span>
                  <span className="text-sm font-semibold">{dashboardStats?.firstContactResolution || 0}%</span>
                </div>
                <Progress 
                  value={dashboardStats?.firstContactResolution} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets resolvidos sem escalação ou transferência
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Análise de Desempenho
            </CardTitle>
            <CardDescription>Tendências e métricas detalhadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="volume">
              <TabsList className="mb-4">
                <TabsTrigger value="volume">Volume de Tickets</TabsTrigger>
                <TabsTrigger value="resolution">Tempo de Resolução</TabsTrigger>
              </TabsList>
              
              <TabsContent value="volume">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ticketVolumeData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="tickets" 
                        stroke="var(--primary)" 
                        fill="var(--primary)" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Volume diário de tickets durante o período selecionado
                </div>
              </TabsContent>
              
              <TabsContent value="resolution">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resolutionTimeByPriorityData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis dataKey="priority" />
                      <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} horas`, 'Tempo de Resolução']} />
                      <Bar dataKey="horas" fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Tempo médio de resolução por nível de prioridade (em horas)
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="w-full flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Meta de primeira resposta: <span className="font-medium">4 horas</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Meta de resolução: <span className="font-medium">36 horas</span>
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimos tickets e atualizações</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTickets ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentTickets && recentTickets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map(ticket => (
                    <TableRow 
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setLocation(`/tickets/${ticket.id}`)}
                    >
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status] || 'bg-gray-100'}>
                          {formatStatus(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[ticket.priority] || 'bg-gray-100'}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                Nenhum ticket recente encontrado
              </p>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={() => setLocation('/tickets')}>
              Ver todos os tickets
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Desempenho</CardTitle>
            <CardDescription>Eficácia do suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tempo Médio de Resposta</span>
                  <span className="text-sm font-bold">{dashboardStats?.responseTime || 0} horas</span>
                </div>
                <Progress 
                  value={Math.min(100, dashboardStats?.responseTime ? (1 / dashboardStats.responseTime) * 100 : 0)} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo médio até a primeira resposta
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tempo Médio de Resolução</span>
                  <span className="text-sm font-bold">{dashboardStats?.resolutionTime || 0} horas</span>
                </div>
                <Progress 
                  value={Math.min(100, dashboardStats?.resolutionTime ? (24 / dashboardStats.resolutionTime) * 100 : 0)} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo médio até a resolução do ticket
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Resolução no Primeiro Contato</span>
                  <span className="text-sm font-bold">42%</span>
                </div>
                <Progress value={42} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets resolvidos sem necessidade de acompanhamento
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Satisfação do Cliente</span>
                  <span className="text-sm font-bold">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado em avaliações de atendimento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}