import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Beaker,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FlaskConical,
  HelpCircle,
  LayoutGrid,
  LineChart,
  Loader2,
  ShieldAlert,
  TestTube,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, LineChart as LineChartComponent, PieChart, Metric } from "@/components/ui/charts";
import { Link } from "wouter";

interface HplcDashboardData {
  equipment: {
    total: number;
    operational: number;
    inMaintenance: number;
    outOfService: number;
  };
  pendingMaintenances: number;
  runsByMonth: { month: string; count: number }[];
  lowStock: number;
  pendingValidations: number;
  consumptionByType: { type: string; quantity: number }[];
  runStatus: { status: string; count: number }[];
}

export default function HplcDashboard() {
  const { user } = useAuth();

  // Mock data para desenvolvimento
  const mockData: HplcDashboardData = {
    equipment: {
      total: 12,
      operational: 9,
      inMaintenance: 2,
      outOfService: 1,
    },
    pendingMaintenances: 3,
    runsByMonth: [
      { month: "Jan", count: 42 },
      { month: "Fev", count: 38 },
      { month: "Mar", count: 45 },
      { month: "Abr", count: 40 },
      { month: "Mai", count: 52 },
      { month: "Jun", count: 48 },
      { month: "Jul", count: 60 },
      { month: "Ago", count: 58 },
      { month: "Set", count: 65 },
      { month: "Out", count: 70 },
      { month: "Nov", count: 75 },
      { month: "Dez", count: 62 },
    ],
    lowStock: 5,
    pendingValidations: 2,
    consumptionByType: [
      { type: "Colunas", quantity: 35 },
      { type: "Solventes", quantity: 120 },
      { type: "Fase Móvel", quantity: 80 },
      { type: "Padrões", quantity: 45 },
      { type: "Filtros", quantity: 55 },
      { type: "Outros", quantity: 25 },
    ],
    runStatus: [
      { status: "Concluído", count: 380 },
      { status: "Em andamento", count: 12 },
      { status: "Agendado", count: 25 },
      { status: "Abortado", count: 8 },
      { status: "Falha", count: 15 },
    ],
  };

  // Endpoint real para o dashboard
  const { data: dashboardData, isLoading } = useQuery<HplcDashboardData>({
    queryKey: ["/api/laboratory/hplc/dashboard"],
    enabled: !!user,
  });

  // Usar dados mockados durante o desenvolvimento, no futuro usar dados reais
  const data = dashboardData || mockData;

  // Cores para os gráficos
  const equipmentColors = ["#22c55e", "#f59e0b", "#ef4444"];
  const consumableColors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#22c55e",
    "#64748b",
  ];
  const runStatusColors = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#64748b",
    "#ef4444",
  ];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard HPLC</h1>
        <p className="text-muted-foreground">
          Visão geral do laboratório HPLC e métricas de desempenho
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Métricas principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Metric
              title="Equipamentos"
              value={data.equipment.total}
              description={`${data.equipment.operational} operacionais`}
              icon={<FlaskConical className="h-4 w-4 text-primary" />}
              trend={{
                value: (data.equipment.operational / data.equipment.total) * 100,
                isPositive: true,
              }}
            />
            <Metric
              title="Manutenções Pendentes"
              value={data.pendingMaintenances}
              description="Agendadas para os próximos 30 dias"
              icon={<Wrench className="h-4 w-4 text-yellow-500" />}
              trend={{
                value: 0,
                isPositive: false,
              }}
            />
            <Metric
              title="Consumíveis com Estoque Baixo"
              value={data.lowStock}
              description="Abaixo do nível mínimo"
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              trend={{
                value: 0,
                isPositive: false,
              }}
            />
            <Metric
              title="Validações Pendentes"
              value={data.pendingValidations}
              description="Métodos aguardando validação"
              icon={<ClipboardCheck className="h-4 w-4 text-blue-500" />}
              trend={{
                value: 0,
                isPositive: true,
              }}
            />
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de corridas por mês */}
            <Card>
              <CardHeader>
                <CardTitle>Corridas por Mês</CardTitle>
                <CardDescription>
                  Total de corridas HPLC realizadas em cada mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={data.runsByMonth}
                  index="month"
                  categories={["count"]}
                  colors={["#3b82f6"]}
                  valueFormatter={(value) => `${value} corridas`}
                  height={300}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Últimos 12 meses
                </Button>
                <Button size="sm" asChild>
                  <Link href="/laboratory/hplc/runs">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Ver detalhes
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Gráfico de consumo por tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Consumo por Tipo de Material</CardTitle>
                <CardDescription>
                  Distribuição do consumo de materiais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={data.consumptionByType}
                  index="type"
                  category="quantity"
                  colors={consumableColors}
                  valueFormatter={(value) => `${value} unidades`}
                  height={300}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Últimos 30 dias
                </Button>
                <Button size="sm" asChild>
                  <Link href="/laboratory/hplc/consumables">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Gerenciar consumíveis
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Estatus de equipamentos e corridas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status dos equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Equipamentos</CardTitle>
                <CardDescription>
                  Distribuição do status atual dos equipamentos HPLC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    {
                      category: "Operacional",
                      value: data.equipment.operational,
                    },
                    {
                      category: "Em Manutenção",
                      value: data.equipment.inMaintenance,
                    },
                    {
                      category: "Fora de Serviço",
                      value: data.equipment.outOfService,
                    },
                  ]}
                  index="category"
                  categories={["value"]}
                  colors={equipmentColors}
                  valueFormatter={(value) => `${value} unidades`}
                  height={300}
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/laboratory/hplc/equipments">
                    <div className="flex items-center justify-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Ver todos os equipamentos
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Status das corridas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Corridas</CardTitle>
                <CardDescription>
                  Distribuição do status das corridas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={data.runStatus}
                  index="status"
                  category="count"
                  colors={runStatusColors}
                  valueFormatter={(value) => `${value} corridas`}
                  height={300}
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/laboratory/hplc/runs">
                    <div className="flex items-center justify-center gap-2">
                      <Beaker className="h-4 w-4" />
                      Gerenciar corridas
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Atalhos para operações comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-24 flex-col" asChild>
                  <Link href="/laboratory/hplc/runs/new">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Beaker className="h-5 w-5" />
                      <span>Nova Corrida</span>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col" asChild>
                  <Link href="/laboratory/hplc/maintenances">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="h-5 w-5" />
                      <span>Agendar Manutenção</span>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col" asChild>
                  <Link href="/laboratory/hplc/consumables">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TestTube className="h-5 w-5" />
                      <span>Registrar Consumo</span>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col" asChild>
                  <Link href="/laboratory/hplc/validations">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      <span>Nova Validação</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}