import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  PackageOpen,
  Plus, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  Filter,
  Image,
  Save,
  FileText,
  AlignLeft,
  DollarSign,
  Truck,
  Clipboard,
  Tag,
  Calendar,
  Map
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Product {
  id?: number;
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
  manufacturerCode?: string;
  sku?: string;
  image?: string;
  status?: 'active' | 'inactive';
  organizationId?: number;
}

export default function PharmacistProdutos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Produto sendo editado
  const [editProduct, setEditProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    category: '',
    expiryDate: '',
    location: '',
    supplier: '',
    barcode: '',
    manufacturerCode: '',
    sku: '',
    status: 'active'
  });
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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

  // Mutação para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (data: Product) => {
      return axios.post(`/api/organizations/${user?.organizationId}/products`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      toast({
        title: "Produto criado com sucesso",
        description: "O produto foi adicionado ao catálogo",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro ao criar produto",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Mutação para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async (data: Product) => {
      return axios.put(`/api/organizations/${user?.organizationId}/products/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
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

  // Mutação para excluir produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return axios.delete(`/api/organizations/${user?.organizationId}/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Produto excluído com sucesso",
        description: "O produto foi removido do catálogo",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
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
    setEditProduct({
      ...product,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
    });
    setIsCreatingNew(false);
    setIsProductDialogOpen(true);
    setActiveTab('basic');
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setEditProduct({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      category: '',
      status: 'active'
    });
    setIsCreatingNew(true);
    setIsProductDialogOpen(true);
    setActiveTab('basic');
  };

  const handleSaveProduct = () => {
    // Validar campos obrigatórios
    if (!editProduct.name || editProduct.price <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do produto e um preço válido",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    const productData = {
      ...editProduct,
      organizationId: user?.organizationId
    };
    
    if (isCreatingNew) {
      createProductMutation.mutate(productData);
    } else {
      updateProductMutation.mutate(productData);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (selectedProduct?.id) {
      deleteProductMutation.mutate(selectedProduct.id);
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
    
    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filteredProducts = filteredProducts.filter(
        (product: Product) => product.status === statusFilter
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

  const getStatusBadge = (status?: string) => {
    if (status === 'inactive') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inativo</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>;
    }
  };

  return (
    <PharmacistLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
              <p className="text-gray-500">
                Gerenciamento do catálogo de produtos • Farmácia {organizationName}
              </p>
            </div>
            <Button className="flex items-center gap-2" onClick={handleNewProduct}>
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
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
                Produtos cadastrados no catálogo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getUniqueCategories().length}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorias distintas
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
              <CardTitle className="text-sm font-medium">Valor do Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products ? formatCurrency(
                  products.reduce((sum: number, p: Product) => 
                    sum + p.price, 0)
                ) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total dos produtos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <CardTitle>Catálogo de Produtos</CardTitle>
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
                      <Tag className="h-4 w-4" />
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
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
                {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
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
                          {product.stockQuantity} {product.stockQuantity === 1 ? 'unidade' : 'unidades'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Excluir
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

      {/* Diálogo de criação/edição de produto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{isCreatingNew ? 'Adicionar Novo Produto' : 'Editar Produto'}</DialogTitle>
            <DialogDescription>
              {isCreatingNew 
                ? 'Preencha os detalhes do novo produto. Os campos com * são obrigatórios.'
                : 'Modifique as informações do produto conforme necessário.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="inventory">Estoque</TabsTrigger>
              <TabsTrigger value="additional">Adicional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                    placeholder="Ex: Medicamentos, Cosméticos, etc."
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editProduct.status} 
                    onValueChange={(value) => setEditProduct({
                      ...editProduct, 
                      status: value as 'active' | 'inactive'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={editProduct.stockQuantity}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      stockQuantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={editProduct.minStockLevel}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      minStockLevel: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização no Estoque</Label>
                  <Input
                    id="location"
                    value={editProduct.location || ''}
                    onChange={(e) => setEditProduct({...editProduct, location: e.target.value})}
                    placeholder="Ex: Prateleira A3, Gaveta B2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Data de Validade</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={editProduct.expiryDate || ''}
                    onChange={(e) => setEditProduct({...editProduct, expiryDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={editProduct.supplier || ''}
                    onChange={(e) => setEditProduct({...editProduct, supplier: e.target.value})}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    value={editProduct.barcode || ''}
                    onChange={(e) => setEditProduct({...editProduct, barcode: e.target.value})}
                    placeholder="Ex: 7891234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturerCode">Código do Fabricante</Label>
                  <Input
                    id="manufacturerCode"
                    value={editProduct.manufacturerCode || ''}
                    onChange={(e) => setEditProduct({...editProduct, manufacturerCode: e.target.value})}
                    placeholder="Código de referência do fabricante"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={editProduct.sku || ''}
                    onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
                    placeholder="Código de controle interno"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    value={editProduct.image || ''}
                    onChange={(e) => setEditProduct({...editProduct, image: e.target.value})}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProduct}
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
              {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Produto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="py-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedProduct.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">Preço:</span>
                  <span className="font-medium">{formatCurrency(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm">Estoque:</span>
                  <span className="font-medium">{selectedProduct.stockQuantity} unidades</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteProduct}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Excluindo..." : "Excluir Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
}