import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Check, Download, Edit, Eye, FileText, Filter, Loader2, MoreVertical, Package, Plus, Printer, Search, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

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

interface GeneralOrder {
  id: string;
  cliente: string;
  data: string;
  status: string;
  total: string;
  observacao: string;
}

// Status do pedido
const OrderStatus = ({ status }: { status: string }) => {
  let statusInfo = {
    label: "",
    variant: ""
  };

  switch (status) {
    case "pending":
    case "Pendente":
      statusInfo = { label: "Pendente", variant: "outline" };
      break;
    case "processing":
    case "Processando":
      statusInfo = { label: "Processando", variant: "secondary" };
      break;
    case "shipped":
    case "Enviado":
      statusInfo = { label: "Enviado", variant: "secondary" };
      break;
    case "delivered":
    case "Entregue":
      statusInfo = { label: "Entregue", variant: "success" };
      break;
    case "canceled":
    case "Cancelado":
      statusInfo = { label: "Cancelado", variant: "destructive" };
      break;
    case "waiting_payment":
    case "Aguardando Pagamento":
      statusInfo = { label: "Aguardando Pagamento", variant: "warning" };
      break;
    case "approved":
    case "Aprovado":
      statusInfo = { label: "Aprovado", variant: "success" };
      break;
    default:
      statusInfo = { label: status, variant: "outline" };
  }

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

  // Query client
  const queryClient = useQueryClient();

  const { data: pedidosGeraisData = [] } = useQuery<GeneralOrder[]>({
    queryKey: ['/api/orders/general'],
    enabled: activeTab === 'todos',
  });

  const { data: pedidosPacientesData = [], isLoading: isLoadingPacientes, error: errorPacientes } = useQuery<PatientOrder[]>({
    queryKey: ['/api/patient/orders'],
    enabled: activeTab === 'pacientes',
  });

  // Filtrado com base no termo de busca e status
  const filteredPedidosGerais = pedidosGeraisData.filter(pedido => {
    const matchesSearch = searchTerm === '' || 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'todos' || pedido.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filtrado com base na aba e termo de busca
  const filteredPedidosPacientes = pedidosPacientesData.filter(order => {
    // Filter by tab
    if (selectedTab !== 'all') {
      if (selectedTab === 'pending' && order.status !== 'pending') return false;
      if (selectedTab === 'processing' && order.status !== 'processing') return false;
      if (selectedTab === 'delivered' && order.status !== 'delivered') return false;
    }
    
    // Filter by search
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (variables: { orderId: number, status: string, trackingCode?: string, note?: string }) => {
      return apiRequest(`/api/organization/orders/${variables.orderId}/status`, {
        method: 'PATCH',
        data: {
          status: variables.status,
          trackingCode: variables.trackingCode,
          note: variables.note
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient/orders'] });
      setStatusModalOpen(false);
      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado com sucesso",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pedido",
        variant: "destructive",
      });
    },
  });

  // Funções
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredPedidosGerais.map(pedido => pedido.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: `Ação em lote: ${action}`,
      description: `Executando ${action} para ${selectedItems.length} pedidos`,
    });
    // Implementar as ações em lote
  };

  const novoPedido = () => {
    toast({
      title: "Novo pedido",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleViewPedido = (id: string) => {
    toast({
      title: "Visualizar pedido",
      description: `Visualizando pedido ${id}`,
    });
  };

  const handleEditPedido = (id: string) => {
    toast({
      title: "Editar pedido",
      description: `Editando pedido ${id}`,
    });
  };

  const handleDeletePedido = (id: string) => {
    toast({
      title: "Excluir pedido",
      description: `Pedido ${id} excluído com sucesso`,
    });
  };

  const openOrderDetails = (order: PatientOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const openStatusModal = (order: PatientOrder, newStatus: string) => {
    setSelectedOrder(order);
    setCurrentStatus(newStatus);
    setTrackingCode("");
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <div>
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
                              <span className="text-sm">
                                Cartão ****{order.additionalInfo.paymentDetails?.cardLastDigits || '0000'}
                                {order.additionalInfo.paymentDetails?.installments && 
                                  ` (${order.additionalInfo.paymentDetails.installments}x)`}
                              </span>
                            )}
                            {order.additionalInfo?.paymentMethod === 'pix' && (
                              <span className="text-sm">PIX</span>
                            )}
                            {order.additionalInfo?.paymentMethod === 'boleto' && (
                              <span className="text-sm">Boleto</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(order.total)}
                          </TableCell>
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
                                  openStatusModal(order, 'processing');
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Processando</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openStatusModal(order, 'shipped');
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Enviado</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openStatusModal(order, 'delivered');
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Entregue</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openStatusModal(order, 'canceled');
                                }} className="text-red-600">
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Cancelado</span>
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

            {/* Modal de Detalhes do Pedido */}
            {selectedOrder && (
              <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Detalhes do Pedido #{selectedOrder.orderNumber}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6 md:grid-cols-3">
                    {/* Informações do Pedido */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informações do Pedido</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">
                            <OrderStatus status={selectedOrder.status} />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data do pedido:</span>
                          <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium truncate">{selectedOrder.additionalInfo?.customerEmail}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pagamento e Entrega */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Pagamento e Entrega</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Método de pagamento:</span>
                          <p className="font-medium">
                            {selectedOrder.additionalInfo?.paymentMethod === 'credit' && 'Cartão de Crédito'}
                            {selectedOrder.additionalInfo?.paymentMethod === 'pix' && 'PIX'}
                            {selectedOrder.additionalInfo?.paymentMethod === 'boleto' && 'Boleto'}
                          </p>
                          {selectedOrder.additionalInfo?.paymentMethod === 'credit' && (
                            <p className="text-sm text-muted-foreground">
                              Final {selectedOrder.additionalInfo.paymentDetails?.cardLastDigits} - 
                              {selectedOrder.additionalInfo.paymentDetails?.installments || '1'}x
                            </p>
                          )}
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
                    <Card className="md:col-span-1">
                      <CardHeader>
                        <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Itens:</span>
                          <p className="font-medium">{selectedOrder.items.length} produto(s)</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Subtotal:</span>
                          <p className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(selectedOrder.total * 0.9)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frete:</span>
                          <p className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(selectedOrder.total * 0.1)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(selectedOrder.total)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item}</TableCell>
                              <TableCell className="text-right">1</TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(selectedOrder.total / selectedOrder.items.length)}
                              </TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(selectedOrder.total / selectedOrder.items.length)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
                    {selectedOrder.status === 'pending' && (
                      <Button onClick={() => openStatusModal(selectedOrder, 'processing')} className="ml-2">
                        Iniciar Processamento
                      </Button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <Button onClick={() => openStatusModal(selectedOrder, 'shipped')} className="ml-2">
                        Marcar como Enviado
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}