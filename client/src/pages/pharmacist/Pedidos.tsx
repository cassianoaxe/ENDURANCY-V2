import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  Package, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  ShoppingBag,
  Calendar,
  XCircle,
  User,
  FileText,
  Banknote
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: number;
  orderNumber: string;
  patient: {
    id: number;
    name: string;
    phone: string;
  };
  date: string;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix';
  notes?: string;
}

export default function PharmacistPedidos() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  // Dados fictícios de pedidos para demonstração
  const mockOrders: Order[] = [
    {
      id: 1,
      orderNumber: 'PED-2025-001',
      patient: {
        id: 101,
        name: 'Ana Silva',
        phone: '(11) 98765-4321'
      },
      date: '2025-04-08T14:30:00',
      status: 'ready',
      items: [
        {
          productId: 1,
          productName: 'Losartana 50mg - 30 comprimidos',
          quantity: 2,
          price: 22.90
        },
        {
          productId: 2,
          productName: 'Vitamina C 1g - 30 comprimidos efervescentes',
          quantity: 1,
          price: 35.50
        }
      ],
      total: 81.30,
      paymentMethod: 'credit',
      notes: 'Paciente solicitou entrega em casa'
    },
    {
      id: 2,
      orderNumber: 'PED-2025-002',
      patient: {
        id: 102,
        name: 'João Oliveira',
        phone: '(11) 97654-3210'
      },
      date: '2025-04-08T16:15:00',
      status: 'processing',
      items: [
        {
          productId: 3,
          productName: 'Dipirona 500mg - 20 comprimidos',
          quantity: 3,
          price: 12.50
        },
        {
          productId: 4,
          productName: 'Paracetamol 750mg - 20 comprimidos',
          quantity: 2,
          price: 15.90
        },
        {
          productId: 5,
          productName: 'Pomada para assaduras - 45g',
          quantity: 1,
          price: 29.90
        }
      ],
      total: 87.20,
      paymentMethod: 'pix'
    },
    {
      id: 3,
      orderNumber: 'PED-2025-003',
      patient: {
        id: 103,
        name: 'Maria Souza',
        phone: '(11) 95678-9012'
      },
      date: '2025-04-09T10:45:00',
      status: 'pending',
      items: [
        {
          productId: 6,
          productName: 'Metformina 850mg - 30 comprimidos',
          quantity: 1,
          price: 18.90
        },
        {
          productId: 7,
          productName: 'Agulhas para insulina - caixa com 100 unidades',
          quantity: 1,
          price: 39.90
        }
      ],
      total: 58.80,
      paymentMethod: 'cash',
      notes: 'Paciente é diabético e precisa das agulhas com urgência'
    },
    {
      id: 4,
      orderNumber: 'PED-2025-004',
      patient: {
        id: 104,
        name: 'Carlos Ferreira',
        phone: '(11) 94321-8765'
      },
      date: '2025-04-07T09:30:00',
      status: 'completed',
      items: [
        {
          productId: 8,
          productName: 'Propranolol 40mg - 30 comprimidos',
          quantity: 2,
          price: 15.50
        },
        {
          productId: 9,
          productName: 'Protetor solar FPS 60 - 120ml',
          quantity: 1,
          price: 69.90
        }
      ],
      total: 100.90,
      paymentMethod: 'debit'
    },
    {
      id: 5,
      orderNumber: 'PED-2025-005',
      patient: {
        id: 105,
        name: 'Laura Mendes',
        phone: '(11) 91234-5678'
      },
      date: '2025-04-06T17:20:00',
      status: 'cancelled',
      items: [
        {
          productId: 10,
          productName: 'Vitaminas pré-natais - 60 comprimidos',
          quantity: 1,
          price: 45.90
        },
        {
          productId: 11,
          productName: 'Óleo de prímula - 60 cápsulas',
          quantity: 1,
          price: 32.50
        }
      ],
      total: 78.40,
      paymentMethod: 'credit',
      notes: 'Pedido cancelado a pedido da paciente'
    }
  ];

  // Filtragem de pedidos
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em Preparação</Badge>;
      case 'ready':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pronto para Retirada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Dinheiro';
      case 'credit':
        return 'Cartão de Crédito';
      case 'debit':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      default:
        return method;
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-gray-500">Gerenciamento de pedidos e dispensação • Farmácia {organizationName}</p>
          </div>
          
          <Button className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockOrders.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pedidos registrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockOrders.filter(o => o.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando processamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Preparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockOrders.filter(o => o.status === 'processing').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sendo separados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prontos para Retirada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockOrders.filter(o => o.status === 'ready').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando o cliente
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filter */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <CardTitle>Lista de Pedidos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedidos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="processing">Em Preparação</SelectItem>
                    <SelectItem value="ready">Prontos para Retirada</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Nº Pedido</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.patient.name}</div>
                          <div className="text-xs text-muted-foreground">{order.patient.phone}</div>
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700" 
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Detalhes
                          </Button>
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Avançar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Nenhum pedido encontrado com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          {selectedOrder && (
            <>
              <DialogHeader className="space-y-1">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">Detalhes do Pedido</DialogTitle>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <DialogDescription>
                  {selectedOrder.orderNumber} • {formatDate(selectedOrder.date)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Informações do Paciente</h3>
                      <p className="text-sm text-gray-500">
                        {selectedOrder.patient.name} • {selectedOrder.patient.phone}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Itens do Pedido</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Valor Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.price * item.quantity)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Total:</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(selectedOrder.total)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Forma de Pagamento</h3>
                        <p className="text-sm text-gray-500">
                          {getPaymentMethodText(selectedOrder.paymentMethod)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">Status Atual</h3>
                        <p className="text-sm text-gray-500">
                          {selectedOrder.status === 'pending' && 'Pedido recebido, aguardando processamento'}
                          {selectedOrder.status === 'processing' && 'Pedido está sendo preparado'}
                          {selectedOrder.status === 'ready' && 'Pronto para retirada na farmácia'}
                          {selectedOrder.status === 'completed' && 'Pedido finalizado e entregue'}
                          {selectedOrder.status === 'cancelled' && 'Pedido foi cancelado'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Observações</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedOrder.notes}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                  Fechar
                </Button>
                
                {selectedOrder.status === 'pending' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Iniciar Preparação
                  </Button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    Marcar como Pronto
                  </Button>
                )}
                
                {selectedOrder.status === 'ready' && (
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Finalizar Entrega
                  </Button>
                )}
                
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                  <Button variant="destructive">
                    Cancelar Pedido
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}