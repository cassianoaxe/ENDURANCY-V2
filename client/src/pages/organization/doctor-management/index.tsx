import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BarChart3, BookOpen, Calendar, CheckCircle2, FileText, Loader2, MoreHorizontal, LayoutDashboard, Search, Stethoscope, UserPlus, Users } from "lucide-react";

// Interface para médico
interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  profilePhoto?: string;
  status: 'active' | 'inactive' | 'pending';
  totalPatients: number;
  totalPrescriptions: number;
  registrationDate: string;
  crm: string;
  crmState: string;
}

// Interface para estatísticas
interface DoctorManagementStats {
  totalDoctors: number;
  activeDoctors: number;
  newDoctorsThisMonth: number;
  totalPrescriptions: number;
  prescriptionsThisMonth: number;
  avgPrescriptionsPerDoctor: number;
  specialties: Array<{name: string, count: number}>;
  totalAppointments: number;
  upcomingAppointments: number;
}

function DoctorManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Carregar estatísticas do gerenciamento médico
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/organization/doctor-management/stats'],
  });
  
  // Carregar médicos
  const { data: doctors, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['/api/organization/doctors'],
  });

  // Carregar prescrições recentes
  const { data: recentPrescriptions, isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['/api/organization/doctor-management/recent-prescriptions'],
  });

  // Carregar agendamentos próximos
  const { data: upcomingAppointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ['/api/organization/doctor-management/upcoming-appointments'],
  });

  if (isStatsLoading || isDoctorsLoading || isPrescriptionsLoading || isAppointmentsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filtrar médicos com base na pesquisa
  const filteredDoctors = doctors && searchQuery
    ? doctors.filter((doctor: Doctor) => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.crm.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : doctors;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Médicos</h1>
          <p className="text-muted-foreground">
            Gerencie médicos, monitore prescrições e organize a educação médica continuada
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate("/organization/doctor-management/doctors")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Cadastrar Médico
          </Button>
          <Button variant="outline" onClick={() => navigate("/organization/doctor-management/education")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Área Educativa
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="doctors" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Médicos
          </TabsTrigger>
          <TabsTrigger 
            value="prescriptions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Prescrições
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Agendamentos
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Médicos</CardTitle>
                <CardDescription>Registro de médicos na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-semibold">{stats?.totalDoctors || 0}</p>
                    <p className="text-muted-foreground text-sm">
                      {stats?.activeDoctors || 0} médicos ativos
                    </p>
                  </div>
                </div>
                {stats?.newDoctorsThisMonth > 0 && (
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                    +{stats?.newDoctorsThisMonth} no último mês
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/organization/doctor-management/doctors")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ver Médicos
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Prescrições</CardTitle>
                <CardDescription>Prescrições emitidas por médicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-emerald-500 mr-3" />
                  <div>
                    <p className="text-2xl font-semibold">{stats?.totalPrescriptions || 0}</p>
                    <p className="text-muted-foreground text-sm">
                      {stats?.prescriptionsThisMonth || 0} este mês
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Média de {stats?.avgPrescriptionsPerDoctor || 0} prescrições por médico
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/organization/doctor-management/prescriptions")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Prescrições
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Agendamentos</CardTitle>
                <CardDescription>Consultas agendadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-semibold">{stats?.totalAppointments || 0}</p>
                    <p className="text-muted-foreground text-sm">
                      {stats?.upcomingAppointments || 0} agendados
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/organization/doctor-management/appointments")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Gerenciar Agenda
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Médicos Recentes</CardTitle>
                <CardDescription>Últimos médicos cadastrados na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>CRM</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors?.slice(0, 5).map((doctor: Doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={doctor.profilePhoto} />
                              <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-xs text-muted-foreground">{doctor.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.crm}/{doctor.crmState}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              doctor.status === 'active' ? 'outline' : 
                              doctor.status === 'pending' ? 'secondary' : 'destructive'
                            }
                            className={
                              doctor.status === 'active' 
                                ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : doctor.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : ''
                            }
                          >
                            {doctor.status === 'active' ? 'Ativo' : 
                             doctor.status === 'pending' ? 'Pendente' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!doctors || doctors.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Não há médicos cadastrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/organization/doctor-management/doctors")}>
                  Ver Todos os Médicos
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
                <CardDescription>Distribuição de médicos por especialidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.specialties?.map((specialty, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{specialty.name}</p>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${(specialty.count / stats.totalDoctors) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-semibold ml-4">{specialty.count}</p>
                    </div>
                  ))}

                  {(!stats?.specialties || stats.specialties.length === 0) && (
                    <div className="py-8 text-center text-muted-foreground">
                      Sem dados de especialidades
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/organization/doctor-management/statistics")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Estatísticas Detalhadas
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Médicos */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar médicos por nome, e-mail, CRM ou especialidade"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/organization/doctor-management/doctors")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Médico
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prescrições</TableHead>
                    <TableHead>Pacientes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors?.map((doctor: Doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doctor.profilePhoto} />
                            <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-xs text-muted-foreground">{doctor.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.crm}/{doctor.crmState}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            doctor.status === 'active' ? 'outline' : 
                            doctor.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            doctor.status === 'active' 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                              : doctor.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : ''
                          }
                        >
                          {doctor.status === 'active' ? 'Ativo' : 
                           doctor.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.totalPrescriptions}</TableCell>
                      <TableCell>{doctor.totalPatients}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/doctor-management/doctors/${doctor.id}`)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredDoctors || filteredDoctors.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {searchQuery ? (
                          <div>
                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p>Nenhum médico encontrado com o termo "{searchQuery}"</p>
                            <Button 
                              variant="link" 
                              onClick={() => setSearchQuery("")}
                              className="mt-2"
                            >
                              Limpar busca
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p>Não há médicos cadastrados</p>
                            <Button 
                              variant="link" 
                              onClick={() => navigate("/organization/doctor-management/doctors")}
                              className="mt-2"
                            >
                              Cadastrar um médico
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredDoctors?.length || 0} de {doctors?.length || 0} médicos
              </p>
              <Button variant="outline" onClick={() => navigate("/organization/doctor-management/doctors")}>
                Ver Todos os Médicos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Prescrições */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescrições Recentes</CardTitle>
              <CardDescription>Últimas prescrições emitidas pelos médicos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPrescriptions?.slice(0, 5).map((prescription: any) => (
                    <TableRow key={prescription.id}>
                      <TableCell>#{prescription.id}</TableCell>
                      <TableCell>{prescription.doctorName}</TableCell>
                      <TableCell>{prescription.patientName}</TableCell>
                      <TableCell>{new Date(prescription.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            prescription.status === 'approved' ? 'outline' : 
                            prescription.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            prescription.status === 'approved' 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                              : prescription.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : ''
                          }
                        >
                          {prescription.status === 'approved' ? 'Aprovada' : 
                           prescription.status === 'pending' ? 'Pendente' : 'Rejeitada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/doctor-management/prescriptions/${prescription.id}`)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentPrescriptions || recentPrescriptions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Não há prescrições registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/organization/doctor-management/prescriptions")}>
                Ver Todas as Prescrições
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Agendamentos */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Próximos</CardTitle>
              <CardDescription>Consultas programadas para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments?.slice(0, 5).map((appointment: any) => (
                    <TableRow key={appointment.id}>
                      <TableCell>#{appointment.id}</TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>
                        {new Date(appointment.scheduledFor).toLocaleDateString('pt-BR')}{' '}
                        {new Date(appointment.scheduledFor).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            appointment.status === 'confirmed' ? 'outline' : 
                            appointment.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            appointment.status === 'confirmed' 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                              : appointment.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : ''
                          }
                        >
                          {appointment.status === 'confirmed' ? 'Confirmado' : 
                           appointment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/doctor-management/appointments/${appointment.id}`)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!upcomingAppointments || upcomingAppointments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Não há agendamentos próximos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/organization/doctor-management/appointments")}>
                Gerenciar Todos os Agendamentos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos"
                className="pl-9"
              />
            </div>
            <Button onClick={() => navigate("/organization/doctor-management/documents")}>
              <FileText className="h-4 w-4 mr-2" />
              Adicionar Documento
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Educacionais</CardTitle>
              <CardDescription>Materiais compartilhados para educação médica continuada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhum documento disponível</h3>
                <p className="mb-4">
                  Adicione documentos educacionais para compartilhar com os médicos da plataforma.
                </p>
                <Button onClick={() => navigate("/organization/doctor-management/documents")}>
                  Adicionar Primeiro Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DoctorManagementPage() {
  return (
    <OrganizationLayout>
      <DoctorManagementDashboard />
    </OrganizationLayout>
  );
}