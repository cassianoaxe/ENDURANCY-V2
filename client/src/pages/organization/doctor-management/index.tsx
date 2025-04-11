import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  CalendarClock, 
  FileText, 
  UserRound, 
  Users, 
  BookOpen, 
  PieChart, 
  Bell, 
  Calendar, 
  CheckCheck, 
  ClipboardCheck, 
  Clock, 
  ArrowUpCircle, 
  ArrowRight, 
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Componente principal do Dashboard de Gerenciamento de Médicos
function DoctorManagementPage() {
  const [, navigate] = useLocation();

  // Buscar estatísticas gerais
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats'],
  });

  // Buscar médicos recentes ou principais
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/organization/doctors'],
  });

  // Buscar próximas consultas
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/organization/appointments'],
  });

  // Buscar atividades recentes
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/organization/activities'],
  });

  // Buscar especialidades médicas (para o gráfico de distribuição)
  const { data: specialtyData, isLoading: isLoadingSpecialties } = useQuery({
    queryKey: ['/api/organization/doctor-specialties/distribution'],
  });

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Filtra médicos ativos para exibição
  const activeDoctors = React.useMemo(() => {
    if (!doctors) return [];
    return doctors.filter(d => d.status === 'active');
  }, [doctors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Médicos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os médicos da plataforma, consultas e documentos.
        </p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Médicos</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDoctors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeDoctors || 0} médicos ativos
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <p className={`flex items-center text-xs ${stats?.newDoctorsThisMonth > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
              <ArrowUpCircle className="h-3 w-3 mr-1" />
              {stats?.newDoctorsThisMonth || 0} novos neste mês
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescrições</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPrescriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.prescriptionsThisMonth || 0} neste mês
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Média: {stats?.avgPrescriptionsPerDoctor || 0}/médico
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.upcomingAppointments || 0} agendadas para os próximos dias
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="px-0" onClick={() => navigate("/organization/doctor-management/appointments")}>
              Ver agenda completa
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentDocuments || 0} adicionados recentemente
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="px-0" onClick={() => navigate("/organization/doctor-management/documents")}>
              Gerenciar documentos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Seção de links rápidos para ações comuns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 font-normal" 
          onClick={() => navigate("/organization/doctor-management/doctors")}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Médicos</h3>
              <p className="text-xs text-muted-foreground">Gerenciar médicos cadastrados</p>
            </div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 font-normal" 
          onClick={() => navigate("/organization/doctor-management/appointments")}
        >
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Consultas</h3>
              <p className="text-xs text-muted-foreground">Agendar consultas médicas</p>
            </div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 font-normal" 
          onClick={() => navigate("/organization/doctor-management/statistics")}
        >
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
              <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Estatísticas</h3>
              <p className="text-xs text-muted-foreground">Ver métricas e análises</p>
            </div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 font-normal" 
          onClick={() => navigate("/organization/doctor-management/documents")}
        >
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Documentos</h3>
              <p className="text-xs text-muted-foreground">Gerenciar documentos educacionais</p>
            </div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Conteúdo principal - Tabs */}
      <Tabs defaultValue="medicos">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="medicos">
            <UserRound className="h-4 w-4 mr-2" />
            Médicos Recentes
          </TabsTrigger>
          <TabsTrigger value="atividades">
            <Activity className="h-4 w-4 mr-2" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="especialidades">
            <Stethoscope className="h-4 w-4 mr-2" />
            Especialidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Médicos Recentes</CardTitle>
              <CardDescription>Lista dos médicos adicionados recentemente ou com atividade recente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDoctors?.slice(0, 5)?.map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={doctor.profilePhoto || undefined} />
                        <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{doctor.name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{doctor.specialty}</span>
                          <span className="mx-1">•</span>
                          <span>CRM {doctor.crm}/{doctor.crmState}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Badge 
                        variant={
                          doctor.status === 'active' ? 'outline' : 
                          doctor.status === 'pending' ? 'secondary' : 
                          doctor.status === 'suspended' ? 'destructive' : 'default'
                        }
                        className={
                          doctor.status === 'active' 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : doctor.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : doctor.status === 'suspended'
                            ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }
                      >
                        {doctor.status === 'active' ? 'Ativo' : 
                         doctor.status === 'pending' ? 'Pendente' : 
                         doctor.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}

                {(!activeDoctors || activeDoctors.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <UserRound className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhum médico cadastrado</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/organization/doctor-management/doctors")}
                      className="mt-2"
                    >
                      Cadastrar médicos
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/organization/doctor-management/doctors")}
              >
                Ver todos os médicos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="atividades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Registro de atividades dos médicos na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.slice(0, 5)?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className={`
                      p-2 rounded-full mt-1
                      ${activity.type === 'appointment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                      ${activity.type === 'prescription' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                      ${activity.type === 'document' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                      ${activity.type === 'login' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
                    `}>
                      {activity.type === 'appointment' && <Calendar className="h-4 w-4" />}
                      {activity.type === 'prescription' && <ClipboardCheck className="h-4 w-4" />}
                      {activity.type === 'document' && <FileText className="h-4 w-4" />}
                      {activity.type === 'login' && <UserRound className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                        <span className="mx-2 text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium">{activity.doctorName}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!activities || activities.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma atividade registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="especialidades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Especialidade</CardTitle>
              <CardDescription>Visualize a distribuição dos médicos por especialidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {specialtyData?.specialties?.map((specialty, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {specialty.count}
                        </Badge>
                        <span className="font-medium">{specialty.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((specialty.count / stats?.totalDoctors) * 100)}%
                      </span>
                    </div>
                    <Progress value={(specialty.count / stats?.totalDoctors) * 100} className="h-2" />
                  </div>
                ))}

                {(!specialtyData?.specialties || specialtyData.specialties.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma especialidade encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/organization/doctor-management/statistics")}
              >
                Ver estatísticas completas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seção Próximas Consultas */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Consultas médicas agendadas para os próximos dias.</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="ml-auto" 
            onClick={() => navigate("/organization/doctor-management/appointments")}
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments?.slice(0, 5)?.map((appointment, index) => (
              <div key={index} className="flex items-start gap-4 border-b last:border-0 pb-4 last:pb-0">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center min-w-[60px]">
                  <p className="text-xs font-medium">{new Date(appointment.scheduledFor).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</p>
                  <p className="text-xl font-bold">{new Date(appointment.scheduledFor).getDate()}</p>
                  <p className="text-xs">{new Date(appointment.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{appointment.doctor.name}</h4>
                    <Badge 
                      variant={
                        appointment.status === 'confirmed' ? 'outline' : 
                        appointment.status === 'pending' ? 'secondary' : 
                        appointment.status === 'cancelled' ? 'destructive' : 'default'
                      }
                      className={
                        appointment.status === 'confirmed' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : appointment.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }
                    >
                      {appointment.status === 'confirmed' ? 'Confirmado' : 
                      appointment.status === 'pending' ? 'Pendente' : 
                      appointment.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.duration} min
                    </span>
                    <span>•</span>
                    <span>Paciente: {appointment.patient.name}</span>
                  </div>
                </div>
              </div>
            ))}

            {(!appointments || appointments.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Não há consultas agendadas</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/organization/doctor-management/appointments")}
                  className="mt-2"
                >
                  Agendar consulta
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Interface que permite o uso de ícones personalizados no código
interface StethoscopeProps extends React.SVGProps<SVGSVGElement> {}

// Ícone de Estetoscópio (similar ao do Lucide, mas personalizado)
const Stethoscope = (props: StethoscopeProps) => (
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

export default function DoctorManagementPageWrapper() {
  return (
    <OrganizationLayout>
      <DoctorManagementPage />
    </OrganizationLayout>
  );
}