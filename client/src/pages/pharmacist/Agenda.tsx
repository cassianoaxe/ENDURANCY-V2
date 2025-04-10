import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, User, CalendarDays, Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PharmacistAgenda() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'day' | 'week'>('day');

  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Exemplo de dados de agendamento (seria substituído por dados reais da API)
  const mockAppointments = [
    { 
      id: 1, 
      patientName: 'Maria Silva', 
      patientId: 101, 
      date: new Date(), 
      time: '09:00', 
      duration: 30, 
      type: 'Orientação Farmacêutica',
      status: 'confirmed'
    },
    { 
      id: 2, 
      patientName: 'João Oliveira', 
      patientId: 102, 
      date: new Date(), 
      time: '10:30', 
      duration: 45, 
      type: 'Acompanhamento de Medicação',
      status: 'confirmed'
    },
    { 
      id: 3, 
      patientName: 'Ana Souza', 
      patientId: 103, 
      date: new Date(), 
      time: '14:00', 
      duration: 30, 
      type: 'Revisão de Prescrição',
      status: 'pending'
    },
    { 
      id: 4, 
      patientName: 'Carlos Ferreira', 
      patientId: 104, 
      date: new Date(new Date().setDate(new Date().getDate() + 1)), 
      time: '11:00', 
      duration: 30, 
      type: 'Orientação Farmacêutica',
      status: 'confirmed'
    },
  ];

  // Filtrar agendamentos para o dia selecionado
  const appointmentsForSelectedDate = mockAppointments.filter(
    app => 
      app.date.getDate() === date.getDate() && 
      app.date.getMonth() === date.getMonth() && 
      app.date.getFullYear() === date.getFullYear()
  );

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  // Renderizar blocos de horário
  const renderTimeBlocks = () => {
    const blocks = [];
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    for (const hour of hours) {
      const appointments = appointmentsForSelectedDate.filter(app => app.time.startsWith(hour.split(':')[0]));
      
      blocks.push(
        <div key={hour} className="flex flex-col border-b">
          <div className="flex items-center py-2 px-4 bg-gray-50">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{hour}</span>
          </div>
          
          <div className="p-2 min-h-[60px]">
            {appointments.length > 0 ? (
              appointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className={`p-2 rounded-md mb-1 text-sm ${
                    appointment.status === 'confirmed' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{appointment.patientName}</span>
                    <Badge variant={appointment.status === 'confirmed' ? 'outline' : 'secondary'}>
                      {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {appointment.time} • {appointment.duration} min
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {appointment.type}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                Sem agendamentos
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return blocks;
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-gray-500">Gerenciamento de consultas e atendimentos • Farmácia {organizationName}</p>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Select value={viewType} onValueChange={(val) => setViewType(val as 'day' | 'week')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              Novo Agendamento
            </Button>
          </div>
        </div>
        
        {/* Calendario e lista de agendamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Side Panel - Calendar and Upcoming */}
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {mockAppointments.length > 0 ? (
                    mockAppointments
                      .filter(app => app.date >= new Date())
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .slice(0, 3)
                      .map(app => (
                        <div key={app.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {app.patientName}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              {format(app.date, "dd/MM/yyyy")} • {app.time}
                            </div>
                          </div>
                          <div>
                            {app.status === 'confirmed' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Badge variant="outline" className="text-xs">Pendente</Badge>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-4">
                      Não há agendamentos próximos
                    </p>
                  )}
                  
                  {mockAppointments.length > 3 && (
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                      Ver todos
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Schedule View */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>
                  Agendamentos • {format(date, "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => {
                    const newDate = new Date(date);
                    newDate.setDate(date.getDate() - 1);
                    setDate(newDate);
                  }}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Hoje
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const newDate = new Date(date);
                    newDate.setDate(date.getDate() + 1);
                    setDate(newDate);
                  }}>
                    Próximo
                  </Button>
                </div>
              </div>
              <CardDescription>
                Visualize e gerencie os agendamentos do dia
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                {renderTimeBlocks()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}