import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  PackageOpen, 
  Edit, 
  PlusCircle, 
  Trash2, 
  AlertTriangle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  sku?: string;
}

export default function PharmacistEstoque() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  
  // Campos de edição de produto
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinStock, setEditMinStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

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

  // Mutação para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async (data: Partial<Product> & { id: number }) => {
      return axios.put(`/api/organizations/${user?.organizationId}/products/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Produto atualizado com sucesso",
        description: "As alterações foram salvas no sistema",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Mutação para ajustar estoque
  const adjustStockMutation = useMutation({
    mutationFn: async (data: { productId: number, quantity: number, reason: string }) => {
      return axios.post(`/api/pharmacist/products/${data.productId}/stock-adjustment`, {
        quantity: data.quantity,
        reason: data.reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAdjustStockDialogOpen(false);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      toast({
        title: "Estoque ajustado com sucesso",
        description: "O ajuste foi registrado no sistema",
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

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditPrice(product.price.toString());
    setEditStock(product.stockQuantity.toString());
    setEditMinStock(product.minStockLevel.toString());
    setEditCategory(product.category || '');
    setEditLocation(product.location || '');
    setEditExpiryDate(product.expiryDate || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!selectedProduct) return;
    
    const updatedProduct = {
      id: selectedProduct.id,
      name: editName,
      description: editDescription,
      price: parseFloat(editPrice),
      stockQuantity: parseInt(editStock),
      minStockLevel: parseInt(editMinStock),
      category: editCategory,
      location: editLocation,
      expiryDate: editExpiryDate || undefined
    };
    
    updateProductMutation.mutate(updatedProduct);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setIsAdjustStockDialogOpen(true);
  };

  const handleSaveStockAdjustment = () => {
    if (!selectedProduct) return;
    
    const quantity = parseInt(adjustmentQuantity);
    
    if (isNaN(quantity) || quantity === 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, informe uma quantidade válida diferente de zero",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (adjustmentReason.trim() === '') {
      toast({
        title: "Razão necessária",
        description: "Por favor, informe o motivo do ajuste de estoque",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    adjustStockMutation.mutate({
      productId: selectedProduct.id,
      quantity: quantity,
      reason: adjustmentReason
    });
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
          product.sku?.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Aplicar filtro de estoque
    if (stockFilter !== 'all') {
      filteredProducts = filteredProducts.filter((product: Product) => {
        if (stockFilter === 'low') {
          return product.stockQuantity <= product.minStockLevel;
        } else if (stockFilter === 'outOfStock') {
          return product.stockQuantity === 0;
        } else if (stockFilter === 'inStock') {
          return product.stockQuantity > 0;
        }
        return true;
      });
    }
    
    // Aplicar filtro de categoria
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(
        (product: Product) => product.category === categoryFilter
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

  const getStockStatusBadge = (product: Product) => {
    if (product.stockQuantity === 0) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Sem Estoque</Badge>;
    } else if (product.stockQuantity <= product.minStockLevel) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Estoque Baixo</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Em Estoque</Badge>;
    }
  };

  const getStockPercentage = (product: Product) => {
    if (product.minStockLevel === 0) return 100;
    const targetLevel = product.minStockLevel * 3; // Considerando que 3x o mínimo é um nível "bom" de estoque
    const percentage = (product.stockQuantity / targetLevel) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Limitar entre 0 e 100
  };

  const getStockProgressColor = (product: Product) => {
    if (product.stockQuantity === 0) {
      return "bg-red-500";
    } else if (product.stockQuantity <= product.minStockLevel) {
      return "bg-yellow-500";
    } else {
      return "bg-green-500";
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <PharmacistLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Estoque</h1>
              <p className="text-gray-500">
                Controle de produtos e estoque • Farmácia {organizationName}
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Estatísticas de Estoque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products ? products.length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos cadastrados no sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Produtos com Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {products ? products.filter((p: Product) => 
                  p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel
                ).length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos abaixo do nível mínimo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Produtos Sem Estoque</CardTitle>
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products ? formatCurrency(
                  products.reduce((sum: number, p: Product) => 
                    sum + (p.price * p.stockQuantity), 0)
                ) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total em estoque
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <CardTitle>Produtos em Estoque</CardTitle>
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
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por estoque" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="inStock">Em estoque</SelectItem>
                    <SelectItem value="low">Estoque baixo</SelectItem>
                    <SelectItem value="outOfStock">Sem estoque</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={categoryFilter} 
                  onValueChange={setCategoryFilter}
                  disabled={getUniqueCategories().length === 0}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <div className="flex items-center gap-2">
                      <PackageOpen className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por categoria" />
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <p>Carregando produtos...</p>
              </div>
            ) : filterAndSortProducts().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <PackageOpen className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum produto encontrado</p>
                {(searchTerm || stockFilter !== 'all' || categoryFilter !== 'all') && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setStockFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="mt-2"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('name')}
                        >
                          Produto
                          {sortField === 'name' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('category')}
                        >
                          Categoria
                          {sortField === 'category' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button 
                          className="flex items-center ml-auto" 
                          onClick={() => handleSort('price')}
                        >
                          Preço
                          {sortField === 'price' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('stockQuantity')}
                        >
                          Estoque
                          {sortField === 'stockQuantity' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('status')}
                        >
                          Status
                          {sortField === 'status' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterAndSortProducts().map((product: Product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate" title={product.name}>
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={product.description}>
                              {product.description || 'Sem descrição'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{product.stockQuantity}</span>
                              <span className="text-xs text-gray-500">Min: {product.minStockLevel}</span>
                            </div>
                            <Progress 
                              value={getStockPercentage(product)} 
                              className={`h-2 ${getStockProgressColor(product)}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStockStatusBadge(product)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustStock(product)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <PackageOpen className="h-3 w-3 mr-1" /> Ajustar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de edição de produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Quantidade em Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={editMinStock}
                  onChange={(e) => setEditMinStock(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Ex: Prateleira A3"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Data de Validade</Label>
              <Input
                id="expiryDate"
                type="date"
                value={editExpiryDate}
                onChange={(e) => setEditExpiryDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProduct}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de ajuste de estoque */}
      <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              Adicione ou remova unidades do estoque. Use números positivos para adicionar e negativos para remover.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">Estoque atual:</span>
                  <span className="font-medium">{selectedProduct.stockQuantity} unidades</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adjustmentQuantity">Quantidade a Ajustar</Label>
                <Input
                  id="adjustmentQuantity"
                  type="number"
                  placeholder="Ex: 10 para adicionar, -5 para remover"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Use valores positivos para adicionar ao estoque e negativos para remover
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adjustmentReason">Motivo do Ajuste</Label>
                <Textarea
                  id="adjustmentReason"
                  placeholder="Ex: Recebimento de mercadoria, correção de inventário, descarte por vencimento..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  rows={3}
                />
              </div>
              
              {adjustmentQuantity && !isNaN(parseInt(adjustmentQuantity)) && (
                <div className="p-3 rounded-md bg-blue-50">
                  <p className="text-blue-800 font-medium">Resumo do Ajuste:</p>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span>Estoque atual:</span>
                    <span>{selectedProduct.stockQuantity} unidades</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span>Ajuste:</span>
                    <span>{parseInt(adjustmentQuantity) > 0 ? '+' : ''}{adjustmentQuantity} unidades</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm font-medium">
                    <span>Novo estoque:</span>
                    <span>{selectedProduct.stockQuantity + parseInt(adjustmentQuantity)} unidades</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustStockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveStockAdjustment}
              disabled={
                adjustStockMutation.isPending || 
                !adjustmentQuantity || 
                isNaN(parseInt(adjustmentQuantity)) ||
                parseInt(adjustmentQuantity) === 0 ||
                !adjustmentReason.trim()
              }
            >
              {adjustStockMutation.isPending ? "Processando..." : "Confirmar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
}