import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Filter,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
  FileText,
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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

type TransactionStatus = 'aprovada' | 'pendente' | 'rejeitada' | 'cancelada' | 'estornada';
type TransactionType = 'pagamento' | 'recebimento' | 'estorno' | 'taxa';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  method: string;
  customer?: string;
  reference?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx-12345',
    date: '2025-04-15T10:30:00',
    type: 'recebimento',
    description: 'Pagamento de fatura #INV-789',
    amount: 1250.00,
    status: 'aprovada',
    method: 'Cartão de crédito',
    customer: 'João Silva',
    reference: 'INV-789'
  },
  {
    id: 'tx-12344',
    date: '2025-04-14T16:45:00',
    type: 'recebimento',
    description: 'Pagamento de fatura #INV-788',
    amount: 570.50,
    status: 'aprovada',
    method: 'PIX',
    customer: 'Maria Oliveira',
    reference: 'INV-788'
  },
  {
    id: 'tx-12343',
    date: '2025-04-14T11:20:00',
    type: 'recebimento',
    description: 'Pagamento de assinatura mensal',
    amount: 99.90,
    status: 'aprovada',
    method: 'Cartão de crédito',
    customer: 'Carlos Eduardo',
    reference: 'SUB-456'
  },
  {
    id: 'tx-12342',
    date: '2025-04-14T09:15:00',
    type: 'estorno',
    description: 'Estorno por cobrança duplicada',
    amount: -150.00,
    status: 'estornada',
    method: 'Cartão de crédito',
    customer: 'Ana Paula',
    reference: 'INV-780'
  },
  {
    id: 'tx-12341',
    date: '2025-04-13T15:30:00',
    type: 'taxa',
    description: 'Taxa de processamento',
    amount: -45.60,
    status: 'aprovada',
    method: 'Sistema',
  },
  {
    id: 'tx-12340',
    date: '2025-04-12T13:20:00',
    type: 'recebimento',
    description: 'Pagamento de fatura #INV-779',
    amount: 780.00,
    status: 'pendente',
    method: 'Boleto',
    customer: 'Roberto Mendes',
    reference: 'INV-779'
  },
  {
    id: 'tx-12339',
    date: '2025-04-11T16:40:00',
    type: 'recebimento',
    description: 'Pagamento de fatura #INV-778',
    amount: 1500.00,
    status: 'rejeitada',
    method: 'Cartão de crédito',
    customer: 'Fernanda Costa',
    reference: 'INV-778'
  },
  {
    id: 'tx-12338',
    date: '2025-04-10T09:05:00',
    type: 'recebimento',
    description: 'Pagamento de assinatura anual',
    amount: 999.00,
    status: 'aprovada',
    method: 'PIX',
    customer: 'Empresa ABC Ltda',
    reference: 'SUB-455'
  },
  {
    id: 'tx-12337',
    date: '2025-04-09T14:50:00',
    type: 'recebimento',
    description: 'Pagamento de fatura #INV-777',
    amount: 350.25,
    status: 'aprovada',
    method: 'Cartão de crédito',
    customer: 'Paulo Soares',
    reference: 'INV-777'
  },
  {
    id: 'tx-12336',
    date: '2025-04-08T11:10:00',
    type: 'pagamento',
    description: 'Pagamento para fornecedor',
    amount: -550.00,
    status: 'aprovada',
    method: 'Transferência',
    reference: 'PO-123'
  }
];

const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case 'aprovada':
      return <Badge className="bg-green-100 text-green-800">Aprovada</Badge>;
    case 'pendente':
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'rejeitada':
      return <Badge className="bg-red-100 text-red-800">Rejeitada</Badge>;
    case 'cancelada':
      return <Badge className="bg-gray-100 text-gray-800">Cancelada</Badge>;
    case 'estornada':
      return <Badge className="bg-purple-100 text-purple-800">Estornada</Badge>;
    default:
      return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
  }
};

const getStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case 'aprovada':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pendente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'rejeitada':
      return <X className="h-4 w-4 text-red-600" />;
    case 'cancelada':
      return <X className="h-4 w-4 text-gray-600" />;
    case 'estornada':
      return <ArrowDown className="h-4 w-4 text-purple-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
  }
};

const getTypeIcon = (type: TransactionType) => {
  switch (type) {
    case 'pagamento':
      return <ArrowUp className="h-4 w-4 text-red-600" />;
    case 'recebimento':
      return <ArrowDown className="h-4 w-4 text-green-600" />;
    case 'estorno':
      return <ArrowUp className="h-4 w-4 text-purple-600" />;
    case 'taxa':
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function ComplyPayTransacoes() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Filtra transações com base nos critérios
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transaction.customer && transaction.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    const transactionDate = new Date(transaction.date);
    const matchesDate = !dateRange?.from || !dateRange?.to || 
                        (transactionDate >= dateRange.from && 
                         transactionDate <= dateRange.to);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground">Gerenciamento de todas as transações processadas pelo ComplyPay</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Utilize os filtros abaixo para encontrar transações específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="estornada">Estornada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="recebimento">Recebimento</SelectItem>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="estorno">Estorno</SelectItem>
                  <SelectItem value="taxa">Taxa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Buscar por ID, descrição..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resultados</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de transações ({filteredTransactions.length})</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span>{transaction.description}</span>
                    </div>
                    {transaction.reference && (
                      <div className="text-xs text-muted-foreground">
                        Ref: {transaction.reference}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{transaction.customer || '-'}</TableCell>
                  <TableCell>{transaction.method}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      {getStatusBadge(transaction.status)}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                          <Download className="h-4 w-4 mr-2" />
                          Baixar comprovante
                        </DropdownMenuItem>
                        {transaction.reference && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver fatura relacionada
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      <p>Nenhuma transação encontrada com os filtros aplicados.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setTypeFilter('all');
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