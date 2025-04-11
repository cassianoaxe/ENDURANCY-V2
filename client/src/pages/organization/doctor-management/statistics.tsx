import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  FileText, 
  Loader2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  UsersRound 
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos
interface Statistic {
  name: string;
  value: number;
  change: number;
  period: string;
}

interface DoctorStatistics {
  totalStats: Statistic[];
  prescriptionsByMonth: { month: string; count: number }[];
  prescriptionsBySpecialty: { specialty: string; count: number }[];
  doctorsBySpecialty: { specialty: string; count: number }[];
  topDoctors: { 
    id: number;
    name: string;
    specialty: string;
    prescriptionsCount: number;
    patientsCount: number;
  }[];
}

function DoctorStatisticsPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = React.useState("overview");
  
  // Carregar estatísticas médicas
  const { data: stats, isLoading } = useQuery<DoctorStatistics>({
    queryKey: ['/api/organization/doctor-management/statistics'],
    placeholderData: {
      totalStats: [],
      prescriptionsByMonth: [],
      prescriptionsBySpecialty: [],
      doctorsBySpecialty: [],
      topDoctors: []
    }
  });

  // Gerar dados de datas para os últimos 6 meses
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return format(date, 'MMM', { locale: ptBR });
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/organization/doctor-management")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Estatísticas Médicas</h1>
            <p className="text-muted-foreground">
              Análise detalhada de desempenho médico e prescrições
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalStats.find(s => s.name === 'totalDoctors')?.value || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStats.find(s => s.name === 'totalDoctors')?.period || 'Total atual'}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <UsersRound className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-xs flex items-center ${
                (stats?.totalStats.find(s => s.name === 'totalDoctors')?.change || 0) > 0
                  ? 'text-green-600'
                  : (stats?.totalStats.find(s => s.name === 'totalDoctors')?.change || 0) < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {(stats?.totalStats.find(s => s.name === 'totalDoctors')?.change || 0) > 0 ? '↑' : 
                 (stats?.totalStats.find(s => s.name === 'totalDoctors')?.change || 0) < 0 ? '↓' : '→'}
                {Math.abs(stats?.totalStats.find(s => s.name === 'totalDoctors')?.change || 0)}% vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalStats.find(s => s.name === 'activeDoctors')?.value || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStats.find(s => s.name === 'activeDoctors')?.period || 'Atualmente ativos'}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <UsersRound className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-xs flex items-center ${
                (stats?.totalStats.find(s => s.name === 'activeDoctors')?.change || 0) > 0
                  ? 'text-green-600'
                  : (stats?.totalStats.find(s => s.name === 'activeDoctors')?.change || 0) < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {(stats?.totalStats.find(s => s.name === 'activeDoctors')?.change || 0) > 0 ? '↑' : 
                 (stats?.totalStats.find(s => s.name === 'activeDoctors')?.change || 0) < 0 ? '↓' : '→'}
                {Math.abs(stats?.totalStats.find(s => s.name === 'activeDoctors')?.change || 0)}% vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.value || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.period || 'Total de prescrições'}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-xs flex items-center ${
                (stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.change || 0) > 0
                  ? 'text-green-600'
                  : (stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.change || 0) < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {(stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.change || 0) > 0 ? '↑' : 
                 (stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.change || 0) < 0 ? '↓' : '→'}
                {Math.abs(stats?.totalStats.find(s => s.name === 'totalPrescriptions')?.change || 0)}% vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prescrições por Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.value || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.period || 'Média atual'}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-xs flex items-center ${
                (stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.change || 0) > 0
                  ? 'text-green-600'
                  : (stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.change || 0) < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {(stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.change || 0) > 0 ? '↑' : 
                 (stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.change || 0) < 0 ? '↓' : '→'}
                {Math.abs(stats?.totalStats.find(s => s.name === 'avgPrescriptionsPerDoctor')?.change || 0)}% vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <FileText className="h-4 w-4 mr-2" />
            Prescrições
          </TabsTrigger>
          <TabsTrigger value="specialties">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Especialidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições Mensais</CardTitle>
                <CardDescription>Total de prescrições emitidas por mês</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={stats?.prescriptionsByMonth || []}
                  index="month"
                  categories={["count"]}
                  colors={["primary"]}
                  valueFormatter={(value) => value.toString()}
                  showLegend={false}
                  showAnimation={true}
                  yAxisWidth={40}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Médicos por Especialidade</CardTitle>
                <CardDescription>Distribuição de médicos por área de atuação</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart
                  data={stats?.doctorsBySpecialty || []}
                  index="specialty"
                  categories={["count"]}
                  colors={["blue", "cyan", "indigo", "violet", "fuchsia", "pink"]}
                  valueFormatter={(value) => value.toString()}
                  showAnimation={true}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Médicos Mais Produtivos</CardTitle>
              <CardDescription>Médicos com maior volume de prescrições</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Prescrições</TableHead>
                    <TableHead>Pacientes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topDoctors?.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.prescriptionsCount}</TableCell>
                      <TableCell>{doctor.patientsCount}</TableCell>
                    </TableRow>
                  ))}
                  {(!stats?.topDoctors || stats.topDoctors.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Não há dados disponíveis
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições por Especialidade</CardTitle>
                <CardDescription>Distribuição de prescrições por especialidade médica</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart
                  data={stats?.prescriptionsBySpecialty || []}
                  index="specialty"
                  categories={["count"]}
                  colors={["emerald", "green", "teal", "cyan", "blue", "indigo"]}
                  valueFormatter={(value) => value.toString()}
                  showAnimation={true}
                  showTooltip={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência de Prescrições</CardTitle>
                <CardDescription>Evolução do volume de prescrições ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart
                  data={stats?.prescriptionsByMonth || []}
                  index="month"
                  categories={["count"]}
                  colors={["primary"]}
                  valueFormatter={(value) => value.toString()}
                  showLegend={false}
                  showAnimation={true}
                  yAxisWidth={40}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Médicos por Especialidade</CardTitle>
                <CardDescription>Número de médicos em cada especialidade</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={stats?.doctorsBySpecialty || []}
                  index="specialty"
                  categories={["count"]}
                  colors={["primary"]}
                  valueFormatter={(value) => value.toString()}
                  layout="vertical"
                  showLegend={false}
                  showAnimation={true}
                  yAxisWidth={120}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prescrições por Especialidade</CardTitle>
                <CardDescription>Volume de prescrições por especialidade</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart
                  data={stats?.prescriptionsBySpecialty || []}
                  index="specialty"
                  categories={["count"]}
                  colors={["blue"]}
                  valueFormatter={(value) => value.toString()}
                  layout="vertical"
                  showLegend={false}
                  showAnimation={true}
                  yAxisWidth={120}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DoctorStatisticsWrapper() {
  return (
    <OrganizationLayout>
      <DoctorStatisticsPage />
    </OrganizationLayout>
  );
}