import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  ShoppingBag, 
  Package, 
  Truck, 
  FileText, 
  BarChart4, 
  Users,
  BadgeCheck,
  Boxes,
  Search,
  Plus,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Tag,
  Clock
} from 'lucide-react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';

// Interfaces para os tipos de dados
interface Supplier {
  id: number;
  name: string;
  tradingName?: string;
  city?: string;
  state?: string;
  logo?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  verified: boolean;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
}

interface Product {
  id: number;
  supplierId: number;
  name: string;
  sku?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  status: 'draft' | 'active' | 'out_of_stock' | 'discontinued';
  isFeatured: boolean;
  inventory?: number;
  tags?: string[];
  createdAt: string;
  featuredImage?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: number;
  createdAt: string;
  organization: {
    name: string;
  };
}

interface Tender {
  id: number;
  title: string;
  status: string;
  budget?: number;
  startDate: string;
  endDate: string;
  organization: {
    name: string;
  };
}

// Componente principal do dashboard do fornecedor
export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Query para buscar dados do fornecedor
  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['/api/suppliers/my-supplier'],
    queryFn: async () => {
      try {
        // Simular a resposta da API
        // Em uma implementação real, seria:
        // const response = await apiRequest('GET', '/api/suppliers/my-supplier');
        // const data = await response.json();
        // return data;
        
        // Dados temporários para desenvolvimento da UI
        return {
          id: 1,
          name: "Tech Med Supplies",
          tradingName: "TechMed",
          cnpj: "12.345.678/0001-90",
          email: "contato@techmed.com.br",
          phone: "(11) 3456-7890",
          address: "Av. Paulista, 1000",
          city: "São Paulo",
          state: "SP",
          logo: null,
          status: "active",
          verified: true,
          description: "Fornecedor especializado em equipamentos médicos de alta tecnologia",
          rating: 4.8,
          ratingCount: 156,
          createdAt: "2025-01-15T14:30:00Z",
          stats: {
            productsCount: 68,
            activeOrdersCount: 12,
            totalOrdersCount: 248,
            tendersWonCount: 15,
            tendersParticipatedCount: 32,
            revenueThisMonth: 85400.00,
            revenueLastMonth: 72300.00
          }
        };
      } catch (error) {
        console.error("Erro ao carregar dados do fornecedor:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do fornecedor",
          variant: "destructive"
        });
        return null;
      }
    },
    retry: 1,
    enabled: !!user
  });
  
  // Query para buscar produtos do fornecedor
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/suppliers/my-products'],
    queryFn: async () => {
      try {
        // Simulação de dados
        return {
          data: [
            {
              id: 1,
              supplierId: 1,
              name: "Monitor multiparâmetros MX-500",
              sku: "MM500-01",
              shortDescription: "Monitor para sinais vitais com tela touch de 15 polegadas",
              price: 18500.00,
              compareAtPrice: 19800.00,
              status: "active",
              isFeatured: true,
              inventory: 15,
              tags: ["monitor", "terapia intensiva", "sinais vitais"],
              createdAt: "2025-02-10T10:00:00Z",
              featuredImage: null
            },
            {
              id: 2,
              supplierId: 1,
              name: "Desfibrilador portátil AED-200",
              sku: "DF200-01",
              shortDescription: "Desfibrilador externo automático com instruções em português",
              price: 12800.00,
              status: "active",
              isFeatured: true,
              inventory: 8,
              tags: ["desfibrilador", "emergência", "portátil"],
              createdAt: "2025-02-15T11:30:00Z",
              featuredImage: null
            },
            {
              id: 3,
              supplierId: 1,
              name: "Kit de instrumentos cirúrgicos básico",
              sku: "KIC-001",
              shortDescription: "Kit com 12 instrumentos cirúrgicos em aço inoxidável",
              price: 3400.00,
              status: "active",
              isFeatured: false,
              inventory: 25,
              tags: ["cirurgia", "instrumentos", "kit"],
              createdAt: "2025-02-20T14:15:00Z",
              featuredImage: null
            }
          ],
          pagination: {
            total: 68,
            page: 1,
            limit: 10,
            totalPages: 7
          }
        };
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos do fornecedor",
          variant: "destructive"
        });
        return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
    },
    retry: 1,
    enabled: !!user
  });
  
  // Query para buscar pedidos do fornecedor
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/suppliers/my-orders'],
    queryFn: async () => {
      try {
        // Simulação de dados
        return {
          data: [
            {
              id: 1,
              orderNumber: "PED-2025-0438",
              status: "processing",
              totalAmount: 55200.00,
              createdAt: "2025-04-28T09:15:00Z",
              organization: {
                name: "Hospital São Lucas"
              }
            },
            {
              id: 2,
              orderNumber: "PED-2025-0425",
              status: "confirmed",
              totalAmount: 12800.00,
              createdAt: "2025-04-25T14:30:00Z",
              organization: {
                name: "Clínica Saúde Integral"
              }
            },
            {
              id: 3,
              orderNumber: "PED-2025-0415",
              status: "shipped",
              totalAmount: 8950.00,
              createdAt: "2025-04-15T11:20:00Z",
              organization: {
                name: "Centro Médico LifeCare"
              }
            }
          ],
          pagination: {
            total: 248,
            page: 1,
            limit: 10,
            totalPages: 25
          }
        };
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar os pedidos do fornecedor",
          variant: "destructive"
        });
        return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
    },
    retry: 1,
    enabled: !!user && activeTab === 'orders'
  });
  
  // Query para buscar licitações
  const { data: tendersData, isLoading: isLoadingTenders } = useQuery({
    queryKey: ['/api/suppliers/my-tenders'],
    queryFn: async () => {
      try {
        // Simulação de dados
        return {
          data: [
            {
              id: 1,
              title: "Aquisição de monitores multiparâmetros",
              status: "open",
              budget: 250000.00,
              startDate: "2025-04-20T00:00:00Z",
              endDate: "2025-05-20T23:59:59Z",
              organization: {
                name: "Hospital Universitário Federal"
              }
            },
            {
              id: 2,
              title: "Fornecimento de kits de sutura",
              status: "under_review",
              budget: 120000.00,
              startDate: "2025-04-10T00:00:00Z",
              endDate: "2025-05-10T23:59:59Z",
              organization: {
                name: "Secretaria de Saúde do Estado"
              }
            },
            {
              id: 3,
              title: "Contrato de manutenção de equipamentos de raio-x",
              status: "awarded",
              budget: 180000.00,
              startDate: "2025-03-15T00:00:00Z",
              endDate: "2025-04-15T23:59:59Z",
              organization: {
                name: "Rede de Clínicas São Camilo"
              }
            }
          ],
          pagination: {
            total: 32,
            page: 1,
            limit: 10,
            totalPages: 4
          }
        };
      } catch (error) {
        console.error("Erro ao carregar licitações:", error);
        toast({
          title: "Erro ao carregar licitações",
          description: "Não foi possível carregar as licitações disponíveis",
          variant: "destructive"
        });
        return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
    },
    retry: 1,
    enabled: !!user && activeTab === 'tenders'
  });
  
  // Renderizar status do fornecedor
  const renderSupplierStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return null;
    }
  };
  
  // Renderizar status do pedido
  const renderOrderStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>;
      case 'processing':
        return <Badge className="bg-indigo-500">Em processamento</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">Enviado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'refunded':
        return <Badge className="bg-amber-500">Reembolsado</Badge>;
      default:
        return null;
    }
  };
  
  // Renderizar status da licitação
  const renderTenderStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'open':
        return <Badge className="bg-green-500">Aberta</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-500">Em análise</Badge>;
      case 'awarded':
        return <Badge className="bg-purple-500">Concedida</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluída</Badge>;
      default:
        return null;
    }
  };
  
  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Formatar data e hora
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Verificar se o fornecedor existe
  if (!isLoadingSupplier && !supplierData) {
    return (
      <OrganizationLayout activeModule="fornecedores">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Portal do Fornecedor</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Seja um fornecedor</CardTitle>
              <CardDescription>
                Você ainda não está cadastrado como fornecedor. Registre-se para ter acesso ao portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Como fornecedor, você poderá:</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span>Cadastrar seus produtos e serviços</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Participar de licitações</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Gerenciar pedidos e entregas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Conectar-se com organizações e clientes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setLocation('/suppliers/register')}>
                Cadastrar como fornecedor
              </Button>
            </CardFooter>
          </Card>
        </div>
      </OrganizationLayout>
    );
  }
  
  return (
    <OrganizationLayout activeModule="fornecedores">
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portal do Fornecedor</h1>
            <div className="flex items-center gap-2 mt-2">
              {!isLoadingSupplier && supplierData && (
                <>
                  {renderSupplierStatus(supplierData.status)}
                  {supplierData.verified && (
                    <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verificado
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/suppliers/edit')}
            >
              Editar perfil
            </Button>
            
            <Button
              onClick={() => setLocation('/suppliers/products/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo produto
            </Button>
          </div>
        </div>
        
        {isLoadingSupplier ? (
          <div className="w-full flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {supplierData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Fornecedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome fantasia</p>
                        <p className="font-medium">{supplierData.tradingName || supplierData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CNPJ</p>
                        <p className="font-medium">{supplierData.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Localização</p>
                        <p className="font-medium">{`${supplierData.city || '-'}, ${supplierData.state || '-'}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cadastrado em</p>
                        <p className="font-medium">{formatDate(supplierData.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Produtos</p>
                        <p className="text-2xl font-bold">{supplierData.stats.productsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pedidos ativos</p>
                        <p className="text-2xl font-bold">{supplierData.stats.activeOrdersCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de pedidos</p>
                        <p className="text-2xl font-bold">{supplierData.stats.totalOrdersCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Licitações ganhas</p>
                        <p className="text-2xl font-bold">{supplierData.stats.tendersWonCount}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Faturamento no mês</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(supplierData.stats.revenueThisMonth)}
                      </p>
                      <div className="flex items-center mt-1">
                        {supplierData.stats.revenueThisMonth > supplierData.stats.revenueLastMonth ? (
                          <span className="text-sm text-green-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            {((supplierData.stats.revenueThisMonth / supplierData.stats.revenueLastMonth - 1) * 100).toFixed(1)}% em relação ao mês anterior
                          </span>
                        ) : (
                          <span className="text-sm text-red-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1-9a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                            </svg>
                            {((1 - supplierData.stats.revenueThisMonth / supplierData.stats.revenueLastMonth) * 100).toFixed(1)}% em relação ao mês anterior
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="tenders">Licitações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Últimos Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProducts ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {productsData?.data.slice(0, 3).map(product => (
                            <div key={product.id} className="flex items-start gap-2">
                              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-sm leading-none">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                              </div>
                            </div>
                          ))}
                          
                          <Button variant="outline" className="w-full" size="sm" asChild>
                            <Link href="/suppliers/products">Ver todos os produtos</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {!ordersData ? (
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => setActiveTab('orders')}
                            >
                              Carregar pedidos
                            </Button>
                          ) : (
                            <>
                              {ordersData.data.slice(0, 3).map(order => (
                                <div key={order.id} className="flex items-start gap-2">
                                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm leading-none">{order.orderNumber}</p>
                                      {renderOrderStatus(order.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(order.totalAmount)}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                size="sm"
                                onClick={() => setActiveTab('orders')}
                              >
                                Ver todos os pedidos
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Licitações Abertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTenders ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {!tendersData ? (
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => setActiveTab('tenders')}
                            >
                              Carregar licitações
                            </Button>
                          ) : (
                            <>
                              {tendersData.data.filter(tender => tender.status === 'open').slice(0, 3).map(tender => (
                                <div key={tender.id} className="flex items-start gap-2">
                                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm leading-none">{tender.title}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-muted-foreground">
                                        Até {formatDate(tender.endDate)}
                                      </p>
                                      {renderTenderStatus(tender.status)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                size="sm"
                                onClick={() => setActiveTab('tenders')}
                              >
                                Ver todas as licitações
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Ordenar
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search" 
                      placeholder="Buscar produtos..." 
                      className="pl-8 w-[250px]"
                    />
                  </div>
                </div>
                
                {isLoadingProducts ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="bg-white rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium">Produto</th>
                            <th className="text-left py-3 px-4 font-medium">SKU</th>
                            <th className="text-left py-3 px-4 font-medium">Preço</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Estoque</th>
                            <th className="text-right py-3 px-4 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsData?.data.map(product => (
                            <tr key={product.id} className="border-b">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium">{product.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{product.sku || '-'}</td>
                              <td className="py-3 px-4 font-medium">{formatCurrency(product.price)}</td>
                              <td className="py-3 px-4">
                                {product.status === 'active' ? (
                                  <Badge className="bg-green-500">Ativo</Badge>
                                ) : (
                                  <Badge variant="outline">{product.status}</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {product.inventory !== undefined ? (
                                  <span className={product.inventory < 5 ? 'text-red-500 font-medium' : ''}>{product.inventory}</span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/suppliers/products/${product.id}`}>Editar</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="py-3 px-4 flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Mostrando {productsData?.data.length} de {productsData?.pagination.total} produtos
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={true}>Anterior</Button>
                        <Button variant="outline" size="sm">Próximo</Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Ordenar
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search" 
                      placeholder="Buscar pedidos..." 
                      className="pl-8 w-[250px]"
                    />
                  </div>
                </div>
                
                {isLoadingOrders ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="bg-white rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium">Pedido</th>
                            <th className="text-left py-3 px-4 font-medium">Organização</th>
                            <th className="text-left py-3 px-4 font-medium">Data</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Valor</th>
                            <th className="text-right py-3 px-4 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersData?.data.map(order => (
                            <tr key={order.id} className="border-b">
                              <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                              <td className="py-3 px-4">{order.organization.name}</td>
                              <td className="py-3 px-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                              <td className="py-3 px-4">{renderOrderStatus(order.status)}</td>
                              <td className="py-3 px-4 font-medium">{formatCurrency(order.totalAmount)}</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/suppliers/orders/${order.id}`}>Detalhes</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="py-3 px-4 flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Mostrando {ordersData?.data.length} de {ordersData?.pagination.total} pedidos
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={true}>Anterior</Button>
                        <Button variant="outline" size="sm">Próximo</Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tenders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Ordenar
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search" 
                      placeholder="Buscar licitações..." 
                      className="pl-8 w-[250px]"
                    />
                  </div>
                </div>
                
                {isLoadingTenders ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tendersData?.data.map(tender => (
                      <Card key={tender.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2">{tender.title}</CardTitle>
                          <CardDescription>
                            {tender.organization.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <span>{renderTenderStatus(tender.status)}</span>
                            </div>
                            
                            {tender.budget && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Orçamento</span>
                                <span className="font-medium">{formatCurrency(tender.budget)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Período</span>
                              <span className="text-sm">
                                {formatDate(tender.startDate)} - {formatDate(tender.endDate)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/suppliers/tenders/${tender.id}`}>Ver detalhes</Link>
                          </Button>
                          
                          {tender.status === 'open' && (
                            <Button size="sm" asChild>
                              <Link href={`/suppliers/tenders/${tender.id}/bid`}>Enviar proposta</Link>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </OrganizationLayout>
  );
}