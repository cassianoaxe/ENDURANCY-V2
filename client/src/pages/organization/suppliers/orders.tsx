import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Clock, CheckCircle, Search, Filter, FileText, Eye, ShoppingCart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

// Componente para visualização de detalhes do pedido
const OrderDetails = ({ orderId }) => {
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/suppliers/orders/${orderId}`],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order?.data) {
    return (
      <div className="text-center text-red-500 p-4">
        Erro ao carregar detalhes do pedido
      </div>
    );
  }

  const { items, supplier, organization } = order.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Pedido</h3>
          <p className="font-medium">#{order.data.orderNumber}</p>
          <p className="text-sm">
            {format(new Date(order.data.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <StatusBadge status={order.data.status} />
          <p className="text-sm mt-1">
            Pagamento: <span className={order.data.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>{order.data.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Itens do Pedido</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.productImage && (
                        <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0">
                          <img 
                            src={item.productImage} 
                            alt={item.productName} 
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <span>{item.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">R$ {item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">R$ {item.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Fornecedor</h3>
          <div className="border rounded-md p-3 text-sm space-y-1">
            <p className="font-medium">{supplier.name}</p>
            <p>{supplier.email}</p>
            <p>{supplier.phone}</p>
            <p>{supplier.address}</p>
            <p>{supplier.city}, {supplier.state}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Organização</h3>
          <div className="border rounded-md p-3 text-sm space-y-1">
            <p className="font-medium">{organization.name}</p>
            <p>{organization.email}</p>
            <p>{organization.phone}</p>
            <p>{organization.address}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between">
          <span className="font-medium">Subtotal:</span>
          <span>R$ {parseFloat(order.data.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Impostos:</span>
          <span>R$ {parseFloat(order.data.taxAmount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Frete:</span>
          <span>R$ {parseFloat(order.data.shippingAmount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Descontos:</span>
          <span>-R$ {parseFloat(order.data.discountAmount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2 border-t pt-2">
          <span className="font-bold">Total:</span>
          <span className="font-bold">R$ {parseFloat(order.data.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// Componente para status de pedido
const StatusBadge = ({ status }) => {
  let color, label;
  
  switch (status) {
    case 'draft':
      color = 'bg-gray-100 text-gray-800';
      label = 'Rascunho';
      break;
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Pendente';
      break;
    case 'confirmed':
      color = 'bg-blue-100 text-blue-800';
      label = 'Confirmado';
      break;
    case 'processing':
      color = 'bg-indigo-100 text-indigo-800';
      label = 'Em processamento';
      break;
    case 'shipped':
      color = 'bg-purple-100 text-purple-800';
      label = 'Enviado';
      break;
    case 'delivered':
      color = 'bg-green-100 text-green-800';
      label = 'Entregue';
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800';
      label = 'Cancelado';
      break;
    case 'refunded':
      color = 'bg-pink-100 text-pink-800';
      label = 'Reembolsado';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
      label = status;
  }
  
  return (
    <Badge className={`${color} hover:${color}`}>
      {label}
    </Badge>
  );
};

// Página principal de pedidos
export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Obter lista de pedidos
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['/api/suppliers/orders', { page: pageIndex, status: statusFilter, query: searchTerm }],
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // A pesquisa é aplicada através da revalidação da query
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPageIndex(1);
  };

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de pedidos do marketplace
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/organization/suppliers/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Carrinho de Compras
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Encontre pedidos específicos utilizando filtros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Pesquisar por número do pedido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status do pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="processing">Em processamento</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Todos os pedidos realizados no marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              Erro ao carregar pedidos. Tente novamente mais tarde.
            </div>
          ) : !ordersData || !ordersData.data || ordersData.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
              <p>Não encontramos nenhum pedido com os filtros aplicados.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.data.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.orderNumber}</TableCell>
                        <TableCell>{order.supplierName}</TableCell>
                        <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>R$ {parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell>
                          <Badge className={`${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} hover:${order.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openOrderDetails(order.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Pedido #{order.orderNumber}</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do pedido e itens adquiridos
                                  </DialogDescription>
                                </DialogHeader>
                                <OrderDetails orderId={order.id} />
                              </DialogContent>
                            </Dialog>
                            
                            {order.paymentStatus !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginação */}
              {ordersData.pagination && ordersData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <Button
                    variant="outline"
                    onClick={() => setPageIndex(pageIndex - 1)}
                    disabled={pageIndex === 1}
                  >
                    Anterior
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Página {pageIndex} de {ordersData.pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPageIndex(pageIndex + 1)}
                    disabled={pageIndex === ordersData.pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}