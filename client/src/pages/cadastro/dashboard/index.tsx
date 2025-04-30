import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, DollarSign, ChevronUp, Layers, AreaChart, LineChart } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { Button } from '@/components/ui/button';

export default function CadastroDashboard() {
  // Dados de exemplo para demonstração
  const dataPie = [
    { name: 'Pro', value: 45, color: '#8884d8' },
    { name: 'Grow', value: 30, color: '#82ca9d' },
    { name: 'Seed', value: 15, color: '#ffc658' },
    { name: 'Free', value: 10, color: '#ff8042' },
  ];

  const dataBar = [
    { name: 'Jan', value: 12 },
    { name: 'Fev', value: 19 },
    { name: 'Mar', value: 15 },
    { name: 'Abr', value: 21 },
    { name: 'Mai', value: 18 },
    { name: 'Jun', value: 25 },
  ];

  const statusData = [
    { name: 'Ativas', value: 70, color: '#4ade80' },
    { name: 'Pendentes', value: 20, color: '#facc15' },
    { name: 'Bloqueadas', value: 5, color: '#f43f5e' },
    { name: 'Em Análise', value: 5, color: '#94a3b8' },
  ];

  // Consulta de dados
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
  });

  // Função de navegação que funciona com o sistema do App.tsx
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard de Cadastros</h1>
          <p className="text-gray-600">Visão geral das organizações e atividades de cadastro</p>
        </div>
        <Button onClick={() => navigate('/cadastro')}>Ver Listagem Completa</Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Organizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{organizations?.length || 0}</span>
                <span className="text-xs text-green-500 flex items-center">
                  <ChevronUp className="h-3 w-3 mr-1" /> 
                  +12% no mês
                </span>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {organizations?.filter(o => o.status === 'active').length || 0}
                </span>
                <span className="text-xs text-green-500 flex items-center">
                  <ChevronUp className="h-3 w-3 mr-1" /> 
                  +15% no mês
                </span>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {organizations?.filter(o => o.status === 'pending').length || 0}
                </span>
                <span className="text-xs text-yellow-500 flex items-center">
                  <ChevronUp className="h-3 w-3 mr-1" /> 
                  Em processamento
                </span>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <LineChart className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Receita Estimada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">R$ 15.250</span>
                <span className="text-xs text-green-500 flex items-center">
                  <ChevronUp className="h-3 w-3 mr-1" /> 
                  +8% no mês
                </span>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
            <CardDescription>Proporção de organizações por plano contratado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Novas Organizações</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataBar}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Organizações" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de status e tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Status das organizações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações no cadastro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amme Medicinal</p>
                    <p className="text-xs text-gray-500">Organização ativada</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Hoje, 10:15</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cannabis Care</p>
                    <p className="text-xs text-gray-500">Alteração de plano</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Ontem, 14:20</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-full">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">WeCannabis</p>
                    <p className="text-xs text-gray-500">Novo administrador adicionado</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">25/04, 09:45</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-100 p-1.5 rounded-full">
                    <Layers className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cannativa</p>
                    <p className="text-xs text-gray-500">Módulos atualizados</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">22/04, 16:30</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}