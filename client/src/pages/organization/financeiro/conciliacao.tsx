'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  CheckCircle2, 
  Download, 
  FileText, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  Upload, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';

// Dados mockados para conciliação bancária
const CONTAS_BANCARIAS = [
  { id: 1, nome: 'Banco Principal - Conta Corrente', tipo: 'corrente', saldo: 75680.45 },
  { id: 2, nome: 'Banco Secundário - Conta Corrente', tipo: 'corrente', saldo: 23450.12 },
  { id: 3, nome: 'Banco Principal - Conta Poupança', tipo: 'poupanca', saldo: 132540.78 }
];

const TRANSACOES_EXTRATO = [
  {
    id: 1,
    data: new Date('2025-04-02'),
    descricao: 'Transferência recebida',
    contaBancariaId: 1,
    valor: 12500,
    tipo: 'credito',
    conciliado: true
  },
  {
    id: 2,
    data: new Date('2025-04-03'),
    descricao: 'Pagamento de fornecedor',
    contaBancariaId: 1,
    valor: 7850,
    tipo: 'debito',
    conciliado: true
  },
  {
    id: 3,
    data: new Date('2025-04-05'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 9300,
    tipo: 'credito',
    conciliado: true
  },
  {
    id: 4,
    data: new Date('2025-04-08'),
    descricao: 'Pagamento de imposto',
    contaBancariaId: 1,
    valor: 3450,
    tipo: 'debito',
    conciliado: false
  },
  {
    id: 5,
    data: new Date('2025-04-10'),
    descricao: 'Transferência para outra conta',
    contaBancariaId: 1,
    valor: 5000,
    tipo: 'debito',
    conciliado: false
  },
  {
    id: 6,
    data: new Date('2025-04-12'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 6750,
    tipo: 'credito',
    conciliado: false
  },
  {
    id: 7,
    data: new Date('2025-04-15'),
    descricao: 'Pagamento de serviço',
    contaBancariaId: 1,
    valor: 1200,
    tipo: 'debito',
    conciliado: false
  },
  {
    id: 8,
    data: new Date('2025-04-17'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 4500,
    tipo: 'credito',
    conciliado: false
  },
];

const TRANSACOES_SISTEMA = [
  {
    id: 101,
    data: new Date('2025-04-02'),
    descricao: 'Transferência recebida',
    contaBancariaId: 1,
    valor: 12500,
    tipo: 'credito',
    conciliado: true
  },
  {
    id: 102,
    data: new Date('2025-04-03'),
    descricao: 'Pagamento de fornecedor',
    contaBancariaId: 1,
    valor: 7850,
    tipo: 'debito',
    conciliado: true
  },
  {
    id: 103,
    data: new Date('2025-04-05'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 9300,
    tipo: 'credito',
    conciliado: true
  },
  {
    id: 104,
    data: new Date('2025-04-08'),
    descricao: 'Pagamento de imposto',
    contaBancariaId: 1,
    valor: 3450,
    tipo: 'debito',
    conciliado: false
  },
  {
    id: 105,
    data: new Date('2025-04-11'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 8200,
    tipo: 'credito',
    conciliado: false
  },
  {
    id: 106,
    data: new Date('2025-04-14'),
    descricao: 'Pagamento de fornecedor',
    contaBancariaId: 1,
    valor: 5800,
    tipo: 'debito',
    conciliado: false
  },
  {
    id: 107,
    data: new Date('2025-04-17'),
    descricao: 'Recebimento de cliente',
    contaBancariaId: 1,
    valor: 4500,
    tipo: 'credito',
    conciliado: false
  },
];

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function ConciliacaoBancaria() {
  const [contaBancariaSelecionada, setContaBancariaSelecionada] = useState(CONTAS_BANCARIAS[0].id.toString());
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes-atual');
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [transacoesSelecionadas, setTransacoesSelecionadas] = useState<number[]>([]);
  
  // Filtrar transações do extrato
  const transacoesExtratoFiltradas = TRANSACOES_EXTRATO.filter((transacao) => {
    // Filtro por conta bancária
    if (transacao.contaBancariaId !== parseInt(contaBancariaSelecionada)) {
      return false;
    }
    
    // Filtro por termo de busca
    if (termoBusca && !transacao.descricao.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    // Filtro por status de conciliação
    if (filtroStatus === 'conciliadas' && !transacao.conciliado) {
      return false;
    } else if (filtroStatus === 'nao-conciliadas' && transacao.conciliado) {
      return false;
    }
    
    return true;
  });
  
  // Filtrar transações do sistema
  const transacoesSistemaFiltradas = TRANSACOES_SISTEMA.filter((transacao) => {
    // Filtro por conta bancária
    if (transacao.contaBancariaId !== parseInt(contaBancariaSelecionada)) {
      return false;
    }
    
    // Filtro por termo de busca
    if (termoBusca && !transacao.descricao.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    // Filtro por status de conciliação
    if (filtroStatus === 'conciliadas' && !transacao.conciliado) {
      return false;
    } else if (filtroStatus === 'nao-conciliadas' && transacao.conciliado) {
      return false;
    }
    
    return true;
  });
  
  // Calcular métricas de conciliação
  const contaSelecionada = CONTAS_BANCARIAS.find(c => c.id === parseInt(contaBancariaSelecionada));
  
  const totalExtrato = TRANSACOES_EXTRATO
    .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada))
    .reduce((acc, t) => t.tipo === 'credito' ? acc + t.valor : acc - t.valor, 0);
  
  const totalSistema = TRANSACOES_SISTEMA
    .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada))
    .reduce((acc, t) => t.tipo === 'credito' ? acc + t.valor : acc - t.valor, 0);
  
  const totalConciliado = TRANSACOES_EXTRATO
    .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada) && t.conciliado)
    .reduce((acc, t) => t.tipo === 'credito' ? acc + t.valor : acc - t.valor, 0);
    
  const percentualConciliado = TRANSACOES_EXTRATO
    .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada)).length > 0
      ? (TRANSACOES_EXTRATO
          .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada) && t.conciliado).length / 
        TRANSACOES_EXTRATO
          .filter(t => t.contaBancariaId === parseInt(contaBancariaSelecionada)).length) * 100
      : 0;
  
  const diferenca = totalExtrato - totalSistema;

  // Lidar com a seleção de transações
  const toggleSelecaoTransacao = (id: number) => {
    setTransacoesSelecionadas(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Conciliar transações selecionadas
  const conciliarTransacoesSelecionadas = () => {
    // Em uma aplicação real, aqui chamaríamos uma API para atualizar os status de conciliação
    alert(`Conciliando ${transacoesSelecionadas.length} transações`);
    setTransacoesSelecionadas([]);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conciliação Bancária</h1>
            <p className="text-muted-foreground">
              Gerencie e concilie suas transações bancárias
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Extrato
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Gerar Relatório
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        <div className="flex space-x-4">
          <Card className="flex-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Configuração</h2>
                  <p className="text-sm text-muted-foreground">Selecione a conta e o período para conciliação</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conta Bancária</label>
                  <Select value={contaBancariaSelecionada} onValueChange={setContaBancariaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTAS_BANCARIAS.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id.toString()}>
                          {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes-atual">Mês Atual</SelectItem>
                      <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                      <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                      <SelectItem value="personalizado">Período Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Saldo da Conta</span>
                      <span className="text-2xl font-bold">{formatarMoeda(contaSelecionada?.saldo || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Progresso da Conciliação</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentualConciliado} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{percentualConciliado.toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={diferenca !== 0 ? "border-red-200 bg-red-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Diferença</span>
                      <span className={`text-2xl font-bold ${diferenca !== 0 ? "text-red-500" : ""}`}>
                        {formatarMoeda(diferenca)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status de conciliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as transações</SelectItem>
                <SelectItem value="conciliadas">Conciliadas</SelectItem>
                <SelectItem value="nao-conciliadas">Não conciliadas</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Mais Filtros
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {transacoesSelecionadas.length > 0 && (
              <Button variant="default" onClick={conciliarTransacoesSelecionadas}>
                Conciliar Selecionadas ({transacoesSelecionadas.length})
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="comparacao" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comparacao">Comparação</TabsTrigger>
            <TabsTrigger value="extrato">Transações do Extrato</TabsTrigger>
            <TabsTrigger value="sistema">Transações do Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparacao">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Transações do Extrato Bancário</CardTitle>
                  <CardDescription>
                    Total: {formatarMoeda(totalExtrato)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[50px]"><Checkbox /></TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transacoesExtratoFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhuma transação encontrada com os filtros selecionados
                          </TableCell>
                        </TableRow>
                      ) : (
                        transacoesExtratoFiltradas.map((transacao) => (
                          <TableRow key={transacao.id} className={transacao.conciliado ? "bg-green-50" : ""}>
                            <TableCell>
                              <Checkbox 
                                checked={transacoesSelecionadas.includes(transacao.id)}
                                onCheckedChange={() => toggleSelecaoTransacao(transacao.id)} 
                              />
                            </TableCell>
                            <TableCell>{format(transacao.data, 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="font-medium">{transacao.descricao}</TableCell>
                            <TableCell className={`text-right ${
                              transacao.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {formatarMoeda(transacao.valor)}
                            </TableCell>
                            <TableCell>
                              {transacao.conciliado ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Conciliado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Transações do Sistema</CardTitle>
                  <CardDescription>
                    Total: {formatarMoeda(totalSistema)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[50px]"><Checkbox /></TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transacoesSistemaFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhuma transação encontrada com os filtros selecionados
                          </TableCell>
                        </TableRow>
                      ) : (
                        transacoesSistemaFiltradas.map((transacao) => (
                          <TableRow key={transacao.id} className={transacao.conciliado ? "bg-green-50" : ""}>
                            <TableCell>
                              <Checkbox 
                                checked={transacoesSelecionadas.includes(transacao.id)}
                                onCheckedChange={() => toggleSelecaoTransacao(transacao.id)}
                              />
                            </TableCell>
                            <TableCell>{format(transacao.data, 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="font-medium">{transacao.descricao}</TableCell>
                            <TableCell className={`text-right ${
                              transacao.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {formatarMoeda(transacao.valor)}
                            </TableCell>
                            <TableCell>
                              {transacao.conciliado ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Conciliado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="extrato">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Transações do Extrato Bancário</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as transações importadas do extrato bancário
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transacoesExtratoFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Nenhuma transação encontrada com os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      transacoesExtratoFiltradas.map((transacao) => (
                        <TableRow key={transacao.id} className={transacao.conciliado ? "bg-green-50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={transacoesSelecionadas.includes(transacao.id)}
                              onCheckedChange={() => toggleSelecaoTransacao(transacao.id)}
                            />
                          </TableCell>
                          <TableCell>{format(transacao.data, 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{transacao.descricao}</TableCell>
                          <TableCell>
                            {CONTAS_BANCARIAS.find(c => c.id === transacao.contaBancariaId)?.nome}
                          </TableCell>
                          <TableCell className={`text-right ${
                            transacao.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formatarMoeda(transacao.valor)}
                          </TableCell>
                          <TableCell>
                            {transacao.conciliado ? (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Conciliado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
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
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatarMoeda(totalExtrato)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sistema">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Transações do Sistema</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as transações registradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transacoesSistemaFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Nenhuma transação encontrada com os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      transacoesSistemaFiltradas.map((transacao) => (
                        <TableRow key={transacao.id} className={transacao.conciliado ? "bg-green-50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={transacoesSelecionadas.includes(transacao.id)}
                              onCheckedChange={() => toggleSelecaoTransacao(transacao.id)}
                            />
                          </TableCell>
                          <TableCell>{format(transacao.data, 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{transacao.descricao}</TableCell>
                          <TableCell>
                            {CONTAS_BANCARIAS.find(c => c.id === transacao.contaBancariaId)?.nome}
                          </TableCell>
                          <TableCell className={`text-right ${
                            transacao.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formatarMoeda(transacao.valor)}
                          </TableCell>
                          <TableCell>
                            {transacao.conciliado ? (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Conciliado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
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
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatarMoeda(totalSistema)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}