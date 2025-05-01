import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package2, 
  ClipboardList, 
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Layout do fornecedor
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";

// Tipo de pedido
interface Order {
  id: string;
  customer: string;
  date: string;
  value: number;
  status: string;
  items: number;
  paymentStatus: string;
  trackingNumber?: string;
  shippingMethod?: string;
}

export default function SupplierOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Dados simulados de pedidos
  const orders: Order[] = [
    { 
      id: "ORD-8547", 
      customer: "Hempmeds", 
      date: "01/05/2025", 
      value: 1289.90, 
      status: "processing", 
      items: 3,
      paymentStatus: "paid"
    },
    { 
      id: "ORD-8546", 
      customer: "CBD Life", 
      date: "30/04/2025", 
      value: 2450.00, 
      status: "shipped", 
      items: 5,
      paymentStatus: "paid",
      trackingNumber: "BR45678901234",
      shippingMethod: "Sedex"
    },
    { 
      id: "ORD-8535", 
      customer: "GreenCare", 
      date: "28/04/2025", 
      value: 890.50, 
      status: "delivered", 
      items: 2,
      paymentStatus: "paid",
      trackingNumber: "BR12345678901",
      shippingMethod: "PAC"
    },
    { 
      id: "ORD-8520", 
      customer: "Hempmeds", 
      date: "25/04/2025", 
      value: 3200.00, 
      status: "delivered", 
      items: 7,
      paymentStatus: "paid",
      trackingNumber: "BR98765432109",
      shippingMethod: "Sedex"
    },
    { 
      id: "ORD-8515", 
      customer: "Abrace", 
      date: "23/04/2025", 
      value: 1750.00, 
      status: "cancelled", 
      items: 4,
      paymentStatus: "refunded"
    },
    { 
      id: "ORD-8503", 
      customer: "AnnaMed", 
      date: "20/04/2025", 
      value: 920.75, 
      status: "processing", 
      items: 2,
      paymentStatus: "pending"
    },
    { 
      id: "ORD-8490", 
      customer: "CBD Life", 
      date: "18/04/2025", 
      value: 1340.25, 
      status: "shipped", 
      items: 3,
      paymentStatus: "paid",
      trackingNumber: "BR34567890123",
      shippingMethod: "PAC"
    },
    { 
      id: "ORD-8475", 
      customer: "GreenCare", 
      date: "15/04/2025", 
      value: 4200.00, 
      status: "delivered", 
      items: 10,
      paymentStatus: "paid",
      trackingNumber: "BR23456789012",
      shippingMethod: "Sedex"
    },
    { 
      id: "ORD-8460", 
      customer: "Hempmeds", 
      date: "12/04/2025", 
      value: 780.50, 
      status: "delivered", 
      items: 2,
      paymentStatus: "paid",
      trackingNumber: "BR87654321098",
      shippingMethod: "PAC"
    },
    { 
      id: "ORD-8445", 
      customer: "Abrace", 
      date: "10/04/2025", 
      value: 3600.25, 
      status: "delivered", 
      items: 8,
      paymentStatus: "paid",
      trackingNumber: "BR76543210987",
      shippingMethod: "Sedex"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped": return "bg-orange-50 text-orange-700 border-orange-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "processing": return "Em processamento";
      case "shipped": return "Enviado";
      case "delivered": return "Entregue";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="h-4 w-4 text-blue-700" />;
      case "shipped": return <Truck className="h-4 w-4 text-orange-700" />;
      case "delivered": return <CheckCircle className="h-4 w-4 text-green-700" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-700" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-700" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-50 text-green-700 border-green-200";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "refunded": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "pending": return "Pendente";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  // Filtragem de pedidos
  const filteredOrders = orders.filter(order => {
    // Filtragem por status
    if (filter !== "all" && order.status !== filter) {
      return false;
    }
    
    // Busca por ID ou cliente
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customer.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Ordenação de pedidos
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "date") {
      // Ordenação por data (converte para timestamp)
      const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
      const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "value") {
      // Ordenação por valor
      return sortDirection === "asc" ? a.value - b.value : b.value - a.value;
    } else if (sortField === "customer") {
      // Ordenação por cliente
      return sortDirection === "asc" 
        ? a.customer.localeCompare(b.customer) 
        : b.customer.localeCompare(a.customer);
    } else {
      // Ordenação por ID (padrão)
      return sortDirection === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    }
  });

  // Função para alternar a direção da ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Função para visualizar detalhes do pedido
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Função para atualizar o status do pedido
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    toast({
      title: "Status atualizado",
      description: `O pedido ${orderId} foi atualizado para "${getStatusText(newStatus)}"`,
    });
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  return (
    <SupplierLayout activeTab="orders">
      <div className="pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Pedidos</h1>
        <p className="text-muted-foreground mb-8">Gerencie todos os seus pedidos em um só lugar.</p>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar pedidos por ID ou cliente" 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status do Pedido</SelectLabel>
                  <SelectItem value="all">Todos os Pedidos</SelectItem>
                  <SelectItem value="processing">Em Processamento</SelectItem>
                  <SelectItem value="shipped">Enviados</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Abas de categorias */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              Todos
              <Badge className="ml-2 bg-gray-200 text-gray-700">{orders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="processing" onClick={() => setFilter("processing")}>
              Em Processamento
              <Badge className="ml-2 bg-blue-100 text-blue-700">{orders.filter(o => o.status === "processing").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="shipped" onClick={() => setFilter("shipped")}>
              Enviados
              <Badge className="ml-2 bg-orange-100 text-orange-700">{orders.filter(o => o.status === "shipped").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered" onClick={() => setFilter("delivered")}>
              Entregues
              <Badge className="ml-2 bg-green-100 text-green-700">{orders.filter(o => o.status === "delivered").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" onClick={() => setFilter("cancelled")}>
              Cancelados
              <Badge className="ml-2 bg-red-100 text-red-700">{orders.filter(o => o.status === "cancelled").length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tabela de Pedidos */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              Mostrando {sortedOrders.length} de {orders.length} pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] cursor-pointer" onClick={() => toggleSort("id")}>
                    <div className="flex items-center">
                      ID do Pedido
                      {sortField === "id" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("customer")}>
                    <div className="flex items-center">
                      Cliente 
                      {sortField === "customer" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("date")}>
                    <div className="flex items-center justify-end">
                      Data 
                      {sortField === "date" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("value")}>
                    <div className="flex items-center justify-end">
                      Valor 
                      {sortField === "value" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewOrderDetails(order)}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-right">{order.date}</TableCell>
                      <TableCell className="text-right">R$ {order.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-center">{order.items}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium border flex items-center ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              
                              {order.status === "processing" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Marcar como Enviado
                                </DropdownMenuItem>
                              )}
                              
                              {order.status === "shipped" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Marcar como Entregue
                                </DropdownMenuItem>
                              )}
                              
                              {(order.status === "processing" || order.status === "shipped") && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "cancelled")}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar Pedido
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={() => toast({ title: "Nota fiscal gerada", description: `Nota fiscal do pedido ${order.id} gerada com sucesso.` })}>
                                <FileText className="mr-2 h-4 w-4" />
                                Gerar Nota Fiscal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhum pedido encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes do Pedido */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido: {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Informações completas sobre o pedido e status de entrega.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid gap-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Cliente</Label>
                  <div className="font-medium">{selectedOrder.customer}</div>
                </div>
                <div className="space-y-1">
                  <Label>Data do Pedido</Label>
                  <div className="font-medium">{selectedOrder.date}</div>
                </div>
                <div className="space-y-1">
                  <Label>Valor Total</Label>
                  <div className="font-medium text-red-700">R$ {selectedOrder.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Status do Pedido</Label>
                  <Badge className={`mt-1 rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label>Status do Pagamento</Label>
                  <Badge className={`mt-1 rounded-full px-3 py-1 text-xs font-medium border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label>Quantidade de Itens</Label>
                  <div className="font-medium">{selectedOrder.items} itens</div>
                </div>
              </div>
              
              {(selectedOrder.status === "shipped" || selectedOrder.status === "delivered") && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Método de Envio</Label>
                    <div className="font-medium">{selectedOrder.shippingMethod}</div>
                  </div>
                  <div className="space-y-1">
                    <Label>Código de Rastreamento</Label>
                    <div className="font-medium">{selectedOrder.trackingNumber}</div>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Label className="mb-3 block">Itens do Pedido</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Itens fictícios do pedido */}
                    <TableRow>
                      <TableCell>Extrato CBD 10%</TableCell>
                      <TableCell className="text-right">2</TableCell>
                      <TableCell className="text-right">R$ 250,00</TableCell>
                      <TableCell className="text-right">R$ 500,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Óleo Full Spectrum</TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell className="text-right">R$ 180,00</TableCell>
                      <TableCell className="text-right">R$ 180,00</TableCell>
                    </TableRow>
                    {selectedOrder.items > 2 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-2">
                          + {selectedOrder.items - 2} outros itens
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between w-full gap-3">
              <Button variant="outline" onClick={closeOrderDetails}>
                Fechar
              </Button>
              
              <div className="flex gap-3">
                {selectedOrder?.status === "processing" && (
                  <Button variant="default" className="bg-orange-600 hover:bg-orange-700" onClick={() => updateOrderStatus(selectedOrder.id, "shipped")}>
                    <Truck className="mr-2 h-4 w-4" />
                    Marcar como Enviado
                  </Button>
                )}
                
                {selectedOrder?.status === "shipped" && (
                  <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como Entregue
                  </Button>
                )}
                
                {(selectedOrder?.status === "processing" || selectedOrder?.status === "shipped") && (
                  <Button variant="destructive" onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Pedido
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}