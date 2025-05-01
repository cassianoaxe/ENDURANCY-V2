import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Package2, 
  ClipboardList, 
  Wallet, 
  Bell, 
  MessageSquare, 
  LogOut, 
  ChevronDown,
  BarChart3,
  ShoppingCart,
  Box,
  Users,
  ArrowUpRight,
  Info,
  Settings,
  CreditCard,
  BellRing,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Layout do fornecedor
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Dados simulados para o dashboard
  const supplierData = {
    name: "Fornecedor ABC Ltda",
    avatar: "",
    products: 24,
    pendingOrders: 5,
    completedOrders: 17,
    revenue: 15750.50,
    rating: 4.8,
    accountStatus: "verified",
    unreadNotifications: 3,
    unreadMessages: 2,
    recentOrders: [
      { id: "ORD-8547", customer: "Hempmeds", date: "01/05/2025", value: 1289.90, status: "processing" },
      { id: "ORD-8546", customer: "CBD Life", date: "30/04/2025", value: 2450.00, status: "shipped" },
      { id: "ORD-8535", customer: "GreenCare", date: "28/04/2025", value: 890.50, status: "delivered" },
      { id: "ORD-8520", customer: "Hempmeds", date: "25/04/2025", value: 3200.00, status: "delivered" },
    ],
    popularProducts: [
      { id: 1, name: "Extrato CBD 10%", price: 250.00, sales: 42 },
      { id: 2, name: "Óleo Full Spectrum", price: 180.00, sales: 37 },
      { id: 3, name: "Kit Cultivo Indoor", price: 1200.00, sales: 15 },
      { id: 4, name: "Semente Premium", price: 85.00, sales: 28 },
    ],
  };

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

  // Eventos fictícios para o componente de Atualizações Recentes
  const recentUpdates = [
    { 
      id: 1,
      type: "notification", 
      title: "Novo pedido recebido", 
      description: "Pedido #ORD-8547 foi recebido e aguarda seu processamento", 
      time: "10m atrás",
      priority: "high"
    },
    { 
      id: 2,
      type: "system", 
      title: "Atualização de preços", 
      description: "O sistema de preços será atualizado hoje às 22h00", 
      time: "2h atrás",
      priority: "medium"
    },
    { 
      id: 3,
      type: "payment", 
      title: "Pagamento recebido", 
      description: "Pagamento de R$ 3.200,00 referente ao pedido #ORD-8520 foi confirmado", 
      time: "1d atrás",
      priority: "normal"
    },
    { 
      id: 4,
      type: "message", 
      title: "Nova mensagem", 
      description: "Hempmeds enviou uma mensagem sobre o pedido #ORD-8547", 
      time: "5h atrás",
      priority: "normal"
    }
  ];

  return (
    <SupplierLayout activeTab="overview">
      <div className="pb-10">
        {/* Top Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas Mensais
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {supplierData.revenue.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">
                +15% em relação ao mês anterior
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[75%]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Ativos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplierData.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                {supplierData.completedOrders} pedidos concluídos este mês
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[45%]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos Cadastrados
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplierData.products}</div>
              <p className="text-xs text-muted-foreground">
                7 produtos adicionados recentemente
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[60%]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Satisfação do Cliente
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplierData.rating}/5.0</div>
              <p className="text-xs text-muted-foreground">
                Baseado em 32 avaliações recentes
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[96%]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>
          
          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Pedidos Recentes */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>
                    Seus pedidos mais recentes e seus status atuais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supplierData.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="bg-red-100 text-red-800 p-2 rounded-full">
                            <Package2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{order.id}</div>
                            <div className="text-sm text-gray-500">{order.customer}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">R$ {order.value.toLocaleString('pt-BR')}</div>
                            <div className="text-sm text-gray-500">{order.date}</div>
                          </div>
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full text-red-800 border-red-200 hover:bg-red-50 hover:text-red-900"
                      onClick={() => setLocation("/supplier/orders")}
                    >
                      Ver todos os pedidos
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Atualizações Recentes */}
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center">
                  <div>
                    <CardTitle>Atualizações Recentes</CardTitle>
                    <CardDescription>
                      Notificações e atualizações do sistema.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-auto h-8 w-8 rounded-full"
                    onClick={() => {
                      toast({
                        title: "Todas as notificações marcadas como lidas",
                      });
                    }}
                  >
                    <BellRing className="h-4 w-4" />
                    <span className="sr-only">Marcar tudo como lido</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUpdates.map((update) => (
                      <div key={update.id} className="flex gap-3 rounded-lg border p-3 bg-card text-card-foreground shadow-sm">
                        <div className={`
                          flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                          ${update.type === 'notification' ? 'bg-blue-100' : 
                            update.type === 'system' ? 'bg-yellow-100' : 
                            update.type === 'payment' ? 'bg-green-100' : 'bg-purple-100'}
                        `}>
                          {update.type === 'notification' && <Bell className="h-4 w-4 text-blue-700" />}
                          {update.type === 'system' && <Info className="h-4 w-4 text-yellow-700" />}
                          {update.type === 'payment' && <CreditCard className="h-4 w-4 text-green-700" />}
                          {update.type === 'message' && <MessageSquare className="h-4 w-4 text-purple-700" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{update.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {update.time}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{update.description}</p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full text-red-800 border-red-200 hover:bg-red-50 hover:text-red-900"
                      onClick={() => {
                        toast({
                          title: "Funcionalidade em desenvolvimento",
                          description: "A página de notificações está sendo implementada."
                        });
                      }}
                    >
                      Ver todas as notificações
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Produtos Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Populares</CardTitle>
                <CardDescription>
                  Seus produtos mais vendidos neste mês.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {supplierData.popularProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                      <div className="bg-gray-100 aspect-video flex items-center justify-center">
                        <Package2 className="h-10 w-10 text-gray-400" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-lg font-bold text-red-700">
                            R$ {product.price.toLocaleString('pt-BR')}
                          </div>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {product.sales} vendidos
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600" 
                              style={{ width: `${product.sales * 2}%` }} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-800 border-red-200 hover:bg-red-50 hover:text-red-900"
                    onClick={() => setLocation("/supplier/products")}
                  >
                    Gerenciar catálogo de produtos
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Pedidos */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Pedidos</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os seus pedidos atuais e anteriores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <ClipboardList className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Sistema de Pedidos</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    O gerenciamento completo de pedidos está em desenvolvimento. 
                    Em breve você poderá visualizar, processar e acompanhar todos os seus pedidos.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "Esta funcionalidade estará disponível em breve."
                      });
                    }}
                  >
                    Acessar Pedidos Pendentes
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Produtos */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Produtos</CardTitle>
                <CardDescription>
                  Gerencie seu catálogo de produtos e estoque.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <Package2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Gerenciamento de Produtos</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    O catálogo completo de produtos está em desenvolvimento.
                    Em breve você poderá adicionar, editar e gerenciar todos os seus produtos.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "Esta funcionalidade estará disponível em breve."
                      });
                    }}
                  >
                    Adicionar Novo Produto
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
                <CardDescription>
                  Acompanhe o desempenho das suas vendas e produtos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <BarChart3 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Estatísticas Avançadas</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    O sistema de análise avançada está em desenvolvimento.
                    Em breve você terá acesso a gráficos e relatórios detalhados sobre suas vendas.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "Esta funcionalidade estará disponível em breve."
                      });
                    }}
                  >
                    Gerar Relatório
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SupplierLayout>
  );
}