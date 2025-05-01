import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart3, 
  Loader2, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Bell, 
  LogOut,
  FileText,
  ChevronRight,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Clock,
  PackageOpen
} from "lucide-react";
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Funções auxiliares para formatação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case 'processing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em processamento</Badge>;
    case 'shipped':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Enviado</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Entregue</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Tipo para as notificações
type Notification = {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'message' | 'system';
  read: boolean;
  createdAt: string;
};

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock de dados do usuário logado
  const user = {
    id: 1,
    name: "Empresa Exemplo LTDA",
    email: "contato@empresa.com.br",
    avatar: null,
    role: "supplier",
  };
  
  // Query para buscar dados do fornecedor
  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['/api/suppliers/me'],
  });
  
  // Query para buscar estatísticas 
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/suppliers/me/stats'],
  });
  
  // Query para buscar pedidos recentes
  const { data: recentOrdersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/suppliers/me/orders', { limit: 5 }],
  });
  
  // Query para buscar notificações
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['/api/suppliers/me/notifications'],
  });
  
  // Mock das estatísticas para demonstração
  const mockStats = {
    revenue: {
      total: 45780.50,
      lastMonth: 12500.75,
      growth: 8.5,
    },
    orders: {
      total: 128,
      pending: 12,
      delivered: 94,
      cancelled: 3,
    },
    products: {
      total: 42,
      active: 37,
      lowStock: 5,
    },
    clients: {
      total: 18,
      active: 14,
      new: 3,
    }
  };
  
  // Mock de pedidos recentes
  const mockRecentOrders = [
    {
      id: 1,
      orderNumber: "ORD-2025-0142",
      clientName: "Associação ABC",
      total: 1250.90,
      status: "delivered",
      items: 5,
      createdAt: "2025-04-28T10:30:00Z",
    },
    {
      id: 2,
      orderNumber: "ORD-2025-0143",
      clientName: "Clínica XYZ",
      total: 3450.00,
      status: "processing",
      items: 8,
      createdAt: "2025-04-29T14:45:00Z",
    },
    {
      id: 3,
      orderNumber: "ORD-2025-0144",
      clientName: "Hospital Bem-Estar",
      total: 780.50,
      status: "pending",
      items: 2,
      createdAt: "2025-04-30T09:15:00Z",
    },
    {
      id: 4,
      orderNumber: "ORD-2025-0145",
      clientName: "Farmácia Saúde",
      total: 1875.25,
      status: "shipped",
      items: 6,
      createdAt: "2025-04-30T16:20:00Z",
    },
    {
      id: 5,
      orderNumber: "ORD-2025-0146",
      clientName: "Centro Médico Esperança",
      total: 2350.00,
      status: "pending",
      items: 4,
      createdAt: "2025-05-01T08:10:00Z",
    },
  ];
  
  // Mock de notificações
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "Novo pedido recebido",
      message: "Você recebeu um novo pedido #ORD-2025-0146 de Centro Médico Esperança",
      type: "order",
      read: false,
      createdAt: "2025-05-01T08:12:00Z",
    },
    {
      id: 2,
      title: "Mensagem de cliente",
      message: "Clínica XYZ enviou uma mensagem sobre o pedido #ORD-2025-0143",
      type: "message",
      read: false,
      createdAt: "2025-04-29T15:30:00Z",
    },
    {
      id: 3,
      title: "Atualização do sistema",
      message: "Novos recursos foram adicionados ao Portal do Fornecedor",
      type: "system",
      read: true,
      createdAt: "2025-04-28T09:45:00Z",
    },
  ];

  // Função para fazer logout
  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você saiu do Portal do Fornecedor com sucesso",
    });
    setLocation("/supplier/login");
  };

  // Mock de função para marcar notificação como lida
  const markAsRead = (id: number) => {
    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi marcada como lida com sucesso",
    });
  };

  return (
    <SupplierLayout activeTab="overview">
      <div className="container mx-auto py-8 px-4">
        <TabsContent value="overview" className="m-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Olá, {user.name}</h1>
            <p className="text-gray-500">Bem-vindo ao seu painel do Portal do Fornecedor</p>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card Faturamento */}
            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{formatCurrency(mockStats.revenue.total)}</span>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{mockStats.revenue.growth}%
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(mockStats.revenue.lastMonth)} no último mês
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Pedidos */}
            <Card className="border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{mockStats.orders.total}</span>
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex text-sm gap-3">
                    <span className="text-yellow-600">{mockStats.orders.pending} pendentes</span>
                    <span className="text-green-600">{mockStats.orders.delivered} entregues</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Produtos */}
            <Card className="border-purple-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{mockStats.products.total}</span>
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex text-sm gap-3">
                    <span className="text-green-600">{mockStats.products.active} ativos</span>
                    <span className="text-orange-600">{mockStats.products.lowStock} em baixo estoque</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Clientes */}
            <Card className="border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{mockStats.clients.total}</span>
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex text-sm gap-3">
                    <span className="text-blue-600">{mockStats.clients.active} ativos</span>
                    <span className="text-green-600">{mockStats.clients.new} novos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de pedidos recentes e próximas entregas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pedidos recentes */}
            <Card className="lg:col-span-2 border-red-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/supplier/orders")}
                    className="text-red-700 hover:text-red-800 hover:bg-red-50"
                  >
                    Ver todos
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Próximas entregas e atividades */}
            <Card className="border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle>Próximas Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Hoje */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Hoje
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 p-2 rounded-md bg-yellow-50 border border-yellow-100">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Confirmar pedido #ORD-2025-0146</p>
                          <p className="text-xs text-gray-500">10:30 - Centro Médico Esperança</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-md bg-blue-50 border border-blue-100">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <PackageOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Preparar envio #ORD-2025-0143</p>
                          <p className="text-xs text-gray-500">13:00 - Clínica XYZ</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Amanhã */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Amanhã
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 p-2 rounded-md bg-purple-50 border border-purple-100">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Enviar pedido #ORD-2025-0145</p>
                          <p className="text-xs text-gray-500">09:00 - Farmácia Saúde</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setLocation("/supplier/orders")}
                    >
                      Ver agenda completa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metas e desempenho */}
          <Card className="border-green-100 mb-8">
            <CardHeader>
              <CardTitle>Desempenho Mensal</CardTitle>
              <CardDescription>Acompanhe suas metas e desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">Meta de Vendas</span>
                    </div>
                    <span className="text-gray-500">
                      {formatCurrency(mockStats.revenue.lastMonth)} / {formatCurrency(15000)}
                    </span>
                  </div>
                  <Progress value={83} className="h-2 bg-green-100" indicatorClassName="bg-green-600" />
                  <p className="text-sm text-gray-500 text-right">83% da meta mensal</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">Pedidos Entregues</span>
                    </div>
                    <span className="text-gray-500">
                      {mockStats.orders.delivered} / {mockStats.orders.total}
                    </span>
                  </div>
                  <Progress value={73} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                  <p className="text-sm text-gray-500 text-right">73% dos pedidos entregues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </SupplierLayout>
  );
}