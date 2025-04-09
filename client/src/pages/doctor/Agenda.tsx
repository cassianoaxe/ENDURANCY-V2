import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { Calendar, Clock, Users, FileText, Filter, Plus, X, CalendarIcon, CheckCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function DoctorAgenda() {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const [selectedDay, setSelectedDay] = useState('today');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [appointmentData, setAppointmentData] = useState({
    patient: '',
    time: '',
    reason: '',
    notes: '',
    duration: '30',
    status: 'scheduled'
  });
  
  // Dados mockados para demonstração
  const appointments = [
    { 
      id: 1, 
      time: '09:00', 
      patientName: 'João Silva', 
      reason: 'Consulta de rotina', 
      status: 'scheduled',
      notes: 'Paciente com histórico de hipertensão'
    },
    { 
      id: 2, 
      time: '10:30', 
      patientName: 'Maria Souza', 
      reason: 'Retorno',
      status: 'confirmed',
      notes: 'Avaliação pós-tratamento'
    },
    { 
      id: 3, 
      time: '11:45', 
      patientName: 'Carlos Ferreira', 
      reason: 'Primeira consulta',
      status: 'confirmed',
      notes: 'Paciente novo - encaminhamento cardiologia'
    },
    { 
      id: 4, 
      time: '14:15', 
      patientName: 'Ana Beatriz', 
      reason: 'Avaliação de exames',
      status: 'scheduled',
      notes: 'Trazer resultados de exames recentes'
    },
    { 
      id: 5, 
      time: '15:30', 
      patientName: 'Roberto Mendes', 
      reason: 'Consulta urgente',
      status: 'urgent',
      notes: 'Encaixe - dores no peito'
    },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-gray-500 text-sm capitalize">{formattedDate}</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Nova Consulta</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Consulta</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes para agendar um novo atendimento.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Aqui seria a lógica para salvar a consulta
                  console.log("Nova consulta agendada:", appointmentData);
                  setIsCreateDialogOpen(false);
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="patient">Paciente</Label>
                      <Select 
                        onValueChange={(value) => setAppointmentData({...appointmentData, patient: value})}
                        value={appointmentData.patient}
                      >
                        <SelectTrigger id="patient">
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="joao-silva">João Silva</SelectItem>
                          <SelectItem value="maria-souza">Maria Souza</SelectItem>
                          <SelectItem value="carlos-ferreira">Carlos Ferreira</SelectItem>
                          <SelectItem value="ana-beatriz">Ana Beatriz</SelectItem>
                          <SelectItem value="roberto-mendes">Roberto Mendes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            {/* Um componente de calendário seria adicionado aqui */}
                            <div className="p-3">
                              <p className="text-sm text-center text-gray-500">Seletor de calendário</p>
                              <div className="flex gap-1 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => setSelectedDate(currentDate)}
                                >
                                  Hoje
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => setSelectedDate(addDays(currentDate, 1))}
                                >
                                  Amanhã
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="time">Horário</Label>
                        <Select 
                          onValueChange={(value) => setAppointmentData({...appointmentData, time: value})}
                          value={appointmentData.time}
                        >
                          <SelectTrigger id="time">
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="08:30">08:30</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="09:30">09:30</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="10:30">10:30</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="11:30">11:30</SelectItem>
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
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duração</Label>
                        <Select 
                          defaultValue="30"
                          onValueChange={(value) => setAppointmentData({...appointmentData, duration: value})}
                          value={appointmentData.duration}
                        >
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Duração" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">60 minutos</SelectItem>
                            <SelectItem value="90">90 minutos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          defaultValue="scheduled"
                          onValueChange={(value) => setAppointmentData({...appointmentData, status: value})}
                          value={appointmentData.status}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Agendada</SelectItem>
                            <SelectItem value="confirmed">Confirmada</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Motivo da Consulta</Label>
                      <Input 
                        id="reason" 
                        placeholder="Ex: Consulta de rotina, Avaliação de exames"
                        value={appointmentData.reason}
                        onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Informações adicionais sobre o paciente ou consulta"
                        className="min-h-[80px]"
                        value={appointmentData.notes}
                        onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agendar Consulta</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="today" onValueChange={setSelectedDay} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
            <TabsTrigger value="yesterday">Ontem</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="tomorrow">Amanhã</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" /> 
                  Consultas de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 mb-3 sm:mb-0">
                        <div className="flex flex-col items-center justify-center text-center min-w-[60px]">
                          <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                          <Badge 
                            className={`mt-1 ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              appointment.status === 'urgent' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {appointment.status === 'confirmed' ? 'Confirmada' : 
                             appointment.status === 'urgent' ? 'Urgente' : 'Agendada'}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.patientName}</h4>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-0 sm:ml-4">
                        <Button size="sm" variant="outline" className="gap-1">
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">Prontuário</span>
                        </Button>
                        <Button size="sm" className="gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="hidden sm:inline">Iniciar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yesterday" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultas de Ontem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Nenhuma consulta para mostrar.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tomorrow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultas de Amanhã</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Carregando consultas...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agenda da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Visualização semanal em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agenda do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Visualização mensal em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
}