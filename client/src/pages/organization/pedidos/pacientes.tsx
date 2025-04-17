'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Search,
  MoreVertical,
  FileText,
  Truck,
  AlertCircle,
  Check,
  X,
  Filter,
  Loader2,
  ArrowDownUp,
  Eye,
  Clipboard,
  Calendar,
  Banknote,
  User,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

// Interface para os dados dos pedidos
interface OrderItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
}

interface Order {
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
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'default' };

  return (
    <Badge variant={statusInfo.variant as any}>
      {statusInfo.label}
    </Badge>
  );
};

// Componente principal da página
const PatientOrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar pedidos do backend
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/organization/orders'],
    queryFn: async () => {
      const response = await fetch('/api/organization/orders', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }
      
      return response.json();
    }
  });

  // Filtrar pedidos com base na aba selecionada e na pesquisa
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Filtrar por status
    if (selectedTab !== 'all') {
      filtered = filtered.filter(order => order.status === selectedTab);
    }
    
    // Filtrar por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.additionalInfo?.customerEmail?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [orders, selectedTab, searchQuery]);

  // Abrir detalhes do pedido
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
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

  // Renderizar página
  return (
    <OrganizationLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pedidos de Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie os pedidos realizados pelos pacientes
            </p>
          </div>
        </div>

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
            {isLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Carregando pedidos...</span>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-24 text-destructive">
                <AlertCircle className="h-8 w-8 mr-2" />
                <span>Erro ao carregar pedidos. Tente novamente mais tarde.</span>
              </div>
            ) : filteredOrders.length === 0 ? (
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
                  {filteredOrders.map((order) => (
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
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Atualizar status
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
                            const item = JSON.parse(itemString) as OrderItem;
                            const price = item.discountPrice !== undefined ? item.discountPrice : item.price;
                            const subtotal = price * item.quantity;
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatPrice(price)}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatPrice(subtotal)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4 space-y-2">
                        <Separator />
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(selectedOrder.total - 15)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete</span>
                          <span>{formatPrice(15)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações e Observações */}
                <div className="mt-6 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Atualizar Status do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Check className="mr-2 h-4 w-4" />
                          Confirmar Pagamento
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="mr-2 h-4 w-4" />
                          Em Processamento
                        </Button>
                        <Button variant="outline" size="sm">
                          <Truck className="mr-2 h-4 w-4" />
                          Enviado
                        </Button>
                        <Button variant="outline" size="sm">
                          <Check className="mr-2 h-4 w-4" />
                          Entregue
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Nota Fiscal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </OrganizationLayout>
  );
};

export default PatientOrdersPage;