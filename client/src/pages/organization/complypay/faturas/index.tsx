import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
import { Search, MoreVertical, FileText, Download, Eye, Trash, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos para as faturas
type StatusFatura = 'paga' | 'pendente' | 'vencida' | 'cancelada';

type Fatura = {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  dataEmissao: string;
  dataVencimento: string;
  status: StatusFatura;
};

// Dados de exemplo para faturas
const faturasExemplo: Fatura[] = [
  {
    id: '1',
    numero: 'FAT-2025-001',
    cliente: 'Empresa ABC Ltda.',
    valor: 1250.00,
    dataEmissao: '2025-04-01',
    dataVencimento: '2025-04-15',
    status: 'pendente',
  },
  {
    id: '2',
    numero: 'FAT-2025-002',
    cliente: 'Consultoria XYZ S.A.',
    valor: 3450.00,
    dataEmissao: '2025-03-15',
    dataVencimento: '2025-04-01',
    status: 'vencida',
  },
  {
    id: '3',
    numero: 'FAT-2025-003',
    cliente: 'Clínica Saúde Plena',
    valor: 2800.00,
    dataEmissao: '2025-04-05',
    dataVencimento: '2025-05-05',
    status: 'pendente',
  },
  {
    id: '4',
    numero: 'FAT-2025-004',
    cliente: 'Farmácia Bem Estar',
    valor: 950.00,
    dataEmissao: '2025-03-10',
    dataVencimento: '2025-03-25',
    status: 'paga',
  },
  {
    id: '5',
    numero: 'FAT-2025-005',
    cliente: 'Instituto Esperança',
    valor: 5200.00,
    dataEmissao: '2025-04-02',
    dataVencimento: '2025-04-17',
    status: 'pendente',
  },
];

// Função para formatar data
const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Função para obter cor do status
const getStatusColor = (status: StatusFatura) => {
  switch (status) {
    case 'paga':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'vencida':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'cancelada':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Função para obter texto do status
const getStatusText = (status: StatusFatura) => {
  switch (status) {
    case 'paga':
      return 'Paga';
    case 'pendente':
      return 'Pendente';
    case 'vencida':
      return 'Vencida';
    case 'cancelada':
      return 'Cancelada';
    default:
      return status;
  }
};

export default function ComplyPayFaturas() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: faturasData, isLoading } = useQuery({
    queryKey: ['/api/complypay/faturas'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  // Filtrar faturas baseado no termo de busca
  const faturasFiltradas = faturasExemplo.filter(fatura => 
    fatura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fatura.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovaFatura = () => {
    toast({
      title: "Nova fatura",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleDownloadFatura = (id: string) => {
    toast({
      title: "Download iniciado",
      description: `Download da fatura ${id} em andamento`,
    });
  };

  const handleVisualizarFatura = (id: string) => {
    toast({
      title: "Visualizar fatura",
      description: `Visualizando fatura ${id}`,
    });
  };

  const handleExcluirFatura = (id: string) => {
    toast({
      title: "Confirmar exclusão",
      description: `Deseja realmente excluir a fatura ${id}?`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Faturas</CardTitle>
          <Button onClick={handleNovaFatura}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Fatura
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar faturas..."
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
                    <TableHead>Nº Fatura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasFiltradas.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell className="font-medium">{fatura.numero}</TableCell>
                      <TableCell>{fatura.cliente}</TableCell>
                      <TableCell>R$ {fatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{formatarData(fatura.dataEmissao)}</TableCell>
                      <TableCell>{formatarData(fatura.dataVencimento)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(fatura.status)}>
                          {getStatusText(fatura.status)}
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
                            <DropdownMenuItem onClick={() => handleVisualizarFatura(fatura.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadFatura(fatura.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleExcluirFatura(fatura.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {faturasFiltradas.length === 0 && (
                <div className="flex justify-center items-center p-4 text-muted-foreground">
                  Nenhuma fatura encontrada
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}