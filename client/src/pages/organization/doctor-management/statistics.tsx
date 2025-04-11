import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  UserRound, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Users, 
  Activity,
  Pill,
  MapPin,
  Clipboard,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

function DoctorStatisticsPage() {
  const [, navigate] = useLocation();
  const [timePeriod, setTimePeriod] = React.useState("mes"); // mes, trimestre, ano
  const [chartType, setChartType] = React.useState("prescriptions"); // prescriptions, appointments, specialties
  
  // Buscar estatísticas gerais
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats'],
  });
  
  // Buscar dados de médicos por região
  const { data: regionData, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats/regions'],
  });
  
  // Buscar dados de prescrições ao longo do tempo
  const { data: prescriptionTrends, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats/prescription-trends', timePeriod],
  });
  
  // Buscar dados de consultas ao longo do tempo
  const { data: appointmentTrends, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats/appointment-trends', timePeriod],
  });
  
  // Buscar médicos mais ativos
  const { data: topDoctors, isLoading: isLoadingTopDoctors } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats/top-doctors'],
  });
  
  // Buscar distribuição de especialidades
  const { data: specialtyData, isLoading: isLoadingSpecialties } = useQuery({
    queryKey: ['/api/organization/doctor-specialties/distribution'],
  });

  const totalPrescriptions = stats?.totalPrescriptions || 0;
  const prescriptionsThisMonth = stats?.prescriptionsThisMonth || 0;
  const prescriptionsComparisonRate = stats?.prescriptionsComparisonRate || 0;
  
  const totalAppointments = stats?.totalAppointments || 0;
  const appointmentsThisMonth = stats?.appointmentsThisMonth || 0;
  const appointmentsComparisonRate = stats?.appointmentsComparisonRate || 0;
  
  const totalDoctors = stats?.totalDoctors || 0;
  const activeDoctors = stats?.activeDoctors || 0;
  const doctorsComparisonRate = stats?.doctorsComparisonRate || 0;

  // Função de exemplo para simular um gráfico básico em ASCII (apenas para demonstração)
  const renderSimpleChart = (data: any[], type: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const normalizedValues = data.map(d => ({
      ...d,
      normalizedValue: (d.value / maxValue) * 100
    }));
    
    return (
      <div className="space-y-3 mt-2">
        {normalizedValues.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <Progress value={item.normalizedValue} className="h-2" />
          </div>
        ))}
      </div>
    );
  };

  // Dados para os gráficos (simulados - seriam substituídos pelos dados reais da API)
  const simulatedPrescriptionData = [
    { label: "Janeiro", value: 120 },
    { label: "Fevereiro", value: 150 },
    { label: "Março", value: 180 },
    { label: "Abril", value: 210 },
    { label: "Maio", value: 190 },
    { label: "Junho", value: 220 }
  ];
  
  const simulatedAppointmentData = [
    { label: "Janeiro", value: 85 },
    { label: "Fevereiro", value: 110 },
    { label: "Março", value: 95 },
    { label: "Abril", value: 140 },
    { label: "Maio", value: 125 },
    { label: "Junho", value: 160 }
  ];
  
  const simulatedSpecialtyData = [
    { label: "Clínico Geral", value: 24 },
    { label: "Dermatologista", value: 12 },
    { label: "Neurologista", value: 8 },
    { label: "Psiquiatra", value: 15 },
    { label: "Pediatra", value: 10 },
    { label: "Endocrinologista", value: 7 }
  ];
  
  // Determinar qual conjunto de dados usar com base na seleção
  const chartData = chartType === "prescriptions" 
    ? prescriptionTrends?.data || simulatedPrescriptionData
    : chartType === "appointments"
    ? appointmentTrends?.data || simulatedAppointmentData
    : specialtyData?.specialties || simulatedSpecialtyData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
          <p className="text-muted-foreground">
            Análise de desempenho dos médicos, prescrições e consultas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Últimos 30 dias</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => window.print()}>
            Exportar relatório
          </Button>
        </div>
      </div>

      {/* Cards com métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Prescrições</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrescriptions}</div>
            <div className="flex items-center pt-1">
              <span className="text-sm text-muted-foreground mr-2">
                {prescriptionsThisMonth} neste mês
              </span>
              
              <Badge variant="outline" className={`flex items-center ${prescriptionsComparisonRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {prescriptionsComparisonRate > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(prescriptionsComparisonRate)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <div className="flex items-center pt-1">
              <span className="text-sm text-muted-foreground mr-2">
                {appointmentsThisMonth} neste mês
              </span>
              
              <Badge variant="outline" className={`flex items-center ${appointmentsComparisonRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {appointmentsComparisonRate > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(appointmentsComparisonRate)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Médicos</CardTitle>
            <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDoctors}</div>
            <div className="flex items-center pt-1">
              <span className="text-sm text-muted-foreground mr-2">
                {activeDoctors} ativos
              </span>
              
              <Badge variant="outline" className={`flex items-center ${doctorsComparisonRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {doctorsComparisonRate > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(doctorsComparisonRate)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Visão Geral</CardTitle>
                  <CardDescription>Análise de tendências</CardDescription>
                </div>
                <div>
                  <Tabs defaultValue="prescriptions" className="w-[400px]"
                    value={chartType} onValueChange={setChartType}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
                      <TabsTrigger value="appointments">Consultas</TabsTrigger>
                      <TabsTrigger value="specialties">Especialidades</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="min-h-[350px]">
                {chartType === 'prescriptions' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Prescrições por período</h3>
                    <div className="mt-6">
                      {renderSimpleChart(chartData, 'bar')}
                      <div className="text-xs text-center text-muted-foreground mt-6">
                        * Dados apresentados conforme o período selecionado
                      </div>
                    </div>
                  </div>
                )}
                
                {chartType === 'appointments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Consultas por período</h3>
                    <div className="mt-6">
                      {renderSimpleChart(chartData, 'line')}
                      <div className="text-xs text-center text-muted-foreground mt-6">
                        * Dados de consultas registradas no sistema
                      </div>
                    </div>
                  </div>
                )}
                
                {chartType === 'specialties' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Distribuição por especialidade</h3>
                    <div className="mt-6">
                      {renderSimpleChart(chartData, 'pie')}
                      <div className="text-xs text-center text-muted-foreground mt-6">
                        * Total de médicos por especialidade
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Médicos Mais Ativos</CardTitle>
              <CardDescription>
                Baseado em prescrições e consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(topDoctors?.doctors || []).slice(0, 5).map((doctor, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={doctor.profilePhoto || undefined} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium leading-none">{doctor.name}</h4>
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                      <div className="flex items-center text-xs space-x-2 mt-1">
                        <div className="flex items-center">
                          <ClipboardCheck className="h-3 w-3 mr-1 text-green-500" />
                          <span>{doctor.prescriptions || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                          <span>{doctor.appointments || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-purple-500" />
                          <span>{doctor.patients || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!topDoctors?.doctors || topDoctors.doctors.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Sem dados suficientes</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/organization/doctor-management/doctors')}
              >
                Ver todos os médicos
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Estatísticas por Localidade */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Geográfica</CardTitle>
          <CardDescription>Concentração de médicos por região</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(regionData?.regions || []).map((region, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h4 className="font-medium">{region.name}</h4>
                  </div>
                  <Badge variant="outline">{region.count}</Badge>
                </div>
                <Progress value={(region.count / (regionData?.total || 1)) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {region.specialties?.slice(0, 3).join(', ')} 
                  {region.specialties?.length > 3 ? ' e mais...' : ''}
                </div>
              </div>
            ))}
            
            {(!regionData?.regions || regionData.regions.length === 0) && (
              <div className="col-span-full text-center py-6 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Sem dados de localização disponíveis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente específico de Estetoscópio (para UI consistente)
const StethoscopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6h0" />
    <path d="M8.8 2.3A.3.3 0 109 2H8a2 2 0 00-2 2v5a6 6 0 006 6h1" />
    <path d="M11 14v4a3 3 0 106 0v-1.5" />
    <circle cx="17" cy="13.5" r="2.5" />
  </svg>
);

export default function DoctorManagementStatisticsWrapper() {
  return (
    <OrganizationLayout>
      <DoctorStatisticsPage />
    </OrganizationLayout>
  );
}