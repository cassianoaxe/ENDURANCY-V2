import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { Calendar, Clock, Users, FileText, Filter } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DoctorAgenda() {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const [selectedDay, setSelectedDay] = useState('today');
  
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
            <Button size="sm" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Nova Consulta</span>
            </Button>
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