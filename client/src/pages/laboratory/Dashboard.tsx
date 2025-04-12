import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Beaker, 
  AlertTriangle, 
  TestTube, 
  XCircle,
  Clock9,
  Settings,
  Users,
  BarChart3,
  FileText,
  Plus
} from "lucide-react";

// Cores do sistema para gráficos
const colors = {
  approved: "#10b981", // verde
  completed: "#3b82f6", // azul
  pending: "#f59e0b", // amarelo
  rejected: "#ef4444", // vermelho
  received: "#8b5cf6", // roxo
  inProgress: "#6366f1", // indigo
  canceled: "#9ca3af", // cinza
};

const statusLabel = {
  approved: "Aprovado",
  completed: "Concluído",
  pending: "Pendente",
  rejected: "Rejeitado",
  received: "Recebido",
  in_progress: "Em Andamento",
  canceled: "Cancelado",
};

export default function LaboratoryDashboard() {
  // Buscar dados estatísticos do dashboard
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/laboratory/dashboard'],
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Preparar dados para gráficos
  const samplesByStatusData = {
    labels: dashboardStats?.samplesByStatus.map((item: any) => statusLabel[item.status as keyof typeof statusLabel] || item.status),
    datasets: [
      {
        data: dashboardStats?.samplesByStatus.map((item: any) => item.count),
        backgroundColor: [
          colors.approved,
          colors.completed,
          colors.pending,
          colors.rejected,
          colors.received,
          colors.inProgress,
          colors.canceled,
        ],
      },
    ],
  };

  const samplesReceivedByDayData = {
    labels: dashboardStats?.samplesReceivedByDay.map((item: any) => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: "Amostras Recebidas",
        data: dashboardStats?.samplesReceivedByDay.map((item: any) => item.count),
        borderColor: colors.completed,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
      },
    ],
  };

  const processingTimeData = {
    labels: dashboardStats?.avgProcessingTimeByTestType.map((item: any) => {
      switch (item.testType) {
        case "cannabinoid_profile": return "Canabinoides";
        case "terpene_profile": return "Terpenos";
        case "heavy_metals": return "Metais Pesados";
        case "pesticides": return "Pesticidas";
        case "microbials": return "Microbiológico";
        case "residual_solvents": return "Solventes";
        case "mycotoxins": return "Micotoxinas";
        default: return item.testType;
      }
    }),
    datasets: [
      {
        label: "Tempo de Processamento (horas)",
        data: dashboardStats?.avgProcessingTimeByTestType.map((item: any) => parseFloat(item.avgTime).toFixed(1)),
        backgroundColor: colors.inProgress,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Laboratório</h1>
          <p className="text-gray-500 mt-1">
            Acompanhe o desempenho e as atividades do laboratório em tempo real
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden md:flex">
            <FileText className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
          <Link href="/laboratory/samples/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Amostra
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Amostras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Beaker className="h-8 w-8 text-emerald-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {dashboardStats?.samplesByStatus.reduce((acc: number, item: any) => acc + item.count, 0)}
                </div>
                <p className="text-xs text-gray-500">Todos os status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Amostras Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {dashboardStats?.samplesByStatus.find((item: any) => item.status === "pending")?.count || 0}
                </div>
                <p className="text-xs text-gray-500">Aguardando processamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Concluídas/Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {(dashboardStats?.samplesByStatus.find((item: any) => item.status === "completed")?.count || 0) +
                   (dashboardStats?.samplesByStatus.find((item: any) => item.status === "approved")?.count || 0)}
                </div>
                <p className="text-xs text-gray-500">Resultados disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {dashboardStats?.avgProcessingTimeByTestType.length > 0 
                    ? (dashboardStats?.avgProcessingTimeByTestType.reduce(
                        (acc: number, item: any) => acc + parseFloat(item.avgTime), 
                        0
                      ) / dashboardStats?.avgProcessingTimeByTestType.length).toFixed(1)
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500">Horas para conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Amostras por Status</CardTitle>
            <CardDescription>Distribuição atual de todas as amostras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <PieChart data={samplesByStatusData} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Amostras Recebidas por Dia</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <LineChart data={samplesReceivedByDayData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio de Processamento por Tipo</CardTitle>
            <CardDescription>Em horas, para cada tipo de teste</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart data={processingTimeData} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Amostras Aguardando por Mais Tempo</CardTitle>
            <CardDescription>Amostras pendentes por mais de 3 dias</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {dashboardStats?.samplesPendingTooLong && dashboardStats.samplesPendingTooLong.length > 0 ? (
                dashboardStats.samplesPendingTooLong.map((sample: any) => (
                  <div key={sample.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium">{sample.productName}</div>
                        <div className="text-xs text-gray-500">
                          #{sample.trackingNumber} • {sample.organizationName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-amber-600 mr-2">
                        {sample.waitingDays} dias
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/laboratory/samples/${sample.id}`}>
                          <span>Ver</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                  <h3 className="text-lg font-medium">Sem atrasos!</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Todas as amostras estão dentro do prazo esperado de processamento.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ícones para acesso rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <Link href="/laboratory/samples">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Beaker className="h-8 w-8 text-emerald-500 mb-2" />
              <span className="text-sm font-medium">Amostras</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/laboratory/tests">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <TestTube className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">Testes</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/laboratory/results">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <FileText className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Resultados</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/laboratory/samples/track">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Clock9 className="h-8 w-8 text-amber-500 mb-2" />
              <span className="text-sm font-medium">Rastreio</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/laboratory/reports">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 text-indigo-500 mb-2" />
              <span className="text-sm font-medium">Relatórios</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/laboratory/settings">
          <Card className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Settings className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm font-medium">Configurações</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// Esqueleto para carregamento
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full rounded-md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-12 mr-2" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}