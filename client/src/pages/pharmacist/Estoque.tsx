import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  PackagePlus, 
  ArrowUpDown, 
  Filter, 
  AlertTriangle, 
  Plus,
  Calendar,
  CheckCircle2,
  BellRing,
  Download,
  BarChart4,
  Activity
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  category: string;
  expiryDate?: string;
  location?: string;
  supplier?: string;
  barcode?: string;
  sku?: string;
  status?: 'active' | 'inactive';
}

interface RestockItem {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  supplier?: string;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  notes?: string;
}

interface StockMovement {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'loss';
  date: string;
  notes?: string;
}

export default function PharmacistEstoque() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockItem, setRestockItem] = useState<RestockItem>({
    productId: 0,
    quantity: 1,
    price: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    productId: 0,
    quantity: 0,
    type: 'adjustment',
    notes: '',
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Buscar produtos
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await axios.get(`/api/organizations/${user.organizationId}/products`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Buscar pedidos de reposição (mock data por enquanto)
  const { data: restockOrders = [] } = useQuery({
    queryKey: ['restock-orders', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      
      // TODO: Implementar API real
      // Simulação de dados de pedidos de reposição
      const mockData = [
        {
          id: 1,
          productId: 101,
          product: { 
            id: 101, 
            name: "Paracetamol 500mg", 
            price: 15.90, 
            stockQuantity: 45, 
            minStockLevel: 20 
          },
          quantity: 100,
          price: 12.50,
          supplier: "Fornecedor Farmacêutico",
          purchaseDate: "2025-04-01",
          expectedDeliveryDate: "2025-04-15",
          status: "pending"
        },
        {
          id: 2,
          productId: 102,
          product: { 
            id: 102, 
            name: "Dipirona 1g", 
            price: 18.50, 
            stockQuantity: 30, 
            minStockLevel: 15 
          },
          quantity: 50,
          price: 15.00,
          supplier: "Distribuidora Médica",
          purchaseDate: "2025-04-03",
          expectedDeliveryDate: "2025-04-10",
          status: "received"
        },
        {
          id: 3,
          productId: 103,
          product: { 
            id: 103, 
            name: "Ibuprofeno 400mg", 
            price: 22.90, 
            stockQuantity: 25, 
            minStockLevel: 10 
          },
          quantity: 40,
          price: 18.50,
          supplier: "Fornecedor Nacional",
          purchaseDate: "2025-04-05",
          expectedDeliveryDate: "2025-04-12",
          status: "partial"
        }
      ];
      
      return mockData;
    },
    enabled: !!user?.organizationId
  });

  // Buscar movimentações de estoque (mock data por enquanto)
  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stock-movements', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      
      // TODO: Implementar API real
      // Simulação de dados de movimentações de estoque
      const mockData = [
        {
          id: 1,
          productId: 101,
          product: { id: 101, name: "Paracetamol 500mg" },
          quantity: -2,
          type: "sale",
          date: "2025-04-10",
          notes: "Venda #12345"
        },
        {
          id: 2,
          productId: 102,
          product: { id: 102, name: "Dipirona 1g" },
          quantity: 50,
          type: "purchase",
          date: "2025-04-09",
          notes: "Compra #789"
        },
        {
          id: 3,
          productId: 103,
          product: { id: 103, name: "Ibuprofeno 400mg" },
          quantity: -5,
          type: "adjustment",
          date: "2025-04-08",
          notes: "Ajuste de inventário"
        },
        {
          id: 4,
          productId: 101,
          product: { id: 101, name: "Paracetamol 500mg" },
          quantity: -1,
          type: "loss",
          date: "2025-04-07",
          notes: "Produto danificado"
        },
        {
          id: 5,
          productId: 104,
          product: { id: 104, name: "Amoxicilina 500mg" },
          quantity: 1,
          type: "return",
          date: "2025-04-06",
          notes: "Devolução cliente"
        }
      ];
      
      return mockData;
    },
    enabled: !!user?.organizationId
  });

  // Mutação para criar pedido de reposição
  const createRestockMutation = useMutation({
    mutationFn: async (data: RestockItem) => {
      // TODO: Implementar API real
      console.log('Criando pedido de reposição:', data);
      return { data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-orders'] });
      setIsRestockDialogOpen(false);
      toast({
        title: "Pedido de reposição criado",
        description: "O pedido foi registrado com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao criar pedido de reposição:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Mutação para ajustar estoque
  const adjustStockMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implementar API real
      console.log('Ajustando estoque:', data);
      return { data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      setIsAdjustDialogOpen(false);
      toast({
        title: "Estoque ajustado",
        description: "O ajuste foi registrado com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao ajustar estoque:', error);
      toast({
        title: "Erro ao ajustar estoque",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product);
    setRestockItem({
      productId: product.id,
      quantity: Math.max(product.minStockLevel - product.stockQuantity, 10),
      price: product.price * 0.7, // Preço sugerido (exemplo: 70% do preço de venda)
      purchaseDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      supplier: product.supplier
    });
    setIsRestockDialogOpen(true);
  };

  const openAdjustDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment({
      productId: product.id,
      quantity: 0,
      type: 'adjustment',
      notes: '',
    });
    setIsAdjustDialogOpen(true);
  };

  const handleCreateRestock = () => {
    createRestockMutation.mutate(restockItem);
  };

  const handleAdjustStock = () => {
    if (selectedProduct) {
      adjustStockMutation.mutate({
        productId: selectedProduct.id,
        quantity: stockAdjustment.quantity,
        type: stockAdjustment.type,
        notes: stockAdjustment.notes
      });
    }
  };

  const filterAndSortProducts = () => {
    if (!products) return [];
    
    let filteredProducts = [...products];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product: Product) =>
          product.name.toLowerCase().includes(searchTermLower) ||
          product.description?.toLowerCase().includes(searchTermLower) ||
          product.category?.toLowerCase().includes(searchTermLower) ||
          product.sku?.toLowerCase().includes(searchTermLower) ||
          product.barcode?.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Aplicar filtro de categoria
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(
        (product: Product) => product.category === categoryFilter
      );
    }
    
    // Aplicar filtro de estoque
    if (stockFilter === 'low') {
      filteredProducts = filteredProducts.filter(
        (product: Product) => product.stockQuantity <= product.minStockLevel
      );
    } else if (stockFilter === 'out') {
      filteredProducts = filteredProducts.filter(
        (product: Product) => product.stockQuantity === 0
      );
    }
    
    // Ordenar resultados
    filteredProducts.sort((a: Product, b: Product) => {
      let valueA = a[sortField as keyof Product];
      let valueB = b[sortField as keyof Product];
      
      // Garantir que estamos comparando strings com strings e números com números
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (valueB === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filteredProducts;
  };

  const getUniqueCategories = () => {
    if (!products) return [];
    
    const categories = new Set<string>();
    products.forEach((product: Product) => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    
    return Array.from(categories);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatusBadge = (quantity: number, minLevel: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>;
    } else if (quantity <= minLevel) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Estoque baixo</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Em estoque</Badge>;
    }
  };

  const getRestockStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pendente</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Recebido</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Parcial</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMovementTypeBadge = (type: string, quantity: number) => {
    switch (type) {
      case 'sale':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Venda</Badge>;
      case 'purchase':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Compra</Badge>;
      case 'adjustment':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Ajuste</Badge>;
      case 'return':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Devolução</Badge>;
      case 'loss':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Perda</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Dados para o gráfico de barras - estoque por categoria
  const getStockByCategoryData = () => {
    if (!products || products.length === 0) return [];
    
    const categories: Record<string, number> = {};
    
    products.forEach((product: Product) => {
      const category = product.category || 'Sem categoria';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += product.stockQuantity;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Dados para o gráfico de pizza - status de estoque
  const getStockStatusData = () => {
    if (!products || products.length === 0) return [];
    
    let normal = 0;
    let low = 0;
    let outOfStock = 0;
    
    products.forEach((product: Product) => {
      if (product.stockQuantity === 0) {
        outOfStock++;
      } else if (product.stockQuantity <= product.minStockLevel) {
        low++;
      } else {
        normal++;
      }
    });
    
    return [
      { name: 'Normal', value: normal, color: '#22c55e' },
      { name: 'Estoque baixo', value: low, color: '#f59e0b' },
      { name: 'Sem estoque', value: outOfStock, color: '#ef4444' }
    ];
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
            <p className="text-gray-500">
              Gestão de estoque e inventário • Farmácia {organizationName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setActiveTab('reports')}>
              <BarChart4 className="h-4 w-4" />
              Relatórios
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventário Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products ? products.reduce((sum: number, p: Product) => sum + p.stockQuantity, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades em estoque
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products ? products.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products ? products.filter((p: Product) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Esgotados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products ? products.filter((p: Product) => p.stockQuantity === 0).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos esgotados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-background grid grid-cols-4 h-11">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-5">
          {/* Produtos com estoque baixo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Produtos com Estoque Baixo
              </CardTitle>
              <CardDescription>
                Produtos que precisam ser reabastecidos em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <p>Carregando produtos...</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Estoque</TableHead>
                        <TableHead className="text-right">Mín. Requerido</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products && products
                        .filter((product: Product) => product.stockQuantity <= product.minStockLevel)
                        .slice(0, 5)
                        .map((product: Product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category || '-'}</TableCell>
                            <TableCell className="text-right">{product.stockQuantity}</TableCell>
                            <TableCell className="text-right">{product.minStockLevel}</TableCell>
                            <TableCell className="text-right">
                              {getStockStatusBadge(product.stockQuantity, product.minStockLevel)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openRestockDialog(product)}
                              >
                                <PackagePlus className="h-3 w-3 mr-1" /> Pedir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      
                      {(!products || products.filter((product: Product) => 
                        product.stockQuantity <= product.minStockLevel).length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                            <p>Todos os produtos estão com estoque adequado</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => {
                  setStockFilter('low');
                  setActiveTab('inventory');
                }}
              >
                Ver todos os produtos com estoque baixo
              </Button>
            </CardFooter>
          </Card>
          
          {/* Pedidos recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                Pedidos de Reposição Recentes
              </CardTitle>
              <CardDescription>
                Últimos pedidos de produtos para reabastecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Data do Pedido</TableHead>
                      <TableHead className="text-right">Entrega Prevista</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restockOrders.slice(0, 5).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.product?.name}</TableCell>
                        <TableCell className="text-right">{order.quantity}</TableCell>
                        <TableCell className="text-right">{formatDate(order.purchaseDate)}</TableCell>
                        <TableCell className="text-right">
                          {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {getRestockStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {restockOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-gray-500">Nenhum pedido de reposição recente</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setActiveTab('orders')}
              >
                Ver todos os pedidos
              </Button>
            </CardFooter>
          </Card>
          
          {/* Movimentações recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 text-purple-500 mr-2" />
                Movimentações Recentes
              </CardTitle>
              <CardDescription>
                Últimas entradas e saídas de produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.slice(0, 5).map((movement: any) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">{movement.product?.name}</TableCell>
                        <TableCell>
                          {getMovementTypeBadge(movement.type, movement.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {movement.quantity >= 0 ? `+${movement.quantity}` : movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatDate(movement.date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{movement.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                    
                    {stockMovements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-gray-500">Nenhuma movimentação recente</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventário */}
        <TabsContent value="inventory" className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <CardTitle>Inventário</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filtrar categoria" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {getUniqueCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filtrar por estoque" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os produtos</SelectItem>
                      <SelectItem value="low">Estoque baixo</SelectItem>
                      <SelectItem value="out">Esgotados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-60">
                  <p>Carregando produtos...</p>
                </div>
              ) : filterAndSortProducts().length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                            Produto
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center cursor-pointer" onClick={() => handleSort('category')}>
                            Categoria
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('stockQuantity')}>
                            Estoque
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Nível Mínimo</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterAndSortProducts().map((product: Product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell className="text-right">{product.stockQuantity}</TableCell>
                          <TableCell className="text-right">{product.minStockLevel}</TableCell>
                          <TableCell className="text-right">
                            {getStockStatusBadge(product.stockQuantity, product.minStockLevel)}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => openRestockDialog(product)}
                            >
                              <PackagePlus className="h-3 w-3 mr-1" /> Pedir
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => openAdjustDialog(product)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Ajustar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <p className="text-gray-500 mb-2">Nenhum produto encontrado com os filtros aplicados</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setStockFilter('all');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pedidos */}
        <TabsContent value="orders" className="space-y-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pedidos de Reposição</CardTitle>
                <CardDescription>
                  Gerenciamento de pedidos de produtos para reabastecimento
                </CardDescription>
              </div>
              <Button className="flex items-center gap-2">
                <PackagePlus className="h-4 w-4" />
                Novo Pedido
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Data do Pedido</TableHead>
                      <TableHead className="text-right">Entrega Prevista</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restockOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.product?.name}</TableCell>
                        <TableCell className="text-right">{order.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.price * order.quantity)}</TableCell>
                        <TableCell className="text-right">{formatDate(order.purchaseDate)}</TableCell>
                        <TableCell className="text-right">
                          {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                        </TableCell>
                        <TableCell>{order.supplier || '-'}</TableCell>
                        <TableCell className="text-right">
                          {getRestockStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            disabled={order.status === 'received' || order.status === 'cancelled'}
                          >
                            {order.status === 'pending' ? 'Receber' : order.status === 'partial' ? 'Completar' : ''}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {restockOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <p className="text-gray-500">Nenhum pedido de reposição registrado</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Estoque por Categoria</CardTitle>
                <CardDescription>
                  Distribuição do estoque atual por categoria de produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getStockByCategoryData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Unidades em estoque" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status de Estoque</CardTitle>
                <CardDescription>
                  Visão geral da situação de estoque dos produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStockStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStockStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Produtos com Maior Rotatividade</CardTitle>
                <CardDescription>
                  Produtos que tiveram maior movimentação de estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600 mb-2">68%</div>
                      <div className="text-sm text-center text-blue-800">Produtos com estoque adequado</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-md">
                      <div className="text-2xl font-bold text-orange-600 mb-2">24%</div>
                      <div className="text-sm text-center text-orange-800">Produtos com estoque baixo</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-md">
                      <div className="text-2xl font-bold text-red-600 mb-2">8%</div>
                      <div className="text-sm text-center text-red-800">Produtos esgotados</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Top 5 Produtos</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Paracetamol 500mg</span>
                          <span className="text-sm text-gray-500">78% do estoque consumido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Dipirona 1g</span>
                          <span className="text-sm text-gray-500">65% do estoque consumido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Amoxicilina 500mg</span>
                          <span className="text-sm text-gray-500">52% do estoque consumido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '52%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Ibuprofeno 400mg</span>
                          <span className="text-sm text-gray-500">45% do estoque consumido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Protetor Solar FPS 60</span>
                          <span className="text-sm text-gray-500">38% do estoque consumido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Reposição de Estoque */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Pedido de Reposição</DialogTitle>
            <DialogDescription>
              Adicione um novo pedido para reposição de estoque
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedProduct && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-name" className="text-right">Produto</Label>
                <Input
                  id="product-name"
                  value={selectedProduct.name}
                  disabled
                  className="col-span-3"
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockItem.quantity}
                onChange={(e) => setRestockItem({...restockItem, quantity: parseInt(e.target.value) || 1})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Preço Unit.</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={restockItem.price}
                onChange={(e) => setRestockItem({...restockItem, price: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Fornecedor</Label>
              <Input
                id="supplier"
                value={restockItem.supplier || ''}
                onChange={(e) => setRestockItem({...restockItem, supplier: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseDate" className="text-right">Data do Pedido</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={restockItem.purchaseDate}
                onChange={(e) => setRestockItem({...restockItem, purchaseDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedDeliveryDate" className="text-right">Entrega Prevista</Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={restockItem.expectedDeliveryDate || ''}
                onChange={(e) => setRestockItem({...restockItem, expectedDeliveryDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRestockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateRestock}
              disabled={createRestockMutation.isPending}
            >
              {createRestockMutation.isPending ? "Criando..." : "Criar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Ajuste de Estoque */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              Adicione ou remova unidades do estoque
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedProduct && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-name" className="text-right">Produto</Label>
                  <Input
                    id="product-name"
                    value={selectedProduct.name}
                    disabled
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current-stock" className="text-right">Estoque Atual</Label>
                  <Input
                    id="current-stock"
                    value={selectedProduct.stockQuantity}
                    disabled
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment-type" className="text-right">Tipo</Label>
              <Select 
                value={stockAdjustment.type} 
                onValueChange={(value) => setStockAdjustment({...stockAdjustment, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de ajuste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Ajuste manual</SelectItem>
                  <SelectItem value="loss">Perda/Quebra</SelectItem>
                  <SelectItem value="return">Devolução</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantidade</Label>
              <div className="col-span-3 flex items-center">
                <Select 
                  value={stockAdjustment.quantity >= 0 ? "add" : "remove"} 
                  onValueChange={(value) => {
                    const absQuantity = Math.abs(stockAdjustment.quantity);
                    setStockAdjustment({
                      ...stockAdjustment, 
                      quantity: value === "add" ? absQuantity : -absQuantity
                    });
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Adicionar</SelectItem>
                    <SelectItem value="remove">Remover</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={Math.abs(stockAdjustment.quantity)}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    const isNegative = stockAdjustment.quantity < 0;
                    setStockAdjustment({
                      ...stockAdjustment, 
                      quantity: isNegative ? -newValue : newValue
                    });
                  }}
                  className="ml-2 flex-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Observações</Label>
              <Input
                id="notes"
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment({...stockAdjustment, notes: e.target.value})}
                className="col-span-3"
                placeholder="Motivo do ajuste"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAdjustDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAdjustStock}
              disabled={adjustStockMutation.isPending}
            >
              {adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}