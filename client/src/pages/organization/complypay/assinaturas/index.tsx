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
  Plus, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash,
  Pause,
  Play,
  Calendar,
  CreditCard,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos para as assinaturas
type StatusAssinatura = 'ativa' | 'pausada' | 'cancelada' | 'trial' | 'inadimplente';
type Periodicidade = 'mensal' | 'trimestral' | 'semestral' | 'anual';

type Assinatura = {
  id: string;
  cliente: string;
  plano: string;
  valor: number;
  dataInicio: string;
  dataRenovacao: string;
  periodicidade: Periodicidade;
  status: StatusAssinatura;
  metodoPagamento: string;
};

// Dados de exemplo para assinaturas
const assinaturasExemplo: Assinatura[] = [
  {
    id: 'ASS-1001',
    cliente: 'Empresa ABC Ltda.',
    plano: 'Business Pro',
    valor: 299.90,
    dataInicio: '2025-01-15',
    dataRenovacao: '2025-05-15',
    periodicidade: 'mensal',
    status: 'ativa',
    metodoPagamento: 'Cartão de Crédito',
  },
  {
    id: 'ASS-1002',
    cliente: 'Consultoria XYZ S.A.',
    plano: 'Enterprise',
    valor: 999.90,
    dataInicio: '2024-11-10',
    dataRenovacao: '2025-05-10',
    periodicidade: 'semestral',
    status: 'ativa',
    metodoPagamento: 'Boleto Bancário',
  },
  {
    id: 'ASS-1003',
    cliente: 'Clínica Saúde Plena',
    plano: 'Starter',
    valor: 99.90,
    dataInicio: '2025-03-05',
    dataRenovacao: '2025-05-05',
    periodicidade: 'mensal',
    status: 'trial',
    metodoPagamento: 'Cartão de Crédito',
  },
  {
    id: 'ASS-1004',
    cliente: 'Farmácia Bem Estar',
    plano: 'Business',
    valor: 199.90,
    dataInicio: '2024-09-20',
    dataRenovacao: '2025-03-20',
    periodicidade: 'semestral',
    status: 'pausada',
    metodoPagamento: 'Cartão de Crédito',
  },
  {
    id: 'ASS-1005',
    cliente: 'Instituto Esperança',
    plano: 'Enterprise Plus',
    valor: 1499.90,
    dataInicio: '2024-06-15',
    dataRenovacao: '2025-06-15',
    periodicidade: 'anual',
    status: 'ativa',
    metodoPagamento: 'Transferência',
  },
  {
    id: 'ASS-1006',
    cliente: 'Academia Corpo Saudável',
    plano: 'Business Pro',
    valor: 299.90,
    dataInicio: '2025-02-01',
    dataRenovacao: '2025-05-01',
    periodicidade: 'mensal',
    status: 'inadimplente',
    metodoPagamento: 'Cartão de Crédito',
  },
];

// Função para formatar data
const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Função para obter cor do status
const getStatusColor = (status: StatusAssinatura) => {
  switch (status) {
    case 'ativa':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'trial':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'pausada':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'inadimplente':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'cancelada':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Função para obter texto do status
const getStatusText = (status: StatusAssinatura) => {
  switch (status) {
    case 'ativa':
      return 'Ativa';
    case 'pausada':
      return 'Pausada';
    case 'cancelada':
      return 'Cancelada';
    case 'trial':
      return 'Trial';
    case 'inadimplente':
      return 'Inadimplente';
    default:
      return status;
  }
};

// Função para obter texto da periodicidade
const getPeriodicidadeText = (periodicidade: Periodicidade) => {
  switch (periodicidade) {
    case 'mensal':
      return 'Mensal';
    case 'trimestral':
      return 'Trimestral';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    default:
      return periodicidade;
  }
};

export default function ComplyPayAssinaturas() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: assinaturasData, isLoading } = useQuery({
    queryKey: ['/api/complypay/assinaturas'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  // Filtrar assinaturas baseado no termo de busca
  const assinaturasFiltradas = assinaturasExemplo.filter(assinatura => 
    assinatura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assinatura.plano.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assinatura.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovaAssinatura = () => {
    toast({
      title: "Nova assinatura",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleVisualizarAssinatura = (id: string) => {
    toast({
      title: "Visualizar assinatura",
      description: `Visualizando detalhes da assinatura ${id}`,
    });
  };

  const handleEditarAssinatura = (id: string) => {
    toast({
      title: "Editar assinatura",
      description: `Editando assinatura ${id}`,
    });
  };

  const handlePausarAssinatura = (id: string) => {
    toast({
      title: "Pausar assinatura",
      description: `A assinatura ${id} foi pausada com sucesso`,
    });
  };

  const handleReativarAssinatura = (id: string) => {
    toast({
      title: "Reativar assinatura",
      description: `A assinatura ${id} foi reativada com sucesso`,
    });
  };

  const handleCancelarAssinatura = (id: string) => {
    toast({
      title: "Confirmar cancelamento",
      description: `Tem certeza que deseja cancelar a assinatura ${id}?`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Assinaturas</CardTitle>
          <Button onClick={handleNovaAssinatura}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Assinatura
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar assinaturas..."
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
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Periodicidade</TableHead>
                    <TableHead>Próxima Renovação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturasFiltradas.map((assinatura) => (
                    <TableRow key={assinatura.id}>
                      <TableCell className="font-medium">{assinatura.id}</TableCell>
                      <TableCell>{assinatura.cliente}</TableCell>
                      <TableCell>{assinatura.plano}</TableCell>
                      <TableCell>R$ {assinatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{getPeriodicidadeText(assinatura.periodicidade)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatarData(assinatura.dataRenovacao)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assinatura.status)}>
                          {getStatusText(assinatura.status)}
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
                            <DropdownMenuItem onClick={() => handleVisualizarAssinatura(assinatura.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditarAssinatura(assinatura.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            
                            {assinatura.status === 'ativa' && (
                              <DropdownMenuItem onClick={() => handlePausarAssinatura(assinatura.id)}>
                                <Pause className="mr-2 h-4 w-4" />
                                <span>Pausar</span>
                              </DropdownMenuItem>
                            )}
                            
                            {assinatura.status === 'pausada' && (
                              <DropdownMenuItem onClick={() => handleReativarAssinatura(assinatura.id)}>
                                <Play className="mr-2 h-4 w-4" />
                                <span>Reativar</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => handleCancelarAssinatura(assinatura.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Cancelar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {assinaturasFiltradas.length === 0 && (
                <div className="flex justify-center items-center p-4 text-muted-foreground">
                  Nenhuma assinatura encontrada
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}