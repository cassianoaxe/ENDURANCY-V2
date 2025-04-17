import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CircleCheck,
  Clock,
  ClipboardList,
  Search,
  Calendar,
  MapPin,
  ReceiptText,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  FileText,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import PatientLayout from '@/components/layout/PatientLayout';

// Interface para o modelo de pedido
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  shippingAddress: string;
  trackingCode?: string;
  carrier?: string;
  estimatedDelivery?: string;
  progressSteps: {
    label: string;
    description: string;
    date: string;
    status: 'completed' | 'current' | 'pending' | 'error';
  }[];
}

// Dados de exemplo de pedidos
const demoOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PED-001-2025',
    date: '05/04/2025',
    status: 'delivered',
    items: [
      { name: 'Full Spectrum 3000mg', quantity: 1, price: 289.99 },
      { name: 'Pomada CBD 500mg', quantity: 2, price: 99.99 },
    ],
    totalPrice: 489.97,
    shippingAddress: 'Rua Exemplo, 123 - Bairro - São Paulo/SP',
    trackingCode: 'BR1234567890',
    carrier: 'Transportadora Express',
    estimatedDelivery: '08/04/2025',
    progressSteps: [
      {
        label: 'Pedido confirmado',
        description: 'Seu pedido foi recebido e confirmado',
        date: '05/04/2025 10:30',
        status: 'completed'
      },
      {
        label: 'Pagamento aprovado',
        description: 'O pagamento foi processado com sucesso',
        date: '05/04/2025 10:35',
        status: 'completed'
      },
      {
        label: 'Em preparação',
        description: 'Seu pedido está sendo preparado para envio',
        date: '05/04/2025 14:20',
        status: 'completed'
      },
      {
        label: 'Enviado',
        description: 'Seu pedido foi enviado',
        date: '06/04/2025 09:15',
        status: 'completed'
      },
      {
        label: 'Em trânsito',
        description: 'Seu pedido está a caminho',
        date: '07/04/2025 08:45',
        status: 'completed'
      },
      {
        label: 'Entregue',
        description: 'Seu pedido foi entregue com sucesso',
        date: '08/04/2025 14:30',
        status: 'completed'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'PED-002-2025',
    date: '10/04/2025',
    status: 'shipped',
    items: [
      { name: 'Broad Spectrum 1500mg', quantity: 1, price: 179.99 },
    ],
    totalPrice: 179.99,
    shippingAddress: 'Rua Exemplo, 123 - Bairro - São Paulo/SP',
    trackingCode: 'BR9876543210',
    carrier: 'Correios SEDEX',
    estimatedDelivery: '15/04/2025',
    progressSteps: [
      {
        label: 'Pedido confirmado',
        description: 'Seu pedido foi recebido e confirmado',
        date: '10/04/2025 16:45',
        status: 'completed'
      },
      {
        label: 'Pagamento aprovado',
        description: 'O pagamento foi processado com sucesso',
        date: '10/04/2025 16:50',
        status: 'completed'
      },
      {
        label: 'Em preparação',
        description: 'Seu pedido está sendo preparado para envio',
        date: '11/04/2025 09:30',
        status: 'completed'
      },
      {
        label: 'Enviado',
        description: 'Seu pedido foi enviado',
        date: '12/04/2025 11:20',
        status: 'completed'
      },
      {
        label: 'Em trânsito',
        description: 'Seu pedido está a caminho',
        date: '13/04/2025 08:15',
        status: 'current'
      },
      {
        label: 'Entregue',
        description: 'Entrega prevista para 15/04/2025',
        date: '',
        status: 'pending'
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'PED-003-2025',
    date: '15/04/2025',
    status: 'processing',
    items: [
      { name: 'Isolado CBD 1000mg', quantity: 1, price: 149.99 },
      { name: 'Spray Sublingual 500mg', quantity: 1, price: 89.99 },
    ],
    totalPrice: 239.98,
    shippingAddress: 'Rua Exemplo, 123 - Bairro - São Paulo/SP',
    estimatedDelivery: '20/04/2025',
    progressSteps: [
      {
        label: 'Pedido confirmado',
        description: 'Seu pedido foi recebido e confirmado',
        date: '15/04/2025 08:30',
        status: 'completed'
      },
      {
        label: 'Pagamento aprovado',
        description: 'O pagamento foi processado com sucesso',
        date: '15/04/2025 08:40',
        status: 'completed'
      },
      {
        label: 'Em preparação',
        description: 'Seu pedido está sendo preparado para envio',
        date: '15/04/2025 14:20',
        status: 'current'
      },
      {
        label: 'Enviado',
        description: 'Aguardando envio',
        date: '',
        status: 'pending'
      },
      {
        label: 'Em trânsito',
        description: 'Aguardando envio',
        date: '',
        status: 'pending'
      },
      {
        label: 'Entregue',
        description: 'Entrega prevista para 20/04/2025',
        date: '',
        status: 'pending'
      }
    ]
  }
];

// Componente para o card de resumo de pedido
const OrderSummaryCard: React.FC<{ order: Order }> = ({ order }) => {
  // Função para obter o ícone e a cor do status
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return { icon: <Clock className="h-4 w-4" />, label: 'Em processamento', color: 'bg-yellow-500' };
      case 'shipped':
        return { icon: <Truck className="h-4 w-4" />, label: 'Enviado', color: 'bg-blue-500' };
      case 'delivered':
        return { icon: <CircleCheck className="h-4 w-4" />, label: 'Entregue', color: 'bg-green-500' };
      case 'cancelled':
        return { icon: <AlertCircle className="h-4 w-4" />, label: 'Cancelado', color: 'bg-red-500' };
      default:
        return { icon: <Package className="h-4 w-4" />, label: 'Status desconhecido', color: 'bg-gray-500' };
    }
  };

  const { icon, label, color } = getStatusInfo(order.status);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
              {order.date}
            </CardDescription>
          </div>
          <Badge className={`${color} text-white`}>
            {icon}
            <span className="ml-1">{label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-1">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Produtos:</span>
            <div className="ml-1 mt-1 space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between font-medium pt-1">
            <span>Total:</span>
            <span>R$ {order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-xs text-gray-500 flex items-start">
          <MapPin className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
          <span>{order.shippingAddress}</span>
        </div>
        <Button variant="outline" size="sm" className="ml-2">
          Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para a página de rastreamento de pedidos
const RastreamentoPedidosPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(demoOrders[1]); // Default to the "shipped" order
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  // Filtrar pedidos com base na tab selecionada
  const filteredOrders = selectedTab === "all" 
    ? demoOrders 
    : demoOrders.filter(order => order.status === selectedTab);

  // Função para rastrear um pedido pelo código
  const handleTrackByCode = () => {
    if (trackingNumber.trim() === "") return;
    
    // Simulação de busca de pedido
    const foundOrder = demoOrders.find(
      order => order.orderNumber === trackingNumber || order.trackingCode === trackingNumber
    );
    
    if (foundOrder) {
      setSelectedOrder(foundOrder);
    } else {
      // Simulação de erro - em um app real, mostraria uma mensagem de erro
      console.log("Pedido não encontrado");
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Rastreamento de Pedidos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Seção de busca de pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rastrear pedido</CardTitle>
                <CardDescription>
                  Digite o número do pedido ou código de rastreio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingCode">Número do pedido ou código de rastreio</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="trackingCode" 
                        placeholder="Ex: PED-001-2025 ou BR1234567890"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                      <Button onClick={handleTrackByCode}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Lista de pedidos recentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Meus pedidos recentes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="processing">Processando</TabsTrigger>
                    <TabsTrigger value="shipped">Enviados</TabsTrigger>
                    <TabsTrigger value="delivered">Entregues</TabsTrigger>
                  </TabsList>
                  <div className="mt-4 space-y-4">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id 
                              ? 'border-primary bg-muted/50' 
                              : 'hover:bg-muted/20'
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <Badge className={
                              order.status === 'delivered' ? 'bg-green-500' :
                              order.status === 'shipped' ? 'bg-blue-500' :
                              order.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {order.status === 'delivered' && 'Entregue'}
                              {order.status === 'shipped' && 'Enviado'}
                              {order.status === 'processing' && 'Processando'}
                              {order.status === 'cancelled' && 'Cancelado'}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">R$ {order.totalPrice.toFixed(2)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum pedido encontrado nesta categoria</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSelectedTab("all")}
                        >
                          Ver todos os pedidos
                        </Button>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Precisa de ajuda? */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precisa de ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Contatar suporte
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Política de envios
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ReceiptText className="h-4 w-4 mr-2" />
                    Política de devolução
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detalhes do pedido */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Pedido {selectedOrder.orderNumber}</CardTitle>
                      <CardDescription className="mt-1">
                        Realizado em {selectedOrder.date} • {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'produto' : 'produtos'}
                      </CardDescription>
                    </div>
                    <div>
                      <Badge className={
                        selectedOrder.status === 'delivered' ? 'bg-green-500' :
                        selectedOrder.status === 'shipped' ? 'bg-blue-500' :
                        selectedOrder.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {selectedOrder.status === 'delivered' && 'Entregue'}
                        {selectedOrder.status === 'shipped' && 'Enviado'}
                        {selectedOrder.status === 'processing' && 'Processando'}
                        {selectedOrder.status === 'cancelled' && 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Informações de entrega */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          Endereço de entrega
                        </h4>
                        <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                      </div>
                      
                      {selectedOrder.trackingCode && (
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm flex items-center">
                            <Truck className="h-4 w-4 mr-1 text-gray-500" />
                            Informações de envio
                          </h4>
                          <p className="text-sm text-gray-600">
                            <span className="block">Transportadora: {selectedOrder.carrier}</span>
                            <span className="block">Código de rastreio: {selectedOrder.trackingCode}</span>
                            <span className="block">Entrega estimada: {selectedOrder.estimatedDelivery}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Linha do tempo de rastreamento */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Status de rastreamento</h4>
                      <Timeline>
                        {selectedOrder.progressSteps.map((step, index) => (
                          <TimelineItem
                            key={index}
                            status={step.status}
                            title={step.label}
                            description={step.description}
                            date={step.date}
                            isLast={index === selectedOrder.progressSteps.length - 1}
                          />
                        ))}
                      </Timeline>
                    </div>
                    
                    <Separator />
                    
                    {/* Itens do pedido */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Resumo do pedido</h4>
                      
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Subtotal</span>
                          <span>R$ {selectedOrder.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Frete</span>
                          <span>Grátis</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2">
                          <span>Total</span>
                          <span>R$ {selectedOrder.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Imprimir detalhes</Button>
                  
                  {(selectedOrder.status === 'processing' || selectedOrder.status === 'shipped') && (
                    <Button>
                      Receber atualizações
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center border rounded-lg">
                <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Nenhum pedido selecionado</h3>
                <p className="text-gray-500 max-w-md">
                  Selecione um pedido da lista ao lado ou busque pelo número do pedido para visualizar os detalhes e status de entrega.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default RastreamentoPedidosPage;