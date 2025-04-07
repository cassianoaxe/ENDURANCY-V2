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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Truck,
  Search,
  Filter,
  Box,
  PackageOpen,
  AlertTriangle,
  MoreHorizontal,
  FilePlus,
  ListChecks,
  Copy,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  PackagePlus,
  Boxes,
  Scan,
  Printer,
  PackageCheck,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  X
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Dados simulados
const pedidosDisponiveis = [
  {
    id: "PED-12345",
    cliente: "João Silva",
    cidade: "São Paulo",
    estado: "SP",
    transportadora: "Correios",
    itens: 3,
    peso: 1.2,
    volume: 0.008,
    valor: 254.90,
    status: "conferido"
  },
  {
    id: "PED-12347",
    cliente: "Carlos Eduardo",
    cidade: "São Paulo",
    estado: "SP",
    transportadora: "Correios",
    itens: 5,
    peso: 2.3,
    volume: 0.015,
    valor: 421.75,
    status: "conferido"
  },
  {
    id: "PED-12350",
    cliente: "Juliana Mendes",
    cidade: "São Paulo",
    estado: "SP",
    transportadora: "Correios",
    itens: 4,
    peso: 1.8,
    volume: 0.012,
    valor: 312.45,
    status: "conferido"
  },
  {
    id: "PED-12351",
    cliente: "Fernando Costa",
    cidade: "Campinas",
    estado: "SP",
    transportadora: "Jadlog",
    itens: 2,
    peso: 0.9,
    volume: 0.006,
    valor: 143.80,
    status: "conferido"
  },
  {
    id: "PED-12352",
    cliente: "Daniela Lima",
    cidade: "Jundiaí",
    estado: "SP",
    transportadora: "Jadlog",
    itens: 1,
    peso: 0.4,
    volume: 0.003,
    valor: 67.90,
    status: "conferido"
  },
  {
    id: "PED-12353",
    cliente: "Amanda Souza",
    cidade: "Campinas",
    estado: "SP",
    transportadora: "Jadlog",
    itens: 3,
    peso: 1.1,
    volume: 0.007,
    valor: 198.50,
    status: "conferido"
  },
  {
    id: "PED-12355",
    cliente: "Bruno Martins",
    cidade: "Ribeirão Preto",
    estado: "SP",
    transportadora: "Correios",
    itens: 2,
    peso: 0.8,
    volume: 0.005,
    valor: 123.45,
    status: "conferido"
  },
  {
    id: "PED-12356",
    cliente: "Camila Santos",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    transportadora: "Sequoia",
    itens: 4,
    peso: 1.5,
    volume: 0.01,
    valor: 275.60,
    status: "conferido"
  }
];

const gruposExistentes = [
  {
    id: "GRP-001",
    transportadora: "Correios",
    cidade: "São Paulo",
    estado: "SP",
    pedidos: ["PED-12340", "PED-12341"],
    totalPedidos: 2,
    totalItens: 7,
    totalPeso: 3.1,
    totalVolume: 0.02,
    totalValor: 567.80,
    status: "agrupado"
  },
  {
    id: "GRP-002",
    transportadora: "Jadlog",
    cidade: "Campinas",
    estado: "SP",
    pedidos: ["PED-12342", "PED-12343", "PED-12344"],
    totalPedidos: 3,
    totalItens: 12,
    totalPeso: 5.5,
    totalVolume: 0.035,
    totalValor: 1230.75,
    status: "agrupado"
  },
  {
    id: "GRP-003",
    transportadora: "Sequoia",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    pedidos: ["PED-12345", "PED-12346"],
    totalPedidos: 2,
    totalItens: 5,
    totalPeso: 2.2,
    totalVolume: 0.014,
    totalValor: 432.90,
    status: "agrupado"
  }
];

export default function JuncaoPedidos() {
  const { toast } = useToast();
  const [termoBusca, setTermoBusca] = useState("");
  const [transportadoraFiltro, setTransportadoraFiltro] = useState("");
  const [regiaoFiltro, setRegiaoFiltro] = useState("");
  const [pedidosSelecionados, setPedidosSelecionados] = useState<string[]>([]);
  const [modoJuncao, setModoJuncao] = useState<"automatico" | "manual">("automatico");
  const [novoGrupo, setNovoGrupo] = useState<{
    id: string;
    pedidos: string[];
    transportadora: string;
    cidade: string;
    estado: string;
  } | null>(null);
  
  // Lista de transportadoras únicas
  const transportadoras = Array.from(new Set(pedidosDisponiveis.map(p => p.transportadora)));
  
  // Lista de regiões únicas (estado + cidade)
  const regioes = Array.from(new Set(pedidosDisponiveis.map(p => `${p.estado} - ${p.cidade}`)));
  
  // Filtrar pedidos disponíveis
  const pedidosFiltrados = pedidosDisponiveis.filter(pedido => {
    // Filtro de transportadora
    if (transportadoraFiltro && pedido.transportadora !== transportadoraFiltro) {
      return false;
    }
    
    // Filtro de região
    if (regiaoFiltro) {
      const [estado, cidade] = regiaoFiltro.split(" - ");
      if (pedido.estado !== estado || pedido.cidade !== cidade) {
        return false;
      }
    }
    
    // Filtro de busca
    if (termoBusca && 
        !pedido.id.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !pedido.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Função para selecionar/deselecionar pedido
  const togglePedidoSelecionado = (pedidoId: string) => {
    if (pedidosSelecionados.includes(pedidoId)) {
      setPedidosSelecionados(pedidosSelecionados.filter(id => id !== pedidoId));
    } else {
      setPedidosSelecionados([...pedidosSelecionados, pedidoId]);
    }
  };
  
  // Função para selecionar todos os pedidos filtrados
  const selecionarTodos = () => {
    const todos = pedidosFiltrados.map(p => p.id);
    setPedidosSelecionados(todos);
  };
  
  // Função para limpar seleção
  const limparSelecao = () => {
    setPedidosSelecionados([]);
  };
  
  // Iniciar junção de pedidos
  const iniciarJuncao = () => {
    if (pedidosSelecionados.length < 2) {
      toast({
        title: "Não foi possível criar grupo",
        description: "Selecione pelo menos 2 pedidos para junção",
        variant: "destructive",
      });
      return;
    }
    
    // Obter detalhes dos pedidos selecionados
    const pedidosSelecionadosDetalhes = pedidosDisponiveis.filter(p => pedidosSelecionados.includes(p.id));
    
    // Verificar se todos os pedidos têm a mesma transportadora e destino
    const transportadora = pedidosSelecionadosDetalhes[0].transportadora;
    const cidade = pedidosSelecionadosDetalhes[0].cidade;
    const estado = pedidosSelecionadosDetalhes[0].estado;
    
    const mesmaTransportadora = pedidosSelecionadosDetalhes.every(p => p.transportadora === transportadora);
    const mesmoDestino = pedidosSelecionadosDetalhes.every(p => p.cidade === cidade && p.estado === estado);
    
    if (!mesmaTransportadora || !mesmoDestino) {
      toast({
        title: "Não foi possível criar grupo",
        description: "Os pedidos selecionados devem ter a mesma transportadora e destino",
        variant: "destructive",
      });
      return;
    }
    
    // Criar novo grupo
    const novoId = `GRP-${Math.floor(1000 + Math.random() * 9000)}`;
    setNovoGrupo({
      id: novoId,
      pedidos: pedidosSelecionados,
      transportadora,
      cidade,
      estado
    });
    
    toast({
      title: "Grupo criado com sucesso",
      description: `${pedidosSelecionados.length} pedidos agrupados para ${cidade}/${estado}`,
    });
  };
  
  // Cancelar criação de grupo
  const cancelarNovoGrupo = () => {
    setNovoGrupo(null);
    setPedidosSelecionados([]);
  };
  
  // Finalizar grupo
  const finalizarGrupo = () => {
    // Em um sistema real, enviaria os dados para o backend
    toast({
      title: "Grupo finalizado com sucesso",
      description: `Grupo ${novoGrupo?.id} criado e enviado para expedição`,
    });
    
    setNovoGrupo(null);
    setPedidosSelecionados([]);
    setTermoBusca("");
    setTransportadoraFiltro("");
    setRegiaoFiltro("");
  };
  
  // Resumo dos pedidos selecionados
  const resumoSelecionados = {
    totalPedidos: pedidosSelecionados.length,
    totalItens: pedidosDisponiveis
      .filter(p => pedidosSelecionados.includes(p.id))
      .reduce((acc, pedido) => acc + pedido.itens, 0),
    totalPeso: pedidosDisponiveis
      .filter(p => pedidosSelecionados.includes(p.id))
      .reduce((acc, pedido) => acc + pedido.peso, 0),
    totalVolume: pedidosDisponiveis
      .filter(p => pedidosSelecionados.includes(p.id))
      .reduce((acc, pedido) => acc + pedido.volume, 0),
    totalValor: pedidosDisponiveis
      .filter(p => pedidosSelecionados.includes(p.id))
      .reduce((acc, pedido) => acc + pedido.valor, 0),
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Junção de Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Agrupe pedidos para o mesmo destino e transportadora
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Scan className="w-4 h-4 mr-2" />
              Escanear Pedidos
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={iniciarJuncao} disabled={pedidosSelecionados.length < 2}>
              <Boxes className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
          </div>
        </div>
        
        {/* Tabs para Tipos de Junção */}
        <Tabs defaultValue="automatico" onValueChange={(v) => setModoJuncao(v as "automatico" | "manual")}>
          <TabsList className="mb-4">
            <TabsTrigger value="automatico">Junção Automática</TabsTrigger>
            <TabsTrigger value="manual">Junção Manual</TabsTrigger>
            <TabsTrigger value="grupos">Grupos Existentes</TabsTrigger>
          </TabsList>
          
          {/* Tab de Junção Automática */}
          <TabsContent value="automatico">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filtros e Pedidos */}
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Pedidos Disponíveis</CardTitle>
                    <CardDescription>
                      Selecione os pedidos que deseja agrupar para expedição
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar pedido ou cliente..."
                          className="pl-8"
                          value={termoBusca}
                          onChange={(e) => setTermoBusca(e.target.value)}
                        />
                      </div>
                      
                      <Select
                        value={transportadoraFiltro}
                        onValueChange={setTransportadoraFiltro}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Transportadora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {transportadoras.map((transportadora) => (
                            <SelectItem key={transportadora} value={transportadora}>
                              {transportadora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={regiaoFiltro}
                        onValueChange={setRegiaoFiltro}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Região" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {regioes.map((regiao) => (
                            <SelectItem key={regiao} value={regiao}>
                              {regiao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Ações em Lote */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {pedidosFiltrados.length} pedidos disponíveis
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selecionarTodos}>
                          Selecionar Todos
                        </Button>
                        <Button variant="outline" size="sm" onClick={limparSelecao}>
                          Limpar Seleção
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lista de Pedidos */}
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <Checkbox 
                                checked={pedidosFiltrados.length > 0 && pedidosSelecionados.length === pedidosFiltrados.length}
                                onCheckedChange={() => {
                                  if (pedidosSelecionados.length === pedidosFiltrados.length) {
                                    limparSelecao();
                                  } else {
                                    selecionarTodos();
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead>Transportadora</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Peso (kg)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pedidosFiltrados.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                Nenhum pedido encontrado com os filtros selecionados
                              </TableCell>
                            </TableRow>
                          ) : (
                            pedidosFiltrados.map((pedido) => (
                              <TableRow 
                                key={pedido.id}
                                className={pedidosSelecionados.includes(pedido.id) ? "bg-green-50 dark:bg-green-900/10" : ""}
                              >
                                <TableCell>
                                  <Checkbox 
                                    checked={pedidosSelecionados.includes(pedido.id)}
                                    onCheckedChange={() => togglePedidoSelecionado(pedido.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{pedido.id}</TableCell>
                                <TableCell>{pedido.cliente}</TableCell>
                                <TableCell>{pedido.cidade}/{pedido.estado}</TableCell>
                                <TableCell>{pedido.transportadora}</TableCell>
                                <TableCell>{pedido.itens}</TableCell>
                                <TableCell>{pedido.peso.toFixed(1)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Resumo da Seleção */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Resumo da Seleção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pedidosSelecionados.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>Nenhum pedido selecionado</p>
                        <p className="text-sm mt-1">Selecione pedidos para ver o resumo</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pedidos:</span>
                            <span className="font-medium">{resumoSelecionados.totalPedidos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Itens totais:</span>
                            <span className="font-medium">{resumoSelecionados.totalItens}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Peso total:</span>
                            <span className="font-medium">{resumoSelecionados.totalPeso.toFixed(1)} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Volume total:</span>
                            <span className="font-medium">{resumoSelecionados.totalVolume.toFixed(3)} m³</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor total:</span>
                            <span className="font-medium">R$ {resumoSelecionados.totalValor.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Pedidos Selecionados</h4>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {pedidosSelecionados.map((id) => {
                                const pedido = pedidosDisponiveis.find(p => p.id === id);
                                return (
                                  <div key={id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                    <span className="text-sm">{id}</span>
                                    <Button variant="ghost" size="icon" onClick={() => togglePedidoSelecionado(id)}>
                                      <X className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={iniciarJuncao}
                        >
                          <Boxes className="mr-2 h-4 w-4" />
                          Criar Grupo ({resumoSelecionados.totalPedidos})
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Junção Manual */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Junção Manual de Pedidos</CardTitle>
                <CardDescription>
                  Escaneie ou digite os códigos dos pedidos manualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Implementação da junção manual */}
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Scan className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Escaneamento de Pedidos</h3>
                  <p className="text-muted-foreground max-w-lg mb-6">
                    Use um leitor de código de barras ou digite os códigos de pedidos manualmente para criar um grupo
                  </p>
                  
                  <div className="flex gap-2 w-full max-w-lg mb-8">
                    <Input placeholder="Digite ou escaneie o código do pedido..." />
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="text-muted-foreground">
                    Modo manual disponível para operadores de expedição
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Grupos Existentes */}
          <TabsContent value="grupos">
            <Card>
              <CardHeader>
                <CardTitle>Grupos de Pedidos</CardTitle>
                <CardDescription>
                  Grupos de pedidos já formados aguardando processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID do Grupo</TableHead>
                        <TableHead>Transportadora</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Peso Total</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gruposExistentes.map((grupo) => (
                        <TableRow key={grupo.id}>
                          <TableCell className="font-medium">{grupo.id}</TableCell>
                          <TableCell>{grupo.transportadora}</TableCell>
                          <TableCell>{grupo.cidade}/{grupo.estado}</TableCell>
                          <TableCell>{grupo.totalPedidos}</TableCell>
                          <TableCell>{grupo.totalItens}</TableCell>
                          <TableCell>{grupo.totalPeso.toFixed(1)} kg</TableCell>
                          <TableCell>R$ {grupo.totalValor.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Imprimir etiquetas
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PackageOpen className="mr-2 h-4 w-4" />
                                  Criar malote
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar grupo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Área de Revisão do Grupo (Aparece após clicar em "Criar Grupo") */}
        {novoGrupo && (
          <Card className="border-green-300 dark:border-green-800 shadow-md">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center">
                <Boxes className="mr-2 h-5 w-5 text-green-600" />
                Novo Grupo de Pedidos
              </CardTitle>
              <CardDescription>
                Revise os pedidos agrupados antes de finalizar
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{novoGrupo.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {novoGrupo.pedidos.length} pedidos para {novoGrupo.cidade}/{novoGrupo.estado} via {novoGrupo.transportadora}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={cancelarNovoGrupo}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={finalizarGrupo}>
                          <PackageCheck className="mr-2 h-4 w-4" />
                          Finalizar Grupo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Peso</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {novoGrupo.pedidos.map((pedidoId) => {
                            const pedido = pedidosDisponiveis.find(p => p.id === pedidoId);
                            if (!pedido) return null;
                            
                            return (
                              <TableRow key={pedido.id}>
                                <TableCell className="font-medium">{pedido.id}</TableCell>
                                <TableCell>{pedido.cliente}</TableCell>
                                <TableCell>{pedido.itens}</TableCell>
                                <TableCell>{pedido.peso.toFixed(1)} kg</TableCell>
                                <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      // Remover pedido do grupo
                                      setNovoGrupo({
                                        ...novoGrupo,
                                        pedidos: novoGrupo.pedidos.filter(id => id !== pedido.id)
                                      });
                                      
                                      // Se ficar apenas um pedido, cancelar grupo
                                      if (novoGrupo.pedidos.length <= 2) {
                                        cancelarNovoGrupo();
                                      }
                                    }}
                                  >
                                    <X className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    <h4 className="font-medium mb-3">Resumo do Grupo</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{novoGrupo.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transportadora:</span>
                        <span className="font-medium">{novoGrupo.transportadora}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destino:</span>
                        <span className="font-medium">{novoGrupo.cidade}/{novoGrupo.estado}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pedidos:</span>
                        <span className="font-medium">{novoGrupo.pedidos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Itens totais:</span>
                        <span className="font-medium">{resumoSelecionados.totalItens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peso total:</span>
                        <span className="font-medium">{resumoSelecionados.totalPeso.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor total:</span>
                        <span className="font-medium">R$ {resumoSelecionados.totalValor.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Próximos Passos</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <ChevronRight className="h-3 w-3 mr-2 text-green-600" />
                          Finalizar grupo
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-3 w-3 mr-2 text-green-600" />
                          Gerar etiquetas
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-3 w-3 mr-2 text-green-600" />
                          Criar malote
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-3 w-3 mr-2 text-green-600" />
                          Despachar para transportadora
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OrganizationLayout>
  );
}