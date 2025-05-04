import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CalendarIcon, 
  ListFilter, 
  Plus, 
  Calendar as CalendarIcon2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados de exemplo dos eventos
const eventosGlobais = [
  {
    id: 1,
    titulo: 'Plantio Lote CLT-006',
    dataInicio: new Date(2025, 4, 2), // 2 de maio de 2025
    dataFim: new Date(2025, 4, 2),
    tipo: 'plantio',
    strain: 'AC/DC',
    responsavel: 'Maria Oliveira',
    status: 'concluido',
    detalhes: 'Plantio de 75 mudas de AC/DC para o lote CLT-006.'
  },
  {
    id: 2,
    titulo: 'Colheita Lote CLT-001',
    dataInicio: new Date(2025, 4, 15), // 15 de maio de 2025
    dataFim: new Date(2025, 4, 15),
    tipo: 'colheita',
    strain: "Charlotte's Web",
    responsavel: 'João Silva',
    status: 'pendente',
    detalhes: 'Colheita programada de 50 plantas do lote CLT-001.'
  },
  {
    id: 3,
    titulo: 'Adubação Lote CLT-007',
    dataInicio: new Date(2025, 4, 5), // 5 de maio de 2025
    dataFim: new Date(2025, 4, 5),
    tipo: 'manutencao',
    strain: 'Cannatonic',
    responsavel: 'Pedro Santos',
    status: 'concluido',
    detalhes: 'Aplicação de adubo orgânico nas plantas do lote CLT-007.'
  },
  {
    id: 4,
    titulo: 'Controle de Pragas',
    dataInicio: new Date(2025, 4, 8), // 8 de maio de 2025
    dataFim: new Date(2025, 4, 8),
    tipo: 'manutencao',
    strain: 'Múltiplas',
    responsavel: 'Ana Costa',
    status: 'concluido',
    detalhes: 'Aplicação de óleo de neem para controle preventivo de pragas em todos os lotes.'
  },
  {
    id: 5,
    titulo: 'Visita Técnica da Anvisa',
    dataInicio: new Date(2025, 4, 20), // 20 de maio de 2025
    dataFim: new Date(2025, 4, 20),
    tipo: 'inspecao',
    strain: 'N/A',
    responsavel: 'Carlos Mendes',
    status: 'pendente',
    detalhes: 'Inspeção técnica da Anvisa para verificação de conformidade dos processos de cultivo.'
  },
  {
    id: 6,
    titulo: 'Manutenção do Sistema de Irrigação',
    dataInicio: new Date(2025, 4, 12), // 12 de maio de 2025
    dataFim: new Date(2025, 4, 12),
    tipo: 'manutencao',
    strain: 'N/A',
    responsavel: 'Roberto Almeida',
    status: 'pendente',
    detalhes: 'Manutenção preventiva no sistema de irrigação automatizado.'
  },
  {
    id: 7,
    titulo: 'Análise de Solo',
    dataInicio: new Date(2025, 4, 7), // 7 de maio de 2025
    dataFim: new Date(2025, 4, 7),
    tipo: 'analise',
    strain: 'N/A',
    responsavel: 'Lucia Fernandes',
    status: 'concluido',
    detalhes: 'Coleta de amostras de solo para análise de pH e nutrientes.'
  },
  {
    id: 8,
    titulo: 'Treinamento de Equipe',
    dataInicio: new Date(2025, 4, 18), // 18 de maio de 2025
    dataFim: new Date(2025, 4, 19),
    tipo: 'treinamento',
    strain: 'N/A',
    responsavel: 'Paulo Menezes',
    status: 'pendente',
    detalhes: 'Treinamento da equipe sobre boas práticas de cultivo de cannabis medicinal.'
  }
];

// Componente para mapear o tipo de evento para cores
const TipoEventoBadge = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case 'plantio':
      return <Badge className="bg-green-100 text-green-800">Plantio</Badge>;
    case 'colheita':
      return <Badge className="bg-amber-100 text-amber-800">Colheita</Badge>;
    case 'manutencao':
      return <Badge className="bg-blue-100 text-blue-800">Manutenção</Badge>;
    case 'inspecao':
      return <Badge className="bg-purple-100 text-purple-800">Inspeção</Badge>;
    case 'analise':
      return <Badge className="bg-teal-100 text-teal-800">Análise</Badge>;
    case 'treinamento':
      return <Badge className="bg-indigo-100 text-indigo-800">Treinamento</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Outro</Badge>;
  }
};

// Componente para mapear o status do evento para cores
const StatusEventoBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'concluido':
      return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
    case 'pendente':
      return <Badge className="bg-blue-100 text-blue-800">Pendente</Badge>;
    case 'atrasado':
      return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
    case 'cancelado':
      return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
  }
};

// Componente principal do Calendário
const CalendarioCultivo = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [eventoSelecionado, setEventoSelecionado] = useState<any | null>(null);

  // Função para filtrar eventos
  const filtrarEventos = () => {
    let eventosFiltrados = [...eventosGlobais];

    if (filtroTipo !== 'todos') {
      eventosFiltrados = eventosFiltrados.filter(ev => ev.tipo === filtroTipo);
    }

    if (filtroStatus !== 'todos') {
      eventosFiltrados = eventosFiltrados.filter(ev => ev.status === filtroStatus);
    }

    return eventosFiltrados;
  };

  // Obter eventos filtrados
  const eventos = filtrarEventos();

  // Obter eventos para a data selecionada
  const eventosDataSelecionada = selectedDate 
    ? eventos.filter(ev => 
        ev.dataInicio.getDate() === selectedDate.getDate() && 
        ev.dataInicio.getMonth() === selectedDate.getMonth() && 
        ev.dataInicio.getFullYear() === selectedDate.getFullYear()
      )
    : [];

  // Função para verificar se uma data tem eventos
  const hasEventOnDay = (day: Date) => {
    return eventos.some(evento => 
      evento.dataInicio.getDate() === day.getDate() &&
      evento.dataInicio.getMonth() === day.getMonth() &&
      evento.dataInicio.getFullYear() === day.getFullYear()
    );
  };

  // Função de renderização personalizada para dias no calendário
  const renderDay = (day: Date) => {
    const isSelected = selectedDate && 
      day.getDate() === selectedDate.getDate() &&
      day.getMonth() === selectedDate.getMonth() &&
      day.getFullYear() === selectedDate.getFullYear();

    const hasEvent = hasEventOnDay(day);
    
    return (
      <div className={`relative p-2 ${isSelected ? 'bg-primary text-primary-foreground rounded-md' : ''}`}>
        <span>{day.getDate()}</span>
        {hasEvent && <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />}
      </div>
    );
  };

  // Função para navegar entre os meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Calendário de Cultivo</h1>
            <p className="text-gray-600 mt-1">Gerenciamento de eventos e atividades do cultivo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Evento</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {format(date, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={date}
                  className="border rounded-md"
                  renderDay={renderDay}
                  locale={ptBR}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex flex-col space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Filtrar por tipo:</span>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="plantio">Plantio</SelectItem>
                        <SelectItem value="colheita">Colheita</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="inspecao">Inspeção</SelectItem>
                        <SelectItem value="analise">Análise</SelectItem>
                        <SelectItem value="treinamento">Treinamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Filtrar por status:</span>
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {selectedDate ? (
                    <span>Eventos em {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                  ) : (
                    <span>Eventos</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {eventosDataSelecionada.length === 0 
                    ? 'Não há eventos para a data selecionada'
                    : `${eventosDataSelecionada.length} evento(s) programado(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventosDataSelecionada.length > 0 ? (
                    eventosDataSelecionada.map((evento) => (
                      <div key={evento.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                        onClick={() => setEventoSelecionado(evento)}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{evento.titulo}</h3>
                          <div className="flex gap-2">
                            <TipoEventoBadge tipo={evento.tipo} />
                            <StatusEventoBadge status={evento.status} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500">Data:</span>
                            <span>{format(evento.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Responsável:</span>
                            <span>{evento.responsavel}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Strain:</span>
                            <span>{evento.strain}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Detalhes:</span>
                          <p className="mt-1">{evento.detalhes}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                      <CalendarIcon2 className="h-12 w-12 mb-4 opacity-20" />
                      <p>Não há eventos programados para esta data</p>
                      <p className="text-sm mt-1">Selecione outra data ou crie um novo evento</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {eventosDataSelecionada.length > 0 && (
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    Ver Todos os Eventos
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Eventos programados para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Evento</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Strain</th>
                    <th className="text-left p-2">Responsável</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos
                    .filter(e => e.dataInicio >= new Date())
                    .sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())
                    .slice(0, 5)
                    .map(evento => (
                      <tr key={evento.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setEventoSelecionado(evento)}>
                        <td className="p-2 font-medium">{evento.titulo}</td>
                        <td className="p-2">{format(evento.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}</td>
                        <td className="p-2"><TipoEventoBadge tipo={evento.tipo} /></td>
                        <td className="p-2">{evento.strain}</td>
                        <td className="p-2">{evento.responsavel}</td>
                        <td className="p-2"><StatusEventoBadge status={evento.status} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <span className="text-sm text-gray-500">
                Exibindo {Math.min(5, eventos.filter(e => e.dataInicio >= new Date()).length)} de {eventos.filter(e => e.dataInicio >= new Date()).length} eventos futuros
              </span>
              <Button variant="link" size="sm">
                Ver todos
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Modal de detalhes do evento (pode ser implementado com Dialog ou Drawer) */}
      {eventoSelecionado && (
        <Popover open={!!eventoSelecionado} onOpenChange={() => setEventoSelecionado(null)}>
          <PopoverContent className="w-96 p-0" align="center">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{eventoSelecionado.titulo}</h2>
              <div className="flex gap-2 mb-4">
                <TipoEventoBadge tipo={eventoSelecionado.tipo} />
                <StatusEventoBadge status={eventoSelecionado.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Data:</span>
                  <span>{format(eventoSelecionado.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Responsável:</span>
                  <span>{eventoSelecionado.responsavel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Strain:</span>
                  <span>{eventoSelecionado.strain}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-500 text-sm">Detalhes:</span>
                <p className="mt-1">{eventoSelecionado.detalhes}</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEventoSelecionado(null)}>
                  Fechar
                </Button>
                <Button size="sm">
                  Editar Evento
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(CalendarioCultivo, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});