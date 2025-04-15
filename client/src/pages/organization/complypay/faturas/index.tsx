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
  Send,
  CalendarDays,
  ExternalLink,
  FileDown,
  Mail,
  PieChart,
  FileWarning,
  Banknote,
  Copy
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
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FaturaStatus = 'paga' | 'pendente' | 'vencida' | 'cancelada' | 'rascunho';
type MetodoPagamento = 'boleto' | 'pix' | 'cartao_credito' | 'transferencia' | 'nao_definido';

interface Fatura {
  id: string;
  numero: string;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  cliente: string;
  clienteEmail: string;
  descricao: string;
  valorTotal: number;
  status: FaturaStatus;
  metodoPagamento: MetodoPagamento;
}

const mockFaturas: Fatura[] = [
  {
    id: 'fatura-001',
    numero: 'INV-2025-0001',
    dataEmissao: '2025-04-01',
    dataVencimento: '2025-04-15',
    dataPagamento: '2025-04-10',
    cliente: 'Empresa ABC Ltda',
    clienteEmail: 'financeiro@empresaabc.com.br',
    descricao: 'Serviços de consultoria - Abril/2025',
    valorTotal: 2500.00,
    status: 'paga',
    metodoPagamento: 'pix'
  },
  {
    id: 'fatura-002',
    numero: 'INV-2025-0002',
    dataEmissao: '2025-04-02',
    dataVencimento: '2025-04-16',
    cliente: 'XYZ Comércio S.A.',
    clienteEmail: 'contato@xyzcomercio.com.br',
    descricao: 'Licença de software - Plano Anual',
    valorTotal: 5800.00,
    status: 'pendente',
    metodoPagamento: 'boleto'
  },
  {
    id: 'fatura-003',
    numero: 'INV-2025-0003',
    dataEmissao: '2025-03-15',
    dataVencimento: '2025-03-30',
    cliente: 'Distribuidora Norte EIRELI',
    clienteEmail: 'financeiro@distnorte.com.br',
    descricao: 'Implementação de sistema - Fase 1',
    valorTotal: 7500.00,
    status: 'vencida',
    metodoPagamento: 'nao_definido'
  },
  {
    id: 'fatura-004',
    numero: 'INV-2025-0004',
    dataEmissao: '2025-04-03',
    dataVencimento: '2025-04-17',
    cliente: 'João Silva (Pessoa Física)',
    clienteEmail: 'joao.silva@email.com',
    descricao: 'Serviço de consultoria individual',
    valorTotal: 750.00,
    status: 'pendente',
    metodoPagamento: 'cartao_credito'
  },
  {
    id: 'fatura-005',
    numero: 'INV-2025-0005',
    dataEmissao: '2025-04-05',
    dataVencimento: '2025-04-19',
    dataPagamento: '2025-04-05',
    cliente: 'Supermercados Rede Ltda',
    clienteEmail: 'compras@redemercados.com.br',
    descricao: 'Serviços de integração - Abril/2025',
    valorTotal: 3850.00,
    status: 'paga',
    metodoPagamento: 'transferencia'
  },
  {
    id: 'fatura-006',
    numero: 'INV-2025-0006',
    dataEmissao: '2025-04-06',
    dataVencimento: '2025-04-20',
    cliente: 'Tech Solutions Informática',
    clienteEmail: 'admin@techsolutions.com.br',
    descricao: 'Hospedagem e serviços cloud - Trimestral',
    valorTotal: 1290.00,
    status: 'pendente',
    metodoPagamento: 'nao_definido'
  },
  {
    id: 'fatura-007',
    numero: 'INV-2025-0007',
    dataEmissao: '2025-04-08',
    dataVencimento: '2025-04-08',
    cliente: 'Global Trading Ltda',
    clienteEmail: 'faturamento@globaltrading.com',
    descricao: 'Serviços de análise de dados',
    valorTotal: 4200.00,
    status: 'cancelada',
    metodoPagamento: 'boleto'
  },
  {
    id: 'fatura-008',
    numero: 'INV-2025-0008',
    dataEmissao: '2025-04-09',
    dataVencimento: '2025-04-23',
    cliente: 'Maria Consultoria MEI',
    clienteEmail: 'maria@mariaconsultoria.com.br',
    descricao: 'Assinatura mensal - Plano Básico',
    valorTotal: 99.90,
    status: 'rascunho',
    metodoPagamento: 'nao_definido'
  },
  {
    id: 'fatura-009',
    numero: 'INV-2025-0009',
    dataEmissao: '2025-04-10',
    dataVencimento: '2025-04-24',
    cliente: 'Empresa XYZ Ltda',
    clienteEmail: 'financeiro@empresaxyz.com',
    descricao: 'Serviços de consultoria - Abril/2025',
    valorTotal: 1780.00,
    status: 'pendente',
    metodoPagamento: 'pix'
  },
  {
    id: 'fatura-010',
    numero: 'INV-2025-0010',
    dataEmissao: '2025-04-11',
    dataVencimento: '2025-04-25',
    dataPagamento: '2025-04-11',
    cliente: 'Construtora Horizonte S.A.',
    clienteEmail: 'contato@horizontesa.com.br',
    descricao: 'Licença de software - Módulo Gerencial',
    valorTotal: 3500.00,
    status: 'paga',
    metodoPagamento: 'cartao_credito'
  }
];

const getStatusColor = (status: FaturaStatus) => {
  switch (status) {
    case 'paga':
      return 'bg-green-100 text-green-800';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'cancelada':
      return 'bg-gray-100 text-gray-800';
    case 'rascunho':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: FaturaStatus) => {
  switch (status) {
    case 'paga':
      return 'Paga';
    case 'pendente':
      return 'Pendente';
    case 'vencida':
      return 'Vencida';
    case 'cancelada':
      return 'Cancelada';
    case 'rascunho':
      return 'Rascunho';
    default:
      return status;
  }
};

const getStatusIcon = (status: FaturaStatus) => {
  switch (status) {
    case 'paga':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pendente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'vencida':
      return <FileWarning className="h-4 w-4 text-red-600" />;
    case 'cancelada':
      return <X className="h-4 w-4 text-gray-600" />;
    case 'rascunho':
      return <FileText className="h-4 w-4 text-blue-600" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getPaymentMethodText = (method: MetodoPagamento) => {
  switch (method) {
    case 'boleto':
      return 'Boleto';
    case 'pix':
      return 'PIX';
    case 'cartao_credito':
      return 'Cartão de Crédito';
    case 'transferencia':
      return 'Transferência';
    case 'nao_definido':
      return 'Não definido';
    default:
      return method;
  }
};

export default function ComplyPayFaturas() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  // Filtragem das faturas
  const filteredFaturas = mockFaturas.filter(fatura => {
    const matchesSearch = 
      fatura.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fatura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatura.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || fatura.status === statusFilter;
    
    const emissaoDate = new Date(fatura.dataEmissao);
    const matchesDate = !dateRange?.from || !dateRange?.to || 
                        (emissaoDate >= dateRange.from && 
                         emissaoDate <= dateRange.to);

    return matchesSearch && matchesStatus && matchesDate;
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

  const resumoFaturas = {
    total: filteredFaturas.reduce((sum, fatura) => sum + fatura.valorTotal, 0),
    pagas: filteredFaturas.filter(f => f.status === 'paga').reduce((sum, fatura) => sum + fatura.valorTotal, 0),
    pendentes: filteredFaturas.filter(f => f.status === 'pendente').reduce((sum, fatura) => sum + fatura.valorTotal, 0),
    vencidas: filteredFaturas.filter(f => f.status === 'vencida').reduce((sum, fatura) => sum + fatura.valorTotal, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground">Gerenciamento de faturas para clientes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Fatura
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Total em Faturas</span>
              <span className="text-2xl font-bold">{formatCurrency(resumoFaturas.total)}</span>
              <div className="flex items-center mt-2">
                <PieChart className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {filteredFaturas.length} faturas no período
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Recebido</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(resumoFaturas.pagas)}</span>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {filteredFaturas.filter(f => f.status === 'paga').length} faturas pagas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Pendente</span>
              <span className="text-2xl font-bold text-yellow-600">{formatCurrency(resumoFaturas.pendentes)}</span>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {filteredFaturas.filter(f => f.status === 'pendente').length} faturas pendentes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Vencido</span>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(resumoFaturas.vencidas)}</span>
              <div className="flex items-center mt-2">
                <FileWarning className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {filteredFaturas.filter(f => f.status === 'vencida').length} faturas vencidas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Faturas</CardTitle>
          <CardDescription>Use os filtros abaixo para encontrar faturas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="flex">
                <Input 
                  placeholder="Buscar por número, cliente..." 
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
          <CardTitle>Faturas</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de faturas ({filteredFaturas.length})</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Número</TableHead>
                <TableHead className="min-w-[150px]">Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaturas.map((fatura) => (
                <TableRow key={fatura.id} className="cursor-pointer" onClick={() => {}}>
                  <TableCell className="font-medium">{fatura.numero}</TableCell>
                  <TableCell>
                    <div>{fatura.cliente}</div>
                    <div className="text-xs text-muted-foreground">{fatura.clienteEmail}</div>
                  </TableCell>
                  <TableCell>{fatura.descricao}</TableCell>
                  <TableCell>{formatDate(fatura.dataEmissao)}</TableCell>
                  <TableCell>{formatDate(fatura.dataVencimento)}</TableCell>
                  <TableCell>{getPaymentMethodText(fatura.metodoPagamento)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(fatura.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(fatura.status)}
                        {getStatusText(fatura.status)}
                      </span>
                    </Badge>
                    {fatura.dataPagamento && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Pago em {formatDate(fatura.dataPagamento)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(fatura.valorTotal)}
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
                        <DropdownMenuItem>
                          <FileDown className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        {fatura.status === 'pendente' && (
                          <>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar lembrete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Banknote className="h-4 w-4 mr-2" />
                              Registrar pagamento
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {fatura.status === 'vencida' && (
                          <DropdownMenuItem>
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Renegociar
                          </DropdownMenuItem>
                        )}
                        
                        {fatura.status === 'rascunho' && (
                          <>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Finalizar e enviar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFaturas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      <p>Nenhuma fatura encontrada com os filtros aplicados.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setDateRange({
                            from: new Date(new Date().setDate(new Date().getDate() - 30)),
                            to: new Date()
                          });
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