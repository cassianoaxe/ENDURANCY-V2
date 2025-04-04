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
import TourGuide from '@/components/features/TourGuide';
import { User, CircleUser, Building2, Activity, Bell, BarChart4, Calendar, FileText, AlertTriangle, Package, Settings, Layers } from 'lucide-react';

// Dados de demonstração
const organizationsData = [
  { month: 'Jan', organizations: 15 },
  { month: 'Fev', organizations: 20 },
  { month: 'Mar', organizations: 28 },
  { month: 'Abr', organizations: 32 },
  { month: 'Mai', organizations: 45 },
  { month: 'Jun', organizations: 52 },
  { month: 'Jul', organizations: 58 },
];

const usersData = [
  { month: 'Jan', admins: 2, doctors: 20, patients: 100 },
  { month: 'Fev', admins: 3, doctors: 25, patients: 130 },
  { month: 'Mar', admins: 4, doctors: 30, patients: 180 },
  { month: 'Abr', admins: 4, doctors: 35, patients: 230 },
  { month: 'Mai', admins: 5, doctors: 45, patients: 300 },
  { month: 'Jun', admins: 6, doctors: 55, patients: 350 },
  { month: 'Jul', admins: 7, doctors: 60, patients: 400 },
];

const activeStatusData = [
  { name: 'Ativas', value: 75, color: '#4CAF50' },
  { name: 'Pendentes', value: 20, color: '#FFC107' },
  { name: 'Suspensas', value: 5, color: '#F44336' },
];

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

// Dados de planos
const plansDistributionData = [
  { name: 'Básico', value: 30, color: '#4CAF50' },
  { name: 'Profissional', value: 45, color: '#2196F3' },
  { name: 'Enterprise', value: 25, color: '#9C27B0' },
];

// Dados de módulos
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

// Crescimento de vendas de planos por mês
const plansSalesData = [
  { month: 'Jan', básico: 20, profissional: 15, enterprise: 5 },
  { month: 'Fev', básico: 25, profissional: 20, enterprise: 8 },
  { month: 'Mar', básico: 30, profissional: 25, enterprise: 12 },
  { month: 'Abr', básico: 35, profissional: 30, enterprise: 15 },
  { month: 'Mai', básico: 40, profissional: 40, enterprise: 20 },
  { month: 'Jun', básico: 45, profissional: 45, enterprise: 25 },
  { month: 'Jul', básico: 50, profissional: 50, enterprise: 30 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dashboard-stats">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Organizações Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">58</div>
                <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
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
          </div>
          
          <div className="grid grid-cols-1 gap-4">
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
                      <Line type="monotone" dataKey="básico" stroke="#4CAF50" strokeWidth={2} name="Básico" />
                      <Line type="monotone" dataKey="profissional" stroke="#2196F3" strokeWidth={2} name="Profissional" />
                      <Line type="monotone" dataKey="enterprise" stroke="#9C27B0" strokeWidth={2} name="Enterprise" />
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
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Hospital Santa Maria</td>
                        <td className="px-6 py-4">Empresa</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">15/05/2023</td>
                        <td className="px-6 py-4">Premium</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Clínica São Lucas</td>
                        <td className="px-6 py-4">Empresa</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">20/06/2023</td>
                        <td className="px-6 py-4">Básico</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Associação Médica Brasileira</td>
                        <td className="px-6 py-4">Associação</td>
                        <td className="px-6 py-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Pendente</span>
                        </td>
                        <td className="px-6 py-4">10/07/2023</td>
                        <td className="px-6 py-4">Premium</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Centro Médico Nacional</td>
                        <td className="px-6 py-4">Empresa</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Ativo</span>
                        </td>
                        <td className="px-6 py-4">05/08/2023</td>
                        <td className="px-6 py-4">Empresarial</td>
                      </tr>
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4 font-medium">Saúde Total</td>
                        <td className="px-6 py-4">Empresa</td>
                        <td className="px-6 py-4">
                          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Suspenso</span>
                        </td>
                        <td className="px-6 py-4">18/04/2023</td>
                        <td className="px-6 py-4">Básico</td>
                      </tr>
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
                    <BarChart data={usersData}>
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
      
      {/* Tour Guide que é acionado automaticamente na primeira visita */}
      <TourGuide
        tourId="admin-dashboard-tour"
        steps={[
          {
            selector: '.dashboard-stats',
            title: 'Estatísticas Principais',
            content: 'Aqui você pode ver um resumo dos principais números da plataforma, incluindo organizações, usuários e consultas.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.organizations-table',
            title: 'Gerenciamento de Organizações',
            content: 'Visualize e gerencie todas as organizações registradas na plataforma com seus respectivos status.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.add-organization-button',
            title: 'Adicionar Organizações',
            content: 'Clique aqui para adicionar manualmente uma nova organização ao sistema.',
            buttonText: 'Próximo',
            placementBeacon: 'top',
          },
          {
            selector: '.sidebar-nav',
            title: 'Menu de Navegação',
            content: 'Use este menu para navegar entre as diferentes seções do sistema administrativo.',
            buttonText: 'Próximo',
            placementBeacon: 'right',
          },
          {
            selector: '.user-profile',
            title: 'Seu Perfil',
            content: 'Acesse seu perfil, configurações e opção de logout através deste menu.',
            buttonText: 'Finalizar Tour',
            placementBeacon: 'bottom',
          },
        ]}
      />
    </div>
  );
}