import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// Removendo import do OrganizationLayout para evitar a renderização duplicada
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  Video,
  MapPin,
  FileText,
  Check,
  X,
  ListFilter
} from "lucide-react";

export default function CalendarioPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [filter, setFilter] = useState("all");

  // Lista de eventos do calendário (em uma implementação real, viriam da API)
  const events = [
    {
      id: 1,
      title: "Reunião de Planejamento",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:30",
      location: "Sala de Reuniões 1",
      type: "meeting",
      participants: ["Maria Silva", "João Costa", "Ana Ribeiro"],
      description: "Planejamento estratégico do próximo trimestre."
    },
    {
      id: 2,
      title: "Apresentação de Resultados",
      date: new Date(),
      startTime: "14:00",
      endTime: "15:00",
      location: "Auditório Principal",
      type: "presentation",
      participants: ["Equipe de Vendas", "Diretoria"],
      description: "Apresentação dos resultados do primeiro trimestre."
    },
    {
      id: 3,
      title: "Treinamento de Equipe",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "13:00",
      endTime: "17:00",
      location: "Sala de Treinamento",
      type: "training",
      participants: ["Novos Colaboradores"],
      description: "Treinamento introdutório para novos colaboradores."
    },
    {
      id: 4,
      title: "Reunião com Fornecedores",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      startTime: "10:00",
      endTime: "11:00",
      location: "Sala de Reuniões 2",
      type: "meeting",
      participants: ["Carlos Santos", "Representantes dos Fornecedores"],
      description: "Negociação de novos contratos de fornecimento."
    },
    {
      id: 5,
      title: "Reunião de Equipe",
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      startTime: "15:00",
      endTime: "16:00",
      location: "Google Meet",
      type: "virtual",
      participants: ["Toda a Equipe"],
      description: "Atualização semanal de status e alinhamento de prioridades."
    }
  ];

  // Filtrar eventos para o dia selecionado
  const filteredEvents = events.filter(event => {
    // Verificar se o dia, mês e ano são iguais
    const isSameDay = event.date.getDate() === selectedDate?.getDate() &&
                      event.date.getMonth() === selectedDate?.getMonth() &&
                      event.date.getFullYear() === selectedDate?.getFullYear();
    
    // Aplicar filtro de tipo
    if (filter === "all") return isSameDay;
    
    return isSameDay && event.type === filter;
  });

  const getDayEvents = (day: Date | undefined) => {
    if (!day) return [];
    
    return events.filter(event => 
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    ).length;
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Calendário</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie eventos, reuniões e compromissos
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Diária</SelectItem>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span>Calendário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md p-3"
                  modifiers={{
                    hasEvent: (date) => getDayEvents(date) > 0,
                  }}
                  modifiersClassNames={{
                    hasEvent: "bg-primary-50 text-primary font-bold",
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const eventCount = getDayEvents(date);
                      return (
                        <div className="relative">
                          {date.getDate()}
                          {eventCount > 0 && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    },
                  }}
                />

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Filtrar por tipo</h3>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos os eventos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os eventos</SelectItem>
                        <SelectItem value="meeting">Reuniões</SelectItem>
                        <SelectItem value="presentation">Apresentações</SelectItem>
                        <SelectItem value="training">Treinamentos</SelectItem>
                        <SelectItem value="virtual">Virtuais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Calendários</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>Eventos Internos</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Reuniões de Equipe</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <span>Treinamentos</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span>Feriados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>
                          {selectedDate.toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    ) : (
                      "Selecione uma data"
                    )}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => {
                      if (selectedDate) {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 1);
                        setSelectedDate(newDate);
                      }
                    }}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                      setSelectedDate(new Date());
                    }}>
                      <span className="text-xs">Hoje</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                      if (selectedDate) {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 1);
                        setSelectedDate(newDate);
                      }
                    }}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {filteredEvents.length > 0 ? (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{event.title}</h3>
                            <Badge 
                              variant={
                                event.type === "meeting" ? "default" : 
                                event.type === "presentation" ? "secondary" :
                                event.type === "training" ? "destructive" : "outline"
                              }
                            >
                              {event.type === "meeting" && "Reunião"}
                              {event.type === "presentation" && "Apresentação"}
                              {event.type === "training" && "Treinamento"}
                              {event.type === "virtual" && "Virtual"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-3">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.participants.length} participantes</span>
                            </div>
                            {event.type === "virtual" && (
                              <div className="flex items-center text-sm">
                                <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Reunião virtual</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Ver detalhes</Button>
                            <Button variant="outline" size="sm">Editar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60">
                      <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Não há eventos agendados para esta data ou com os filtros selecionados.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Evento
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}