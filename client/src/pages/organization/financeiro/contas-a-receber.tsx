'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, FileEdit, Plus, Search, Trash2, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados de exemplo
const CONTAS_RECEBER = [
  { 
    id: 1, 
    descricao: 'Venda de produtos - Cliente ABC', 
    categoria: 'Vendas',
    valor: 7500.00, 
    dataEmissao: new Date(2025, 3, 8),
    dataVencimento: new Date(2025, 3, 20),
    status: 'pendente',
  },
  { 
    id: 2, 
    descricao: 'Consultoria - Cliente XYZ', 
    categoria: 'Serviços',
    valor: 3200.00, 
    dataEmissao: new Date(2025, 3, 5),
    dataVencimento: new Date(2025, 3, 15),
    status: 'recebido',
  },
  { 
    id: 3, 
    descricao: 'Assinatura mensal - Cliente DEF', 
    categoria: 'Assinaturas',
    valor: 1200.00, 
    dataEmissao: new Date(2025, 3, 1),
    dataVencimento: new Date(2025, 3, 10),
    status: 'recebido',
  },
  { 
    id: 4, 
    descricao: 'Venda de produtos - Cliente GHI', 
    categoria: 'Vendas',
    valor: 5400.00, 
    dataEmissao: new Date(2025, 3, 7),
    dataVencimento: new Date(2025, 3, 12),
    status: 'vencido',
  },
  { 
    id: 5, 
    descricao: 'Consultoria - Cliente JKL', 
    categoria: 'Serviços',
    valor: 4500.00, 
    dataEmissao: new Date(2025, 3, 9),
    dataVencimento: new Date(2025, 3, 25),
    status: 'pendente',
  },
  { 
    id: 6, 
    descricao: 'Assinatura anual - Cliente MNO', 
    categoria: 'Assinaturas',
    valor: 12000.00, 
    dataEmissao: new Date(2025, 3, 15),
    dataVencimento: new Date(2025, 4, 10),
    status: 'pendente',
  },
];

export default function ContasAReceber() {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('pendentes');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<{
    de: Date | undefined;
    ate: Date | undefined;
  }>({
    de: undefined,
    ate: undefined,
  });
  const [termoBusca, setTermoBusca] = useState('');

  // Formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  // Formatar datas
  const formatarData = (data: Date) => {
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Aplicar filtros às contas
  const contasFiltradas = CONTAS_RECEBER.filter((conta) => {
    // Filtro de status
    if (filtroStatus !== 'todos' && conta.status !== filtroStatus) {
      return false;
    }

    // Filtro de período para contas pendentes
    if (filtroPeriodo === 'pendentes' && conta.status !== 'pendente') {
      return false;
    }

    // Filtro de período para contas vencidas
    if (filtroPeriodo === 'vencidas' && conta.status !== 'vencido') {
      return false;
    }

    // Filtro de período personalizado
    if (periodoSelecionado.de && periodoSelecionado.ate) {
      if (conta.dataVencimento < periodoSelecionado.de || conta.dataVencimento > periodoSelecionado.ate) {
        return false;
      }
    }

    // Filtro de busca
    if (termoBusca && !conta.descricao.toLowerCase().includes(termoBusca.toLowerCase()) &&
        !conta.categoria.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Cálculo de totais
  const totalPendente = contasFiltradas
    .filter(conta => conta.status === 'pendente')
    .reduce((sum, conta) => sum + conta.valor, 0);

  const totalVencido = contasFiltradas
    .filter(conta => conta.status === 'vencido')
    .reduce((sum, conta) => sum + conta.valor, 0);

  const totalRecebido = contasFiltradas
    .filter(conta => conta.status === 'recebido')
    .reduce((sum, conta) => sum + conta.valor, 0);

  const totalGeral = contasFiltradas.reduce((sum, conta) => sum + conta.valor, 0);

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
            <p className="text-muted-foreground">
              Gerenciamento de contas e receitas a receber
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Pendente</span>
                <span className="text-2xl font-bold text-yellow-600">{formatarMoeda(totalPendente)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Vencido</span>
                <span className="text-2xl font-bold text-red-600">{formatarMoeda(totalVencido)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Recebido</span>
                <span className="text-2xl font-bold text-green-600">{formatarMoeda(totalRecebido)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Geral</span>
                <span className="text-2xl font-bold">{formatarMoeda(totalGeral)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="recebido">Recebidos</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendentes">Pendentes</SelectItem>
                  <SelectItem value="vencidas">Vencidas</SelectItem>
                  <SelectItem value="personalizado">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtroPeriodo === 'personalizado' && (
              <div className="flex-1 min-w-[200px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodoSelecionado.de && periodoSelecionado.ate
                        ? `${format(periodoSelecionado.de, 'dd/MM/yyyy')} - ${format(periodoSelecionado.ate, 'dd/MM/yyyy')}`
                        : "Selecione o período"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={new Date()}
                      selected={{
                        from: periodoSelecionado.de,
                        to: periodoSelecionado.ate,
                      }}
                      onSelect={(range) => 
                        setPeriodoSelecionado({
                          de: range?.from,
                          ate: range?.to,
                        })
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="flex md:w-1/3 lg:w-1/4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar contas..."
                className="pl-8 w-full"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Nenhuma conta encontrada com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    contasFiltradas.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell>{conta.categoria}</TableCell>
                        <TableCell>{formatarMoeda(conta.valor)}</TableCell>
                        <TableCell>{formatarData(conta.dataEmissao)}</TableCell>
                        <TableCell>{formatarData(conta.dataVencimento)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(conta.status)}>
                            {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <FileEdit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {conta.status === 'pendente' && (
                                <DropdownMenuItem className="cursor-pointer text-green-600">
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Marcar como Recebido
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}