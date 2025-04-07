import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Search,
  Plus,
  FileUp,
  FileDown,
  Package,
  BarChart,
  AlertTriangle,
  Warehouse,
  Truck,
  MoreHorizontal,
  RefreshCw,
  Edit,
  ArrowDownUp,
  PlusCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados de exemplo para estoque de expedição
const mockInventory = [
  { 
    id: "EXP-001",
    nome: "Caixa de Papelão P",
    categoria: "embalagem",
    quantidade: 150,
    quantidadeMinima: 50,
    status: "disponivel",
    localizacao: "Prateleira A-1",
    ultimaAtualizacao: "07/04/2025",
    preco: "R$ 2,50"
  },
  { 
    id: "EXP-002",
    nome: "Caixa de Papelão M",
    categoria: "embalagem",
    quantidade: 120,
    quantidadeMinima: 40,
    status: "disponivel",
    localizacao: "Prateleira A-2",
    ultimaAtualizacao: "07/04/2025",
    preco: "R$ 3,50"
  },
  { 
    id: "EXP-003",
    nome: "Caixa de Papelão G",
    categoria: "embalagem",
    quantidade: 80,
    quantidadeMinima: 30,
    status: "disponivel",
    localizacao: "Prateleira A-3",
    ultimaAtualizacao: "07/04/2025",
    preco: "R$ 4,50"
  },
  { 
    id: "EXP-004",
    nome: "Fita Adesiva Transparente",
    categoria: "suprimento",
    quantidade: 35,
    quantidadeMinima: 30,
    status: "baixo",
    localizacao: "Prateleira B-1",
    ultimaAtualizacao: "06/04/2025",
    preco: "R$ 8,90"
  },
  { 
    id: "EXP-005",
    nome: "Saco Plástico Bolha P",
    categoria: "embalagem",
    quantidade: 200,
    quantidadeMinima: 50,
    status: "disponivel",
    localizacao: "Prateleira B-2",
    ultimaAtualizacao: "06/04/2025",
    preco: "R$ 0,75"
  },
  { 
    id: "EXP-006",
    nome: "Etiquetas Adesivas",
    categoria: "suprimento",
    quantidade: 10,
    quantidadeMinima: 20,
    status: "critico",
    localizacao: "Prateleira C-1",
    ultimaAtualizacao: "05/04/2025",
    preco: "R$ 15,00"
  },
  { 
    id: "EXP-007",
    nome: "Envelopes Acolchoados",
    categoria: "embalagem",
    quantidade: 65,
    quantidadeMinima: 30,
    status: "disponivel",
    localizacao: "Prateleira C-2",
    ultimaAtualizacao: "05/04/2025",
    preco: "R$ 1,25"
  },
  { 
    id: "EXP-008",
    nome: "Lacre de Segurança",
    categoria: "suprimento",
    quantidade: 90,
    quantidadeMinima: 40,
    status: "disponivel",
    localizacao: "Prateleira D-1",
    ultimaAtualizacao: "04/04/2025",
    preco: "R$ 0,50"
  }
];

// Categorias de produtos
const productCategories = [
  "embalagem",
  "suprimento",
  "equipamento",
  "outros"
];

export default function EstoqueExpedicao() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar itens com base na guia selecionada e no termo de pesquisa
  const filteredItems = mockInventory.filter(item => {
    // Filtro de status
    if (selectedTab === "disponiveis" && item.status !== "disponivel") return false;
    if (selectedTab === "baixo_estoque" && item.status !== "baixo") return false;
    if (selectedTab === "criticos" && item.status !== "critico") return false;
    
    // Filtro de categoria
    if (selectedCategoria && selectedCategoria !== "all" && item.categoria !== selectedCategoria) return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.id.toLowerCase().includes(searchLower) ||
        item.nome.toLowerCase().includes(searchLower) ||
        item.localizacao.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Calcular estatísticas
  const totalItens = filteredItems.reduce((acc, item) => acc + item.quantidade, 0);
  const itensBaixoEstoque = mockInventory.filter(item => item.status === "baixo").length;
  const itensCriticos = mockInventory.filter(item => item.status === "critico").length;

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={() => navigateTo("/organization/expedicao")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Estoque da Expedição</h1>
            <p className="text-muted-foreground mt-1">
              Controle materiais e suprimentos utilizados na expedição
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <FileUp className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>

        {/* Estatísticas de Estoque */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Itens</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockInventory.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Package className="h-3 w-3 inline mr-1" />
                  {totalItens} unidades em estoque
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Estoque Disponível</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockInventory.filter(item => item.status === "disponivel").length}
                  </span>
                </div>
                <div className="mt-4 text-green-600 text-xs">
                  <Warehouse className="h-3 w-3 inline mr-1" />
                  Itens com quantidade adequada
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Estoque Baixo</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {itensBaixoEstoque}
                  </span>
                </div>
                <div className="mt-4 text-amber-600 text-xs">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Itens próximos ao mínimo
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Estoque Crítico</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {itensCriticos}
                  </span>
                </div>
                <div className="mt-4 text-red-600 text-xs">
                  <Truck className="h-3 w-3 inline mr-1" />
                  Itens que precisam de reposição
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ID ou localização..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="whitespace-nowrap">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Estoque
            </Button>
          </div>
        </div>

        {/* Tabs de categorias */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos os Itens</TabsTrigger>
            <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
            <TabsTrigger value="baixo_estoque">Estoque Baixo</TabsTrigger>
            <TabsTrigger value="criticos">Críticos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="space-y-4">
            {/* Tabela de estoque */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome do Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}</TableCell>
                          <TableCell>{item.localizacao}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium">{item.quantidade}</span>
                              <span className="text-xs text-muted-foreground ml-1">
                                (Min: {item.quantidadeMinima})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${item.status === "disponivel" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                ${item.status === "baixo" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                ${item.status === "critico" ? "bg-red-50 text-red-700 hover:bg-red-50" : ""}
                              `}
                            >
                              {item.status === "disponivel" ? "Disponível" : 
                              item.status === "baixo" ? "Estoque Baixo" : 
                              "Crítico"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.preco}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ArrowDownUp className="h-4 w-4 mr-2" />
                                    Movimentar estoque
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Adicionar ao pedido
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Nenhum item encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filteredItems.length} de {mockInventory.length} itens
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={filteredItems.length === 0}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredItems.length === 0}>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações rápidas */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Adicionar Item</h3>
                  <p className="text-xs text-muted-foreground">Cadastrar novo item no estoque</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <ArrowDownUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Movimentação</h3>
                  <p className="text-xs text-muted-foreground">Registrar entrada ou saída</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Relatórios</h3>
                  <p className="text-xs text-muted-foreground">Gerar relatórios de estoque</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Solicitar Compra</h3>
                  <p className="text-xs text-muted-foreground">Criar solicitação de compra</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}