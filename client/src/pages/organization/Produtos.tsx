import React, { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, Download, Eye, Edit, Trash2, Plus,
  Package, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal,
  CheckCircle, AlertCircle, Trash, Copy, Tag, BarChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useToast } from "@/hooks/use-toast";

// Dados simulados dos produtos
const produtos = [
  {
    id: 1,
    nome: "Óleo Essencial de Lavanda",
    preco: 89.90,
    estoque: 45,
    categoria: "Óleos Essenciais",
    sku: "OE-LAV-100",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=Lavanda",
    descricao: "Óleo essencial de lavanda 100% puro, extraído a frio. Ideal para aromaterapia e relaxamento.",
    peso: "30g",
    dimensoes: "5 x 5 x 10 cm",
    dataInclusao: "02/01/2025",
    vendas: 124
  },
  {
    id: 2,
    nome: "Crème de CBD 500mg",
    preco: 159.90,
    estoque: 32,
    categoria: "Terapêuticos",
    sku: "CBD-CRM-500",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=CBD",
    descricao: "Creme terapêutico com CBD para alívio de dores musculares e inflamações.",
    peso: "50g",
    dimensoes: "6 x 6 x 12 cm",
    dataInclusao: "15/01/2025",
    vendas: 98
  },
  {
    id: 3,
    nome: "Chá de Camomila Orgânico",
    preco: 28.50,
    estoque: 120,
    categoria: "Chás",
    sku: "CHA-CAM-50",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=Camomila",
    descricao: "Chá de camomila 100% orgânico. Propriedades calmantes e relaxantes.",
    peso: "50g",
    dimensoes: "10 x 5 x 15 cm",
    dataInclusao: "10/02/2025",
    vendas: 87
  },
  {
    id: 4,
    nome: "Proteína Vegana",
    preco: 120.00,
    estoque: 65,
    categoria: "Suplementos",
    sku: "SUP-PROT-500",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=Proteína",
    descricao: "Proteína vegana à base de ervilha, arroz e cânhamo. Sem glúten e lactose.",
    peso: "500g",
    dimensoes: "10 x 10 x 20 cm",
    dataInclusao: "05/02/2025",
    vendas: 76
  },
  {
    id: 5,
    nome: "Ômega 3 1000mg",
    preco: 65.90,
    estoque: 85,
    categoria: "Suplementos",
    sku: "SUP-OMG-60",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=Ômega3",
    descricao: "Suplemento de Ômega 3 extraído de algas marinhas. 100% vegano.",
    peso: "100g",
    dimensoes: "5 x 5 x 10 cm",
    dataInclusao: "20/01/2025",
    vendas: 62
  },
  {
    id: 6,
    nome: "Vitamina D3 2000UI",
    preco: 45.90,
    estoque: 5,
    categoria: "Suplementos",
    sku: "SUP-VITD-60",
    status: "Baixo Estoque",
    imagem: "https://placehold.co/100x100/f59e0b/white?text=VitD",
    descricao: "Vitamina D3 de origem vegetal para manutenção da saúde óssea.",
    peso: "70g",
    dimensoes: "5 x 5 x 10 cm",
    dataInclusao: "10/03/2025",
    vendas: 43
  },
  {
    id: 7,
    nome: "Óleo de Coco Extravirgem",
    preco: 39.90,
    estoque: 0,
    categoria: "Óleos Essenciais",
    sku: "OL-COC-250",
    status: "Esgotado",
    imagem: "https://placehold.co/100x100/ef4444/white?text=Coco",
    descricao: "Óleo de coco extravirgem prensado a frio, não refinado.",
    peso: "250ml",
    dimensoes: "7 x 7 x 12 cm",
    dataInclusao: "15/02/2025",
    vendas: 38
  },
  {
    id: 8,
    nome: "Colágeno Hidrolisado",
    preco: 89.00,
    estoque: 15,
    categoria: "Suplementos",
    sku: "SUP-COL-300",
    status: "Ativo",
    imagem: "https://placehold.co/100x100/49de80/white?text=Colágeno",
    descricao: "Colágeno hidrolisado tipo 1 e 3 para pele, cabelos e articulações.",
    peso: "300g",
    dimensoes: "10 x 10 x 15 cm",
    dataInclusao: "25/01/2025",
    vendas: 56
  }
];

// Categorias para filtro e para o formulário
const categorias = [
  "Todos",
  "Óleos Essenciais",
  "Terapêuticos",
  "Chás",
  "Suplementos"
];

export default function Produtos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedProduto, setSelectedProduto] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Status para as badges de produtos
  const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
    "Ativo": { 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> 
    },
    "Baixo Estoque": { 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300", 
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> 
    },
    "Esgotado": { 
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
      icon: <Trash className="h-3.5 w-3.5 mr-1" /> 
    }
  };

  // Filtragem por termo de busca, categoria e status
  const filteredProdutos = produtos.filter(produto => {
    const matchesTerm = searchTerm === "" || 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "Todos" || produto.categoria === categoryFilter;
    const matchesStatus = statusFilter === "Todos" || produto.status === statusFilter;
    
    return matchesTerm && matchesCategory && matchesStatus;
  });

  // Paginação
  const pageCount = Math.ceil(filteredProdutos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProdutos = filteredProdutos.slice(startIndex, startIndex + itemsPerPage);

  // Abrir modal de detalhes
  const handleViewProduto = (produto: any) => {
    setSelectedProduto(produto);
    setIsViewDialogOpen(true);
  };

  // Abrir modal de formulário para adicionar/editar
  const handleEditProduto = (produto: any) => {
    setSelectedProduto(produto);
    setFormMode("edit");
    setIsFormDialogOpen(true);
  };

  const handleAddProduto = () => {
    setSelectedProduto(null);
    setFormMode("add");
    setIsFormDialogOpen(true);
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteConfirm = (produto: any) => {
    setSelectedProduto(produto);
    setIsDeleteDialogOpen(true);
  };

  // Simular salvar produto
  const handleSaveProduto = () => {
    toast({
      title: formMode === "add" ? "Produto adicionado" : "Produto atualizado",
      description: formMode === "add" 
        ? "O produto foi adicionado com sucesso." 
        : "As alterações foram salvas com sucesso.",
      variant: "default",
    });
    setIsFormDialogOpen(false);
  };

  // Simular excluir produto
  const handleDeleteProduto = () => {
    toast({
      title: "Produto excluído",
      description: "O produto foi excluído com sucesso.",
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
  };

  // Navegar pelas páginas
  const nextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seu catálogo de produtos, preços e estoque
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <BarChart className="mr-2 h-4 w-4" />
              Análise
            </Button>
            <Button 
              className="h-9 bg-green-600 hover:bg-green-700"
              onClick={handleAddProduto}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou SKU..." 
              className="pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Baixo Estoque">Baixo Estoque</SelectItem>
                <SelectItem value="Esgotado">Esgotado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              setSearchTerm("");
              setCategoryFilter("Todos");
              setStatusFilter("Todos");
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Grid de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProdutos.length > 0 ? (
            paginatedProdutos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden">
                <div className="flex h-48 bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={produto.imagem} 
                    alt={produto.nome}
                    className="object-contain w-full"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold truncate">{produto.nome}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{produto.categoria}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`flex items-center ${statusConfig[produto.status]?.color}`}
                    >
                      {statusConfig[produto.status]?.icon}
                      {produto.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-lg font-bold">R$ {produto.preco.toFixed(2)}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Estoque: </span>
                        <span className={produto.estoque === 0 ? "text-red-500" : (produto.estoque < 10 ? "text-amber-500" : "")}>
                          {produto.estoque}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleViewProduto(produto)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditProduto(produto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewProduto(produto)}>
                            <Eye className="h-4 w-4 mr-2" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduto(produto)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="h-4 w-4 mr-2" /> Adicionar promoção
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteConfirm(produto)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-10">
              <div className="flex flex-col items-center justify-center text-center">
                <Package className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tente ajustar os filtros ou adicione um novo produto.
                </p>
                <Button onClick={handleAddProduto}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Paginação */}
        {filteredProdutos.length > itemsPerPage && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredProdutos.length)}
              </span> de <span className="font-medium">{filteredProdutos.length}</span> produtos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === pageCount}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Detalhes do Produto */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
            <DialogDescription>
              Informações completas sobre o produto
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-2 flex items-center justify-center h-full">
                    <img 
                      src={selectedProduto.imagem} 
                      alt={selectedProduto.nome}
                      className="object-contain max-h-40 mx-auto"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold">{selectedProduto.nome}</h2>
                  
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge 
                      variant="outline"
                      className={`flex items-center ${statusConfig[selectedProduto.status]?.color}`}
                    >
                      {statusConfig[selectedProduto.status]?.icon}
                      {selectedProduto.status}
                    </Badge>
                    
                    <Badge variant="outline">{selectedProduto.categoria}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    SKU: {selectedProduto.sku}
                  </p>
                  
                  <p className="mt-3 text-sm">{selectedProduto.descricao}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="text-lg font-bold">R$ {selectedProduto.preco.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque</p>
                      <p className="text-lg font-bold">{selectedProduto.estoque} unidades</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="detalhes">
                <TabsList className="w-full">
                  <TabsTrigger value="detalhes" className="flex-1">Detalhes</TabsTrigger>
                  <TabsTrigger value="vendas" className="flex-1">Histórico de Vendas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="detalhes" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Informações Básicas</p>
                        <div className="rounded-md border p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">SKU:</span>
                            <span className="text-sm font-medium">{selectedProduto.sku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Categoria:</span>
                            <span className="text-sm">{selectedProduto.categoria}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge 
                              variant="outline"
                              className={`flex items-center ${statusConfig[selectedProduto.status]?.color}`}
                            >
                              {statusConfig[selectedProduto.status]?.icon}
                              {selectedProduto.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Data de Inclusão:</span>
                            <span className="text-sm">{selectedProduto.dataInclusao}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Dimensões e Peso</p>
                        <div className="rounded-md border p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Peso:</span>
                            <span className="text-sm">{selectedProduto.peso}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Dimensões:</span>
                            <span className="text-sm">{selectedProduto.dimensoes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Descrição</p>
                      <div className="rounded-md border p-3">
                        <p className="text-sm">{selectedProduto.descricao}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="vendas" className="pt-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Total de vendas: <span className="font-bold">{selectedProduto.vendas} unidades</span></p>
                      <Button variant="outline" size="sm">
                        <BarChart className="h-4 w-4 mr-2" />
                        Ver análise detalhada
                      </Button>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Vendas nos últimos 30 dias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] flex items-center justify-center">
                          <p className="text-muted-foreground">Gráfico de vendas seria exibido aqui</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedProduto && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditProduto(selectedProduto);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Produto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Formulário - Adicionar/Editar Produto */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Adicionar Novo Produto" : "Editar Produto"}</DialogTitle>
            <DialogDescription>
              {formMode === "add" 
                ? "Preencha as informações para adicionar um novo produto ao catálogo" 
                : "Atualize as informações do produto"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="info-basicas">
              <TabsList className="w-full">
                <TabsTrigger value="info-basicas" className="flex-1">Informações Básicas</TabsTrigger>
                <TabsTrigger value="descricao" className="flex-1">Descrição</TabsTrigger>
                <TabsTrigger value="estoque-preco" className="flex-1">Estoque e Preço</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info-basicas" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input 
                      id="nome" 
                      placeholder="Nome do produto" 
                      defaultValue={selectedProduto?.nome || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      placeholder="Código único do produto" 
                      defaultValue={selectedProduto?.sku || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select defaultValue={selectedProduto?.categoria || categorias[1]}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.slice(1).map(categoria => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="peso">Peso</Label>
                    <Input 
                      id="peso" 
                      placeholder="Ex: 100g" 
                      defaultValue={selectedProduto?.peso || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dimensoes">Dimensões</Label>
                    <Input 
                      id="dimensoes" 
                      placeholder="Ex: 10 x 5 x 2 cm" 
                      defaultValue={selectedProduto?.dimensoes || ""} 
                    />
                  </div>
                  
                  <div className="col-span-full">
                    <Label htmlFor="imagem">Imagem do Produto</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {selectedProduto?.imagem && (
                        <div className="h-20 w-20 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
                          <img 
                            src={selectedProduto.imagem} 
                            alt={selectedProduto.nome}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <Button variant="outline">Selecionar Imagem</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="descricao" className="pt-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="descricao">Descrição do Produto</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descreva o produto de forma detalhada" 
                      className="min-h-32" 
                      defaultValue={selectedProduto?.descricao || ""} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Atributos Adicionais</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox id="organico" />
                      <Label htmlFor="organico" className="text-sm font-normal">Produto Orgânico</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="vegano" />
                      <Label htmlFor="vegano" className="text-sm font-normal">Produto Vegano</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="glutenfree" />
                      <Label htmlFor="glutenfree" className="text-sm font-normal">Sem Glúten</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="estoque-preco" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input 
                      id="preco" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      defaultValue={selectedProduto?.preco || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preco_promocional">Preço Promocional (R$)</Label>
                    <Input 
                      id="preco_promocional" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estoque">Quantidade em Estoque</Label>
                    <Input 
                      id="estoque" 
                      type="number" 
                      placeholder="0" 
                      defaultValue={selectedProduto?.estoque || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="alerta_estoque">Alerta de Estoque Baixo</Label>
                    <Input 
                      id="alerta_estoque" 
                      type="number" 
                      placeholder="5" 
                      defaultValue="10" 
                    />
                  </div>
                  
                  <div className="col-span-full">
                    <div className="flex items-center gap-2">
                      <Checkbox id="controle_estoque" defaultChecked />
                      <Label htmlFor="controle_estoque" className="text-sm font-normal">
                        Controlar estoque deste produto
                      </Label>
                    </div>
                  </div>
                  
                  <div className="col-span-full">
                    <div className="flex items-center gap-2">
                      <Checkbox id="produto_ativo" defaultChecked={selectedProduto?.status !== "Esgotado"} />
                      <Label htmlFor="produto_ativo" className="text-sm font-normal">
                        Produto ativo (visível na loja)
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveProduto}
            >
              {formMode === "add" ? "Adicionar Produto" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="flex items-center gap-4 py-4">
              <div className="h-16 w-16 rounded-md bg-slate-100 dark:bg-slate-800 p-1 flex-shrink-0">
                <img 
                  src={selectedProduto.imagem} 
                  alt={selectedProduto.nome}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedProduto.nome}</h3>
                <p className="text-sm text-muted-foreground">SKU: {selectedProduto.sku}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProduto}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}