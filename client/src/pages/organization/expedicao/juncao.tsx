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
  Box,
  PackagePlus,
  Link,
  Check,
  Unlink,
  Clock,
  Trash2,
  ArrowUpDown,
  MoreHorizontal
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados de exemplo para junções de pedidos
const mockJuntions = [
  { 
    id: "JUNT-12345", 
    nome: "Entrega RJ - 07/04", 
    data: "07/04/2025", 
    status: "aberta", 
    pedidos: ["PED-12345", "PED-12346", "PED-12348"],
    destino: "Rio de Janeiro, RJ",
    responsavel: "Carlos Silva"
  },
  { 
    id: "JUNT-12346", 
    nome: "Entrega SP - 07/04", 
    data: "07/04/2025", 
    status: "finalizada", 
    pedidos: ["PED-12347", "PED-12349", "PED-12350", "PED-12352"],
    destino: "São Paulo, SP",
    responsavel: "Maria Oliveira"
  },
  { 
    id: "JUNT-12347", 
    nome: "Entrega BH - 06/04", 
    data: "06/04/2025", 
    status: "processando", 
    pedidos: ["PED-12351", "PED-12355"],
    destino: "Belo Horizonte, MG",
    responsavel: "João Santos"
  },
  { 
    id: "JUNT-12348", 
    nome: "Entrega RS - 06/04", 
    data: "06/04/2025", 
    status: "finalizada", 
    pedidos: ["PED-12353", "PED-12356", "PED-12358"],
    destino: "Porto Alegre, RS",
    responsavel: "Ana Pereira"
  },
];

// Dados de exemplo para pedidos disponíveis para junção
const mockAvailableOrders = [
  { 
    id: "PED-12359", 
    cliente: "Roberto Almeida", 
    data: "07/04/2025", 
    itens: 3,
    status: "separado", 
    destino: "Rio de Janeiro, RJ"
  },
  { 
    id: "PED-12360", 
    cliente: "Fernanda Costa", 
    data: "07/04/2025", 
    itens: 5,
    status: "separado", 
    destino: "São Paulo, SP"
  },
  { 
    id: "PED-12361", 
    cliente: "Eduardo Lima", 
    data: "07/04/2025", 
    itens: 2,
    status: "separado", 
    destino: "Rio de Janeiro, RJ"
  },
  { 
    id: "PED-12362", 
    cliente: "Márcia Souza", 
    data: "07/04/2025", 
    itens: 4,
    status: "separado", 
    destino: "São Paulo, SP"
  },
  { 
    id: "PED-12363", 
    cliente: "Gustavo Mendes", 
    data: "07/04/2025", 
    itens: 6,
    status: "separado", 
    destino: "Belo Horizonte, MG"
  }
];

export default function JuncaoPedidos() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("ativas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedJunction, setSelectedJunction] = useState<string | null>(null);
  const [activeJunction, setActiveJunction] = useState<{
    id: string;
    nome: string;
    pedidos: string[];
  } | null>(null);

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar junções com base na guia selecionada e no termo de pesquisa
  const filteredJunctions = mockJuntions.filter(junction => {
    // Filtro de status
    if (selectedTab === "ativas" && junction.status === "finalizada") return false;
    if (selectedTab === "finalizadas" && junction.status !== "finalizada") return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        junction.id.toLowerCase().includes(searchLower) ||
        junction.nome.toLowerCase().includes(searchLower) ||
        junction.destino.toLowerCase().includes(searchLower) ||
        junction.pedidos.some(pedido => pedido.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Função para filtrar pedidos disponíveis
  const filteredAvailableOrders = mockAvailableOrders.filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.cliente.toLowerCase().includes(searchLower) ||
        order.destino.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Função para lidar com a seleção de pedidos
  const toggleOrderSelection = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Função para selecionar todos os pedidos
  const selectAllOrders = () => {
    if (selectedOrders.length === filteredAvailableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredAvailableOrders.map(order => order.id));
    }
  };

  // Função para criar uma nova junção
  const createNewJunction = () => {
    // Em produção, isso seria uma chamada de API
    alert(`Criando nova junção com os pedidos: ${selectedOrders.join(", ")}`);
    setSelectedOrders([]);
  };

  // Função para simular a adição de pedidos à junção selecionada
  const addToJunction = () => {
    if (!selectedJunction || selectedOrders.length === 0) return;
    
    // Em produção, isso seria uma chamada de API
    alert(`Adicionando pedidos: ${selectedOrders.join(", ")} à junção: ${selectedJunction}`);
    setSelectedOrders([]);
    setSelectedJunction(null);
  };

  // Função para abrir detalhes de uma junção
  const viewJunctionDetails = (junction: {id: string; nome: string; pedidos: string[]}) => {
    setActiveJunction(junction);
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Junção de Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Agrupe pedidos com destinos semelhantes para otimizar o envio
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setActiveJunction(null)}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button>
              <PackagePlus className="h-4 w-4 mr-2" />
              Nova Junção
            </Button>
          </div>
        </div>

        {/* Estatísticas de Junções */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Junções</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockJuntions.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Box className="h-3 w-3 inline mr-1" />
                  {mockJuntions.reduce((acc, j) => acc + j.pedidos.length, 0)} pedidos agrupados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Junções Abertas</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockJuntions.filter(j => j.status === "aberta").length}
                  </span>
                </div>
                <div className="mt-4 text-amber-600 text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Aguardando processamento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Em Processamento</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockJuntions.filter(j => j.status === "processando").length}
                  </span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <ArrowUpDown className="h-3 w-3 inline mr-1" />
                  Agrupamento em andamento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Finalizadas</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockJuntions.filter(j => j.status === "finalizada").length}
                  </span>
                </div>
                <div className="mt-4 text-green-600 text-xs">
                  <Check className="h-3 w-3 inline mr-1" />
                  Prontas para expedição
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal */}
        {activeJunction ? (
          // Detalhes da Junção Selecionada
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{activeJunction.nome}</CardTitle>
                  <CardDescription>
                    Junção ID: {activeJunction.id} • {activeJunction.pedidos.length} pedidos
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveJunction(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às junções
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pedidos na Junção</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID Pedido</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeJunction.pedidos.map((pedido) => (
                            <TableRow key={pedido}>
                              <TableCell className="font-medium">{pedido}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Agrupado
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Adicionar Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por pedido ou destino..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">
                                <Checkbox 
                                  checked={selectedOrders.length === filteredAvailableOrders.length && filteredAvailableOrders.length > 0}
                                  onCheckedChange={selectAllOrders}
                                  aria-label="Selecionar todos os pedidos"
                                />
                              </TableHead>
                              <TableHead>ID Pedido</TableHead>
                              <TableHead>Destino</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAvailableOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedOrders.includes(order.id)}
                                    onCheckedChange={() => toggleOrderSelection(order.id)}
                                    aria-label={`Selecionar pedido ${order.id}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.destino}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <Button 
                          className="w-full" 
                          disabled={selectedOrders.length === 0}
                          onClick={addToJunction}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Adicionar Selecionados à Junção
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Lista de Junções
          <>
            {/* Barra de pesquisa e filtros */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por junção, pedido ou destino..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {selectedOrders.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    className="whitespace-nowrap"
                    onClick={createNewJunction}
                  >
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Criar Junção ({selectedOrders.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Tabs de categorias */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="ativas">Junções Ativas</TabsTrigger>
                <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos Disponíveis</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="space-y-4">
                {selectedTab !== "pedidos" ? (
                  // Tabela de junções
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Pedidos</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredJunctions.length > 0 ? (
                            filteredJunctions.map((junction) => (
                              <TableRow key={junction.id}>
                                <TableCell className="font-medium">{junction.id}</TableCell>
                                <TableCell>{junction.nome}</TableCell>
                                <TableCell>{junction.data}</TableCell>
                                <TableCell>{junction.destino}</TableCell>
                                <TableCell>{junction.pedidos.length}</TableCell>
                                <TableCell>{junction.responsavel}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      ${junction.status === "aberta" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                      ${junction.status === "processando" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                      ${junction.status === "finalizada" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                    `}
                                  >
                                    {junction.status === "aberta" ? "Aberta" : 
                                    junction.status === "processando" ? "Processando" : 
                                    "Finalizada"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => viewJunctionDetails({
                                        id: junction.id,
                                        nome: junction.nome,
                                        pedidos: junction.pedidos
                                      })}
                                    >
                                      <Box className="h-4 w-4 mr-2" />
                                      Ver
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Gerar etiquetas</DropdownMenuItem>
                                        <DropdownMenuItem>Gerar documentação</DropdownMenuItem>
                                        <DropdownMenuItem>Finalizar junção</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Cancelar junção</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-4">
                                Nenhuma junção encontrada
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 py-4">
                      <div className="text-xs text-muted-foreground">
                        Mostrando {filteredJunctions.length} de {
                          selectedTab === "ativas" 
                            ? mockJuntions.filter(j => j.status !== "finalizada").length 
                            : mockJuntions.filter(j => j.status === "finalizada").length
                        } junções
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={filteredJunctions.length === 0}>
                          Anterior
                        </Button>
                        <Button variant="outline" size="sm" disabled={filteredJunctions.length === 0}>
                          Próximo
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ) : (
                  // Tabela de pedidos disponíveis
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={selectedOrders.length === filteredAvailableOrders.length && filteredAvailableOrders.length > 0}
                                onCheckedChange={selectAllOrders}
                                aria-label="Selecionar todos os pedidos"
                              />
                            </TableHead>
                            <TableHead>ID Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAvailableOrders.length > 0 ? (
                            filteredAvailableOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedOrders.includes(order.id)}
                                    onCheckedChange={() => toggleOrderSelection(order.id)}
                                    aria-label={`Selecionar pedido ${order.id}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.cliente}</TableCell>
                                <TableCell>{order.data}</TableCell>
                                <TableCell>{order.itens}</TableCell>
                                <TableCell>{order.destino}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem 
                                        disabled={mockJuntions.filter(j => j.status !== "finalizada").length === 0}
                                        onClick={() => {
                                          setSelectedOrders([order.id]);
                                          setSelectedJunction(mockJuntions[0].id);
                                          setSelectedTab("ativas");
                                        }}
                                      >
                                        Adicionar a uma junção
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-4">
                                Nenhum pedido disponível encontrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 py-4">
                      <div className="text-xs text-muted-foreground">
                        Mostrando {filteredAvailableOrders.length} de {mockAvailableOrders.length} pedidos
                      </div>
                      {selectedOrders.length > 0 && (
                        <div className="flex justify-center flex-1">
                          <div className="bg-gray-50 px-4 py-2 rounded-md flex items-center gap-2">
                            <span className="text-sm">{selectedOrders.length} pedidos selecionados</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrders([])}
                            >
                              Limpar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={createNewJunction}
                            >
                              Criar Nova Junção
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={filteredAvailableOrders.length === 0}>
                          Anterior
                        </Button>
                        <Button variant="outline" size="sm" disabled={filteredAvailableOrders.length === 0}>
                          Próximo
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </OrganizationLayout>
  );
}