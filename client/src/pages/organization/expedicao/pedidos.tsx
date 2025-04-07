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
  ArrowUpDown,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  ClipboardList,
  FileText,
  Box,
  PackageCheck,
  MoreHorizontal,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados simulados de pedidos (seria substituído por dados reais da API)
const mockPedidos = [
  {
    id: "PED-12345",
    cliente: "João Silva",
    status: "pendente",
    data: "2025-04-07T10:25:00",
    prioridade: "normal",
    itens: 3,
    valorTotal: 254.90
  },
  {
    id: "PED-12346",
    cliente: "Maria Oliveira",
    status: "preparando",
    data: "2025-04-07T09:15:00",
    prioridade: "alta",
    itens: 2,
    valorTotal: 187.35
  },
  {
    id: "PED-12347",
    cliente: "Carlos Eduardo",
    status: "conferido",
    data: "2025-04-07T08:30:00",
    prioridade: "normal",
    itens: 5,
    valorTotal: 421.75
  },
  {
    id: "PED-12348",
    cliente: "Ana Carolina",
    status: "pendente",
    data: "2025-04-07T11:45:00",
    prioridade: "baixa",
    itens: 1,
    valorTotal: 89.90
  },
  {
    id: "PED-12349",
    cliente: "Roberto Santos",
    status: "preparando",
    data: "2025-04-07T08:05:00",
    prioridade: "urgente",
    itens: 7,
    valorTotal: 753.20
  },
  {
    id: "PED-12350",
    cliente: "Juliana Mendes",
    status: "conferido",
    data: "2025-04-07T07:30:00",
    prioridade: "alta",
    itens: 4,
    valorTotal: 312.45
  },
  {
    id: "PED-12351",
    cliente: "Fernando Costa",
    status: "documentacao",
    data: "2025-04-06T16:20:00",
    prioridade: "normal",
    itens: 2,
    valorTotal: 143.80
  },
  {
    id: "PED-12352",
    cliente: "Daniela Lima",
    status: "documentacao",
    data: "2025-04-06T15:40:00",
    prioridade: "baixa",
    itens: 1,
    valorTotal: 67.90
  }
];

export default function PreparacaoPedidos() {
  const [filtro, setFiltro] = useState("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  
  // Função para filtrar pedidos
  const pedidosFiltrados = mockPedidos.filter(pedido => {
    // Filtro de status
    if (filtro !== "todos" && pedido.status !== filtro) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && !pedido.id.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !pedido.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Função para ordenar pedidos
  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (ordenacao === "recentes") {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    } else if (ordenacao === "antigos") {
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    } else if (ordenacao === "maior_valor") {
      return b.valorTotal - a.valorTotal;
    } else if (ordenacao === "menor_valor") {
      return a.valorTotal - b.valorTotal;
    } else if (ordenacao === "prioridade") {
      const prioridadeValor = {
        "urgente": 4,
        "alta": 3,
        "normal": 2,
        "baixa": 1
      };
      return prioridadeValor[b.prioridade as keyof typeof prioridadeValor] - 
             prioridadeValor[a.prioridade as keyof typeof prioridadeValor];
    }
    return 0;
  });

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
  
  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "preparando":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "conferido":
        return "bg-green-100 text-green-800 border-green-300";
      case "documentacao":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Função para obter o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "preparando":
        return <Package className="h-3.5 w-3.5 mr-1" />;
      case "conferido":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case "documentacao":
        return <FileText className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Função para obter a cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-300";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "baixa":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Função para obter o ícone da prioridade
  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      case "alta":
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      case "normal":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case "baixa":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Preparação de Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a preparação e separação de pedidos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ClipboardList className="w-4 h-4 mr-2" />
              Lista de Trabalho
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Etiquetas
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <PackageCheck className="w-4 h-4 mr-2" />
              Iniciar Separação
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por pedido ou cliente..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filtrar
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status do Pedido</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFiltro("todos")}>
                  Todos os pedidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro("pendente")}>
                  Pendentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro("preparando")}>
                  Em preparação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro("conferido")}>
                  Conferidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro("documentacao")}>
                  Em documentação
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setOrdenacao("recentes")}>
                  Mais recentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("antigos")}>
                  Mais antigos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("maior_valor")}>
                  Maior valor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("menor_valor")}>
                  Menor valor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("prioridade")}>
                  Prioridade
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Exibindo {pedidosOrdenados.length} de {mockPedidos.length} pedidos
          </div>
        </div>
        
        {/* Tabela de pedidos */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead className="w-[120px]">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosOrdenados.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{formatarData(pedido.data)}</TableCell>
                  <TableCell>{pedido.itens} {pedido.itens === 1 ? 'item' : 'itens'}</TableCell>
                  <TableCell>R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`flex w-fit items-center ${getStatusColor(pedido.status)}`}>
                      {getStatusIcon(pedido.status)}
                      <span>
                        {pedido.status === "pendente" ? "Pendente" : 
                         pedido.status === "preparando" ? "Em preparação" : 
                         pedido.status === "conferido" ? "Conferido" : 
                         pedido.status === "documentacao" ? "Em documentação" : 
                         pedido.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`flex w-fit items-center ${getPrioridadeColor(pedido.prioridade)}`}>
                      {getPrioridadeIcon(pedido.prioridade)}
                      <span>
                        {pedido.prioridade === "urgente" ? "Urgente" : 
                         pedido.prioridade === "alta" ? "Alta" : 
                         pedido.prioridade === "normal" ? "Normal" : 
                         pedido.prioridade === "baixa" ? "Baixa" : 
                         pedido.prioridade}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Separar pedido</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir etiquetas</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Alterar status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">
                  {mockPedidos.filter(p => p.status === "pendente").length}
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Em Preparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">
                  {mockPedidos.filter(p => p.status === "preparando").length}
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pedidos Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">
                  {mockPedidos.filter(p => p.prioridade === "urgente" || p.prioridade === "alta").length}
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
}