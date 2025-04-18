'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

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
  Plus,
  Package,
  AlertCircle,
  Loader2,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Banknote,
  Check,
  Calendar,
  ArrowDownUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Interface para os dados dos pedidos de pacientes
interface OrderItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
}

interface PatientOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: string[];
  additionalInfo: {
    customerEmail: string;
    deliveryMethod: string;
    orderNumber: string;
    paymentDetails: {
      cardLastDigits?: string;
      installments?: string;
    };
    paymentMethod: string;
    prescriptionId?: string;
    requiredPrescription?: boolean;
    shippingAddress?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    userId: number;
  };
}

// Interface para os pedidos gerais
interface GeneralOrder {
  id: string;
  cliente: string;
  data: string;
  status: string;
  total: string;
  observacao: string;
}

// Dados de exemplo dos pedidos gerais
const pedidosGerais: GeneralOrder[] = [
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

// Componente para exibir status do pedido
const OrderStatus: React.FC<{ status: string }> = ({ status }) => {
  const statusMap: Record<string, { label: string; variant: string }> = {
    pending: { label: 'Pendente', variant: 'outline' },
    processing: { label: 'Em processamento', variant: 'secondary' },
    shipped: { label: 'Enviado', variant: 'secondary' },
    delivered: { label: 'Entregue', variant: 'secondary' },
    canceled: { label: 'Cancelado', variant: 'destructive' },
    refunded: { label: 'Reembolsado', variant: 'destructive' },
    awaiting_payment: { label: 'Aguardando pagamento', variant: 'outline' },
    payment_confirmed: { label: 'Pagamento confirmado', variant: 'secondary' },
    // Status dos pedidos gerais
    'Entregue': { label: 'Entregue', variant: 'secondary' },
    'Processando': { label: 'Processando', variant: 'secondary' },
    'Enviado': { label: 'Enviado', variant: 'secondary' },
    'Cancelado': { label: 'Cancelado', variant: 'destructive' },
    'Pendente': { label: 'Pendente', variant: 'outline' },
    'Aguardando Pagamento': { label: 'Aguardando pagamento', variant: 'outline' },
    'Aprovado': { label: 'Aprovado', variant: 'secondary' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'default' };

  return (
    <Badge variant={statusInfo.variant as any}>
      {statusInfo.label}
    </Badge>
  );
};

export default function GerenciamentoPedidos() {
  // Estados compartilhados
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // Pagina de pedidos de pacientes
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PatientOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Buscar pedidos gerais (mock por enquanto)
  const { data: pedidosGeraisData, isLoading: isLoadingGerais } = useQuery({
    queryKey: ['/api/vendas/pedidos'],
    enabled: false, // Desabilitado temporariamente,
    initialData: pedidosGerais // Usar dados simulados como fallback
  });

  // Buscar pedidos de pacientes
  const { data: pedidosPacientes, isLoading: isLoadingPacientes, error: errorPacientes } = useQuery<PatientOrder[]>({
    queryKey: ['/api/organization/orders', { type: 'patient' }],
    queryFn: async () => {
      const response = await fetch('/api/organization/orders?type=patient', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos de pacientes');
      }
      
      return response.json();
    }
  });
  
  // Buscar pedidos para expedição (pedidos confirmados que precisam ser preparados/enviados)
  const { data: pedidosExpedicao, isLoading: isLoadingExpedicao, error: errorExpedicao } = useQuery<any[]>({
    queryKey: ['/api/organization/orders/expedition'],
    queryFn: async () => {
      const response = await fetch('/api/organization/orders/expedition', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos para expedição');
      }
      
      return response.json();
    }
  });

  // Manipulação dos pedidos gerais
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === pedidosGeraisData?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pedidosGeraisData?.map(pedido => pedido.id) || []);
    }
  };

  const filteredPedidosGerais = pedidosGeraisData?.filter(pedido => {
    const matchesSearch = searchTerm === '' || 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'todos' || 
      pedido.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Manipulação dos pedidos de pacientes
  const filteredPedidosPacientes = React.useMemo(() => {
    if (!pedidosPacientes) return [];
    
    let filtered = pedidosPacientes;
    
    // Filtrar por status
    if (selectedTab !== 'all') {
      filtered = filtered.filter(order => order.status === selectedTab);
    }
    
    // Filtrar por pesquisa
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.additionalInfo?.customerEmail?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [pedidosPacientes, selectedTab, searchQuery]);

  // Funções compartilhadas
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

  // Abrir detalhes do pedido de paciente
  const openOrderDetails = (order: PatientOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  
  // Query client para invalidações
  const queryClient = useQueryClient();
  
  // Mutation para atualizar status do pedido
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingCode, note }: { 
      orderId: number; 
      status: string; 
      trackingCode?: string;
      note?: string;
    }) => {
      const response = await fetch(`/api/organization/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          trackingCode,
          note
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do pedido');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para recarregar pedidos
      queryClient.invalidateQueries({ queryKey: ['/api/organization/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/orders/expedition'] });
      
      // Fechar modal de status e limpar campos
      setStatusModalOpen(false);
      setTrackingCode('');
      setStatusNote('');
      
      toast({
        title: 'Status atualizado',
        description: 'O status do pedido foi atualizado com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Abrir modal para atualizar status
  const openStatusModal = (order: PatientOrder, newStatus: string) => {
    setSelectedOrder(order);
    setCurrentStatus(newStatus);
    setStatusModalOpen(true);
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os pedidos da sua organização
            </p>
          </div>
          
          <Button onClick={novoPedido}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="todos">Pedidos Gerais</TabsTrigger>
            <TabsTrigger value="pacientes">Pedidos de Pacientes</TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da aba Pedidos Gerais */}
          <TabsContent value="todos" className="mt-4">
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
                      <SelectItem value="todos">Todos os status</SelectItem>
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
                            checked={selectedItems.length === pedidosGeraisData?.length && (pedidosGeraisData?.length || 0) > 0}
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
                      {filteredPedidosGerais.map((pedido) => (
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
                            <OrderStatus status={pedido.status} />
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
                      {(!filteredPedidosGerais || filteredPedidosGerais.length === 0) && (
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
          </TabsContent>
          
          {/* Conteúdo da aba Pedidos de Pacientes */}
          <TabsContent value="pacientes" className="mt-4">
            {/* Filtros e Pesquisa */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <Tabs
                defaultValue="all"
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="processing">Em Processamento</TabsTrigger>
                  <TabsTrigger value="delivered">Entregues</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pedidos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabela de Pedidos */}
            <Card>
              <CardContent className="p-0">
                {isLoadingPacientes ? (
                  <div className="flex justify-center items-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Carregando pedidos...</span>
                  </div>
                ) : errorPacientes ? (
                  <div className="flex justify-center items-center py-24 text-destructive">
                    <AlertCircle className="h-8 w-8 mr-2" />
                    <span>Erro ao carregar pedidos. Tente novamente mais tarde.</span>
                  </div>
                ) : filteredPedidosPacientes.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-24 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                    <p>Não há pedidos que correspondam aos filtros selecionados.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Pedido #</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPedidosPacientes.map((order) => (
                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openOrderDetails(order)}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>
                            <OrderStatus status={order.status} />
                          </TableCell>
                          <TableCell>
                            {order.additionalInfo?.paymentMethod === 'credit' && (
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-1" />
                                <span>Cartão de Crédito</span>
                              </div>
                            )}
                            {order.additionalInfo?.paymentMethod === 'pix' && (
                              <div className="flex items-center">
                                <img src="/icons/pix.svg" alt="PIX" className="h-4 w-4 mr-1" />
                                <span>PIX</span>
                              </div>
                            )}
                            {order.additionalInfo?.paymentMethod === 'bankslip' && (
                              <div className="flex items-center">
                                <Banknote className="h-4 w-4 mr-1" />
                                <span>Boleto</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openOrderDetails(order);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                {/* Mostrar opções de status baseadas no status atual */}
                                {order.status === 'payment_confirmed' && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openStatusModal(order, 'in_preparation');
                                  }}>
                                    <Package className="h-4 w-4 mr-2" />
                                    <span>Iniciar Preparação</span>
                                  </DropdownMenuItem>
                                )}
                                {(order.status === 'payment_confirmed' || order.status === 'in_preparation') && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openStatusModal(order, 'shipped');
                                  }}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    <span>Marcar como Enviado</span>
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'shipped' && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openStatusModal(order, 'delivered');
                                  }}>
                                    <Check className="h-4 w-4 mr-2" />
                                    <span>Marcar como Entregue</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openStatusModal(order, 'canceled');
                                }} className="text-red-600">
                                  <Trash className="h-4 w-4 mr-2" />
                                  <span>Cancelar Pedido</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Gerar nota fiscal
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Diálogo de Detalhes do Pedido */}
            {selectedOrder && (
              <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                      <span>Detalhes do Pedido #{selectedOrder.orderNumber}</span>
                      <OrderStatus status={selectedOrder.status} />
                    </DialogTitle>
                    <DialogDescription>
                      Pedido realizado em {formatDate(selectedOrder.createdAt)}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informações do Cliente */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5 text-muted-foreground" />
                            Informações do Cliente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Nome:</span>
                            <p className="font-medium">{selectedOrder.customerName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{selectedOrder.additionalInfo?.customerEmail}</p>
                          </div>
                          {selectedOrder.additionalInfo?.shippingAddress && (
                            <div>
                              <span className="text-muted-foreground">Endereço:</span>
                              <p className="font-medium">
                                {selectedOrder.additionalInfo.shippingAddress.street}, {selectedOrder.additionalInfo.shippingAddress.number}
                                {selectedOrder.additionalInfo.shippingAddress.complement && `, ${selectedOrder.additionalInfo.shippingAddress.complement}`}
                              </p>
                              <p className="font-medium">
                                {selectedOrder.additionalInfo.shippingAddress.neighborhood} - {selectedOrder.additionalInfo.shippingAddress.city}/{selectedOrder.additionalInfo.shippingAddress.state}
                              </p>
                              <p className="font-medium">
                                CEP: {selectedOrder.additionalInfo.shippingAddress.zipCode}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Informações de Pagamento e Entrega */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                            Pagamento e Entrega
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Método de pagamento:</span>
                            <p className="font-medium">
                              {selectedOrder.additionalInfo?.paymentMethod === 'credit' && 'Cartão de Crédito'}
                              {selectedOrder.additionalInfo?.paymentMethod === 'pix' && 'PIX'}
                              {selectedOrder.additionalInfo?.paymentMethod === 'bankslip' && 'Boleto Bancário'}
                              
                              {selectedOrder.additionalInfo?.paymentMethod === 'credit' && 
                                selectedOrder.additionalInfo?.paymentDetails?.installments && 
                                ` (${selectedOrder.additionalInfo.paymentDetails.installments}x)`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Método de entrega:</span>
                            <p className="font-medium">
                              {selectedOrder.additionalInfo?.deliveryMethod === 'express' && 'Entrega Expressa (1-2 dias úteis)'}
                              {selectedOrder.additionalInfo?.deliveryMethod === 'standard' && 'Entrega Padrão (5-7 dias úteis)'}
                              {selectedOrder.additionalInfo?.deliveryMethod === 'pickup' && 'Retirada na Loja'}
                            </p>
                          </div>
                          
                          {selectedOrder.additionalInfo?.requiredPrescription && (
                            <div>
                              <span className="text-muted-foreground">Prescrição médica:</span>
                              <p className="font-medium flex items-center">
                                <Check className="h-4 w-4 text-green-600 mr-1" />
                                Requerida (ID: {selectedOrder.additionalInfo.prescriptionId})
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Itens do Pedido */}
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                            Itens do Pedido
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Preço</TableHead>
                                <TableHead className="text-center">Qtd</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedOrder.items.map((itemString, index) => {
                                try {
                                  const item = JSON.parse(itemString) as OrderItem;
                                  const price = item.discountPrice !== undefined ? item.discountPrice : item.price;
                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                      </TableCell>
                                      <TableCell className="text-right">{formatPrice(price)}</TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">{formatPrice(price * item.quantity)}</TableCell>
                                    </TableRow>
                                  );
                                } catch (e) {
                                  console.error('Erro ao processar item do pedido:', e);
                                  return null;
                                }
                              })}
                              <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">
                                  Total
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                  {formatPrice(selectedOrder.total)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                  
                  <DialogFooter className="flex justify-between items-center mt-6">
                    <span className="text-sm text-muted-foreground">
                      ID do Pedido: {selectedOrder.id}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                        Fechar
                      </Button>
                      <Button onClick={() => openStatusModal(selectedOrder, "in_preparation")}>
                        Atualizar Status
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Atualização de Status */}
      {selectedOrder && (
        <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Status do Pedido</DialogTitle>
              <DialogDescription>
                Atualize o status do pedido #{selectedOrder?.orderNumber} para {currentStatus === 'shipped' ? 'enviado' : currentStatus === 'delivered' ? 'entregue' : currentStatus === 'canceled' ? 'cancelado' : 'em preparação'}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {currentStatus === 'shipped' && (
                <div className="space-y-2">
                  <label htmlFor="tracking-code" className="text-sm font-medium">
                    Código de Rastreamento
                  </label>
                  <Input
                    id="tracking-code"
                    placeholder="Digite o código de rastreamento..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O código de rastreamento será enviado ao cliente por e-mail.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="status-note" className="text-sm font-medium">
                  Observações (opcional)
                </label>
                <Input
                  id="status-note"
                  placeholder="Adicione informações adicionais sobre este status..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderStatusMutation.mutate({
                      orderId: selectedOrder.id,
                      status: currentStatus,
                      trackingCode: currentStatus === 'shipped' ? trackingCode : undefined,
                      note: statusNote || undefined
                    });
                  }
                }}
                disabled={updateOrderStatusMutation.isPending || (currentStatus === 'shipped' && !trackingCode)}
              >
                {updateOrderStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>Atualizar Status</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
  );
}