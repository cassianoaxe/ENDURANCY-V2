import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuth } from '@/contexts/AuthContext';
// Tour Guide removido pois ficou tecnologicamente defasado
import { User, CircleUser, Building2, Activity, Bell, BarChart4, Calendar, FileText, AlertTriangle, Package, Settings, Layers } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

// Função para obter dados das organizações a partir da API
const useOrganizationData = () => {
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['/api/plans'],
  });

  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ['/api/modules'],
  });

  const { data: orgModules, isLoading: loadingOrgModules } = useQuery({
    queryKey: ['/api/organization-modules/all'],
  });

  const isLoading = loadingOrgs || loadingPlans || loadingModules || loadingOrgModules;

  // Processar dados para exibição nos gráficos apenas quando todos estiverem carregados
  const processData = () => {
    if (isLoading || !organizations || !plans || !modules || !orgModules) {
      return {
        organizationsData: [],
        plansDistributionData: [],
        moduleDistributionData: [],
        modulesPlanDistribution: [],
        plansSalesData: [],
        activeStatusData: []
      };
    }

    // Contar organizações por status
    const statusCounts = {
      active: 0,
      pending: 0,
      blocked: 0,
      review: 0
    };

    const orgArray = Array.isArray(organizations) ? organizations : [];
    const plansArray = Array.isArray(plans) ? plans : [];
    const modulesArray = Array.isArray(modules) ? modules : [];
    const orgModulesArray = Array.isArray(orgModules) ? orgModules : [];

    // Contar organizações por status
    orgArray.forEach(org => {
      if (org.status === 'active') statusCounts.active++;
      else if (org.status === 'pending') statusCounts.pending++;
      else if (org.status === 'blocked') statusCounts.blocked++;
      else if (org.status === 'review') statusCounts.review++;
    });

    // Preparar dados de status para o gráfico
    const activeStatusData = [
      { name: 'Ativas', value: statusCounts.active, color: '#4CAF50' },
      { name: 'Pendentes', value: statusCounts.pending, color: '#FFC107' },
      { name: 'Em Análise', value: statusCounts.review, color: '#2196F3' },
      { name: 'Bloqueadas', value: statusCounts.blocked, color: '#F44336' },
    ].filter(item => item.value > 0); // Remover categorias vazias

    // Contar planos por tipo
    const planCounts = {};
    const planColors = {
      'Freemium': '#9e9e9e',
      'Básico': '#9e9e9e',
      'Seed': '#4CAF50',
      'Grow': '#2196F3',
      'Pro': '#9C27B0',
      'Empresarial': '#FF5722'
    };

    // Inicializar contagem de planos
    plansArray.forEach(plan => {
      planCounts[plan.name] = 0;
    });

    // Contar organizações por plano
    orgArray.forEach(org => {
      const planName = plansArray.find(p => p.id === org.planId)?.name || 'Básico';
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    // Preparar dados de distribuição de planos
    const plansDistributionData = Object.keys(planCounts).map(planName => ({
      name: planName,
      value: planCounts[planName],
      color: planColors[planName] || '#9e9e9e'
    })).filter(item => item.value > 0); // Remover planos sem organizações

    // Contar módulos ativos
    const moduleCounts = {};
    const moduleColors = {
      'Financeiro': '#4CAF50',
      'RH': '#2196F3',
      'Logística': '#FFC107',
      'Suporte': '#9C27B0',
      'CRM': '#FF5722',
      'Dashboard': '#607D8B',
      'Vendas': '#795548',
      'Estoque': '#3F51B5'
    };

    // Inicializar contagem de módulos
    modulesArray.forEach(mod => {
      moduleCounts[mod.name] = 0;
    });

    // Contar módulos ativos por organização
    orgModulesArray.forEach(orgModule => {
      if (orgModule.status === 'active') {
        const moduleName = modulesArray.find(m => m.id === orgModule.moduleId)?.name || 'Desconhecido';
        moduleCounts[moduleName] = (moduleCounts[moduleName] || 0) + 1;
      }
    });

    // Preparar dados de distribuição de módulos
    const moduleDistributionData = Object.keys(moduleCounts).map(moduleName => ({
      name: moduleName,
      value: moduleCounts[moduleName],
      color: moduleColors[moduleName] || '#9e9e9e'
    })).filter(item => item.value > 0); // Remover módulos sem organizações

    // Calcular distribuição de módulos por plano
    const modulePlanMatrix = {};

    // Inicializar a matriz
    modulesArray.forEach(mod => {
      modulePlanMatrix[mod.name] = {};
      plansArray.forEach(plan => {
        modulePlanMatrix[mod.name][plan.name] = 0;
      });
    });

    // Preencher a matriz com dados reais
    orgModulesArray.forEach(orgModule => {
      if (orgModule.status === 'active' && orgModule.organizationId) {
        const organization = orgArray.find(org => org.id === orgModule.organizationId);
        if (organization) {
          const planName = plansArray.find(p => p.id === organization.planId)?.name || 'Básico';
          const moduleName = modulesArray.find(m => m.id === orgModule.moduleId)?.name || 'Desconhecido';
          if (moduleName in modulePlanMatrix && planName) {
            modulePlanMatrix[moduleName][planName] = (modulePlanMatrix[moduleName][planName] || 0) + 1;
          }
        }
      }
    });

    // Converter a matriz em um array para o gráfico
    const modulesPlanDistribution = [];
    Object.keys(modulePlanMatrix).forEach(moduleName => {
      Object.keys(modulePlanMatrix[moduleName]).forEach(planName => {
        const count = modulePlanMatrix[moduleName][planName];
        if (count > 0) { // Incluir apenas combinações com pelo menos uma ocorrência
          modulesPlanDistribution.push({
            module: moduleName,
            plan: planName,
            count: count
          });
        }
      });
    });

    // Dados de crescimento mensal das assinaturas de módulos
    // Em uma implementação real, estes dados viriam de uma API com dados históricos
    const moduleSalesStats = [
      { month: 'Jan', freemium: 20, seed: 12, grow: 15, pro: 5 },
      { month: 'Fev', freemium: 25, seed: 18, grow: 20, pro: 8 },
      { month: 'Mar', freemium: 30, seed: 22, grow: 25, pro: 12 },
      { month: 'Abr', freemium: 35, seed: 26, grow: 30, pro: 15 },
      { month: 'Mai', freemium: 40, seed: 32, grow: 40, pro: 20 },
      { month: 'Jun', freemium: 45, seed: 38, grow: 45, pro: 25 },
      { month: 'Jul', freemium: 50, seed: 42, grow: 50, pro: 30 },
    ];
    
    // Usar os dados mockados para o gráfico
    const plansSalesData = moduleSalesStats;

    // Calcular dados de organizações por mês (também simulados)
    const organizationsData = [
      { month: 'Jan', organizations: Math.round(orgArray.length * 0.25) },
      { month: 'Fev', organizations: Math.round(orgArray.length * 0.35) },
      { month: 'Mar', organizations: Math.round(orgArray.length * 0.45) },
      { month: 'Abr', organizations: Math.round(orgArray.length * 0.55) },
      { month: 'Mai', organizations: Math.round(orgArray.length * 0.7) },
      { month: 'Jun', organizations: Math.round(orgArray.length * 0.85) },
      { month: 'Jul', organizations: orgArray.length },
    ];
    
    // Dados de usuários para o gráfico (simulados)
    const usersData = [
      { month: 'Jan', users: 10 },
      { month: 'Fev', users: 20 },
      { month: 'Mar', users: 35 },
      { month: 'Abr', users: 45 },
      { month: 'Mai', users: 60 },
      { month: 'Jun', users: 80 },
      { month: 'Jul', users: 100 },
    ];

    return {
      organizationsData,
      plansDistributionData,
      moduleDistributionData,
      modulesPlanDistribution,
      plansSalesData,
      activeStatusData,
      usersData
    };
  };

  return {
    ...processData(),
    isLoading
  };
};

const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9C27B0', '#FF5722'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Buscar dados dinâmicos para o dashboard
  const {
    organizationsData,
    plansDistributionData,
    moduleDistributionData,
    modulesPlanDistribution,
    plansSalesData,
    activeStatusData,
    usersData,
    isLoading
  } = useOrganizationData();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-gray-500 mt-1">Bem-vindo de volta, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Sistema Operacional</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden md:inline">Módulos/Planos</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden md:inline">Organizações</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Atividades</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 dashboard-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Organizações Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{organizations?.length || 0}</div>
                <p className="text-xs text-green-500">{!isLoading && organizations?.length > 0 ? '+12% em relação ao mês anterior' : 'Carregando dados...'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">872</div>
                <p className="text-xs text-green-500">+8% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas de Módulos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">325</div>
                <p className="text-xs text-green-500">+22% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 32.800</div>
                <p className="text-xs text-green-500">+18% em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Novo card para Crescimento de Vendas por Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Vendas por Plano</CardTitle>
                <CardDescription>Tendência mensal de assinaturas por tipo de plano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plansSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="freemium" stroke="#9e9e9e" strokeWidth={2} name="Freemium" />
                      <Line type="monotone" dataKey="seed" stroke="#4CAF50" strokeWidth={2} name="Seed" />
                      <Line type="monotone" dataKey="grow" stroke="#2196F3" strokeWidth={2} name="Grow" />
                      <Line type="monotone" dataKey="pro" stroke="#9C27B0" strokeWidth={2} name="Pro" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Planos</CardTitle>
                  <CardDescription>Porcentagem de assinaturas por tipo de plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={plansDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {plansDistributionData.map((entry, index) => (
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
                <div className="h-[320px]">
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
                      <Bar dataKey="count" stackId="a" name="Assinaturas" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Organizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={organizationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="organizations" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dashboard-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal Recorrente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 32.800</div>
                <p className="text-xs text-green-500">+18% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">325</div>
                <p className="text-xs text-green-500">+22% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 980</div>
                <p className="text-xs text-amber-500">+5% em relação ao mês anterior</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Vendas por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plansSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="freemium" stroke="#9e9e9e" strokeWidth={2} name="Freemium" />
                      <Line type="monotone" dataKey="seed" stroke="#4CAF50" strokeWidth={2} name="Seed" />
                      <Line type="monotone" dataKey="grow" stroke="#2196F3" strokeWidth={2} name="Grow" />
                      <Line type="monotone" dataKey="pro" stroke="#9C27B0" strokeWidth={2} name="Pro" />
                    </LineChart>
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
                        if (entry.plan === 'Freemium') color = '#9e9e9e';
                        else if (entry.plan === 'Seed') color = '#4CAF50';
                        else if (entry.plan === 'Grow') color = '#2196F3';
                        else if (entry.plan === 'Pro') color = '#9C27B0';
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
                          <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                          Freemium
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          Seed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          Grow
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                          Pro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(new Set(modulesPlanDistribution.map(item => item.module))).map(module => (
                        <tr key={module}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Freemium')?.count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Seed')?.count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Grow')?.count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {modulesPlanDistribution.find(item => item.module === module && item.plan === 'Pro')?.count || 0}
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
        
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 organizations-table">
            <Card>
              <CardHeader>
                <CardTitle>Organizações Registradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Data de Registro</th>
                        <th scope="col" className="px-6 py-3">Plano</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        organizations && Array.isArray(organizations) && organizations.length > 0 ? (
                          organizations.map((org: any, index: number) => {
                            // Encontrar o nome do plano
                            const planName = plans && Array.isArray(plans) 
                              ? plans.find((p: any) => p.id === org.planId)?.name || 'Desconhecido'
                              : 'Desconhecido';
                            
                            // Determinar a classe CSS do status
                            let statusClass = 'bg-gray-100 text-gray-800';
                            if (org.status === 'active') statusClass = 'bg-green-100 text-green-800';
                            else if (org.status === 'pending') statusClass = 'bg-yellow-100 text-yellow-800';
                            else if (org.status === 'blocked' || org.status === 'suspended') statusClass = 'bg-red-100 text-red-800';
                            else if (org.status === 'review') statusClass = 'bg-blue-100 text-blue-800';
                            
                            // Formatar data de criação
                            const createdDate = org.createdAt 
                              ? new Date(org.createdAt).toLocaleDateString('pt-BR')
                              : 'Data desconhecida';
                              
                            return (
                              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{org.name}</td>
                                <td className="px-6 py-4">{org.type || 'Não especificado'}</td>
                                <td className="px-6 py-4">
                                  <span className={`${statusClass} text-xs font-medium me-2 px-2.5 py-0.5 rounded-full`}>
                                    {org.status === 'active' ? 'Ativo' : 
                                     org.status === 'pending' ? 'Pendente' : 
                                     org.status === 'blocked' ? 'Bloqueado' : 
                                     org.status === 'suspended' ? 'Suspenso' : 
                                     org.status === 'review' ? 'Em Análise' : 
                                     'Desconhecido'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">{createdDate}</td>
                                <td className="px-6 py-4">{planName}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              Nenhuma organização encontrada
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="add-organization-button px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                    Adicionar Organização
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="admins" fill="#8884d8" name="Administradores" />
                      <Bar dataKey="doctors" fill="#82ca9d" name="Médicos" />
                      <Bar dataKey="patients" fill="#ffc658" name="Pacientes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Administradores da Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Último Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Administrador do Sistema</td>
                        <td className="px-6 py-4">admin@endurancy.com</td>
                        <td className="px-6 py-4">Hoje, 14:45</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Suporte Técnico</td>
                        <td className="px-6 py-4">suporte@endurancy.com</td>
                        <td className="px-6 py-4">Ontem, 09:30</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Gerente de Contas</td>
                        <td className="px-6 py-4">contas@endurancy.com</td>
                        <td className="px-6 py-4">25/07/2023, 16:20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Usuário</th>
                      <th scope="col" className="px-6 py-3">Ação</th>
                      <th scope="col" className="px-6 py-3">Detalhes</th>
                      <th scope="col" className="px-6 py-3">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Admin</td>
                      <td className="px-6 py-4">Login no sistema</td>
                      <td className="px-6 py-4">IP: 192.168.1.100</td>
                      <td className="px-6 py-4">Hoje, 14:45</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Admin</td>
                      <td className="px-6 py-4">Aprovação de organização</td>
                      <td className="px-6 py-4">Clínica Saúde Total (ID: 142)</td>
                      <td className="px-6 py-4">Hoje, 11:32</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Suporte</td>
                      <td className="px-6 py-4">Reset de senha</td>
                      <td className="px-6 py-4">Para usuário: medico@clinica.com</td>
                      <td className="px-6 py-4">Ontem, 16:20</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Admin</td>
                      <td className="px-6 py-4">Edição de plano</td>
                      <td className="px-6 py-4">Plano Premium - alteração de preço</td>
                      <td className="px-6 py-4">Ontem, 10:05</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">Gerente</td>
                      <td className="px-6 py-4">Suspensão de conta</td>
                      <td className="px-6 py-4">Organização ID: 98 - Pagamento pendente</td>
                      <td className="px-6 py-4">25/07/2023, 09:45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-medium">Relatório Mensal de Crescimento</p>
                      <p className="text-sm text-gray-500">Gerado em: 01/07/2023</p>
                    </div>
                    <button className="text-blue-600 hover:underline">Baixar</button>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-medium">Análise de Usuários Ativos</p>
                      <p className="text-sm text-gray-500">Gerado em: 15/06/2023</p>
                    </div>
                    <button className="text-blue-600 hover:underline">Baixar</button>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-medium">Relatório Financeiro Q2</p>
                      <p className="text-sm text-gray-500">Gerado em: 30/06/2023</p>
                    </div>
                    <button className="text-blue-600 hover:underline">Baixar</button>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-medium">Atividade de Consultas Médicas</p>
                      <p className="text-sm text-gray-500">Gerado em: 25/06/2023</p>
                    </div>
                    <button className="text-blue-600 hover:underline">Baixar</button>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                      <option>Atividade de Usuários</option>
                      <option>Financeiro</option>
                      <option>Crescimento de Organizações</option>
                      <option>Análise de Consultas</option>
                      <option>Uso da Plataforma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Período</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1">De</label>
                        <input type="date" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Até</label>
                        <input type="date" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formato</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="format" className="mr-2" defaultChecked />
                        <span>PDF</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="format" className="mr-2" />
                        <span>Excel</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="format" className="mr-2" />
                        <span>CSV</span>
                      </label>
                    </div>
                  </div>
                  <button type="button" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90">
                    Gerar Relatório
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Falha de Backup</h3>
                      <p className="text-sm text-red-700">O backup automático agendado falhou às 03:00. Verifique os logs do sistema.</p>
                      <p className="text-xs text-red-600 mt-1">Hoje, 03:15</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Alto Uso de CPU</h3>
                      <p className="text-sm text-yellow-700">O servidor está experimentando picos de uso de CPU acima de 90% nas últimas 2 horas.</p>
                      <p className="text-xs text-yellow-600 mt-1">Hoje, 10:22</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Pagamentos Pendentes</h3>
                      <p className="text-sm text-yellow-700">5 organizações têm pagamentos pendentes há mais de 15 dias.</p>
                      <p className="text-xs text-yellow-600 mt-1">Ontem, 16:40</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-md">
                  <div className="flex items-start">
                    <Bell className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">Manutenção Concluída</h3>
                      <p className="text-sm text-green-700">A manutenção programada do sistema foi concluída com sucesso.</p>
                      <p className="text-xs text-green-600 mt-1">25/07/2023, 05:30</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Tour Guide removido pois ficou tecnologicamente defasado */}
    </div>
  );
}