import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreVertical, 
  CreditCard, 
  Banknote, 
  QrCode, 
  RefreshCw, 
  ArrowDown, 
  ArrowUp, 
  Eye, 
  Download, 
  Filter, 
  Calendar 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from "@/components/ui/date-range-picker";

// Tipos para as transações
type MetodoPagamento = 'cartao' | 'boleto' | 'pix' | 'transferencia';
type TipoTransacao = 'pagamento' | 'reembolso';
type StatusTransacao = 'aprovada' | 'pendente' | 'recusada' | 'estornada';

type Transacao = {
  id: string;
  referencia: string;
  cliente: string;
  valor: number;
  data: string;
  metodoPagamento: MetodoPagamento;
  tipo: TipoTransacao;
  status: StatusTransacao;
};

// Dados de exemplo para transações
const transacoesExemplo: Transacao[] = [
  {
    id: '1',
    referencia: 'TRX-4872',
    cliente: 'Empresa ABC Ltda.',
    valor: 1250.00,
    data: '2025-04-12T14:30:00',
    metodoPagamento: 'cartao',
    tipo: 'pagamento',
    status: 'aprovada',
  },
  {
    id: '2',
    referencia: 'TRX-4873',
    cliente: 'Consultoria XYZ S.A.',
    valor: 3450.00,
    data: '2025-04-11T09:15:00',
    metodoPagamento: 'pix',
    tipo: 'pagamento',
    status: 'pendente',
  },
  {
    id: '3',
    referencia: 'TRX-4874',
    cliente: 'Clínica Saúde Plena',
    valor: 750.00,
    data: '2025-04-10T16:45:00',
    metodoPagamento: 'cartao',
    tipo: 'reembolso',
    status: 'aprovada',
  },
  {
    id: '4',
    referencia: 'TRX-4875',
    cliente: 'Farmácia Bem Estar',
    valor: 950.00,
    data: '2025-04-09T11:20:00',
    metodoPagamento: 'boleto',
    tipo: 'pagamento',
    status: 'aprovada',
  },
  {
    id: '5',
    referencia: 'TRX-4876',
    cliente: 'Instituto Esperança',
    valor: 2100.00,
    data: '2025-04-08T10:05:00',
    metodoPagamento: 'transferencia',
    tipo: 'pagamento',
    status: 'aprovada',
  },
  {
    id: '6',
    referencia: 'TRX-4877',
    cliente: 'Academia Corpo Saudável',
    valor: 1800.00,
    data: '2025-04-07T13:45:00',
    metodoPagamento: 'pix',
    tipo: 'pagamento',
    status: 'recusada',
  },
];

// Função para formatar data
const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Função para obter cor do status
const getStatusColor = (status: StatusTransacao) => {
  switch (status) {
    case 'aprovada':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'recusada':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'estornada':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Função para obter ícone do método de pagamento
const getMethodIcon = (method: MetodoPagamento) => {
  switch (method) {
    case 'cartao':
      return <CreditCard className="h-4 w-4" />;
    case 'boleto':
      return <Banknote className="h-4 w-4" />;
    case 'pix':
      return <QrCode className="h-4 w-4" />;
    case 'transferencia':
      return <RefreshCw className="h-4 w-4" />;
    default:
      return null;
  }
};

// Função para obter texto do método de pagamento
const getMethodText = (method: MetodoPagamento) => {
  switch (method) {
    case 'cartao':
      return 'Cartão de Crédito';
    case 'boleto':
      return 'Boleto Bancário';
    case 'pix':
      return 'PIX';
    case 'transferencia':
      return 'Transferência';
    default:
      return method;
  }
};

// Função para obter texto do status
const getStatusText = (status: StatusTransacao) => {
  switch (status) {
    case 'aprovada':
      return 'Aprovada';
    case 'pendente':
      return 'Pendente';
    case 'recusada':
      return 'Recusada';
    case 'estornada':
      return 'Estornada';
    default:
      return status;
  }
};

// Função para obter ícone do tipo de transação
const getTypeIcon = (type: TipoTransacao) => {
  switch (type) {
    case 'pagamento':
      return <ArrowDown className="h-4 w-4 text-green-600" />;
    case 'reembolso':
      return <ArrowUp className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

export default function ComplyPayTransacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: transacoesData, isLoading } = useQuery({
    queryKey: ['/api/complypay/transacoes'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  // Filtrar transações baseado no termo de busca
  const transacoesFiltradas = transacoesExemplo.filter(transacao => 
    transacao.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transacao.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVisualizarTransacao = (id: string) => {
    toast({
      title: "Visualizar transação",
      description: `Visualizando detalhes da transação ${id}`,
    });
  };

  const handleExportarComprovante = (id: string) => {
    toast({
      title: "Download iniciado",
      description: `Exportando comprovante da transação ${id}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Transações</CardTitle>
          <div>
            <DateRangePicker />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoesFiltradas.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell className="font-medium flex items-center">
                        {getTypeIcon(transacao.tipo)}
                        <span className="ml-2">{transacao.referencia}</span>
                      </TableCell>
                      <TableCell>{transacao.cliente}</TableCell>
                      <TableCell className={transacao.tipo === 'reembolso' ? 'text-red-600' : ''}>
                        {transacao.tipo === 'reembolso' ? '- ' : ''}
                        R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{formatarData(transacao.data)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getMethodIcon(transacao.metodoPagamento)}
                          <span className="ml-2">{getMethodText(transacao.metodoPagamento)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transacao.status)}>
                          {getStatusText(transacao.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleVisualizarTransacao(transacao.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportarComprovante(transacao.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Exportar comprovante</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transacoesFiltradas.length === 0 && (
                <div className="flex justify-center items-center p-4 text-muted-foreground">
                  Nenhuma transação encontrada
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}