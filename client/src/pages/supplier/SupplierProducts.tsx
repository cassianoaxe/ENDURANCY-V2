import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package2,
  Search,
  Filter,
  ChevronDown,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  ImagePlus,
  BarChart3,
  Tag,
  Archive,
  Check,
  X,
  Upload,
  DollarSign,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

// Layout do fornecedor
// O SupplierLayout é aplicado no App.tsx

// Tipos
interface Product {
  id: number;
  supplierId: number;
  name: string;
  sku: string;
  shortDescription: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  status: string;
  isFeatured: boolean;
  inventory: number;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  featuredImage?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function SupplierProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("newest");

  // Buscar produtos via API
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/suppliers/my-products', page, limit, sort, filter !== 'all' ? filter : null, categoryFilter !== 'all' ? categoryFilter : null, searchQuery],
    queryFn: async () => {
      let url = `/api/suppliers/my-products?page=${page}&limit=${limit}&sort=${sort}`;
      
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      if (categoryFilter !== 'all') {
        url += `&category=${categoryFilter}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      try {
        // Usar o método GET de forma correta
        console.log("Fazendo requisição GET para:", url);
        // O formato correto é: apiRequest(url, { method: "GET" }) ou apiRequest(url) que usa GET por padrão
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro na busca de produtos:", error);
        throw error;
      }
    }
  });
  
  // Buscar categorias via API
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/suppliers/categories'],
    queryFn: async () => {
      try {
        // Simulando dados até que a API esteja pronta
        return {
          success: true,
          data: [
            { id: "extratos", name: "Extratos" },
            { id: "oleos", name: "Óleos" },
            { id: "capsulas", name: "Cápsulas" },
            { id: "topicos", name: "Tópicos" },
            { id: "sementes", name: "Sementes" },
            { id: "flores", name: "Flores" },
            { id: "cultivo", name: "Cultivo" },
            { id: "acessorios", name: "Acessórios" },
            { id: "livros", name: "Livros" }
          ]
        };
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        return { success: false, data: [] };
      }
    }
  });
  
  // Mutation para adicionar produto
  const addProductMutation = useMutation({
    mutationFn: async (productData: FormData) => {
      try {
        console.log("Fazendo requisição POST para produtos do fornecedor");
        const response = await fetch("/api/suppliers/products", {
          method: "POST",
          credentials: "include",
          body: productData, // FormData não precisa ser JSON.stringify
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/my-products'] });
      toast({
        title: "Produto adicionado",
        description: "O novo produto foi adicionado com sucesso.",
      });
      setShowAddProduct(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar produto",
        description: error.message || "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: FormData }) => {
      try {
        console.log("Fazendo requisição PUT para atualizar produto:", id);
        const response = await fetch(`/api/suppliers/products/${id}`, {
          method: "PUT",
          credentials: "include",
          body: data, // FormData não precisa ser JSON.stringify
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/my-products'] });
      toast({
        title: "Produto atualizado",
        description: `As alterações no produto foram salvas com sucesso.`,
      });
      closeProductDetails();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para remover produto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        console.log("Fazendo requisição DELETE para produto:", productId);
        const response = await fetch(`/api/suppliers/products/${productId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/my-products'] });
      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message || "Ocorreu um erro ao remover o produto.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para alterar status do produto
  const updateProductStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      try {
        console.log("Fazendo requisição PUT para alterar status do produto:", id);
        const response = await fetch(`/api/suppliers/products/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao alterar status do produto:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/my-products'] });
      toast({
        title: "Status alterado",
        description: `O status do produto foi alterado para "${getStatusText(variables.status)}".`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro ao alterar o status do produto.",
        variant: "destructive"
      });
    }
  });

  // Usando dados da API ou dados simulados enquanto desenvolvemos
  const products: Product[] = [
    {
      id: 1,
      name: "Frasco de Vidro Âmbar 30ml",
      description: "Frasco de vidro âmbar com tampa conta-gotas, ideal para armazenamento de preparações farmacêuticas, óleos essenciais e extratos.",
      price: 8.50,
      stock: 450,
      category: "frascos",
      status: "active",
      sku: "FRSC-AMB-30",
      imageUrl: "/images/products/frasco-30ml.jpg",
      sales: 142,
      rating: 4.8
    },
    {
      id: 2,
      name: "Óleo MCT (Triglicerídeos de Cadeia Média)",
      description: "Óleo MCT farmacêutico de alta pureza, extraído de coco, ideal como veículo para formulações magistrais e preparações farmacêuticas.",
      price: 120.00,
      stock: 58,
      category: "oleos",
      status: "active",
      sku: "MCT-1000",
      imageUrl: "/images/products/mct-oil.jpg",
      sales: 97,
      rating: 4.7,
      discountPrice: 109.90
    },
    {
      id: 3,
      name: "Kit Estufa Cultivo Controlado",
      description: "Kit completo para cultivo controlado em ambiente laboratorial, inclui estrutura, sistema de iluminação LED, controle de temperatura e umidade.",
      price: 2200.00,
      stock: 12,
      category: "cultivo",
      status: "active",
      sku: "KIT-EST-01",
      imageUrl: "/images/products/estufa-lab.jpg",
      sales: 15,
      rating: 4.5
    },
    {
      id: 4,
      name: "Terra Turfa Premium",
      description: "Substrato especial com turfa de alta qualidade para cultivo controlado em laboratório. pH balanceado e enriquecido com nutrientes.",
      price: 45.00,
      stock: 120,
      category: "cultivo",
      status: "active",
      sku: "TURF-10KG",
      imageUrl: "/images/products/turfa.jpg",
      sales: 68,
      rating: 4.6
    },
    {
      id: 5,
      name: "Balança de Precisão 0.001g",
      description: "Balança de precisão digital com sensibilidade de 0.001g, ideal para laboratórios farmacêuticos e pesagem de componentes ativos.",
      price: 890.00,
      stock: 22,
      category: "equipamentos",
      status: "active",
      sku: "BAL-PREC-01",
      imageUrl: "/images/products/balanca.jpg",
      sales: 29,
      rating: 4.8
    },
    {
      id: 6,
      name: "Frasco de Vidro Âmbar 10ml",
      description: "Frasco pequeno de vidro âmbar com tampa conta-gotas, ideal para amostras, testes e preparações em volumes reduzidos.",
      price: 5.50,
      stock: 685,
      category: "frascos",
      status: "active",
      sku: "FRSC-AMB-10",
      imageUrl: "/images/products/frasco-10ml.jpg",
      sales: 231,
      rating: 4.4
    },
    {
      id: 7,
      name: "Óleo de Milho Farmacêutico",
      description: "Óleo de milho refinado para uso farmacêutico, ideal como veículo para formulações de medicamentos e extratos.",
      price: 85.00,
      stock: 35,
      category: "oleos",
      status: "active",
      sku: "OL-MLH-1000",
      imageUrl: "/images/products/corn-oil.jpg",
      sales: 45,
      rating: 4.3
    },
    {
      id: 8,
      name: "Kit Vidraria Laboratório Básico",
      description: "Kit de vidrarias essenciais para laboratório, incluindo béqueres, provetas, erlenmeyers e funis de diferentes tamanhos.",
      price: 450.00,
      stock: 0,
      category: "vidraria",
      status: "out_of_stock",
      sku: "VID-LAB-KIT",
      imageUrl: "/images/products/vidraria.jpg",
      sales: 18,
      rating: 4.9
    },
    {
      id: 9, 
      name: "Manual de Boas Práticas Laboratoriais",
      description: "Guia completo sobre procedimentos, normas técnicas e boas práticas para laboratórios farmacêuticos e de manipulação.",
      price: 120.00,
      stock: 10,
      category: "livros",
      status: "active",
      sku: "LIV-BPL-01",
      imageUrl: "/images/products/manual-bpl.jpg",
      sales: 23,
      rating: 4.6
    },
    {
      id: 10,
      name: "Alcool de Cereais 1L",
      description: "Álcool etílico de cereais 96°GL, ideal para extrações e preparações farmacêuticas de alta pureza.",
      price: 38.00,
      stock: 8,
      category: "insumos",
      status: "low_stock",
      sku: "ALC-CER-1L",
      imageUrl: "/images/products/alcool.jpg",
      sales: 71,
      rating: 4.7
    },
    {
      id: 11,
      name: "Sistema de Irrigação Automático",
      description: "Sistema completo de irrigação por gotejamento com timer programável para cultivo controlado em laboratório.",
      price: 375.00,
      stock: 0,
      category: "cultivo",
      status: "draft",
      sku: "IRG-AUTO-01",
      sales: 0
    },
    {
      id: 12,
      name: "Medidor de pH Digital",
      description: "Medidor de pH digital de alta precisão para análise e controle de soluções em laboratório.",
      price: 189.90,
      stock: 15,
      category: "equipamentos",
      status: "active",
      sku: "PHMT-DIG-01",
      imageUrl: "/images/products/phmetro.jpg",
      sales: 37,
      rating: 4.5
    }
  ];

  // Categorias disponíveis
  const categories = [
    { id: "frascos", name: "Frascos e Embalagens" },
    { id: "oleos", name: "Óleos e Veículos" },
    { id: "insumos", name: "Insumos Laboratoriais" },
    { id: "vidraria", name: "Vidraria" },
    { id: "equipamentos", name: "Equipamentos" },
    { id: "cultivo", name: "Cultivo e Irrigação" },
    { id: "paramentacao", name: "Paramentação" },
    { id: "livros", name: "Livros e Manuais" }
  ];

  // Obter nome da categoria a partir do ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-50 text-green-700 border-green-200";
      case "inactive": return "bg-gray-50 text-gray-700 border-gray-200";
      case "out_of_stock": return "bg-red-50 text-red-700 border-red-200";
      case "low_stock": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "draft": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      case "out_of_stock": return "Sem Estoque";
      case "low_stock": return "Estoque Baixo";
      case "draft": return "Rascunho";
      default: return status;
    }
  };

  // Processar dados da API ou usar dados simulados
  const getProductsData = () => {
    if (productsResponse?.success && productsResponse?.data) {
      return productsResponse.data;
    }
    return products; // Dados simulados até API ser concluída
  };
  
  const getCategoriesData = () => {
    if (categoriesResponse?.success && categoriesResponse?.data) {
      return categoriesResponse.data;
    }
    return categories; // Dados simulados até API ser concluída
  };
  
  // Filtragem de produtos já é feita pela API
  const displayProducts = getProductsData();
  
  // Abrir detalhes do produto
  const openProductDetails = (product: Product, edit: boolean = false) => {
    setSelectedProduct(product);
    setEditMode(edit);
    setShowProductDetails(true);
  };

  // Fechar detalhes do produto
  const closeProductDetails = () => {
    setSelectedProduct(null);
    setEditMode(false);
    setShowProductDetails(false);
  };

  // Adicionar produto
  const addProduct = (formData: FormData) => {
    addProductMutation.mutate(formData);
  };

  // Salvar alterações do produto
  const saveProductChanges = (formData: FormData) => {
    if (!selectedProduct) return;
    updateProductMutation.mutate({ id: selectedProduct.id, data: formData });
  };

  // Remover produto
  const removeProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };

  // Alterar status do produto
  const changeProductStatus = (productId: number, status: string) => {
    updateProductStatusMutation.mutate({ id: productId, status });
  };

  return (
    <div>
      <div className="pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos e controle o estoque.</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)} className="bg-red-700 hover:bg-red-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar produtos por nome, descrição ou SKU" 
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
                  <SelectLabel>Status do Produto</SelectLabel>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categorias</SelectLabel>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
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
              <Badge className="ml-2 bg-gray-200 text-gray-700">
                {productsResponse?.pagination?.total || displayProducts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setFilter("active")}>
              Ativos
              <Badge className="ml-2 bg-green-100 text-green-700">
                {filter === "active" ? (productsResponse?.pagination?.total || 0) : "..."}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="low_stock" onClick={() => setFilter("low_stock")}>
              Estoque Baixo
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                {filter === "low_stock" ? (productsResponse?.pagination?.total || 0) : "..."}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="draft" onClick={() => setFilter("draft")}>
              Rascunhos
              <Badge className="ml-2 bg-blue-100 text-blue-700">
                {filter === "draft" ? (productsResponse?.pagination?.total || 0) : "..."}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Estado de carregamento */}
        {isLoadingProducts && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Carregando produtos...</p>
          </div>
        )}
        
        {/* Grid de produtos */}
        {!isLoadingProducts && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {product.featuredImage ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <img 
                          src={product.featuredImage} 
                          alt={product.name} 
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.classList.add('hidden');
                            e.currentTarget.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center h-full w-full"><svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 1L8 5h8l-2-4"/></svg><span class="text-xs text-gray-500 mt-2">Erro ao carregar imagem</span></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Package2 className="h-12 w-12 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <Badge className={`absolute top-2 right-2 ${getStatusColor(product.status)}`}>
                    {getStatusText(product.status)}
                  </Badge>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-600 text-white">
                      -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-gray-50">
                      {product.tags && product.tags.length > 0 ? product.tags[0] : "Sem categoria"}
                    </Badge>
                    <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.shortDescription}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {product.compareAtPrice && product.compareAtPrice > product.price ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-red-700">
                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            R$ {product.compareAtPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-red-700">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Estoque: <span className={product.inventory === 0 ? "text-red-600 font-bold" : product.inventory < 10 ? "text-yellow-600 font-bold" : ""}>
                        {product.inventory}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => openProductDetails(product)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detalhes
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openProductDetails(product, true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {product.status === "active" ? (
                        <DropdownMenuItem onClick={() => changeProductStatus(product.id, "inactive")}>
                          <Archive className="mr-2 h-4 w-4" />
                          Desativar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => changeProductStatus(product.id, "active")}>
                          <Check className="mr-2 h-4 w-4" />
                          Ativar
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
            
            {/* Card de adicionar novo produto */}
            <Card className="overflow-hidden border-dashed border-2 hover:border-red-300 hover:bg-red-50/30 transition-colors cursor-pointer" onClick={() => setShowAddProduct(true)}>
              <div className="h-full flex flex-col items-center justify-center p-6 min-h-[320px]">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <PlusCircle className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="font-medium text-lg mb-2 text-center">Adicionar Novo Produto</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Clique aqui para adicionar um novo produto ao seu catálogo
                </p>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                  Adicionar Produto
                </Button>
              </div>
            </Card>
            
            {/* Mensagem de nenhum produto encontrado */}
            {displayProducts.length === 0 && !isLoadingProducts && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <Package2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Não foram encontrados produtos com os filtros selecionados.
                </p>
                <Button variant="outline" onClick={() => { setFilter("all"); setCategoryFilter("all"); setSearchQuery(""); }}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal para adicionar novo produto */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo produto para adicioná-lo ao seu catálogo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nome do Produto *</Label>
                <Input id="product-name" placeholder="Ex: Extrato CBD 10%" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU *</Label>
                <Input id="product-sku" placeholder="Ex: CBD-EXT-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-description">Descrição *</Label>
              <Textarea id="product-description" placeholder="Descrição detalhada do produto" className="min-h-[100px]" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">Preço (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="product-price" type="number" min="0" step="0.01" className="pl-10" placeholder="0,00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Estoque *</Label>
                <Input id="product-stock" type="number" min="0" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Categoria *</Label>
                <Select>
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center mb-2">
                  Arraste e solte uma imagem aqui, ou clique para selecionar
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG ou GIF (máx. 2MB)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Cancelar
            </Button>
            <Button onClick={addProduct} className="bg-red-700 hover:bg-red-800">
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes/edição do produto */}
      {selectedProduct && (
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Editar Produto" : "Detalhes do Produto"}
              </DialogTitle>
              <DialogDescription>
                {editMode 
                  ? "Edite as informações do produto conforme necessário."
                  : "Informações detalhadas sobre o produto."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  {editMode ? (
                    <Input id="edit-name" defaultValue={selectedProduct.name} />
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">{selectedProduct.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  {editMode ? (
                    <Input id="edit-sku" defaultValue={selectedProduct.sku} />
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">{selectedProduct.sku}</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                {editMode ? (
                  <Textarea id="edit-description" defaultValue={selectedProduct.description} className="min-h-[100px]" />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50 min-h-[100px]">{selectedProduct.description}</div>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (R$)</Label>
                  {editMode ? (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="edit-price" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        className="pl-10" 
                        defaultValue={selectedProduct.price} 
                      />
                    </div>
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">
                      R$ {selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Estoque</Label>
                  {editMode ? (
                    <Input id="edit-stock" type="number" min="0" defaultValue={selectedProduct.stock} />
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">{selectedProduct.stock}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  {editMode ? (
                    <Select defaultValue={selectedProduct.category}>
                      <SelectTrigger id="edit-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">{getCategoryName(selectedProduct.category)}</div>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  {editMode ? (
                    <Select defaultValue={selectedProduct.status}>
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                        <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md bg-gray-50">
                      <Badge className={getStatusColor(selectedProduct.status)}>
                        {getStatusText(selectedProduct.status)}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sales">Vendas</Label>
                  <div className="p-2 border rounded-md bg-gray-50">{selectedProduct.sales}</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rating">Avaliação</Label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    {selectedProduct.rating ? `${selectedProduct.rating}/5.0` : "Sem avaliações"}
                  </div>
                </div>
              </div>
              
              {editMode && (
                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    {selectedProduct.imageUrl ? (
                      <div className="text-center">
                        <div className="bg-gray-200 w-32 h-32 mx-auto mb-2 flex items-center justify-center">
                          <Package2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-700">imagem-atual.jpg</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="mr-2 h-4 w-4" />
                          Trocar Imagem
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center mb-2">
                          Arraste e solte uma imagem aqui, ou clique para selecionar
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG ou GIF (máx. 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between w-full gap-3">
                <Button variant="outline" onClick={closeProductDetails}>
                  {editMode ? "Cancelar" : "Fechar"}
                </Button>
                
                <div className="flex gap-3">
                  {editMode ? (
                    <Button onClick={saveProductChanges} className="bg-red-700 hover:bg-red-800">
                      Salvar Alterações
                    </Button>
                  ) : (
                    <div>
                      <Button variant="destructive" onClick={() => removeProduct(selectedProduct.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                      <Button onClick={() => setEditMode(true)} className="bg-red-700 hover:bg-red-800">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}