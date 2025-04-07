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
  Truck,
  Package,
  MapPin,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Activity,
  Clipboard,
  Clock,
  RefreshCw,
  PlusCircle,
  Info,
  Edit,
  ExternalLink,
  Link,
  FileText,
  CalendarRange,
  Boxes,
  BellRing,
  PlusSquare,
  RotateCw,
  ChevronRight,
  Eye,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Dados de exemplo para rastreamentos
const mockTrackings = [
  { 
    id: "TR-12345", 
    codigo: "JO123456789BR",
    transportadora: "Correios",
    dataAtualizacao: "07/04/2025 14:23",
    status: "em_transito",
    previsaoEntrega: "10/04/2025",
    origem: "São Paulo, SP",
    destino: "Rio de Janeiro, RJ",
    progressoEntrega: 65,
    pedido: "PED-12345",
    malote: "MAL-12345",
    ultimaAtualizacao: "Em trânsito - Centro de Distribuição Rio de Janeiro"
  },
  { 
    id: "TR-12346", 
    codigo: "JD987654321BR",
    transportadora: "JADLOG",
    dataAtualizacao: "07/04/2025 10:15",
    status: "postado",
    previsaoEntrega: "12/04/2025",
    origem: "São Paulo, SP",
    destino: "Belo Horizonte, MG",
    progressoEntrega: 25,
    pedido: "PED-12346",
    malote: "MAL-12346",
    ultimaAtualizacao: "Objeto postado"
  },
  { 
    id: "TR-12347", 
    codigo: "LA987654321BR",
    transportadora: "LATAM Cargo",
    dataAtualizacao: "06/04/2025 16:42",
    status: "em_transito",
    previsaoEntrega: "08/04/2025",
    origem: "São Paulo, SP",
    destino: "Salvador, BA",
    progressoEntrega: 45,
    pedido: "PED-12347",
    malote: "MAL-12347",
    ultimaAtualizacao: "Objeto em trânsito - de São Paulo para Salvador"
  },
  { 
    id: "TR-12348", 
    codigo: "JO567891234BR",
    transportadora: "Correios",
    dataAtualizacao: "06/04/2025 09:30",
    status: "entregue",
    previsaoEntrega: "06/04/2025",
    origem: "São Paulo, SP",
    destino: "Curitiba, PR",
    progressoEntrega: 100,
    pedido: "PED-12348",
    malote: "MAL-12348",
    ultimaAtualizacao: "Objeto entregue ao destinatário"
  },
  { 
    id: "TR-12349", 
    codigo: "TP123456",
    transportadora: "Transportadora Própria",
    dataAtualizacao: "05/04/2025 17:12",
    status: "problemas",
    previsaoEntrega: "08/04/2025",
    origem: "São Paulo, SP",
    destino: "Porto Alegre, RS",
    progressoEntrega: 50,
    pedido: "PED-12349",
    malote: "MAL-12349",
    ultimaAtualizacao: "Tentativa de entrega não realizada - Destinatário ausente"
  },
  { 
    id: "TR-12350", 
    codigo: "JO123123123BR",
    transportadora: "Correios",
    dataAtualizacao: "05/04/2025 11:05",
    status: "entregue",
    previsaoEntrega: "05/04/2025",
    origem: "São Paulo, SP",
    destino: "Campinas, SP",
    progressoEntrega: 100,
    pedido: "PED-12350",
    malote: "MAL-12350",
    ultimaAtualizacao: "Objeto entregue ao destinatário"
  }
];

// Histórico de eventos de um rastreamento específico
const exampleTrackingEvents = [
  {
    data: "07/04/2025",
    hora: "14:23",
    local: "Rio de Janeiro / RJ",
    status: "Em trânsito - Centro de Distribuição Rio de Janeiro",
    detalhes: "Objeto em trânsito - de Unidade de Tratamento para Centro de Distribuição"
  },
  {
    data: "07/04/2025",
    hora: "08:45",
    local: "Rio de Janeiro / RJ",
    status: "Objeto recebido na unidade de distribuição",
    detalhes: "Objeto recebido na unidade de distribuição em Rio de Janeiro"
  },
  {
    data: "06/04/2025",
    hora: "22:30",
    local: "São Paulo / SP",
    status: "Objeto em trânsito - de São Paulo para Rio de Janeiro",
    detalhes: "Objeto encaminhado de Unidade de Tratamento em São Paulo para Unidade de Distribuição em Rio de Janeiro"
  },
  {
    data: "06/04/2025",
    hora: "15:12",
    local: "São Paulo / SP",
    status: "Objeto postado",
    detalhes: "Objeto postado pelo remetente em Agência dos Correios em São Paulo"
  }
];

// Lista de transportadoras disponíveis
const carriers = [
  "Correios",
  "JADLOG",
  "LATAM Cargo",
  "DHL",
  "Fedex",
  "Transportadora Própria",
  "Azul Cargo"
];

// Interface para tipagem dos eventos de rastreamento
interface TrackingEvent {
  data: string;
  hora: string;
  local: string;
  status: string;
  detalhes: string;
  icon?: React.ReactNode;
}

// Interface para tipagem dos rastreamentos
interface Tracking {
  id: string;
  codigo: string;
  transportadora: string;
  dataAtualizacao: string;
  status: "postado" | "em_transito" | "entregue" | "problemas";
  previsaoEntrega: string;
  origem: string;
  destino: string;
  progressoEntrega: number;
  pedido: string;
  malote: string;
  ultimaAtualizacao: string;
}

export default function AtualizacaoRastreios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransportadora, setSelectedTransportadora] = useState("");
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  
  // Estados para modal de atualização de status
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [trackingToUpdate, setTrackingToUpdate] = useState<Tracking | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  
  // Estados para modal de adição de rastreamento
  const [isAddTrackingModalOpen, setIsAddTrackingModalOpen] = useState(false);
  const [newTrackingCode, setNewTrackingCode] = useState("");
  const [newTrackingCarrier, setNewTrackingCarrier] = useState("");
  const [newTrackingOrder, setNewTrackingOrder] = useState("");
  const [newTrackingOrigin, setNewTrackingOrigin] = useState("");
  const [newTrackingDestination, setNewTrackingDestination] = useState("");
  const [newTrackingPackage, setNewTrackingPackage] = useState("");
  
  // Estados para notificações
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [trackingToNotify, setTrackingToNotify] = useState<Tracking | null>(null);
  const [notifyMessage, setNotifyMessage] = useState("");
  
  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar rastreamentos com base na guia selecionada e no termo de pesquisa
  const filteredTrackings = mockTrackings.filter(tracking => {
    // Filtro de status
    if (selectedTab === "em_transito" && tracking.status !== "em_transito") return false;
    if (selectedTab === "postado" && tracking.status !== "postado") return false;
    if (selectedTab === "entregue" && tracking.status !== "entregue") return false;
    if (selectedTab === "problemas" && tracking.status !== "problemas") return false;
    
    // Filtro de transportadora
    if (selectedTransportadora && selectedTransportadora !== "all" && tracking.transportadora !== selectedTransportadora) return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tracking.id.toLowerCase().includes(searchLower) ||
        tracking.codigo.toLowerCase().includes(searchLower) ||
        tracking.pedido.toLowerCase().includes(searchLower) ||
        tracking.malote.toLowerCase().includes(searchLower) ||
        tracking.destino.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Função para consultar rastreamento (simula uma consulta)
  const consultarRastreamento = () => {
    if (!trackingInput.trim()) return;
    
    // Simulação de consulta a API de rastreamento
    // Em um ambiente real, isso seria uma chamada a uma API de Correios, JADLOG, etc.
    const tracking = mockTrackings.find(t => t.codigo === trackingInput);
    
    if (tracking) {
      setSelectedTracking(tracking.id);
      setTrackingEvents(exampleTrackingEvents);
      
      // Feedback ao usuário usando toast
      toast({
        title: "Rastreamento encontrado",
        description: `Código ${tracking.codigo} - Status: ${
          tracking.status === "postado" ? "Postado" : 
          tracking.status === "em_transito" ? "Em Trânsito" : 
          tracking.status === "entregue" ? "Entregue" :
          "Problemas"
        }`,
        variant: "default",
      });
    } else {
      // Feedback ao usuário
      toast({
        title: "Rastreamento não encontrado",
        description: "O código informado não foi encontrado ou é inválido.",
        variant: "destructive",
      });
      setTrackingEvents([]);
    }
    
    setTrackingInput("");
  };

  // Função para atualizar rastreamento de transportadora
  const atualizarRastreamentos = () => {
    // Simulação de atualização de rastreamentos
    // Em um ambiente real, isso seria uma chamada a APIs das transportadoras
    toast({
      title: "Atualizando rastreamentos",
      description: "Solicitação de atualização enviada. Isso pode levar alguns minutos.",
      variant: "default",
    });
  };
  
  // Função para adicionar um novo rastreamento
  const adicionarNovoRastreamento = () => {
    if (!newTrackingCode || !newTrackingCarrier) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos o código e a transportadora.",
        variant: "destructive",
      });
      return;
    }
    
    // Em um ambiente real, isso seria uma chamada à API para registrar o rastreamento
    toast({
      title: "Rastreamento adicionado",
      description: `O código ${newTrackingCode} foi adicionado com sucesso.`,
      variant: "default",
    });
    
    // Limpar campos do formulário
    setNewTrackingCode("");
    setNewTrackingCarrier("");
    setNewTrackingOrder("");
    setNewTrackingOrigin("");
    setNewTrackingDestination("");
    setNewTrackingPackage("");
    
    // Fechar modal
    setIsAddTrackingModalOpen(false);
  };
  
  // Função para atualizar o status de um rastreamento
  const atualizarStatusRastreamento = () => {
    if (!trackingToUpdate || !newStatus) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione um status para atualizar.",
        variant: "destructive",
      });
      return;
    }
    
    // Em um ambiente real, isso seria uma chamada à API para atualizar o status
    toast({
      title: "Status atualizado",
      description: `O rastreamento ${trackingToUpdate.codigo} foi atualizado para ${
        newStatus === "postado" ? "Postado" : 
        newStatus === "em_transito" ? "Em Trânsito" : 
        newStatus === "entregue" ? "Entregue" :
        "Problemas"
      }.`,
      variant: "default",
    });
    
    // Fechar modal e limpar campos
    setIsUpdateStatusModalOpen(false);
    setNewStatus("");
    setStatusNotes("");
    setTrackingToUpdate(null);
  };
  
  // Função para enviar notificação sobre um rastreamento
  const enviarNotificacao = () => {
    if (!trackingToNotify || !notifyMessage) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, escreva uma mensagem para notificar.",
        variant: "destructive",
      });
      return;
    }
    
    // Em um ambiente real, isso seria uma chamada à API para enviar notificação
    toast({
      title: "Notificação enviada",
      description: `A notificação sobre o rastreamento ${trackingToNotify.codigo} foi enviada.`,
      variant: "default",
    });
    
    // Fechar modal e limpar campos
    setIsNotifyModalOpen(false);
    setNotifyMessage("");
    setTrackingToNotify(null);
  };
  
  // Função para abrir modal de atualização de status
  const openUpdateStatusModal = (tracking: Tracking) => {
    setTrackingToUpdate(tracking);
    setNewStatus(tracking.status);
    setIsUpdateStatusModalOpen(true);
  };
  
  // Função para abrir modal de notificação
  const openNotifyModal = (tracking: Tracking) => {
    setTrackingToNotify(tracking);
    setIsNotifyModalOpen(true);
  };

  // Detalhes do rastreamento selecionado
  const selectedTrackingDetails = selectedTracking 
    ? mockTrackings.find(t => t.id === selectedTracking) as Tracking | null
    : null;

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
            <h1 className="text-2xl font-bold tracking-tight">Atualização de Rastreios</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe e atualize os rastreamentos de seus envios
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddTrackingModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Rastreamento
            </Button>
            <Button onClick={atualizarRastreamentos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Rastreamentos
            </Button>
          </div>
        </div>

        {selectedTrackingDetails ? (
          // Detalhes do rastreamento selecionado
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Detalhes do Rastreamento</CardTitle>
                    <CardDescription>
                      Código: {selectedTrackingDetails.codigo} • 
                      Transportadora: {selectedTrackingDetails.transportadora}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTracking(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar à lista
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progresso da entrega */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Progresso da Entrega</div>
                    <div className="text-sm font-medium">{selectedTrackingDetails.progressoEntrega}%</div>
                  </div>
                  <Progress value={selectedTrackingDetails.progressoEntrega} className="h-2" />
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Package className="h-3 w-3 mr-1" />
                      Postado
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Truck className="h-3 w-3 mr-1" />
                      Em trânsito
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      Entregue
                    </div>
                  </div>
                </div>

                {/* Informações principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Informações da Remessa</h3>
                      <Separator className="my-2" />
                      <dl className="divide-y">
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">ID Rastreio:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.id}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Código:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.codigo}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Transportadora:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.transportadora}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Pedido:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.pedido}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Malote:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.malote}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Status e Datas</h3>
                      <Separator className="my-2" />
                      <dl className="divide-y">
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Status:</dt>
                          <dd className="text-sm">
                            <Badge 
                              variant="outline" 
                              className={`
                                ${selectedTrackingDetails.status === "postado" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                ${selectedTrackingDetails.status === "em_transito" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                ${selectedTrackingDetails.status === "entregue" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                ${selectedTrackingDetails.status === "problemas" ? "bg-red-50 text-red-700 hover:bg-red-50" : ""}
                              `}
                            >
                              {selectedTrackingDetails.status === "postado" ? "Postado" : 
                              selectedTrackingDetails.status === "em_transito" ? "Em Trânsito" : 
                              selectedTrackingDetails.status === "entregue" ? "Entregue" :
                              "Problemas"}
                            </Badge>
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Última Atualização:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.dataAtualizacao}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Previsão de Entrega:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.previsaoEntrega}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Origem:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.origem}</dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm text-muted-foreground">Destino:</dt>
                          <dd className="text-sm font-medium">{selectedTrackingDetails.destino}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                {/* Histórico de eventos com timeline */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium">Histórico de Eventos</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateStatusModal(selectedTrackingDetails as Tracking)}
                    >
                      <PlusSquare className="h-4 w-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-6">
                      {trackingEvents.map((event, index) => (
                        <div key={index} className="relative pl-6 pb-6">
                          {/* Linha vertical conectando os eventos */}
                          {index !== trackingEvents.length - 1 && (
                            <div className="absolute left-[10px] top-[24px] bottom-0 w-[2px] bg-slate-200"></div>
                          )}
                          
                          {/* Círculo indicador */}
                          <div className="absolute left-0 top-1 w-[20px] h-[20px] rounded-full border-2 border-primary bg-background flex items-center justify-center">
                            {index === 0 ? (
                              <div className="w-[8px] h-[8px] rounded-full bg-primary"></div>
                            ) : null}
                          </div>
                          
                          {/* Conteúdo do evento */}
                          <div className="bg-white rounded-lg border p-3 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-sm">{event.status}</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CalendarRange className="h-3 w-3 mr-1" />
                                {event.data} {event.hora}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {event.local}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.detalhes}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {trackingEvents.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          Nenhum evento de rastreamento encontrado
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Clipboard className="h-4 w-4 mr-2" />
                    Imprimir Histórico
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTracking(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar à Lista
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Lista de rastreamentos
          <div className="space-y-6">
            {/* Consulta de rastreio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultar Rastreamento</CardTitle>
                <CardDescription>
                  Digite o código de rastreamento para consultar o status atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Digite o código de rastreamento..."
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                    />
                  </div>
                  <Button onClick={consultarRastreamento} disabled={!trackingInput.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Consultar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Rastreamentos */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Total de Rastreamentos</span>
                    <div className="mt-1">
                      <span className="text-3xl font-bold">{mockTrackings.length}</span>
                    </div>
                    <div className="mt-4 text-blue-600 text-xs">
                      <Activity className="h-3 w-3 inline mr-1" />
                      Acompanhamento ativo
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Em Trânsito</span>
                    <div className="mt-1">
                      <span className="text-3xl font-bold">
                        {mockTrackings.filter(track => track.status === "em_transito" || track.status === "postado").length}
                      </span>
                    </div>
                    <div className="mt-4 text-amber-600 text-xs">
                      <Truck className="h-3 w-3 inline mr-1" />
                      Objetos em transporte
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Entregues</span>
                    <div className="mt-1">
                      <span className="text-3xl font-bold">
                        {mockTrackings.filter(track => track.status === "entregue").length}
                      </span>
                    </div>
                    <div className="mt-4 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      Objetos entregues com sucesso
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">Com Problemas</span>
                    <div className="mt-1">
                      <span className="text-3xl font-bold">
                        {mockTrackings.filter(track => track.status === "problemas").length}
                      </span>
                    </div>
                    <div className="mt-4 text-red-600 text-xs">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Requer atenção
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
                  placeholder="Buscar por rastreio, pedido ou destino..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedTransportadora} onValueChange={setSelectedTransportadora}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Correios">Correios</SelectItem>
                    <SelectItem value="JADLOG">JADLOG</SelectItem>
                    <SelectItem value="LATAM Cargo">LATAM Cargo</SelectItem>
                    <SelectItem value="Transportadora Própria">Transportadora Própria</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={atualizarRastreamentos} className="whitespace-nowrap">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Tabs de categorias */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos os Rastreamentos</TabsTrigger>
                <TabsTrigger value="em_transito">Em Trânsito</TabsTrigger>
                <TabsTrigger value="postado">Postados</TabsTrigger>
                <TabsTrigger value="entregue">Entregues</TabsTrigger>
                <TabsTrigger value="problemas">Com Problemas</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="space-y-4">
                {/* Tabela de rastreamentos */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Transportadora</TableHead>
                          <TableHead>Última Atualização</TableHead>
                          <TableHead>Progresso</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrackings.length > 0 ? (
                          filteredTrackings.map((tracking) => (
                            <TableRow key={tracking.id}>
                              <TableCell className="font-medium">{tracking.codigo}</TableCell>
                              <TableCell>{tracking.pedido}</TableCell>
                              <TableCell>{tracking.transportadora}</TableCell>
                              <TableCell>{tracking.dataAtualizacao}</TableCell>
                              <TableCell>
                                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`absolute left-0 top-0 h-full rounded-full ${
                                      tracking.status === "problemas" ? "bg-red-500" : "bg-green-500"
                                    }`}
                                    style={{ width: `${tracking.progressoEntrega}%` }}
                                  ></div>
                                </div>
                              </TableCell>
                              <TableCell>{tracking.destino}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    ${tracking.status === "postado" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                    ${tracking.status === "em_transito" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                    ${tracking.status === "entregue" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                                    ${tracking.status === "problemas" ? "bg-red-50 text-red-700 hover:bg-red-50" : ""}
                                  `}
                                >
                                  {tracking.status === "postado" ? "Postado" : 
                                  tracking.status === "em_transito" ? "Em Trânsito" : 
                                  tracking.status === "entregue" ? "Entregue" :
                                  "Problemas"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTracking(tracking.id);
                                      setTrackingEvents(exampleTrackingEvents);
                                    }}
                                  >
                                    Detalhes
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setSelectedTracking(tracking.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver detalhes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openUpdateStatusModal(tracking as Tracking)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Atualizar status
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openNotifyModal(tracking as Tracking)}>
                                        <BellRing className="h-4 w-4 mr-2" />
                                        Enviar notificação
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setSelectedTracking(tracking.id)}>
                                        <Clock className="h-4 w-4 mr-2" />
                                        Ver histórico
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        toast({
                                          title: "Etiqueta gerada",
                                          description: `Etiqueta para o rastreamento ${tracking.codigo} foi gerada.`,
                                          variant: "default",
                                        });
                                      }}>
                                        <Clipboard className="h-4 w-4 mr-2" />
                                        Imprimir etiqueta
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
                              Nenhum rastreamento encontrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <div className="text-xs text-muted-foreground">
                      Mostrando {filteredTrackings.length} de {mockTrackings.length} rastreamentos
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled={filteredTrackings.length === 0}>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" disabled={filteredTrackings.length === 0}>
                        Próximo
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Modal para adicionar novo rastreamento */}
      <Dialog open={isAddTrackingModalOpen} onOpenChange={setIsAddTrackingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Rastreamento</DialogTitle>
            <DialogDescription>
              Cadastre um novo código de rastreamento para acompanhamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                <Input
                  id="trackingCode"
                  placeholder="Ex: JO123456789BR"
                  value={newTrackingCode}
                  onChange={(e) => setNewTrackingCode(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">Transportadora</Label>
                <Select value={newTrackingCarrier} onValueChange={setNewTrackingCarrier}>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier} value={carrier}>
                        {carrier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número do Pedido</Label>
                <Input
                  id="orderNumber"
                  placeholder="Ex: PED-12345"
                  value={newTrackingOrder}
                  onChange={(e) => setNewTrackingOrder(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  placeholder="Ex: São Paulo, SP"
                  value={newTrackingOrigin}
                  onChange={(e) => setNewTrackingOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Ex: Rio de Janeiro, RJ"
                  value={newTrackingDestination}
                  onChange={(e) => setNewTrackingDestination(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="package">Malote (opcional)</Label>
              <Input
                id="package"
                placeholder="Ex: MAL-12345"
                value={newTrackingPackage}
                onChange={(e) => setNewTrackingPackage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTrackingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarNovoRastreamento}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Rastreamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para atualizar status */}
      <Dialog open={isUpdateStatusModalOpen} onOpenChange={setIsUpdateStatusModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atualizar Status do Rastreamento</DialogTitle>
            <DialogDescription>
              {trackingToUpdate && (
                <>Atualize o status do rastreamento {trackingToUpdate.codigo}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postado">Postado</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="problemas">Problemas na Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Detalhes da Atualização</Label>
              <Textarea
                id="notes"
                placeholder="Descreva os detalhes desta atualização..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={atualizarStatusRastreamento}>
              Atualizar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para enviar notificação */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              {trackingToNotify && (
                <>Envie uma notificação sobre o rastreamento {trackingToNotify.codigo}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem a ser enviada..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email" />
              <Label htmlFor="email">Enviar por e-mail</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sms" />
              <Label htmlFor="sms">Enviar por SMS</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={enviarNotificacao}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}