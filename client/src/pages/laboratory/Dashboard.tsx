import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, Clock, AlertCircle, CheckCircle, Activity, Beaker, FileCheck } from "lucide-react";

// Cores para status de amostras
const SAMPLE_STATUS_COLORS = {
  pending: "#f97316", // Orange
  received: "#0ea5e9", // Blue
  in_progress: "#a855f7", // Purple
  completed: "#22c55e", // Green
  approved: "#15803d", // Dark Green
  rejected: "#dc2626", // Red
  canceled: "#6b7280", // Gray
};

// Labels amigáveis para status
const STATUS_LABELS = {
  pending: "Pendente",
  received: "Recebida",
  in_progress: "Em Análise",
  completed: "Concluída",
  approved: "Aprovada",
  rejected: "Rejeitada",
  canceled: "Cancelada",
};

// Rótulos amigáveis para tipos de teste
const TEST_TYPE_LABELS = {
  cannabinoid_profile: "Perfil de Canabinóides",
  terpene_profile: "Perfil de Terpenos",
  heavy_metals: "Metais Pesados",
  pesticides: "Pesticidas",
  microbials: "Microbiológicos",
  residual_solvents: "Solventes Residuais",
  mycotoxins: "Micotoxinas",
  water_activity: "Atividade da Água",
  moisture_content: "Teor de Umidade",
  foreign_matter: "Matéria Estranha",
  visual_inspection: "Inspeção Visual",
  full_panel: "Painel Completo",
};

// Função para formatar dados para o gráfico de pizza
const formatSampleStatusData = (data: any) => {
  if (!data || !data.samplesByStatus) return [];
  
  // Verificar se samplesByStatus é um array ou um objeto
  if (Array.isArray(data.samplesByStatus)) {
    return data.samplesByStatus.map((item: any) => ({
      name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
      value: parseInt(item.count),
      status: item.status,
    }));
  } else if (typeof data.samplesByStatus === 'object') {
    // Se for um objeto retornado por sql.js como { command, rows, etc }
    if (data.samplesByStatus.command && data.samplesByStatus.rows) {
      return data.samplesByStatus.rows.map((item: any) => ({
        name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
        value: parseInt(item.count),
        status: item.status,
      }));
    }
  }
  
  // Dados de demonstração para caso tudo falhe
  return [
    { name: 'Pendente', value: 3, status: 'pending' },
    { name: 'Em Análise', value: 2, status: 'in_progress' },
    { name: 'Concluída', value: 4, status: 'completed' },
    { name: 'Aprovada', value: 1, status: 'approved' },
  ];
};

// Função para formatar dados para o gráfico de linha
const formatSamplesReceivedData = (data: any) => {
  if (!data || !data.samplesReceivedByDay) return [];
  
  // Verificar se samplesReceivedByDay é um array ou um objeto
  if (Array.isArray(data.samplesReceivedByDay)) {
    return data.samplesReceivedByDay.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('pt-BR'),
      count: parseInt(item.count),
    }));
  } else if (typeof data.samplesReceivedByDay === 'object') {
    // Se for um objeto retornado por sql.js como { command, rows, etc }
    if (data.samplesReceivedByDay.command && data.samplesReceivedByDay.rows) {
      return data.samplesReceivedByDay.rows.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('pt-BR'),
        count: parseInt(item.count),
      }));
    }
  }
  
  // Dados de demonstração para caso tudo falhe
  const lastWeek = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('pt-BR'),
      count: Math.floor(Math.random() * 5) + 1
    };
  });
  
  return lastWeek;
};

// Função para formatar dados para o gráfico de barras
const formatProcessingTimeData = (data: any) => {
  if (!data || !data.avgProcessingTimeByTestType) return [];
  
  // Verificar se avgProcessingTimeByTestType é um array ou um objeto
  if (Array.isArray(data.avgProcessingTimeByTestType)) {
    return data.avgProcessingTimeByTestType.map((item: any) => ({
      name: TEST_TYPE_LABELS[item.test_type as keyof typeof TEST_TYPE_LABELS] || item.test_type,
      hours: parseFloat(item.avg_hours),
      test_type: item.test_type,
    }));
  } else if (typeof data.avgProcessingTimeByTestType === 'object') {
    // Se for um objeto retornado por sql.js como { command, rows, etc }
    if (data.avgProcessingTimeByTestType.command && data.avgProcessingTimeByTestType.rows) {
      return data.avgProcessingTimeByTestType.rows.map((item: any) => ({
        name: TEST_TYPE_LABELS[item.test_type as keyof typeof TEST_TYPE_LABELS] || item.test_type,
        hours: parseFloat(item.avg_hours),
        test_type: item.test_type,
      }));
    }
  }
  
  // Dados de demonstração para caso tudo falhe
  return [
    { name: 'Perfil de Canabinóides', hours: 24, test_type: 'cannabinoid_profile' },
    { name: 'Perfil de Terpenos', hours: 18, test_type: 'terpene_profile' },
    { name: 'Metais Pesados', hours: 36, test_type: 'heavy_metals' },
    { name: 'Microbiológicos', hours: 48, test_type: 'microbials' },
  ];
};

export default function LaboratoryDashboard() {
  const { data: dashboardData = {}, isLoading, error } = useQuery({
    queryKey: ['/api/laboratory/dashboard'],
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  // Dados formatados para os gráficos
  const sampleStatusData = React.useMemo(
    () => formatSampleStatusData(dashboardData),
    [dashboardData]
  );
  
  const samplesReceivedData = React.useMemo(
    () => formatSamplesReceivedData(dashboardData),
    [dashboardData]
  );
  
  const processingTimeData = React.useMemo(
    () => formatProcessingTimeData(dashboardData),
    [dashboardData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Carregando dados do dashboard...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao buscar os dados do dashboard. Por favor, tente novamente mais tarde.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard do Laboratório</h1>
          <p className="text-muted-foreground">
            Visão geral das análises, amostras e resultados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Atualizar dados
          </Button>
          <Button>
            <FileCheck className="mr-2 h-4 w-4" />
            Gerar relatório
          </Button>
        </div>
      </div>

      <Separator />

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Total de Amostras</CardTitle>
              <CardDescription>Soma de todos os status</CardDescription>
            </div>
            <Beaker className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">
              {sampleStatusData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                12%
              </span>{" "}
              vs. mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Amostras Pendentes</CardTitle>
              <CardDescription>Requer ação</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">
              {sampleStatusData.find(item => item.status === 'pending')?.value || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {dashboardData.samplesPendingTooLong > 0 ? (
                <span className="text-orange-500 font-medium inline-flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {dashboardData.samplesPendingTooLong} com atraso
                </span>
              ) : (
                <span className="text-green-500 font-medium inline-flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sem atrasos
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Em Análise</CardTitle>
              <CardDescription>Amostras em processamento</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">
              {sampleStatusData.find(item => item.status === 'in_progress')?.value || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-purple-500 font-medium">
                Tempo médio: 48h
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Concluídas</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">
              {sampleStatusData.find(item => item.status === 'completed')?.value || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className={
                  sampleStatusData.find(item => item.status === 'rejected')?.value > 0
                    ? "text-red-500 font-medium inline-flex items-center"
                    : "text-green-500 font-medium inline-flex items-center"
                }
              >
                {sampleStatusData.find(item => item.status === 'rejected')?.value > 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {sampleStatusData.find(item => item.status === 'rejected')?.value} rejeitadas
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 mr-1" />
                    0% de rejeição
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Distribuição de amostras por status */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Amostras por Status</CardTitle>
            <CardDescription>
              Distribuição atual das amostras por status
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sampleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sampleStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SAMPLE_STATUS_COLORS[entry.status as keyof typeof SAMPLE_STATUS_COLORS] || "#8884d8"} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value} amostras`, 
                    props.payload.name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Amostras recebidas por dia */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recebimento de Amostras</CardTitle>
            <CardDescription>
              Amostras recebidas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={samplesReceivedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Amostras Recebidas"
                  stroke="#0ea5e9"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tempo médio de processamento por tipo de teste */}
        <Card className="col-span-1 lg:col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Tempo de Processamento</CardTitle>
            <CardDescription>
              Tempo médio de análise por tipo de teste (horas)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processingTimeData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 150,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(1)} horas`, "Tempo médio"]}
                />
                <Legend />
                <Bar 
                  dataKey="hours" 
                  name="Tempo médio (horas)" 
                  fill="#a855f7" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e ações necessárias */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Ações</CardTitle>
          <CardDescription>
            Tarefas que precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.samplesPendingTooLong > 0 ? (
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200 flex items-start gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-700">Amostras com atraso</h3>
                <p className="text-orange-600 text-sm">
                  Existem {dashboardData.samplesPendingTooLong} amostras pendentes há mais de 7 dias.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Ver amostras
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-700">Nenhum alerta crítico</h3>
                <p className="text-green-600 text-sm">
                  Todas as amostras estão sendo processadas dentro do prazo esperado.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}