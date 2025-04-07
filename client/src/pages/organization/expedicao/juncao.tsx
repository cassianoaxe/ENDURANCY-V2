import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  Link2,
  Check,
  Unlink,
  Clock,
  Trash2,
  ArrowUpDown,
  MoreHorizontal,
  PackageCheck,
  Filter,
  FileText,
  Printer,
  ExternalLink,
  X,
  AlertCircle,
  Info,
  Tag,
  Truck,
  User,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Package
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

// Dados adicionais de pedidos para visualização detalhada
const mockOrderDetails = {
  "PED-12345": {
    cliente: "Carlos Silva",
    itens: [
      { id: "ITEM-001", nome: "Produto A", quantidade: 2, peso: "1.5kg" },
      { id: "ITEM-002", nome: "Produto B", quantidade: 1, peso: "0.8kg" }
    ],
    endereco: "Av. Brasil, 1500, Rio de Janeiro, RJ",
    cep: "20000-000",
    status: "separado",
    valorTotal: "R$ 350,00",
    pesoTotal: "2.3kg",
    volumeTotal: "0,015m³",
    dataPedido: "05/04/2025",
    dataEntrega: "09/04/2025"
  },
  "PED-12346": {
    cliente: "Maria Oliveira",
    itens: [
      { id: "ITEM-003", nome: "Produto C", quantidade: 3, peso: "2.0kg" }
    ],
    endereco: "Rua Voluntários da Pátria, 250, Rio de Janeiro, RJ",
    cep: "20000-001",
    status: "separado",
    valorTotal: "R$ 420,00",
    pesoTotal: "2.0kg",
    volumeTotal: "0,010m³",
    dataPedido: "05/04/2025",
    dataEntrega: "09/04/2025"
  }
};

// Transportadoras disponíveis
const mockCarriers = [
  { id: "TRANS-001", nome: "Transportadora Rápida", tipo: "Terrestre", tempoEntrega: "2-3 dias" },
  { id: "TRANS-002", nome: "Envio Express", tipo: "Aérea", tempoEntrega: "1 dia" },
  { id: "TRANS-003", nome: "Logística Total", tipo: "Terrestre", tempoEntrega: "3-5 dias" },
  { id: "TRANS-004", nome: "Entrega Econômica", tipo: "Terrestre", tempoEntrega: "5-7 dias" }
];

// Interface completa para junção
interface JunctionDetails {
  id: string;
  nome: string;
  data: string;
  status: string;
  pedidos: string[];
  destino: string;
  responsavel: string;
  transportadora?: string;
  observacoes?: string;
  pesoTotal?: string;
  volumeTotal?: string;
  valorTotal?: string;
  previsaoEntrega?: string;
}

export default function JuncaoPedidos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("ativas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedJunction, setSelectedJunction] = useState<string | null>(null);
  const [activeJunction, setActiveJunction] = useState<{
    id: string;
    nome: string;
    pedidos: string[];
  } | null>(null);
  
  // Estados para o modal de nova junção
  const [isNewJunctionModalOpen, setIsNewJunctionModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newJunctionName, setNewJunctionName] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [junctionNotes, setJunctionNotes] = useState("");
  const [createdJunctionId, setCreatedJunctionId] = useState("");
  
  // Estado para visualização detalhada de pedido
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<string | null>(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  
  // Estado para modal de processamento de junção
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [junctionToProcess, setJunctionToProcess] = useState<JunctionDetails | null>(null);

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

  // Função para filtrar pedidos por destino
  const filterOrdersByDestination = (destination: string) => {
    return mockAvailableOrders.filter(order => order.destino === destination);
  };

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

  // Função para calcular peso e volume total dos pedidos selecionados
  const calculateTotals = () => {
    return {
      peso: "5.2kg",
      volume: "0.025m³",
      valor: "R$ 1.235,00"
    };
  };

  // Função para criar uma nova junção
  const createNewJunction = () => {
    if (!newJunctionName || !selectedDestination || selectedOrders.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o nome, destino e selecione pelo menos um pedido.",
        variant: "destructive",
      });
      return;
    }
    
    // Em produção, isso seria uma chamada de API
    const junctionId = `JUNT-${Math.floor(10000 + Math.random() * 90000)}`;
    setCreatedJunctionId(junctionId);
    setIsNewJunctionModalOpen(false);
    setIsSuccessModalOpen(true);
    
    toast({
      title: "Junção criada com sucesso",
      description: `Junção ${junctionId} criada com ${selectedOrders.length} pedidos.`,
    });
  };

  // Função para simular a adição de pedidos à junção selecionada
  const addToJunction = () => {
    if (!selectedJunction || selectedOrders.length === 0) return;
    
    // Em produção, isso seria uma chamada de API
    toast({
      title: "Pedidos adicionados",
      description: `${selectedOrders.length} pedidos adicionados à junção ${selectedJunction}.`,
    });
    
    setSelectedOrders([]);
    setSelectedJunction(null);
  };

  // Função para abrir detalhes de uma junção
  const viewJunctionDetails = (junction: {id: string; nome: string; pedidos: string[]}) => {
    setActiveJunction(junction);
  };
  
  // Função para abrir visualização detalhada de um pedido
  const viewOrderDetails = (orderId: string) => {
    setSelectedOrderDetail(orderId);
    setIsOrderDetailModalOpen(true);
  };
  
  // Função para processar uma junção
  const processJunction = (junction: JunctionDetails) => {
    setJunctionToProcess(junction);
    setIsProcessModalOpen(true);
  };
  
  // Função para finalizar o processamento de uma junção
  const finalizeJunctionProcessing = () => {
    if (!junctionToProcess) return;
    
    toast({
      title: "Junção processada",
      description: `A junção ${junctionToProcess.id} foi processada e está pronta para expedição.`,
      variant: "default",
    });
    
    setIsProcessModalOpen(false);
  };
  
  // Função para remover um pedido de uma junção
  const removeOrderFromJunction = (junctionId: string, orderId: string) => {
    toast({
      title: "Pedido removido",
      description: `O pedido ${orderId} foi removido da junção ${junctionId}.`,
      variant: "default",
    });
  };
  
  // Função para gerar etiquetas para uma junção
  const generateLabelsForJunction = (junctionId: string) => {
    toast({
      title: "Etiquetas geradas",
      description: `As etiquetas para a junção ${junctionId} foram geradas com sucesso.`,
      variant: "default",
    });
    
    // Navegar para a página de etiquetas em uma aplicação real
    // navigateTo("/organization/expedicao/etiquetas");
  };
  
  // Função para gerar documentação para uma junção
  const generateDocumentsForJunction = (junctionId: string) => {
    toast({
      title: "Documentação gerada",
      description: `A documentação para a junção ${junctionId} foi gerada com sucesso.`,
      variant: "default",
    });
    
    // Navegar para a página de documentação em uma aplicação real
    // navigateTo("/organization/expedicao/documentacao");
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
            {activeJunction && (
              <Button 
                variant="outline"
                onClick={() => setActiveJunction(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à lista
              </Button>
            )}
            <Dialog open={isNewJunctionModalOpen} onOpenChange={setIsNewJunctionModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedOrders([]);
                  setNewJunctionName("");
                  setSelectedDestination("");
                  setSelectedCarrier("");
                  setJunctionNotes("");
                  setIsNewJunctionModalOpen(true);
                }}>
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Nova Junção
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Junção de Pedidos</DialogTitle>
                  <DialogDescription>
                    Agrupe pedidos com destinos semelhantes para otimizar o envio e reduzir custos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={newJunctionName}
                      onChange={(e) => setNewJunctionName(e.target.value)}
                      placeholder="Ex: Entrega RJ - 10/04"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="destino" className="text-right">
                      Destino
                    </Label>
                    <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                      <SelectTrigger className="col-span-3" id="destino">
                        <SelectValue placeholder="Selecione o destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rio de Janeiro, RJ">Rio de Janeiro, RJ</SelectItem>
                        <SelectItem value="São Paulo, SP">São Paulo, SP</SelectItem>
                        <SelectItem value="Belo Horizonte, MG">Belo Horizonte, MG</SelectItem>
                        <SelectItem value="Porto Alegre, RS">Porto Alegre, RS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="transportadora" className="text-right">
                      Transportadora
                    </Label>
                    <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                      <SelectTrigger className="col-span-3" id="transportadora">
                        <SelectValue placeholder="Selecione a transportadora (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCarriers.map(carrier => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.nome} ({carrier.tipo} - {carrier.tempoEntrega})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="observacoes" className="text-right">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={junctionNotes}
                      onChange={(e) => setJunctionNotes(e.target.value)}
                      placeholder="Informações adicionais sobre esta junção"
                      className="col-span-3"
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Pedidos disponíveis</h4>
                      {selectedOrders.length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {selectedOrders.length} pedidos selecionados
                        </Badge>
                      )}
                    </div>
                    
                    {selectedDestination ? (
                      <div className="max-h-[200px] overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">
                                <Checkbox 
                                  checked={
                                    filterOrdersByDestination(selectedDestination).length > 0 && 
                                    selectedOrders.length === filterOrdersByDestination(selectedDestination).length
                                  }
                                  onCheckedChange={() => {
                                    const ordersForDestination = filterOrdersByDestination(selectedDestination);
                                    if (ordersForDestination.length === selectedOrders.length) {
                                      setSelectedOrders([]);
                                    } else {
                                      setSelectedOrders(ordersForDestination.map(o => o.id));
                                    }
                                  }}
                                  aria-label="Selecionar todos os pedidos"
                                />
                              </TableHead>
                              <TableHead>Pedido</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Itens</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filterOrdersByDestination(selectedDestination).length > 0 ? (
                              filterOrdersByDestination(selectedDestination).map((order) => (
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
                                  <TableCell>{order.itens}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                  Nenhum pedido disponível para este destino
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 border rounded-md text-muted-foreground">
                        <Info className="h-4 w-4 mr-2" />
                        Selecione um destino para ver os pedidos disponíveis
                      </div>
                    )}
                  </div>
                  
                  {selectedOrders.length > 0 && (
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <PackageCheck className="h-4 w-4 mr-2" />
                        Resumo da Junção
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Peso:</span> {calculateTotals().peso}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume:</span> {calculateTotals().volume}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor:</span> {calculateTotals().valor}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewJunctionModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" onClick={createNewJunction} disabled={!newJunctionName || !selectedDestination || selectedOrders.length === 0}>
                    Criar Junção
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal de sucesso */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-green-600">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Junção Criada com Sucesso
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <p>A junção <span className="font-medium">{createdJunctionId}</span> foi criada com {selectedOrders.length} pedidos.</p>
                  
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Próximos passos
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        Gerar etiquetas para expedição
                      </p>
                      <p className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Criar documentação de transporte
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setIsSuccessModalOpen(false);
                    // Recarregar a lista de junções em um caso real
                  }}>
                    Entendi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal de detalhes do pedido */}
            <Dialog open={isOrderDetailModalOpen} onOpenChange={setIsOrderDetailModalOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Detalhes do Pedido</DialogTitle>
                  <DialogDescription>
                    {selectedOrderDetail && `Informações completas sobre o pedido ${selectedOrderDetail}`}
                  </DialogDescription>
                </DialogHeader>
                {selectedOrderDetail && mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails] && (
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Informações do Cliente
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Nome:</span> 
                            <span className="font-medium text-foreground">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].cliente}</span>
                          </p>
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Endereço:</span> 
                            <span className="font-medium text-foreground">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].endereco}</span>
                          </p>
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>CEP:</span> 
                            <span className="font-medium text-foreground">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].cep}</span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Informações do Pedido
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Data do Pedido:</span> 
                            <span className="font-medium text-foreground">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].dataPedido}</span>
                          </p>
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Entrega Prevista:</span> 
                            <span className="font-medium text-foreground">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].dataEntrega}</span>
                          </p>
                          <p className="text-muted-foreground flex items-center justify-between">
                            <span>Status:</span> 
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              {mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].status}
                            </Badge>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Itens do Pedido
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Peso</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].itens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.id}</TableCell>
                              <TableCell>{item.nome}</TableCell>
                              <TableCell>{item.quantidade}</TableCell>
                              <TableCell>{item.peso}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-muted-foreground text-sm">Valor Total:</span>
                        <p className="font-medium">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].valorTotal}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Peso Total:</span>
                        <p className="font-medium">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].pesoTotal}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Volume Total:</span>
                        <p className="font-medium">{mockOrderDetails[selectedOrderDetail as keyof typeof mockOrderDetails].volumeTotal}</p>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOrderDetailModalOpen(false)}>Fechar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal de processamento de junção */}
            <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Processar Junção</DialogTitle>
                  <DialogDescription>
                    {junctionToProcess && `Finalize a junção ${junctionToProcess.id} para expedição`}
                  </DialogDescription>
                </DialogHeader>
                {junctionToProcess && (
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Informações da Junção
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">ID:</span> {junctionToProcess.id}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nome:</span> {junctionToProcess.nome}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data:</span> {junctionToProcess.data}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Destino:</span> {junctionToProcess.destino}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Responsável:</span> {junctionToProcess.responsavel}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span> 
                          <Badge variant="outline" className={`ml-1
                            ${junctionToProcess.status === "aberta" ? "bg-amber-50 text-amber-700" : ""}
                            ${junctionToProcess.status === "processando" ? "bg-blue-50 text-blue-700" : ""}
                            ${junctionToProcess.status === "finalizada" ? "bg-green-50 text-green-700" : ""}
                          `}>
                            {junctionToProcess.status === "aberta" ? "Aberta" : 
                            junctionToProcess.status === "processando" ? "Processando" : 
                            "Finalizada"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        Transportadora
                      </h4>
                      <Select defaultValue={selectedCarrier} onValueChange={setSelectedCarrier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a transportadora" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCarriers.map(carrier => (
                            <SelectItem key={carrier.id} value={carrier.id}>
                              {carrier.nome} ({carrier.tipo} - {carrier.tempoEntrega})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="process-notes">Observações</Label>
                      <Textarea
                        id="process-notes"
                        placeholder="Informações adicionais sobre a expedição"
                        value={junctionNotes}
                        onChange={(e) => setJunctionNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 bg-muted p-4 rounded-md">
                      <div>
                        <span className="text-muted-foreground text-xs">Pedidos</span>
                        <p className="font-medium">{junctionToProcess.pedidos.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Peso estimado</span>
                        <p className="font-medium">{junctionToProcess.pesoTotal || "5.2kg"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Volume</span>
                        <p className="font-medium">{junctionToProcess.volumeTotal || "0.025m³"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmação
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="confirm-process" />
                        <Label htmlFor="confirm-process">
                          Confirmo que todos os pedidos desta junção foram verificados e estão prontos para expedição
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>Cancelar</Button>
                  <Button onClick={finalizeJunctionProcessing}>
                    Finalizar Processamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => viewOrderDetails(pedido)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeOrderFromJunction(activeJunction.id, pedido)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
                                        <DropdownMenuItem onClick={() => {
                                          processJunction(junction as JunctionDetails);
                                        }}>
                                          <PackageCheck className="h-4 w-4 mr-2" />
                                          Processar junção
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => generateLabelsForJunction(junction.id)}>
                                          <Tag className="h-4 w-4 mr-2" />
                                          Gerar etiquetas
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => generateDocumentsForJunction(junction.id)}>
                                          <FileText className="h-4 w-4 mr-2" />
                                          Gerar documentação
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Cancelar junção
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
                                      <DropdownMenuItem onClick={() => viewOrderDetails(order.id)}>
                                        <Info className="h-4 w-4 mr-2" />
                                        Ver detalhes
                                      </DropdownMenuItem>
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