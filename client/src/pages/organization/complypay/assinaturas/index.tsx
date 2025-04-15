import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  MoreHorizontal,
  Download,
  Search,
  Clock,
  CheckCircle,
  X,
  Plus,
  FileText,
  CalendarDays,
  RefreshCw,
  PauseCircle,
  Ban,
  ArrowUpRight,
  CreditCard,
  Users,
  ReceiptText,
  Calendar,
  History,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatusAssinatura = 'ativa' | 'pendente' | 'pausada' | 'cancelada' | 'trial';
type RecorrenciaAssinatura = 'mensal' | 'trimestral' | 'semestral' | 'anual';
type MetodoPagamento = 'cartao_credito' | 'boleto' | 'pix' | 'transferencia';

interface Assinatura {
  id: string;
  nome: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    tipo: 'pf' | 'pj';
  };
  status: StatusAssinatura;
  valorMensal: number;
  valorTotal: number;
  dataInicio: string;
  dataProximoFaturamento: string;
  dataCancelamento?: string;
  recorrencia: RecorrenciaAssinatura;
  metodoPagamento: MetodoPagamento;
  ultimasFaturas?: Array<{
    id: string;
    numero: string;
    data: string;
    valor: number;
    status: 'paga' | 'pendente' | 'vencida' | 'cancelada';
  }>;
}

const calcularProximaCobranca = (
  dataInicio: string,
  recorrencia: RecorrenciaAssinatura
): string => {
  const date = new Date(dataInicio);
  const today = new Date();

  let nextDate: Date;

  switch (recorrencia) {
    case 'mensal':
      // Encontra a próxima data mensal a partir da data de início
      nextDate = new Date(today);
      nextDate.setDate(date.getDate());
      // Se a data já passou este mês, avança para o próximo
      if (nextDate < today) {
        nextDate = addMonths(nextDate, 1);
      }
      break;
    case 'trimestral':
      // Encontra a próxima data trimestral
      nextDate = new Date(date);
      while (nextDate <= today) {
        nextDate = addMonths(nextDate, 3);
      }
      break;
    case 'semestral':
      // Encontra a próxima data semestral
      nextDate = new Date(date);
      while (nextDate <= today) {
        nextDate = addMonths(nextDate, 6);
      }
      break;
    case 'anual':
      // Encontra a próxima data anual
      nextDate = new Date(date);
      while (nextDate <= today) {
        nextDate = addYears(nextDate, 1);
      }
      break;
    default:
      nextDate = addMonths(new Date(today), 1);
  }

  return nextDate.toISOString().split('T')[0];
};

const mockAssinaturas: Assinatura[] = [
  {
    id: 'assinatura-001',
    nome: 'Plano Premium Anual',
    cliente: {
      id: 'cliente-001',
      nome: 'Empresa ABC Ltda',
      email: 'financeiro@empresaabc.com.br',
      tipo: 'pj'
    },
    status: 'ativa',
    valorMensal: 299.90,
    valorTotal: 3598.80, // Valor anual com desconto
    dataInicio: '2024-10-15',
    dataProximoFaturamento: '2025-10-15',
    recorrencia: 'anual',
    metodoPagamento: 'cartao_credito',
    ultimasFaturas: [
      {
        id: 'fatura-001',
        numero: 'INV-2024-0123',
        data: '2024-10-15',
        valor: 3598.80,
        status: 'paga'
      }
    ]
  },
  {
    id: 'assinatura-002',
    nome: 'Plano Básico Mensal',
    cliente: {
      id: 'cliente-002',
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      tipo: 'pf'
    },
    status: 'ativa',
    valorMensal: 49.90,
    valorTotal: 49.90,
    dataInicio: '2025-03-05',
    dataProximoFaturamento: '2025-05-05',
    recorrencia: 'mensal',
    metodoPagamento: 'cartao_credito',
    ultimasFaturas: [
      {
        id: 'fatura-002',
        numero: 'INV-2025-0056',
        data: '2025-04-05',
        valor: 49.90,
        status: 'paga'
      },
      {
        id: 'fatura-003',
        numero: 'INV-2025-0022',
        data: '2025-03-05',
        valor: 49.90,
        status: 'paga'
      }
    ]
  },
  {
    id: 'assinatura-003',
    nome: 'Plano Business Trimestral',
    cliente: {
      id: 'cliente-003',
      nome: 'Tech Solutions Informática',
      email: 'admin@techsolutions.com.br',
      tipo: 'pj'
    },
    status: 'pendente',
    valorMensal: 199.90,
    valorTotal: 599.70,
    dataInicio: '2025-04-10',
    dataProximoFaturamento: '2025-07-10',
    recorrencia: 'trimestral',
    metodoPagamento: 'boleto',
    ultimasFaturas: [
      {
        id: 'fatura-004',
        numero: 'INV-2025-0064',
        data: '2025-04-10',
        valor: 599.70,
        status: 'pendente'
      }
    ]
  },
  {
    id: 'assinatura-004',
    nome: 'Plano Enterprise Semestral',
    cliente: {
      id: 'cliente-004',
      nome: 'XYZ Comércio S.A.',
      email: 'contato@xyzcomercio.com.br',
      tipo: 'pj'
    },
    status: 'pausada',
    valorMensal: 499.90,
    valorTotal: 2999.40,
    dataInicio: '2024-12-01',
    dataProximoFaturamento: '2025-06-01',
    recorrencia: 'semestral',
    metodoPagamento: 'transferencia'
  },
  {
    id: 'assinatura-005',
    nome: 'Plano Standard Mensal',
    cliente: {
      id: 'cliente-005',
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@email.com',
      tipo: 'pf'
    },
    status: 'cancelada',
    valorMensal: 89.90,
    valorTotal: 89.90,
    dataInicio: '2025-01-15',
    dataProximoFaturamento: '2025-03-15',
    dataCancelamento: '2025-02-28',
    recorrencia: 'mensal',
    metodoPagamento: 'pix',
    ultimasFaturas: [
      {
        id: 'fatura-005',
        numero: 'INV-2025-0028',
        data: '2025-02-15',
        valor: 89.90,
        status: 'paga'
      },
      {
        id: 'fatura-006',
        numero: 'INV-2025-0012',
        data: '2025-01-15',
        valor: 89.90,
        status: 'paga'
      }
    ]
  },
  {
    id: 'assinatura-006',
    nome: 'Plano Premium + API Mensal',
    cliente: {
      id: 'cliente-006',
      nome: 'Global Trading Ltda',
      email: 'faturamento@globaltrading.com',
      tipo: 'pj'
    },
    status: 'ativa',
    valorMensal: 349.90,
    valorTotal: 349.90,
    dataInicio: '2025-03-20',
    dataProximoFaturamento: '2025-05-20',
    recorrencia: 'mensal',
    metodoPagamento: 'cartao_credito',
    ultimasFaturas: [
      {
        id: 'fatura-007',
        numero: 'INV-2025-0059',
        data: '2025-04-20',
        valor: 349.90,
        status: 'paga'
      },
      {
        id: 'fatura-008',
        numero: 'INV-2025-0043',
        data: '2025-03-20',
        valor: 349.90,
        status: 'paga'
      }
    ]
  },
  {
    id: 'assinatura-007',
    nome: 'Plano Teste 14 dias',
    cliente: {
      id: 'cliente-007',
      nome: 'Startup Inovadora LTDA',
      email: 'contato@startupinovadora.com.br',
      tipo: 'pj'
    },
    status: 'trial',
    valorMensal: 149.90,
    valorTotal: 0,
    dataInicio: '2025-04-05',
    dataProximoFaturamento: '2025-04-19',
    recorrencia: 'mensal',
    metodoPagamento: 'cartao_credito'
  },
  {
    id: 'assinatura-008',
    nome: 'Plano Premium Anual',
    cliente: {
      id: 'cliente-008',
      nome: 'Carlos Eduardo LTDA',
      email: 'contato@carloseduardo.com.br',
      tipo: 'pj'
    },
    status: 'pendente',
    valorMensal: 299.90,
    valorTotal: 3598.80,
    dataInicio: '2025-04-01',
    dataProximoFaturamento: '2026-04-01',
    recorrencia: 'anual',
    metodoPagamento: 'boleto',
    ultimasFaturas: [
      {
        id: 'fatura-009',
        numero: 'INV-2025-0060',
        data: '2025-04-01',
        valor: 3598.80,
        status: 'pendente'
      }
    ]
  }
];

const getStatusColor = (status: StatusAssinatura) => {
  switch (status) {
    case 'ativa':
      return 'bg-green-100 text-green-800';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800';
    case 'pausada':
      return 'bg-blue-100 text-blue-800';
    case 'cancelada':
      return 'bg-gray-100 text-gray-800';
    case 'trial':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: StatusAssinatura) => {
  switch (status) {
    case 'ativa':
      return 'Ativa';
    case 'pendente':
      return 'Pendente';
    case 'pausada':
      return 'Pausada';
    case 'cancelada':
      return 'Cancelada';
    case 'trial':
      return 'Período de Teste';
    default:
      return status;
  }
};

const getStatusIcon = (status: StatusAssinatura) => {
  switch (status) {
    case 'ativa':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pendente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'pausada':
      return <PauseCircle className="h-4 w-4 text-blue-600" />;
    case 'cancelada':
      return <X className="h-4 w-4 text-gray-600" />;
    case 'trial':
      return <CalendarDays className="h-4 w-4 text-purple-600" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getRecorrenciaText = (recorrencia: RecorrenciaAssinatura) => {
  switch (recorrencia) {
    case 'mensal':
      return 'Mensal';
    case 'trimestral':
      return 'Trimestral';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    default:
      return recorrencia;
  }
};

const getMetodoPagamentoText = (metodo: MetodoPagamento) => {
  switch (metodo) {
    case 'cartao_credito':
      return 'Cartão de Crédito';
    case 'boleto':
      return 'Boleto';
    case 'pix':
      return 'PIX';
    case 'transferencia':
      return 'Transferência';
    default:
      return metodo;
  }
};

export default function ComplyPayAssinaturas() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recorrenciaFilter, setRecorrenciaFilter] = useState<string>('all');
  
  // Filtragem das assinaturas
  const filteredAssinaturas = mockAssinaturas.filter(assinatura => {
    const matchesSearch = 
      assinatura.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      assinatura.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assinatura.cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assinatura.status === statusFilter;
    const matchesRecorrencia = recorrenciaFilter === 'all' || assinatura.recorrencia === recorrenciaFilter;

    return matchesSearch && matchesStatus && matchesRecorrencia;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const resumoAssinaturas = {
    total: filteredAssinaturas.length,
    ativas: filteredAssinaturas.filter(a => a.status === 'ativa').length,
    pendentes: filteredAssinaturas.filter(a => a.status === 'pendente').length,
    pausadas: filteredAssinaturas.filter(a => a.status === 'pausada').length,
    canceladas: filteredAssinaturas.filter(a => a.status === 'cancelada').length,
    trial: filteredAssinaturas.filter(a => a.status === 'trial').length,
    receitaMensal: filteredAssinaturas
      .filter(a => ['ativa', 'pendente', 'trial'].includes(a.status))
      .reduce((sum, assinatura) => sum + assinatura.valorMensal, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie assinaturas recorrentes de seus clientes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Receita Mensal Recorrente</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(resumoAssinaturas.receitaMensal)}</span>
              <div className="flex items-center mt-2">
                <RefreshCw className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-muted-foreground">
                  Baseado em {resumoAssinaturas.ativas + resumoAssinaturas.pendentes} assinaturas ativas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Total de Assinaturas</span>
              <span className="text-2xl font-bold">{resumoAssinaturas.total}</span>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge className="bg-green-100 text-green-800">
                  {resumoAssinaturas.ativas} ativas
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {resumoAssinaturas.pendentes} pendentes
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {resumoAssinaturas.trial} trial
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Próximos Faturamentos</span>
              <span className="text-2xl font-bold">7</span>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-muted-foreground">
                  Nos próximos 7 dias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Taxa de Retenção</span>
              <span className="text-2xl font-bold">95%</span>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +2.5% em relação ao mês anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Assinaturas</CardTitle>
          <CardDescription>Use os filtros abaixo para encontrar assinaturas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="trial">Período de Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recorrência</label>
              <Select value={recorrenciaFilter} onValueChange={setRecorrenciaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma recorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="flex">
                <Input 
                  placeholder="Buscar por nome, cliente..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button variant="outline" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assinaturas</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de assinaturas ({filteredAssinaturas.length})</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Plano</TableHead>
                <TableHead className="min-w-[180px]">Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Próximo Faturamento</TableHead>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssinaturas.map((assinatura) => (
                <TableRow key={assinatura.id} className="cursor-pointer" onClick={() => {}}>
                  <TableCell className="font-medium">{assinatura.nome}</TableCell>
                  <TableCell>
                    <div>{assinatura.cliente.nome}</div>
                    <div className="text-xs text-muted-foreground">{assinatura.cliente.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{formatCurrency(assinatura.valorMensal)}/mês</div>
                    {assinatura.recorrencia !== 'mensal' && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(assinatura.valorTotal)}/{assinatura.recorrencia === 'anual' ? 'ano' : 
                                                             assinatura.recorrencia === 'trimestral' ? 'trimestre' : 
                                                             'semestre'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getRecorrenciaText(assinatura.recorrencia)}</TableCell>
                  <TableCell>
                    {assinatura.status === 'cancelada' ? (
                      <span className="text-gray-500">-</span>
                    ) : (
                      formatDate(assinatura.dataProximoFaturamento)
                    )}
                  </TableCell>
                  <TableCell>{getMetodoPagamentoText(assinatura.metodoPagamento)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assinatura.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(assinatura.status)}
                        {getStatusText(assinatura.status)}
                      </span>
                    </Badge>
                    {assinatura.dataCancelamento && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Cancelada em {formatDate(assinatura.dataCancelamento)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        
                        {assinatura.status === 'ativa' && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Histórico de faturas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Pausar assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ban className="h-4 w-4 mr-2" />
                              Cancelar assinatura
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {assinatura.status === 'pausada' && (
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reativar assinatura
                          </DropdownMenuItem>
                        )}
                        
                        {assinatura.status === 'pendente' && (
                          <>
                            <DropdownMenuItem>
                              <ReceiptText className="h-4 w-4 mr-2" />
                              Ver fatura pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Atualizar método de pagamento
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {assinatura.status === 'trial' && (
                          <DropdownMenuItem>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Configurar pagamento
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssinaturas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      <p>Nenhuma assinatura encontrada com os filtros aplicados.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setRecorrenciaFilter('all');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}