import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  MoreHorizontal,
  ChevronDown,
  BarChart4,
  RefreshCw,
  PackagePlus,
  FileText,
  Truck,
  Archive,
  ShoppingCart,
  Boxes,
  Box,
  Plus,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Dados simulados de produtos em estoque
const estoqueProdutos = [
  { 
    id: 1, 
    codigo: "EMB-2535", 
    nome: "Caixa Pequena 15x15x10cm", 
    categoria: "Embalagem", 
    unidade: "Un", 
    quantidade: 157, 
    estoqueMinimo: 50, 
    localizacao: "A1-P3-G2" 
  },
  { 
    id: 2, 
    codigo: "EMB-3040", 
    nome: "Caixa Média 30x40x20cm", 
    categoria: "Embalagem", 
    unidade: "Un", 
    quantidade: 83, 
    estoqueMinimo: 30, 
    localizacao: "A1-P4-G1" 
  },
  { 
    id: 3, 
    codigo: "ETQ-1015", 
    nome: "Etiqueta Adesiva 10x15cm", 
    categoria: "Etiqueta", 
    unidade: "Rolo", 
    quantidade: 42, 
    estoqueMinimo: 10, 
    localizacao: "A2-P1-G3" 
  },
  { 
    id: 4, 
    codigo: "BUB-1000", 
    nome: "Plástico Bolha 1m x 100m", 
    categoria: "Proteção", 
    unidade: "Rolo", 
    quantidade: 12, 
    estoqueMinimo: 5, 
    localizacao: "A2-P2-G1" 
  },
  { 
    id: 5, 
    codigo: "FIT-5050", 
    nome: "Fita Adesiva 50mm x 50m", 
    categoria: "Fixação", 
    unidade: "Rolo", 
    quantidade: 67, 
    estoqueMinimo: 20, 
    localizacao: "A3-P1-G2" 
  },
  { 
    id: 6, 
    codigo: "PAP-KRF", 
    nome: "Papel Kraft 120g", 
    categoria: "Proteção", 
    unidade: "Folha", 
    quantidade: 230, 
    estoqueMinimo: 100, 
    localizacao: "A3-P2-G4" 
  },
  { 
    id: 7, 
    codigo: "EMB-4060", 
    nome: "Caixa Grande 40x60x30cm", 
    categoria: "Embalagem", 
    unidade: "Un", 
    quantidade: 28, 
    estoqueMinimo: 15, 
    localizacao: "A1-P5-G3" 
  },
  { 
    id: 8, 
    codigo: "MAL-PP", 
    nome: "Malote de Segurança PP", 
    categoria: "Malote", 
    unidade: "Un", 
    quantidade: 75, 
    estoqueMinimo: 30, 
    localizacao: "A4-P1-G1" 
  },
  { 
    id: 9, 
    codigo: "MAL-G", 
    nome: "Malote de Segurança G", 
    categoria: "Malote", 
    unidade: "Un", 
    quantidade: 45, 
    estoqueMinimo: 20, 
    localizacao: "A4-P1-G2" 
  },
  { 
    id: 10, 
    codigo: "LAC-SEG", 
    nome: "Lacre de Segurança Numerado", 
    categoria: "Segurança", 
    unidade: "Un", 
    quantidade: 320, 
    estoqueMinimo: 100, 
    localizacao: "A4-P2-G3" 
  }
];

// Histórico de movimentações simulado
const historicoMovimentacoes = [
  { 
    id: 1, 
    data: "2025-04-07T10:15:00", 
    tipo: "entrada", 
    produto: "Caixa Média 30x40x20cm", 
    quantidade: 30, 
    usuario: "José Silva" 
  },
  { 
    id: 2, 
    data: "2025-04-07T09:30:00", 
    tipo: "saida", 
    produto: "Etiqueta Adesiva 10x15cm", 
    quantidade: 2, 
    usuario: "Maria Costa" 
  },
  { 
    id: 3, 
    data: "2025-04-06T16:45:00", 
    tipo: "entrada", 
    produto: "Malote de Segurança PP", 
    quantidade: 50, 
    usuario: "José Silva" 
  },
  { 
    id: 4, 
    data: "2025-04-06T14:20:00", 
    tipo: "saida", 
    produto: "Caixa Pequena 15x15x10cm", 
    quantidade: 8, 
    usuario: "Carlos Santos" 
  },
  { 
    id: 5, 
    data: "2025-04-05T11:05:00", 
    tipo: "saida", 
    produto: "Plástico Bolha 1m x 100m", 
    quantidade: 1, 
    usuario: "Ana Oliveira" 
  }
];

export default function EstoqueExpedicao() {
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [exibirBaixoEstoque, setExibirBaixoEstoque] = useState(false);
  
  // Filtragem de produtos
  const produtosFiltrados = estoqueProdutos.filter(produto => {
    // Filtro de baixo estoque
    if (exibirBaixoEstoque && produto.quantidade > produto.estoqueMinimo * 1.2) {
      return false;
    }
    
    // Filtro por categoria
    if (filtroCategoria && produto.categoria !== filtroCategoria) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && !produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !produto.codigo.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Categorias únicas
  const categorias = Array.from(new Set(estoqueProdutos.map(p => p.categoria)));
  
  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Função para obter a cor do status do estoque
  const getEstoqueStatusColor = (quantidade: number, estoqueMinimo: number) => {
    if (quantidade <= estoqueMinimo) {
      return "text-red-600";
    } else if (quantidade <= estoqueMinimo * 1.5) {
      return "text-amber-600";
    } else {
      return "text-green-600";
    }
  };
  
  // Função para obter o progresso do estoque
  const getEstoqueProgress = (quantidade: number, estoqueMinimo: number) => {
    const relacao = quantidade / (estoqueMinimo * 2);
    return Math.min(Math.max(relacao * 100, 0), 100);
  };
  
  // Função para obter a cor do progresso
  const getProgressColor = (quantidade: number, estoqueMinimo: number) => {
    if (quantidade <= estoqueMinimo) {
      return "bg-red-600";
    } else if (quantidade <= estoqueMinimo * 1.5) {
      return "bg-amber-600";
    } else {
      return "bg-green-600";
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Estoque da Expedição</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento de materiais e insumos para expedição
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Itens</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{estoqueProdutos.length}</span>
                  <span className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Boxes className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Categorias</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{categorias.length}</span>
                  <span className="p-2 bg-purple-100 rounded-full text-purple-600">
                    <Archive className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Baixo Estoque</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {estoqueProdutos.filter(p => p.quantidade <= p.estoqueMinimo).length}
                  </span>
                  <span className="p-2 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-2 text-xs text-amber-600">
                  {estoqueProdutos.filter(p => p.quantidade <= p.estoqueMinimo * 1.5 && p.quantidade > p.estoqueMinimo).length} itens próximos do mínimo
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Movimentações</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{historicoMovimentacoes.length}</span>
                  <span className="p-2 bg-green-100 rounded-full text-green-600">
                    <RefreshCw className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  {historicoMovimentacoes.filter(m => m.tipo === "entrada").length} entradas, {' '}
                  {historicoMovimentacoes.filter(m => m.tipo === "saida").length} saídas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Abas */}
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="produtos" className="space-y-4">
            {/* Filtros e busca */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 w-full md:w-auto items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código ou nome..."
                    className="pl-8"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                </div>
                
                <Select
                  value={filtroCategoria}
                  onValueChange={setFiltroCategoria}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant={exibirBaixoEstoque ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExibirBaixoEstoque(!exibirBaixoEstoque)}
                  className={exibirBaixoEstoque ? "bg-amber-600 hover:bg-amber-700" : ""}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Baixo Estoque
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Exibindo {produtosFiltrados.length} de {estoqueProdutos.length} itens
              </div>
            </div>
            
            {/* Tabela de produtos */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.codigo}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria}</Badge>
                      </TableCell>
                      <TableCell>{produto.unidade}</TableCell>
                      <TableCell>{produto.localizacao}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`font-medium ${getEstoqueStatusColor(produto.quantidade, produto.estoqueMinimo)}`}>
                            {produto.quantidade} / {produto.estoqueMinimo} (mín)
                          </span>
                          <Progress 
                            value={getEstoqueProgress(produto.quantidade, produto.estoqueMinimo)} 
                            className={`h-2 mt-1 ${getProgressColor(produto.quantidade, produto.estoqueMinimo)}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {produto.quantidade <= produto.estoqueMinimo ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex w-fit items-center">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            Crítico
                          </Badge>
                        ) : produto.quantidade <= produto.estoqueMinimo * 1.5 ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex w-fit items-center">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            Baixo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex w-fit items-center">
                            <Package className="h-3.5 w-3.5 mr-1" />
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Entrada de estoque</DropdownMenuItem>
                            <DropdownMenuItem>Saída de estoque</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ajuste de estoque</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="movimentacoes" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold">Histórico de Movimentações</h3>
              
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    className="pl-8 w-[250px]"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoMovimentacoes.map((historico) => (
                    <TableRow key={historico.id}>
                      <TableCell>{formatarData(historico.data)}</TableCell>
                      <TableCell>
                        {historico.tipo === "entrada" ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex w-fit items-center">
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Entrada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex w-fit items-center">
                            <Box className="h-3.5 w-3.5 mr-1" />
                            Saída
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{historico.produto}</TableCell>
                      <TableCell className="font-medium">
                        {historico.quantidade} {historico.produto.includes("Caixa") ? "un" : 
                                             historico.produto.includes("Etiqueta") ? "rolos" : 
                                             historico.produto.includes("Bolha") ? "rolos" : 
                                             historico.produto.includes("Fita") ? "rolos" : 
                                             historico.produto.includes("Malote") ? "un" : 
                                             historico.produto.includes("Lacre") ? "un" : 
                                             "un"}
                      </TableCell>
                      <TableCell>{historico.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}