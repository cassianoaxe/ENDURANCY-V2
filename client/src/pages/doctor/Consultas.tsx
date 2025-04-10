import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, Plus, Search, Video, Users, CheckCircle, XCircle, Phone } from "lucide-react";
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';

const tiposConsulta = [
  { value: "presencial", label: "Presencial" },
  { value: "video", label: "Vídeo Chamada" },
  { value: "telefone", label: "Telefone" }
];

const statusConsulta = [
  { value: "agendada", label: "Agendada", color: "bg-blue-100 text-blue-800" },
  { value: "em-andamento", label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  { value: "concluida", label: "Concluída", color: "bg-green-100 text-green-800" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800" }
];

// Dados de exemplo de consultas
const consultasHoje = [
  {
    id: 1,
    paciente: "Maria Santos",
    horario: "09:00",
    tipo: "presencial",
    status: "agendada"
  },
  {
    id: 2,
    paciente: "João Silva",
    horario: "10:30",
    tipo: "video",
    status: "em-andamento"
  },
  {
    id: 3,
    paciente: "Ana Oliveira",
    horario: "13:45",
    tipo: "telefone",
    status: "concluida"
  },
  {
    id: 4,
    paciente: "Carlos Mendes",
    horario: "15:15",
    tipo: "presencial",
    status: "cancelada"
  }
];

const consultasProximas = [
  {
    id: 5,
    paciente: "Rafaela Gomes",
    data: "12/04/2025",
    horario: "08:30",
    tipo: "presencial",
    status: "agendada"
  },
  {
    id: 6,
    paciente: "Bruno Costa",
    data: "13/04/2025",
    horario: "14:00",
    tipo: "video",
    status: "agendada"
  },
  {
    id: 7,
    paciente: "Júlia Martins",
    data: "15/04/2025",
    horario: "11:15",
    tipo: "telefone",
    status: "agendada"
  }
];

export default function Consultas() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [novaConsultaAberta, setNovaConsultaAberta] = React.useState(false);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "presencial":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "video":
        return <Video className="h-4 w-4 text-purple-600" />;
      case "telefone":
        return <Phone className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusObj = statusConsulta.find(s => s.value === status);
    
    if (!statusObj) return null;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj.color}`}>
        {statusObj.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelada":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Consultas</h1>
        <Dialog open={novaConsultaAberta} onOpenChange={setNovaConsultaAberta}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
              <DialogDescription>
                Preencha as informações para agendar uma nova consulta.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger id="paciente">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="ana">Ana Oliveira</SelectItem>
                      <SelectItem value="carlos">Carlos Mendes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data" className="text-right">
                  Data
                </Label>
                <div className="col-span-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="horario" className="text-right">
                  Horário
                </Label>
                <Input
                  id="horario"
                  type="time"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo" className="text-right">
                  Tipo
                </Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecione o tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposConsulta.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre a consulta"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNovaConsultaAberta(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={() => setNovaConsultaAberta(false)}>
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6">
        <div className="w-2/3">
          <Tabs defaultValue="hoje" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="hoje">Hoje</TabsTrigger>
              <TabsTrigger value="proximas">Próximas</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hoje">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Consultas de Hoje</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span>{date?.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultasHoje.length > 0 ? (
                      consultasHoje.map((consulta) => (
                        <div 
                          key={consulta.id} 
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-md">
                              {getTipoIcon(consulta.tipo)}
                            </div>
                            <div>
                              <h3 className="font-medium">{consulta.paciente}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{consulta.horario}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(consulta.status)}
                            <Button variant="outline" size="sm">
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma consulta agendada para hoje.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    {consultasHoje.length} consultas hoje
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="proximas">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Próximas Consultas</CardTitle>
                  <CardDescription>
                    Consultas agendadas para os próximos dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultasProximas.length > 0 ? (
                      consultasProximas.map((consulta) => (
                        <div 
                          key={consulta.id} 
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-md">
                              {getTipoIcon(consulta.tipo)}
                            </div>
                            <div>
                              <h3 className="font-medium">{consulta.paciente}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays className="h-3 w-3" />
                                <span>{consulta.data}</span>
                                <Clock className="h-3 w-3 ml-2" />
                                <span>{consulta.horario}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(consulta.status)}
                            <Button variant="outline" size="sm">
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Não há consultas agendadas para os próximos dias.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    {consultasProximas.length} consultas agendadas
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="historico">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Histórico de Consultas</CardTitle>
                  <CardDescription>
                    Consultas anteriores e seus resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input 
                        type="search" 
                        placeholder="Buscar paciente ou data..." 
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <p>Selecione um período para visualizar o histórico de consultas.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Visualize suas consultas no calendário</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
            <CardFooter>
              <div className="w-full text-sm text-gray-500">
                Selecione uma data para ver as consultas agendadas.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}