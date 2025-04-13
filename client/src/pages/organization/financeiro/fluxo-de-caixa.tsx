'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileBarChart, 
  Plus, 
  Search, 
  Pencil, 
  ArrowUp, 
  ArrowDown,
  Filter 
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Dados mockados para demonstração
const TRANSACOES = [
  { 
    id: 1, 
    data: new Date('2025-04-01'), 
    descricao: 'Pagamento de aluguel', 
    categoria: 'Despesas Operacionais',
    valor: -3500,
    tipo: 'saida', 
    status: 'confirmado' 
  },
  { 
    id: 2, 
    data: new Date('2025-04-02'), 
    descricao: 'Recebimento de cliente ABC', 
    categoria: 'Vendas',
    valor: 7850,
    tipo: 'entrada', 
    status: 'confirmado' 
  },
  { 
    id: 3, 
    data: new Date('2025-04-03'), 
    descricao: 'Salários funcionários', 
    categoria: 'Folha de Pagamento',
    valor: -12500,
    tipo: 'saida', 
    status: 'confirmado' 
  },
  { 
    id: 4, 
    data: new Date('2025-04-05'), 
    descricao: 'Pagamento fornecedor XYZ', 
    categoria: 'Fornecedores',
    valor: -4200,
    tipo: 'saida', 
    status: 'confirmado' 
  },
  { 
    id: 5, 
    data: new Date('2025-04-08'), 
    descricao: 'Recebimento de cliente DEF', 
    categoria: 'Vendas',
    valor: 5300,
    tipo: 'entrada', 
    status: 'confirmado' 
  },
  { 
    id: 6, 
    data: new Date('2025-04-10'), 
    descricao: 'Pagamento de impostos', 
    categoria: 'Impostos',
    valor: -3800,
    tipo: 'saida', 
    status: 'confirmado' 
  },
  { 
    id: 7, 
    data: new Date('2025-04-12'), 
    descricao: 'Recebimento de cliente GHI', 
    categoria: 'Vendas',
    valor: 9200,
    tipo: 'entrada', 
    status: 'confirmado' 
  },
  { 
    id: 8, 
    data: new Date('2025-04-15'), 
    descricao: 'Pagamento de serviços', 
    categoria: 'Serviços',
    valor: -1800,
    tipo: 'saida', 
    status: 'confirmado' 
  },
  { 
    id: 9, 
    data: new Date('2025-04-18'), 
    descricao: 'Recebimento de cliente JKL', 
    categoria: 'Vendas',
    valor: 4500,
    tipo: 'entrada', 
    status: 'pendente' 
  },
  { 
    id: 10, 
    data: new Date('2025-04-20'), 
    descricao: 'Pagamento de utilidades', 
    categoria: 'Utilidades',
    valor: -950,
    tipo: 'saida', 
    status: 'pendente' 
  },
  { 
    id: 11, 
    data: new Date('2025-04-22'), 
    descricao: 'Recebimento de cliente MNO', 
    categoria: 'Vendas',
    valor: 6700,
    tipo: 'entrada', 
    status: 'pendente' 
  },
  { 
    id: 12, 
    data: new Date('2025-04-25'), 
    descricao: 'Pagamento de marketing', 
    categoria: 'Marketing',
    valor: -2500,
    tipo: 'saida', 
    status: 'pendente' 
  },
  { 
    id: 13, 
    data: new Date('2025-04-28'), 
    descricao: 'Recebimento de cliente PQR', 
    categoria: 'Vendas',
    valor: 8100,
    tipo: 'entrada', 
    status: 'pendente' 
  },
  { 
    id: 14, 
    data: new Date('2025-04-30'), 
    descricao: 'Pagamento de seguro', 
    categoria: 'Seguros',
    valor: -1200,
    tipo: 'saida', 
    status: 'pendente' 
  },
];

// Componente para exibir transações no calendário
const TransacaoDia = ({ transacoes }: { transacoes: any[] }) => {
  const totalEntradas = transacoes
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const totalSaidas = transacoes
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);
  
  return (
    <div className="flex flex-col items-center gap-1 p-1">
      {totalEntradas > 0 && (
        <div className="flex items-center text-green-500 text-xs">
          <ArrowUp className="h-3 w-3 mr-1" />
          {formatarMoeda(totalEntradas)}
        </div>
      )}
      {totalSaidas > 0 && (
        <div className="flex items-center text-red-500 text-xs">
          <ArrowDown className="h-3 w-3 mr-1" />
          {formatarMoeda(totalSaidas)}
        </div>
      )}
    </div>
  );
};

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function FluxoDeCaixa() {
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  // Navegar entre meses
  const mesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };
  
  const proximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };
  
  // Filtrar transações por data selecionada
  const transacoesDoDia = TRANSACOES.filter(
    (t) => dataSelecionada && isSameDay(t.data, dataSelecionada)
  );
  
  // Agrupar transações por data para o calendário
  const transacoesPorDia = TRANSACOES.reduce((acc, transacao) => {
    const dataStr = format(transacao.data, 'yyyy-MM-dd');
    if (!acc[dataStr]) {
      acc[dataStr] = [];
    }
    acc[dataStr].push(transacao);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Filtrar transações para a lista
  const transacoesFiltradas = TRANSACOES.filter((transacao) => {
    // Filtro por termo de busca
    if (termoBusca && !transacao.descricao.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
    if (filtroStatus !== 'todos' && transacao.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por tipo
    if (filtroTipo !== 'todos' && transacao.tipo !== filtroTipo) {
      return false;
    }
    
    return true;
  });
  
  // Calcular saldos
  const totalEntradas = transacoesFiltradas
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const totalSaidas = transacoesFiltradas
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const saldoLiquido = totalEntradas + totalSaidas;
  
  // Renderizar conteúdo no calendário
  const renderDayContent = (day: Date) => {
    const dataStr = format(day, 'yyyy-MM-dd');
    const transacoesNoDia = transacoesPorDia[dataStr] || [];
    
    if (transacoesNoDia.length > 0) {
      return <TransacaoDia transacoes={transacoesNoDia} />;
    }
    
    return null;
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todas as entradas e saídas financeiras
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
              Nova Transação
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Calendário de Fluxo de Caixa</CardTitle>
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
                    ? `Detalhes do dia ${format(dataSelecionada, 'dd/MM/yyyy')}` 
                    : 'Selecione uma data'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transacoesDoDia.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-500">Entradas</p>
                            <p className="text-xl font-bold">
                              {formatarMoeda(
                                transacoesDoDia
                                  .filter((t) => t.tipo === 'entrada')
                                  .reduce((acc, t) => acc + t.valor, 0)
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-red-500">Saídas</p>
                            <p className="text-xl font-bold">
                              {formatarMoeda(
                                transacoesDoDia
                                  .filter((t) => t.tipo === 'saida')
                                  .reduce((acc, t) => acc + t.valor, 0)
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Transações</h3>
                      <ul className="space-y-2">
                        {transacoesDoDia.map((transacao) => (
                          <li key={transacao.id} className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <span className="font-medium">{transacao.descricao}</span>
                              <span className={transacao.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'}>
                                {formatarMoeda(transacao.valor)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                              <span>{transacao.categoria}</span>
                              <span className="capitalize">{transacao.status}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    {dataSelecionada 
                      ? 'Nenhuma transação registrada para esta data' 
                      : 'Selecione uma data para ver as transações'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Entradas</h3>
                <p className="text-2xl font-bold text-green-500">{formatarMoeda(totalEntradas)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Total de {transacoesFiltradas.filter(t => t.tipo === 'entrada').length} transações
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Saídas</h3>
                <p className="text-2xl font-bold text-red-500">{formatarMoeda(totalSaidas)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Total de {transacoesFiltradas.filter(t => t.tipo === 'saida').length} transações
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Saldo Líquido</h3>
                <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatarMoeda(saldoLiquido)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Diferença entre entradas e saídas
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Lista de Transações</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar transação..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
              
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Mais Filtros
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Nenhuma transação encontrada com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    transacoesFiltradas.map((transacao) => (
                      <TableRow key={transacao.id}>
                        <TableCell>{format(transacao.data, 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{transacao.descricao}</TableCell>
                        <TableCell>{transacao.categoria}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transacao.status === 'confirmado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transacao.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right ${
                          transacao.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatarMoeda(transacao.valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold">
                      Total ({transacoesFiltradas.length} transações)
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatarMoeda(saldoLiquido)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}