import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MoreVertical,
  ChevronDown, 
  Eye, 
  Edit, 
  Trash, 
  Download, 
  FileText, 
  Printer,
  Plus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';

// Dados de exemplo
const pedidos = [
  {
    id: 'P2350001',
    cliente: 'Maria Silva',
    data: '10/05/2023, 17:30',
    status: 'Entregue',
    total: 'R$ 350,00',
    observacao: 'Entregue no período da tarde'
  },
  {
    id: 'P2350002',
    cliente: 'João Santos',
    data: '12/06/2023, 08:45',
    status: 'Processando',
    total: 'R$ 125,50',
    observacao: 'Juntar com pedido P2350006 do mesmo cliente'
  },
  {
    id: 'P2350003',
    cliente: 'Ana Costa',
    data: '15/06/2023, 09:20',
    status: 'Enviado',
    total: 'R$ 645,00',
    observacao: 'Cliente solicitou embalagem discreta'
  },
  {
    id: 'P2350004',
    cliente: 'Roberto Alves',
    data: '17/06/2023, 13:10',
    status: 'Cancelado',
    total: 'R$ 780,20',
    observacao: 'Pedido cancelado a pedido do cliente'
  },
  {
    id: 'P2350005',
    cliente: 'João Santos',
    data: '18/06/2023, 07:30',
    status: 'Pendente',
    total: 'R$ 430,80',
    observacao: 'Cliente solicitou juntar com pedido anterior P2350002'
  },
  {
    id: 'P2350006',
    cliente: 'Carla Mendes',
    data: '20/06/2023, 17:20',
    status: 'Aguardando Pagamento',
    total: 'R$ 100,00',
    observacao: ''
  },
  {
    id: 'P2350007',
    cliente: 'Paulo Rodrigues',
    data: '22/06/2023, 08:15',
    status: 'Aprovado',
    total: 'R$ 890,50',
    observacao: ''
  },
  {
    id: 'P2350008',
    cliente: 'Fernanda Lima',
    data: '23/06/2023, 09:30',
    status: 'Entregue',
    total: 'R$ 320,00',
    observacao: ''
  },
];

// Função para obter a cor do status do pedido
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Entregue':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Processando':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Enviado':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'Cancelado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Pendente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Aguardando Pagamento':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Aprovado':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Pedidos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  // Use React Query para buscar os pedidos
  const { data: pedidosData, isLoading } = useQuery({
    queryKey: ['/api/vendas/pedidos'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === pedidos.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pedidos.map(pedido => pedido.id));
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = searchTerm === '' || 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || 
      pedido.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewPedido = (id: string) => {
    toast({
      title: "Visualizando pedido",
      description: `Abrindo detalhes do pedido ${id}`,
    });
  };

  const handleEditPedido = (id: string) => {
    toast({
      title: "Editando pedido",
      description: `Editando pedido ${id}`,
    });
  };

  const handleDeletePedido = (id: string) => {
    toast({
      title: "Confirmação necessária",
      description: `Deseja realmente excluir o pedido ${id}?`,
      variant: "destructive",
    });
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: `${action} em lote`,
      description: `Ação ${action} aplicada a ${selectedItems.length} pedidos`,
    });
  };

  const novoPedido = () => {
    toast({
      title: "Novo pedido",
      description: "Criando novo pedido",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
          <p className="text-muted-foreground">Visualize, gerencie e acompanhe todos os pedidos</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={novoPedido}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Todos os status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Processando">Processando</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aguardando Pagamento">Aguardando Pagamento</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-left">
                    <Checkbox 
                      checked={selectedItems.length === pedidos.length && pedidos.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Pedido</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Observação</th>
                  <th className="text-center py-3 px-4 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Checkbox 
                        checked={selectedItems.includes(pedido.id)}
                        onCheckedChange={() => handleSelectItem(pedido.id)}
                      />
                    </td>
                    <td className="py-3 px-4">{pedido.id}</td>
                    <td className="py-3 px-4">{pedido.cliente}</td>
                    <td className="py-3 px-4">{pedido.data}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(pedido.status)}>
                        {pedido.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{pedido.total}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{pedido.observacao}</td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPedido(pedido.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPedido(pedido.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePedido(pedido.id)} className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredPedidos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      Nenhum pedido encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('exportar')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('gerar notas')}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Notas
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('imprimir')}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleBulkAction('excluir')}>
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <span className="text-sm text-muted-foreground ml-auto">
                {selectedItems.length} item(s) selecionado(s)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}