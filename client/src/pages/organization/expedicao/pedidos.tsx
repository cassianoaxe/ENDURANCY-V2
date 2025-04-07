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
  Package, 
  ArrowLeft,
  Search,
  Filter,
  ListChecks,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Dados de exemplo para pedidos
const mockOrders = [
  { 
    id: "PED-12345", 
    cliente: "Carlos Silva", 
    data: "07/04/2025", 
    status: "pendente", 
    prioridade: "alta", 
    itens: 8,
    destino: "São Paulo, SP"
  },
  { 
    id: "PED-12346", 
    cliente: "Maria Oliveira", 
    data: "07/04/2025", 
    status: "preparacao", 
    prioridade: "media", 
    itens: 3,
    destino: "Rio de Janeiro, RJ"
  },
  { 
    id: "PED-12347", 
    cliente: "João Santos", 
    data: "06/04/2025", 
    status: "revisao", 
    prioridade: "baixa", 
    itens: 5,
    destino: "Belo Horizonte, MG"
  },
  { 
    id: "PED-12348", 
    cliente: "Ana Pereira", 
    data: "06/04/2025", 
    status: "pendente", 
    prioridade: "media", 
    itens: 2,
    destino: "Curitiba, PR"
  },
  { 
    id: "PED-12349", 
    cliente: "Roberto Almeida", 
    data: "05/04/2025", 
    status: "preparacao", 
    prioridade: "alta", 
    itens: 12,
    destino: "Recife, PE"
  },
  { 
    id: "PED-12350", 
    cliente: "Fernanda Costa", 
    data: "05/04/2025", 
    status: "revisao", 
    prioridade: "baixa", 
    itens: 4,
    destino: "Porto Alegre, RS"
  }
];

export default function PreparacaoPedidos() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar pedidos com base na guia selecionada e no termo de pesquisa
  const filteredOrders = mockOrders.filter(order => {
    // Filtro de status
    if (selectedTab === "pendentes" && order.status !== "pendente") return false;
    if (selectedTab === "preparacao" && order.status !== "preparacao") return false;
    if (selectedTab === "revisao" && order.status !== "revisao") return false;
    if (selectedTab === "urgentes" && order.prioridade !== "alta") return false;
    
    // Filtro de pesquisa
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
            <h1 className="text-2xl font-bold tracking-tight">Preparação de Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os pedidos em preparação, pendentes e em revisão
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <ListChecks className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </div>
        </div>

        {/* Estatísticas de Pedidos */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Pedidos</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockOrders.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Package className="h-3 w-3 inline mr-1" />
                  {mockOrders.reduce((sum, order) => sum + order.itens, 0)} itens no total
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pedidos Pendentes</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockOrders.filter(order => order.status === "pendente").length}
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
                <span className="text-muted-foreground text-sm">Em Preparação</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockOrders.filter(order => order.status === "preparacao").length}
                  </span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  Processamento em andamento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pedidos Urgentes</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockOrders.filter(order => order.prioridade === "alta").length}
                  </span>
                </div>
                <div className="mt-4 text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Prioridade alta
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
              placeholder="Buscar por pedido, cliente ou destino..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Ordenar por
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Mais recentes</DropdownMenuItem>
                <DropdownMenuItem>Mais antigos</DropdownMenuItem>
                <DropdownMenuItem>Prioridade</DropdownMenuItem>
                <DropdownMenuItem>Quantidade de itens</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs de categorias */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos os Pedidos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="preparacao">Em Preparação</TabsTrigger>
            <TabsTrigger value="revisao">Em Revisão</TabsTrigger>
            <TabsTrigger value="urgentes">Urgentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="space-y-4">
            {/* Tabela de pedidos */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.cliente}</TableCell>
                          <TableCell>{order.data}</TableCell>
                          <TableCell>{order.itens}</TableCell>
                          <TableCell>{order.destino}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${order.status === "pendente" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                ${order.status === "preparacao" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                ${order.status === "revisao" ? "bg-purple-50 text-purple-700 hover:bg-purple-50" : ""}
                              `}
                            >
                              {order.status === "pendente" ? "Pendente" : 
                              order.status === "preparacao" ? "Em Preparação" : 
                              "Em Revisão"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${order.prioridade === "baixa" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                ${order.prioridade === "media" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                ${order.prioridade === "alta" ? "bg-red-50 text-red-700 hover:bg-red-50" : ""}
                              `}
                            >
                              {order.prioridade === "baixa" ? "Baixa" : 
                              order.prioridade === "media" ? "Média" : 
                              "Alta"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                <DropdownMenuItem>Atualizar status</DropdownMenuItem>
                                <DropdownMenuItem>Gerar etiqueta</DropdownMenuItem>
                                <DropdownMenuItem>Gerar documentação</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Nenhum pedido encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filteredOrders.length} de {mockOrders.length} pedidos
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}