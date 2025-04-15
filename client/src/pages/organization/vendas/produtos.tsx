import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Edit, 
  Eye, 
  Trash,
  SquarePen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';

// Dados de exemplo
const produtos = [
  {
    produto: 'Cápsulas CBD 30mg',
    sku: 'CBD-CAP-30',
    categoria: 'cápsula',
    preco: 'R$ 99,90',
    estoque: '120 unidades',
    status: 'Ativo',
  },
  {
    produto: 'Creme Tópico CBD',
    sku: 'CBD-CREME-TOP',
    categoria: 'tópico',
    preco: 'R$ 89,90',
    estoque: '60 unidades',
    status: 'Ativo',
  },
  {
    produto: 'Extrato Full Spectrum 10ml',
    sku: 'CBD-EXT-FS-10',
    categoria: 'extrato',
    preco: 'R$ 189,90',
    estoque: '18 unidades',
    status: 'Estoque baixo',
  },
  {
    produto: 'Óleo CBD 10% 30ml',
    sku: 'CBD-OL-10-30',
    categoria: 'óleo',
    preco: 'R$ 249,90',
    estoque: '22 unidades',
    status: 'Ativo',
  },
  {
    produto: 'Óleo CBD 5% 30ml',
    sku: 'CBD-OL-5-30',
    categoria: 'óleo',
    preco: 'R$ 149,90',
    estoque: '0 unidades',
    status: 'Esgotado',
  },
  {
    produto: 'Pomada Canabidiol 50g',
    sku: 'CBD-POM-50',
    categoria: 'tópico',
    preco: 'R$ 79,90',
    estoque: '35 unidades',
    status: 'Ativo',
  },
  {
    produto: 'Spray Sublingual THC/CBD',
    sku: 'CBD-SPRAY-SUB',
    categoria: 'óleo',
    preco: 'R$ 159,90',
    estoque: '45 unidades',
    status: 'Ativo',
  },
];

// Função para obter a cor do status do produto
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ativo':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Estoque baixo':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Esgotado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  // Use React Query para buscar os produtos
  const { data: produtosData, isLoading } = useQuery({
    queryKey: ['/api/vendas/produtos'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = searchTerm === '' || 
      produto.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'ativos' && produto.status === 'Ativo') ||
      (activeTab === 'estoque-baixo' && produto.status === 'Estoque baixo') ||
      (activeTab === 'esgotados' && produto.status === 'Esgotado');
    
    return matchesSearch && matchesTab;
  });

  const handleCreateProduct = () => {
    toast({
      title: "Novo produto",
      description: "Criando novo produto",
    });
  };

  const handleViewProduct = (sku: string) => {
    toast({
      title: "Visualizando produto",
      description: `Abrindo detalhes do produto ${sku}`,
    });
  };

  const handleEditProduct = (sku: string) => {
    toast({
      title: "Editando produto",
      description: `Editando produto ${sku}`,
    });
  };

  const handleDeleteProduct = (sku: string) => {
    toast({
      title: "Confirmação necessária",
      description: `Deseja realmente excluir o produto ${sku}?`,
      variant: "destructive",
    });
  };

  const handleExportProducts = () => {
    toast({
      title: "Exportar produtos",
      description: "Iniciando exportação da lista de produtos",
    });
  };

  const handleImportProducts = () => {
    toast({
      title: "Importar produtos",
      description: "Selecione um arquivo CSV ou Excel para importar",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleExportProducts}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleImportProducts}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto por nome, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs defaultValue="todos" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="ativos">Ativos</TabsTrigger>
                <TabsTrigger value="estoque-baixo">Estoque Baixo</TabsTrigger>
                <TabsTrigger value="esgotados">Esgotados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium">Produto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">
                    <div className="flex items-center">
                      Categoria
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium">
                    <div className="flex items-center">
                      Preço
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Estoque</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((produto, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2 text-gray-500">
                          <SquarePen className="h-4 w-4" />
                        </div>
                        <span>{produto.produto}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{produto.sku}</td>
                    <td className="py-3 px-4 capitalize">{produto.categoria}</td>
                    <td className="py-3 px-4">{produto.preco}</td>
                    <td className="py-3 px-4">{produto.estoque}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(produto.status)}>
                        {produto.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProduct(produto.sku)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(produto.sku)}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProduct(produto.sku)} className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredProdutos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      Nenhum produto encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}