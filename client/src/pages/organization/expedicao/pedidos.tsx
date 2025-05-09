import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  MoreHorizontal,
  User,
  MapPin,
  Calendar,
  Tag,
  Truck,
  ClipboardList,
  FileText,
  Printer,
  Clipboard,
  X,
  Check
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Tipo para um item de pedido
type OrderItem = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  sku: string;
  status: "pendente" | "separado" | "embalado";
};

// Tipo para um pedido completo
interface Order {
  id: string;
  cliente: string;
  email?: string;
  telefone?: string;
  data: string;
  status: "pendente" | "preparacao" | "revisao" | "enviado" | "entregue" | "cancelado";
  prioridade: "baixa" | "media" | "alta";
  itens: number;
  destino: string;
  endereco?: string;
  cep?: string;
  transportadora?: string;
  metodoPagamento?: string;
  valorTotal?: number;
  observacoes?: string;
  historico?: {data: string, status: string, descricao: string}[];
  produtos?: OrderItem[];
}

// Dados de exemplo para pedidos
const mockOrderItems: Record<string, OrderItem[]> = {
  "PED-12345": [
    { id: "ITEM-1", nome: "Produto A", quantidade: 3, preco: 29.90, sku: "SKU001", status: "separado" },
    { id: "ITEM-2", nome: "Produto B", quantidade: 2, preco: 45.50, sku: "SKU002", status: "pendente" },
    { id: "ITEM-3", nome: "Produto C", quantidade: 1, preco: 89.90, sku: "SKU003", status: "separado" },
    { id: "ITEM-4", nome: "Produto D", quantidade: 2, preco: 19.90, sku: "SKU004", status: "embalado" }
  ],
  "PED-12346": [
    { id: "ITEM-5", nome: "Produto E", quantidade: 1, preco: 125.50, sku: "SKU005", status: "separado" },
    { id: "ITEM-6", nome: "Produto F", quantidade: 2, preco: 45.00, sku: "SKU006", status: "pendente" }
  ],
  "PED-12347": [
    { id: "ITEM-7", nome: "Produto G", quantidade: 1, preco: 59.90, sku: "SKU007", status: "pendente" },
    { id: "ITEM-8", nome: "Produto H", quantidade: 2, preco: 36.50, sku: "SKU008", status: "separado" },
    { id: "ITEM-9", nome: "Produto I", quantidade: 2, preco: 32.75, sku: "SKU009", status: "pendente" }
  ]
};

// Histórico de pedidos
const mockOrderHistory: Record<string, {data: string, status: string, descricao: string}[]> = {
  "PED-12345": [
    { data: "07/04/2025 08:15", status: "criado", descricao: "Pedido criado" },
    { data: "07/04/2025 09:30", status: "pendente", descricao: "Pagamento confirmado" },
    { data: "07/04/2025 10:45", status: "preparacao", descricao: "Iniciada separação de itens" }
  ],
  "PED-12346": [
    { data: "07/04/2025 07:05", status: "criado", descricao: "Pedido criado" },
    { data: "07/04/2025 07:20", status: "pendente", descricao: "Pagamento confirmado" },
    { data: "07/04/2025 08:30", status: "preparacao", descricao: "Iniciada separação de itens" }
  ],
  "PED-12347": [
    { data: "06/04/2025 14:25", status: "criado", descricao: "Pedido criado" },
    { data: "06/04/2025 15:10", status: "pendente", descricao: "Pagamento confirmado" },
    { data: "06/04/2025 16:30", status: "preparacao", descricao: "Iniciada separação de itens" },
    { data: "07/04/2025 09:15", status: "revisao", descricao: "Pedido em revisão final" }
  ]
}

// Dados completos de pedidos
const mockOrders: Order[] = [
  { 
    id: "PED-12345", 
    cliente: "Carlos Silva",
    email: "carlos.silva@exemplo.com",
    telefone: "(11) 98765-4321",
    data: "07/04/2025", 
    status: "pendente", 
    prioridade: "alta", 
    itens: 8,
    destino: "São Paulo, SP",
    endereco: "Av. Paulista, 1000, Apto 123",
    cep: "01310-100",
    transportadora: "Correios - SEDEX",
    metodoPagamento: "Cartão de Crédito",
    valorTotal: 299.90,
    observacoes: "Cliente solicitou embalagem para presente",
    historico: mockOrderHistory["PED-12345"],
    produtos: mockOrderItems["PED-12345"]
  },
  { 
    id: "PED-12346", 
    cliente: "Maria Oliveira",
    email: "maria.oliveira@exemplo.com",
    telefone: "(21) 99876-5432",
    data: "07/04/2025", 
    status: "preparacao", 
    prioridade: "media", 
    itens: 3,
    destino: "Rio de Janeiro, RJ",
    endereco: "Rua Copacabana, 500, Bloco B",
    cep: "22050-002",
    transportadora: "JADLOG",
    metodoPagamento: "Boleto Bancário",
    valorTotal: 215.50,
    observacoes: "Entregar somente ao destinatário",
    historico: mockOrderHistory["PED-12346"],
    produtos: mockOrderItems["PED-12346"]
  },
  { 
    id: "PED-12347", 
    cliente: "João Santos",
    email: "joao.santos@exemplo.com",
    telefone: "(31) 98877-6655",
    data: "06/04/2025", 
    status: "revisao", 
    prioridade: "baixa", 
    itens: 5,
    destino: "Belo Horizonte, MG",
    endereco: "Av. Afonso Pena, 1500",
    cep: "30130-005",
    transportadora: "LATAM Cargo",
    metodoPagamento: "PIX",
    valorTotal: 198.30,
    observacoes: "Requer documentação especial",
    historico: mockOrderHistory["PED-12347"],
    produtos: mockOrderItems["PED-12347"]
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };
  
  // Funções para abrir/fechar modais
  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };
  
  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusModalOpen(true);
  };

  // Função para atualizar o status de um pedido
  const updateOrderStatus = () => {
    if (!selectedOrder) return;
    
    // Em um ambiente real, faria uma chamada de API aqui
    // Simulando a atualização apenas para efeito de demonstração
    toast({
      title: "Status atualizado com sucesso",
      description: `Pedido ${selectedOrder.id} alterado para ${
        newStatus === "pendente" ? "Pendente" : 
        newStatus === "preparacao" ? "Em Preparação" :
        newStatus === "revisao" ? "Em Revisão" :
        newStatus === "enviado" ? "Enviado" :
        newStatus === "entregue" ? "Entregue" : 
        "Cancelado"
      }`,
      variant: "default",
    });
    
    setStatusModalOpen(false);
  };

  // Função para gerar etiqueta para um pedido
  const generateLabel = (orderId: string) => {
    // Simulando geração de etiqueta
    toast({
      title: "Etiqueta gerada com sucesso",
      description: `A etiqueta para o pedido ${orderId} está pronta para impressão`,
      variant: "default",
    });
  };
  
  // Função para gerar documentação para um pedido
  const generateDocumentation = (orderId: string) => {
    // Simulando geração de documentação
    toast({
      title: "Documentação gerada com sucesso",
      description: `A documentação para o pedido ${orderId} está pronta para impressão`,
      variant: "default",
    });
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
    <div className="container py-6 space-y-6">
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

      <Tabs defaultValue="todos" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos os Pedidos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="preparacao">Em Preparação</TabsTrigger>
          <TabsTrigger value="revisao">Em Revisão</TabsTrigger>
          <TabsTrigger value="urgentes">Urgentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="space-y-4">
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
                              <DropdownMenuItem onClick={() => openDetailModal(order)}>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStatusModal(order)}>
                                Atualizar status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateLabel(order.id)}>
                                Gerar etiqueta
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateDocumentation(order.id)}>
                                Gerar documentação
                              </DropdownMenuItem>
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

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        {selectedOrder && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Pedido {selectedOrder.id}
              </DialogTitle>
              <DialogDescription>
                Informações completas sobre o pedido
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Gerais</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1
                          ${selectedOrder.status === "pendente" ? "bg-amber-50 text-amber-700" : ""}
                          ${selectedOrder.status === "preparacao" ? "bg-blue-50 text-blue-700" : ""}
                          ${selectedOrder.status === "revisao" ? "bg-purple-50 text-purple-700" : ""}
                          ${selectedOrder.status === "enviado" ? "bg-green-50 text-green-700" : ""}
                          ${selectedOrder.status === "entregue" ? "bg-green-50 text-green-700" : ""}
                          ${selectedOrder.status === "cancelado" ? "bg-red-50 text-red-700" : ""}
                        `}
                      >
                        {selectedOrder.status === "pendente" ? "Pendente" : 
                         selectedOrder.status === "preparacao" ? "Em Preparação" : 
                         selectedOrder.status === "revisao" ? "Em Revisão" :
                         selectedOrder.status === "enviado" ? "Enviado" :
                         selectedOrder.status === "entregue" ? "Entregue" :
                         "Cancelado"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Prioridade</div>
                    <div>
                      <Badge 
                        variant="outline" 
                        className={`mt-1
                          ${selectedOrder.prioridade === "baixa" ? "bg-green-50 text-green-700" : ""}
                          ${selectedOrder.prioridade === "media" ? "bg-blue-50 text-blue-700" : ""}
                          ${selectedOrder.prioridade === "alta" ? "bg-red-50 text-red-700" : ""}
                        `}
                      >
                        {selectedOrder.prioridade === "baixa" ? "Baixa" : 
                         selectedOrder.prioridade === "media" ? "Média" : 
                         "Alta"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Data</div>
                    <div className="text-base flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedOrder.data}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Método de Pagamento</div>
                    <div className="text-base">{selectedOrder.metodoPagamento || "Não informado"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
                    <div className="text-base">{selectedOrder.valorTotal ? `R$ ${selectedOrder.valorTotal.toFixed(2)}` : "Não informado"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Transportadora</div>
                    <div className="text-base flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedOrder.transportadora || "Não definida"}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Nome</div>
                    <div className="text-base flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedOrder.cliente}
                    </div>
                  </div>
                  
                  {selectedOrder.email && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Email</div>
                      <div className="text-base">{selectedOrder.email}</div>
                    </div>
                  )}
                  
                  {selectedOrder.telefone && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                      <div className="text-base">{selectedOrder.telefone}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Destino</div>
                    <div className="text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedOrder.destino}
                    </div>
                  </div>
                  
                  {selectedOrder.endereco && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Endereço</div>
                      <div className="text-base">{selectedOrder.endereco}</div>
                    </div>
                  )}
                  
                  {selectedOrder.cep && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">CEP</div>
                      <div className="text-base">{selectedOrder.cep}</div>
                    </div>
                  )}
                  
                  {selectedOrder.observacoes && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Observações</div>
                      <div className="text-base">{selectedOrder.observacoes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {selectedOrder.produtos && selectedOrder.produtos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.produtos.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${item.status === "pendente" ? "bg-amber-50 text-amber-700" : ""}
                              ${item.status === "separado" ? "bg-blue-50 text-blue-700" : ""}
                              ${item.status === "embalado" ? "bg-green-50 text-green-700" : ""}
                            `}
                          >
                            {item.status === "pendente" ? "Pendente" : 
                             item.status === "separado" ? "Separado" : 
                             "Embalado"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {selectedOrder.historico && selectedOrder.historico.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Histórico do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.historico.map((evento, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium">{evento.status}</div>
                        <div className="text-xs text-muted-foreground">{evento.data}</div>
                        <div className="text-sm mt-1">{evento.descricao}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-6 gap-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openStatusModal(selectedOrder)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Atualizar Status
                </Button>
                <Button variant="outline" size="sm" onClick={() => generateLabel(selectedOrder.id)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Gerar Etiqueta
                </Button>
                <Button variant="outline" size="sm" onClick={() => generateDocumentation(selectedOrder.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Documentação
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Imprimir detalhes do pedido</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        {selectedOrder && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar status do pedido</DialogTitle>
              <DialogDescription>
                Selecione o novo status para o pedido {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="preparacao">Em Preparação</SelectItem>
                  <SelectItem value="revisao">Em Revisão</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                onClick={updateOrderStatus}
                disabled={newStatus === selectedOrder.status}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}