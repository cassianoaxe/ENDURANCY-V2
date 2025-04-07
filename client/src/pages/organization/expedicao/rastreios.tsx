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
  RefreshCw
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

export default function AtualizacaoRastreios() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransportadora, setSelectedTransportadora] = useState("");
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);

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
    if (selectedTransportadora && tracking.transportadora !== selectedTransportadora) return false;
    
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
      // Feedback ao usuário
      alert(`Rastreamento encontrado: ${tracking.codigo} - ${tracking.status}`);
    } else {
      // Feedback ao usuário
      alert("Rastreamento não encontrado ou inválido");
      setTrackingEvents([]);
    }
    
    setTrackingInput("");
  };

  // Função para atualizar rastreamento de transportadora
  const atualizarRastreamentos = () => {
    // Simulação de atualização de rastreamentos
    // Em um ambiente real, isso seria uma chamada a APIs das transportadoras
    alert("Solicitação de atualização de rastreamentos enviada. Isso pode levar alguns minutos.");
  };

  // Detalhes do rastreamento selecionado
  const selectedTrackingDetails = selectedTracking 
    ? mockTrackings.find(t => t.id === selectedTracking) 
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

                {/* Histórico de eventos */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Histórico de Eventos</h3>
                  <div className="bg-slate-50 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Local</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trackingEvents.map((event, index) => (
                          <TableRow key={index}>
                            <TableCell>{event.data}</TableCell>
                            <TableCell>{event.hora}</TableCell>
                            <TableCell>{event.local}</TableCell>
                            <TableCell>{event.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                    <SelectItem value="">Todas</SelectItem>
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
                                      <DropdownMenuItem>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Atualizar rastreio
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Clock className="h-4 w-4 mr-2" />
                                        Ver histórico
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
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
    </OrganizationLayout>
  );
}