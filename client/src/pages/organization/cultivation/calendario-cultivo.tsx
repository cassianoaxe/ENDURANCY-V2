import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Dados de exemplo dos eventos
const eventosGlobais = [
  {
    id: 1,
    titulo: 'Plantio Lote CLT-006',
    dataInicio: new Date(2025, 4, 2), // 2 de maio de 2025
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
    tipo: 'manutencao',
    strain: 'Cannatonic',
    responsavel: 'Pedro Santos',
    status: 'concluido',
    detalhes: 'Aplicação de adubo orgânico nas plantas do lote CLT-007.'
  },
  {
    id: 4,
    titulo: 'Visita Técnica da Anvisa',
    dataInicio: new Date(2025, 4, 20), // 20 de maio de 2025
    tipo: 'inspecao',
    strain: 'N/A',
    responsavel: 'Carlos Mendes',
    status: 'pendente',
    detalhes: 'Inspeção técnica da Anvisa para verificação de conformidade.'
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
    default:
      return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
  }
};

// Componente principal do Calendário
const CalendarioCultivo = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

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
  const eventosDataSelecionada = date 
    ? eventos.filter(ev => 
        ev.dataInicio.getDate() === date.getDate() && 
        ev.dataInicio.getMonth() === date.getMonth() && 
        ev.dataInicio.getFullYear() === date.getFullYear()
      )
    : [];

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Calendário de Cultivo</h1>
            <p className="text-gray-600 mt-1">Gerenciamento de eventos e atividades do cultivo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <a href="/organization/cultivation" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
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
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="border rounded-md"
                  locale={pt}
                />
              </CardContent>
              <CardFooter className="border-t pt-4">
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
                  {date ? (
                    <span>Eventos em {format(date, 'dd/MM/yyyy', { locale: pt })}</span>
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
                      <div key={evento.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors">
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
                            <span>{format(evento.dataInicio, 'dd/MM/yyyy', { locale: pt })}</span>
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
                      <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                      <p>Não há eventos programados para esta data</p>
                      <p className="text-sm mt-1">Selecione outra data ou crie um novo evento</p>
                    </div>
                  )}
                </div>
              </CardContent>
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
                      <tr key={evento.id} className="border-b hover:bg-gray-50 cursor-pointer">
                        <td className="p-2 font-medium">{evento.titulo}</td>
                        <td className="p-2">{format(evento.dataInicio, 'dd/MM/yyyy', { locale: pt })}</td>
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
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(CalendarioCultivo, {
  moduleType: "cultivation", 
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});