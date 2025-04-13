'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Plus, 
  Search,
  CalendarIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format, addMonths, subMonths, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dados mockados para calendário financeiro
const EVENTOS_FINANCEIROS = [
  {
    id: 1,
    tipo: 'recebimento',
    titulo: 'Recebimento Cliente ABC',
    data: '2025-04-05',
    valor: 7500,
    status: 'previsto'
  },
  {
    id: 2,
    tipo: 'pagamento',
    titulo: 'Aluguel',
    data: '2025-04-10',
    valor: 3200,
    status: 'previsto'
  },
  {
    id: 3,
    tipo: 'pagamento',
    titulo: 'Folha de Pagamento',
    data: '2025-04-05',
    valor: 22000,
    status: 'previsto'
  },
  {
    id: 4,
    tipo: 'pagamento',
    titulo: 'Fornecedor XYZ',
    data: '2025-04-15',
    valor: 4800,
    status: 'previsto'
  },
  {
    id: 5,
    tipo: 'recebimento',
    titulo: 'Recebimento Cliente DEF',
    data: '2025-04-18',
    valor: 12000,
    status: 'previsto'
  },
  {
    id: 6,
    tipo: 'pagamento',
    titulo: 'Impostos',
    data: '2025-04-20',
    valor: 5600,
    status: 'previsto'
  },
  {
    id: 7,
    tipo: 'recebimento',
    titulo: 'Recebimento Cliente GHI',
    data: '2025-04-25',
    valor: 9300,
    status: 'previsto'
  },
  {
    id: 8,
    tipo: 'pagamento',
    titulo: 'Despesas Operacionais',
    data: '2025-04-28',
    valor: 3700,
    status: 'previsto'
  },
  {
    id: 9,
    tipo: 'recebimento',
    titulo: 'Recebimento Cliente JKL',
    data: '2025-04-10',
    valor: 5400,
    status: 'previsto'
  },
  {
    id: 10,
    tipo: 'pagamento',
    titulo: 'Serviços',
    data: '2025-04-12',
    valor: 2300,
    status: 'previsto'
  },
];

// Componente para exibir eventos no calendário
const EventosDia = ({ eventos }: { eventos: any[] }) => {
  const totalRecebimentos = eventos
    .filter((e) => e.tipo === 'recebimento')
    .reduce((acc, e) => acc + e.valor, 0);
  
  const totalPagamentos = eventos
    .filter((e) => e.tipo === 'pagamento')
    .reduce((acc, e) => acc + e.valor, 0);
  
  return (
    <div className="flex flex-col items-center gap-1 p-1">
      {totalRecebimentos > 0 && (
        <div className="flex items-center text-green-500 text-xs">
          <ArrowUp className="h-3 w-3 mr-1" />
          {formatarMoeda(totalRecebimentos)}
        </div>
      )}
      {totalPagamentos > 0 && (
        <div className="flex items-center text-red-500 text-xs">
          <ArrowDown className="h-3 w-3 mr-1" />
          {formatarMoeda(totalPagamentos)}
        </div>
      )}
      <Badge variant="outline" className="text-xs">
        {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
};

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
};

export default function CalendarioFinanceiro() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  
  // Navegar entre meses
  const mesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };
  
  const proximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };
  
  // Filtrar eventos por dia selecionado
  const eventosDoDia = EVENTOS_FINANCEIROS.filter(
    (evento) => dataSelecionada && isSameDay(parseISO(evento.data), dataSelecionada)
  );
  
  // Agrupar eventos por data para o calendário
  const eventosPorDia = EVENTOS_FINANCEIROS.reduce((acc, evento) => {
    if (!acc[evento.data]) {
      acc[evento.data] = [];
    }
    acc[evento.data].push(evento);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Filtrar eventos para a lista
  const eventosFiltrados = EVENTOS_FINANCEIROS.filter((evento) => {
    // Filtro por termo de busca
    if (termoBusca && !evento.titulo.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    // Filtro por tipo
    if (filtroTipo !== 'todos' && evento.tipo !== filtroTipo) {
      return false;
    }
    
    return true;
  });
  
  // Renderizar conteúdo no calendário
  const renderDayContent = (day: Date) => {
    const dataStr = format(day, 'yyyy-MM-dd');
    const eventosNoDia = eventosPorDia[dataStr] || [];
    
    if (eventosNoDia.length > 0) {
      return <EventosDia eventos={eventosNoDia} />;
    }
    
    return null;
  };
  
  // Calcular totais para cartões de resumo
  const totalRecebimentos = eventosFiltrados
    .filter((e) => e.tipo === 'recebimento')
    .reduce((acc, e) => acc + e.valor, 0);
  
  const totalPagamentos = eventosFiltrados
    .filter((e) => e.tipo === 'pagamento')
    .reduce((acc, e) => acc + e.valor, 0);
  
  const saldoPrevisto = totalRecebimentos - totalPagamentos;

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendário Financeiro</h1>
            <p className="text-muted-foreground">
              Visualize e planeje receitas e despesas futuras
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={mesAnterior}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="outline" size="sm" onClick={proximoMes}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Recebimentos Previstos</h3>
                <p className="text-2xl font-bold text-green-500">{formatarMoeda(totalRecebimentos)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Total de {eventosFiltrados.filter(e => e.tipo === 'recebimento').length} eventos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Pagamentos Previstos</h3>
                <p className="text-2xl font-bold text-red-500">{formatarMoeda(totalPagamentos)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Total de {eventosFiltrados.filter(e => e.tipo === 'pagamento').length} eventos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Saldo Previsto</h3>
                <p className={`text-2xl font-bold ${saldoPrevisto >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatarMoeda(saldoPrevisto)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Diferença entre recebimentos e pagamentos
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Calendário de Eventos Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={setDataSelecionada}
                  month={mesAtual}
                  onMonthChange={setMesAtual}
                  className="rounded-md border w-full"
                  locale={ptBR}
                  // Em uma implementação real, usaríamos um componente personalizado para DayContent
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  {dataSelecionada 
                    ? `Eventos do dia ${format(dataSelecionada, 'dd/MM/yyyy')}` 
                    : 'Selecione uma data'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventosDoDia.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-500">Recebimentos</p>
                            <p className="text-xl font-bold">
                              {formatarMoeda(
                                eventosDoDia
                                  .filter((e) => e.tipo === 'recebimento')
                                  .reduce((acc, e) => acc + e.valor, 0)
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-red-500">Pagamentos</p>
                            <p className="text-xl font-bold">
                              {formatarMoeda(
                                eventosDoDia
                                  .filter((e) => e.tipo === 'pagamento')
                                  .reduce((acc, e) => acc + e.valor, 0)
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Eventos Financeiros</h3>
                      <ul className="space-y-2">
                        {eventosDoDia.map((evento) => (
                          <li key={evento.id} className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <span className="font-medium">{evento.titulo}</span>
                              <span className={evento.tipo === 'recebimento' ? 'text-green-500' : 'text-red-500'}>
                                {formatarMoeda(evento.valor)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="capitalize">{evento.tipo}</span>
                              <span className="mx-2">•</span>
                              <span>{evento.status}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    {dataSelecionada 
                      ? 'Nenhum evento financeiro programado para esta data' 
                      : 'Selecione uma data para ver os eventos'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Próximos Eventos Financeiros</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar evento..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="recebimento">Recebimentos</SelectItem>
                  <SelectItem value="pagamento">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Escolher Período
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium">Selecione o período</h4>
                    <div className="grid gap-2">
                      <div className="grid gap-1">
                        <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                          Próximos 7 dias
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                          Próximos 30 dias
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                          Este mês
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                          Próximo mês
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Nenhum evento encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventosFiltrados.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>
                          {format(parseISO(evento.data), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">{evento.titulo}</TableCell>
                        <TableCell>
                          <Badge variant={evento.tipo === 'recebimento' ? 'default' : 'secondary'}>
                            {evento.tipo === 'recebimento' ? 'Recebimento' : 'Pagamento'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{evento.status}</Badge>
                        </TableCell>
                        <TableCell className={`text-right ${
                          evento.tipo === 'recebimento' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatarMoeda(evento.valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}