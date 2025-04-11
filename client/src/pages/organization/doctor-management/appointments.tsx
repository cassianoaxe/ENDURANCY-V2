import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, addHours, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Eye, 
  FileText, 
  Filter, 
  Loader2, 
  MoreHorizontal, 
  PencilLine, 
  RefreshCw, 
  Search, 
  Trash2, 
  UserCheck, 
  XCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  profilePhoto: string | null;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  profilePhoto: string | null;
}

interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  scheduledFor: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string | null;
  type: 'first_visit' | 'follow_up' | 'emergency' | 'routine';
  createdAt: string;
  doctor: {
    name: string;
    specialty: string;
    profilePhoto: string | null;
  };
  patient: {
    name: string;
    email: string;
    profilePhoto: string | null;
  };
}

// Esquema de validação para o formulário de agendamento
const appointmentFormSchema = z.object({
  doctorId: z.string().min(1, { message: "Selecione um médico" }),
  patientId: z.string().min(1, { message: "Selecione um paciente" }),
  scheduledFor: z.date({ required_error: "Selecione uma data" }),
  time: z.string().min(1, { message: "Selecione um horário" }),
  duration: z.string().min(1, { message: "Selecione a duração" }),
  type: z.enum(['first_visit', 'follow_up', 'emergency', 'routine'], {
    required_error: "Selecione o tipo de consulta",
  }),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed'], {
    required_error: "Selecione o status",
  }),
  notes: z.string().optional(),
});

// Componente principal
function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [doctorFilter, setDoctorFilter] = useState<string | null>(null);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Queries
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/organization/appointments'],
  });

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/organization/doctors'],
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/organization/patients'],
  });

  // Form setup
  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      doctorId: "",
      patientId: "",
      scheduledFor: new Date(),
      time: "09:00",
      duration: "30",
      type: "routine",
      status: "pending",
      notes: "",
    }
  });

  // Resetar formulário quando o agendamento selecionado mudar
  React.useEffect(() => {
    if (selectedAppointment) {
      const appointmentDate = new Date(selectedAppointment.scheduledFor);
      
      form.reset({
        doctorId: selectedAppointment.doctorId.toString(),
        patientId: selectedAppointment.patientId.toString(),
        scheduledFor: appointmentDate,
        time: format(appointmentDate, 'HH:mm'),
        duration: selectedAppointment.duration.toString(),
        type: selectedAppointment.type,
        status: selectedAppointment.status,
        notes: selectedAppointment.notes || "",
      });
    } else {
      form.reset({
        doctorId: "",
        patientId: "",
        scheduledFor: new Date(),
        time: "09:00",
        duration: "30",
        type: "routine",
        status: "pending",
        notes: "",
      });
    }
  }, [selectedAppointment, form]);

  // Mutações
  const addAppointmentMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof appointmentFormSchema>) => {
      // Combinar data e hora para o formato ISO
      const dateTime = new Date(formData.scheduledFor);
      const [hours, minutes] = formData.time.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      
      const data = {
        doctorId: parseInt(formData.doctorId),
        patientId: parseInt(formData.patientId),
        scheduledFor: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        status: formData.status,
        notes: formData.notes || null,
      };
      
      return await apiRequest('/api/organization/appointments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Consulta agendada",
        description: "A consulta foi agendada com sucesso.",
      });
      setIsNewAppointmentDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/appointments'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar consulta",
        description: "Ocorreu um erro ao agendar a consulta. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao agendar consulta:", error);
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof appointmentFormSchema>) => {
      if (!selectedAppointment) return;
      
      // Combinar data e hora para o formato ISO
      const dateTime = new Date(formData.scheduledFor);
      const [hours, minutes] = formData.time.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      
      const data = {
        id: selectedAppointment.id,
        doctorId: parseInt(formData.doctorId),
        patientId: parseInt(formData.patientId),
        scheduledFor: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        status: formData.status,
        notes: formData.notes || null,
      };
      
      return await apiRequest(`/api/organization/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Consulta atualizada",
        description: "As informações da consulta foram atualizadas com sucesso.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/appointments'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar consulta",
        description: "Ocorreu um erro ao atualizar a consulta. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar consulta:", error);
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/organization/appointments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Consulta cancelada",
        description: "A consulta foi cancelada com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/appointments'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cancelar consulta",
        description: "Ocorreu um erro ao cancelar a consulta. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao cancelar consulta:", error);
    }
  });

  // Funções manipuladoras
  const handleAddAppointment = (values: z.infer<typeof appointmentFormSchema>) => {
    addAppointmentMutation.mutate(values);
  };

  const handleUpdateAppointment = (values: z.infer<typeof appointmentFormSchema>) => {
    updateAppointmentMutation.mutate(values);
  };

  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;
    deleteAppointmentMutation.mutate(selectedAppointment.id);
  };

  // Filtragem de consultas
  const filteredAppointments = React.useMemo(() => {
    if (!appointments) return [];
    
    let filtered = [...appointments];
    
    // Filtrar por data selecionada
    if (selectedDate) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledFor);
        return isSameDay(appointmentDate, selectedDate);
      });
    }
    
    // Filtrar por status
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    // Filtrar por médico
    if (doctorFilter) {
      filtered = filtered.filter(appointment => 
        appointment.doctorId.toString() === doctorFilter
      );
    }
    
    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.doctor.name.toLowerCase().includes(query) ||
        appointment.patient.name.toLowerCase().includes(query) ||
        appointment.patient.email.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [appointments, selectedDate, statusFilter, doctorFilter, searchQuery]);

  // Ordenar por horário
  const sortedAppointments = React.useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });
  }, [filteredAppointments]);

  // Agrupamento de consultas por médico para visualização
  const appointmentsByDoctor = React.useMemo(() => {
    const grouped: Record<number, Appointment[]> = {};
    
    sortedAppointments.forEach(appointment => {
      if (!grouped[appointment.doctorId]) {
        grouped[appointment.doctorId] = [];
      }
      grouped[appointment.doctorId].push(appointment);
    });
    
    return grouped;
  }, [sortedAppointments]);

  // Data de calendário com consultas agendadas
  function isAppointmentDate(date: Date) {
    if (!appointments) return false;
    
    return appointments.some(appointment => {
      const appointmentDate = new Date(appointment.scheduledFor);
      return isSameDay(appointmentDate, date);
    });
  }

  if (isLoadingAppointments || isLoadingDoctors || isLoadingPatients) {
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
            <h1 className="text-3xl font-bold">Agendamento de Consultas</h1>
            <p className="text-muted-foreground">
              Gerencie os agendamentos de consultas médicas
            </p>
          </div>
        </div>
        
        <Button onClick={() => {
          setSelectedAppointment(null);
          setIsNewAppointmentDialogOpen(true);
        }}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>
              Selecione uma data para visualizar as consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                appointment: (date) => isAppointmentDate(date),
              }}
              modifiersClassNames={{
                appointment: "has-appointments",
              }}
            />
            <style jsx global>{`
              .has-appointments::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: hsl(var(--primary));
              }
            `}</style>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {sortedAppointments.length} consultas em {format(selectedDate || new Date(), 'PPP', { locale: ptBR })}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(new Date())}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Hoje
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por médico ou paciente"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={doctorFilter || ""} onValueChange={(value) => setDoctorFilter(value || null)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os médicos</SelectItem>
                  {doctors?.map((doctor: Doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setStatusFilter(null);
                setDoctorFilter(null);
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">
                <FileText className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="doctors">
                <UserCheck className="h-4 w-4 mr-2" />
                Por Médico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Consultas de {format(selectedDate || new Date(), 'PPP', { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>
                    Lista de todas as consultas agendadas para a data selecionada
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {format(new Date(appointment.scheduledFor), 'HH:mm')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {appointment.duration} min
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.doctor.profilePhoto || undefined} />
                                <AvatarFallback>{appointment.doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{appointment.doctor.name}</p>
                                <p className="text-xs text-muted-foreground">{appointment.doctor.specialty}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.patient.profilePhoto || undefined} />
                                <AvatarFallback>{appointment.patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{appointment.patient.name}</p>
                                <p className="text-xs text-muted-foreground">{appointment.patient.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.type === 'first_visit' ? 'Primeira Consulta' :
                             appointment.type === 'follow_up' ? 'Retorno' :
                             appointment.type === 'emergency' ? 'Emergência' : 'Rotina'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                appointment.status === 'confirmed' ? 'outline' : 
                                appointment.status === 'pending' ? 'secondary' : 
                                appointment.status === 'cancelled' ? 'destructive' : 
                                'default'
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
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setIsViewDialogOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setIsEditDialogOpen(true);
                                }}>
                                  <PencilLine className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sortedAppointments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p>Não há consultas agendadas para esta data</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSelectedAppointment(null);
                                setIsNewAppointmentDialogOpen(true);
                              }}
                              className="mt-2"
                            >
                              Agendar uma nova consulta
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="doctors" className="space-y-4">
              {Object.keys(appointmentsByDoctor).length > 0 ? (
                Object.entries(appointmentsByDoctor).map(([doctorId, doctorAppointments]) => {
                  const doctor = doctors.find((d: Doctor) => d.id === parseInt(doctorId));
                  if (!doctor) return null;
                  
                  return (
                    <Card key={doctorId} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.profilePhoto || undefined} />
                            <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{doctor.name}</CardTitle>
                            <CardDescription>{doctor.specialty}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {doctorAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md",
                                appointment.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20' :
                                appointment.status === 'confirmed' ? 'bg-green-50 dark:bg-green-900/20' :
                                appointment.status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/20' :
                                'bg-yellow-50 dark:bg-yellow-900/20'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-full",
                                  appointment.status === 'cancelled' ? 'bg-red-100 dark:bg-red-800' :
                                  appointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-800' :
                                  appointment.status === 'completed' ? 'bg-blue-100 dark:bg-blue-800' :
                                  'bg-yellow-100 dark:bg-yellow-800'
                                )}>
                                  <Clock className={cn(
                                    "h-4 w-4",
                                    appointment.status === 'cancelled' ? 'text-red-600 dark:text-red-300' :
                                    appointment.status === 'confirmed' ? 'text-green-600 dark:text-green-300' :
                                    appointment.status === 'completed' ? 'text-blue-600 dark:text-blue-300' :
                                    'text-yellow-600 dark:text-yellow-300'
                                  )} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {format(new Date(appointment.scheduledFor), 'HH:mm')}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {appointment.duration} min
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {appointment.type === 'first_visit' ? 'Primeira Consulta' :
                                       appointment.type === 'follow_up' ? 'Retorno' :
                                       appointment.type === 'emergency' ? 'Emergência' : 'Rotina'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={appointment.patient.profilePhoto || undefined} />
                                      <AvatarFallback>{appointment.patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">{appointment.patient.name}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Não há consultas agendadas para esta data</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSelectedAppointment(null);
                        setIsNewAppointmentDialogOpen(true);
                      }}
                      className="mt-2"
                    >
                      Agendar uma nova consulta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog para adicionar uma nova consulta */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Nova Consulta</DialogTitle>
            <DialogDescription>
              Preencha os dados para agendar uma nova consulta médica.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAppointment)} className="space-y-4">
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o médico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((doctor: Doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient: Patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} - {patient.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="08:30">08:30</SelectItem>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="09:30">09:30</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="10:30">10:30</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="11:30">11:30</SelectItem>
                          <SelectItem value="13:00">13:00</SelectItem>
                          <SelectItem value="13:30">13:30</SelectItem>
                          <SelectItem value="14:00">14:00</SelectItem>
                          <SelectItem value="14:30">14:30</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="15:30">15:30</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="16:30">16:30</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="17:30">17:30</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a duração" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first_visit">Primeira Consulta</SelectItem>
                          <SelectItem value="follow_up">Retorno</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                          <SelectItem value="routine">Rotina</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre a consulta" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewAppointmentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={addAppointmentMutation.isPending}
                >
                  {addAppointmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Agendar Consulta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar uma consulta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>
              Atualize as informações da consulta médica.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateAppointment)} className="space-y-4">
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o médico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((doctor: Doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient: Patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} - {patient.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="08:30">08:30</SelectItem>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="09:30">09:30</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="10:30">10:30</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="11:30">11:30</SelectItem>
                          <SelectItem value="13:00">13:00</SelectItem>
                          <SelectItem value="13:30">13:30</SelectItem>
                          <SelectItem value="14:00">14:00</SelectItem>
                          <SelectItem value="14:30">14:30</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="15:30">15:30</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="16:30">16:30</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="17:30">17:30</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a duração" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first_visit">Primeira Consulta</SelectItem>
                          <SelectItem value="follow_up">Retorno</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                          <SelectItem value="routine">Rotina</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre a consulta" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateAppointmentMutation.isPending}
                >
                  {updateAppointmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes da consulta */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
            <DialogDescription>
              Informações completas sobre o agendamento.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Médico</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedAppointment.doctor.profilePhoto || undefined} />
                      <AvatarFallback>
                        {selectedAppointment.doctor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedAppointment.doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedAppointment.doctor.specialty}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Paciente</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedAppointment.patient.profilePhoto || undefined} />
                      <AvatarFallback>
                        {selectedAppointment.patient.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedAppointment.patient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedAppointment.patient.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                    <p className="font-medium">{format(new Date(selectedAppointment.scheduledFor), 'PPP', { locale: ptBR })}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Horário</h3>
                    <p className="font-medium">{format(new Date(selectedAppointment.scheduledFor), 'HH:mm')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Duração</h3>
                    <p className="font-medium">{selectedAppointment.duration} minutos</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                    <p className="font-medium">
                      {selectedAppointment.type === 'first_visit' ? 'Primeira Consulta' :
                       selectedAppointment.type === 'follow_up' ? 'Retorno' :
                       selectedAppointment.type === 'emergency' ? 'Emergência' : 'Rotina'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <Badge 
                  className={cn(
                    "text-sm",
                    selectedAppointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : selectedAppointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  )}
                >
                  {selectedAppointment.status === 'confirmed' ? 'Confirmado' : 
                   selectedAppointment.status === 'pending' ? 'Pendente' : 
                   selectedAppointment.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
                <p className="text-sm border rounded-lg p-3 bg-muted/20">
                  {selectedAppointment.notes || "Nenhuma observação adicional."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p>{format(new Date(selectedAppointment.createdAt), 'PPP', { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID da Consulta</p>
                  <p>#{selectedAppointment.id}</p>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Button 
                  type="button"
                  variant="default"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                {selectedAppointment.status !== 'cancelled' && (
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmação de cancelamento */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta consulta?
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4">
              <div className="border rounded-lg p-4 bg-muted/20 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(selectedAppointment.scheduledFor), 'PPP', { locale: ptBR })} às {format(new Date(selectedAppointment.scheduledFor), 'HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedAppointment.doctor.profilePhoto || undefined} />
                      <AvatarFallback>{selectedAppointment.doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">{selectedAppointment.doctor.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedAppointment.patient.profilePhoto || undefined} />
                      <AvatarFallback>{selectedAppointment.patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">{selectedAppointment.patient.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 p-3 rounded-md mb-4 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                O cancelamento será informado ao médico e ao paciente.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAppointment}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AppointmentsPageWrapper() {
  return (
    <OrganizationLayout>
      <AppointmentsPage />
    </OrganizationLayout>
  );
}