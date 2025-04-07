import React, { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search, Truck, Package, Calendar, MapPin, Clipboard,
  CheckCircle, Clock, AlertTriangle, PackageCheck, FileText,
  ChevronLeft, ChevronRight, PackageOpen, RefreshCw, Eye
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useToast } from "@/hooks/use-toast";

// Dados simulados dos pedidos para rastreamento
const envios = [
  {
    id: "ENV-567890",
    pedido: "PED-39845",
    cliente: "Marina Silva",
    dataEnvio: "07/04/2025",
    status: "Entregue",
    transportadora: "Transportes Rápidos",
    codigoRastreio: "TR123456789BR",
    statusDetalhado: [
      { data: "07/04/2025 09:30", status: "Pedido recebido", local: "Sistema interno" },
      { data: "07/04/2025 14:45", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "07/04/2025 16:20", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "07/04/2025 17:30", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "07/04/2025 20:45", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "08/04/2025 08:30", status: "Em trânsito", local: "Central de distribuição - Campinas, SP" },
      { data: "08/04/2025 16:45", status: "Saiu para entrega", local: "Unidade local - Campinas, SP" },
      { data: "08/04/2025 18:30", status: "Entregue", local: "Campinas, SP" }
    ],
    enderecoEntrega: "Rua das Flores, 123 - Jardim Primavera, Campinas - SP, 13087-550",
    produtos: [
      { id: 1, nome: "Óleo Essencial de Lavanda", quantidade: 2 },
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1 }
    ],
    nfe: "12345678901234567890",
    previsaoEntrega: "08/04/2025",
    observacoes: "Entrega realizada com sucesso."
  },
  {
    id: "ENV-567891",
    pedido: "PED-39844",
    cliente: "Ricardo Santos",
    dataEnvio: "07/04/2025",
    status: "Em trânsito",
    transportadora: "Entregas Brasil",
    codigoRastreio: "EB987654321BR",
    statusDetalhado: [
      { data: "07/04/2025 10:15", status: "Pedido recebido", local: "Sistema interno" },
      { data: "07/04/2025 15:30", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "07/04/2025 17:00", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "07/04/2025 18:45", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "07/04/2025 22:15", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "08/04/2025 09:30", status: "Em trânsito", local: "Central de distribuição - Rio de Janeiro, RJ" }
    ],
    enderecoEntrega: "Av. Atlântica, 456 - Copacabana, Rio de Janeiro - RJ, 22070-000",
    produtos: [
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1 }
    ],
    nfe: "09876543210987654321",
    previsaoEntrega: "09/04/2025",
    observacoes: ""
  },
  {
    id: "ENV-567892",
    pedido: "PED-39843",
    cliente: "Carla Mendes",
    dataEnvio: "06/04/2025",
    status: "Saiu para entrega",
    transportadora: "Entregas Brasil",
    codigoRastreio: "EB567891234BR",
    statusDetalhado: [
      { data: "06/04/2025 11:00", status: "Pedido recebido", local: "Sistema interno" },
      { data: "06/04/2025 14:30", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "06/04/2025 16:15", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "06/04/2025 17:30", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "06/04/2025 20:00", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "07/04/2025 08:45", status: "Em trânsito", local: "Central de distribuição - Belo Horizonte, MG" },
      { data: "08/04/2025 07:30", status: "Saiu para entrega", local: "Unidade local - Belo Horizonte, MG" }
    ],
    enderecoEntrega: "Rua dos Ipês, 789 - Savassi, Belo Horizonte - MG, 30130-170",
    produtos: [
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 2 },
      { id: 4, nome: "Proteína Vegana (500g)", quantidade: 1 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1 }
    ],
    nfe: "54321098765432109876",
    previsaoEntrega: "08/04/2025",
    observacoes: "Cliente solicitou entrega no período da tarde."
  },
  {
    id: "ENV-567893",
    pedido: "PED-39842",
    cliente: "Marcos Oliveira",
    dataEnvio: "06/04/2025",
    status: "Entregue",
    transportadora: "Transportes Rápidos",
    codigoRastreio: "TR456789123BR",
    statusDetalhado: [
      { data: "06/04/2025 09:45", status: "Pedido recebido", local: "Sistema interno" },
      { data: "06/04/2025 13:30", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "06/04/2025 15:00", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "06/04/2025 16:45", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "06/04/2025 19:30", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "07/04/2025 07:15", status: "Em trânsito", local: "Central de distribuição - Curitiba, PR" },
      { data: "07/04/2025 13:45", status: "Saiu para entrega", local: "Unidade local - Curitiba, PR" },
      { data: "07/04/2025 16:30", status: "Entregue", local: "Curitiba, PR" }
    ],
    enderecoEntrega: "Rua das Araucárias, 321 - Batel, Curitiba - PR, 80420-000",
    produtos: [
      { id: 4, nome: "Proteína Vegana (500g)", quantidade: 2 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1 },
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 1 }
    ],
    nfe: "67890123456789012345",
    previsaoEntrega: "08/04/2025",
    observacoes: "Entrega realizada com sucesso. Cliente não estava presente, recebido por porteiro."
  },
  {
    id: "ENV-567894",
    pedido: "PED-39841",
    cliente: "Ana Pereira",
    dataEnvio: "05/04/2025",
    status: "Extraviado",
    transportadora: "Entregas Brasil",
    codigoRastreio: "EB345678912BR",
    statusDetalhado: [
      { data: "05/04/2025 10:30", status: "Pedido recebido", local: "Sistema interno" },
      { data: "05/04/2025 14:00", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "05/04/2025 15:45", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "05/04/2025 17:15", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "05/04/2025 20:30", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "06/04/2025 09:00", status: "Em trânsito", local: "Central de distribuição - Porto Alegre, RS" },
      { data: "07/04/2025 00:00", status: "Extraviado", local: "Porto Alegre, RS" }
    ],
    enderecoEntrega: "Av. Ipiranga, 987 - Partenon, Porto Alegre - RS, 90610-000",
    produtos: [
      { id: 1, nome: "Óleo Essencial de Lavanda", quantidade: 1 }
    ],
    nfe: "43210987654321098765",
    previsaoEntrega: "07/04/2025",
    observacoes: "Pacote extraviado pela transportadora. Processo de reembolso iniciado."
  },
  {
    id: "ENV-567895",
    pedido: "PED-39840",
    cliente: "Lucas Martins",
    dataEnvio: "05/04/2025",
    status: "Atraso",
    transportadora: "Transportes Rápidos",
    codigoRastreio: "TR891234567BR",
    statusDetalhado: [
      { data: "05/04/2025 11:15", status: "Pedido recebido", local: "Sistema interno" },
      { data: "05/04/2025 15:30", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "05/04/2025 17:00", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "05/04/2025 18:45", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "05/04/2025 22:00", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "06/04/2025 10:30", status: "Em trânsito", local: "Central de distribuição - Recife, PE" },
      { data: "07/04/2025 08:15", status: "Atraso na entrega", local: "Unidade local - Recife, PE" }
    ],
    enderecoEntrega: "Rua da Aurora, 654 - Boa Vista, Recife - PE, 50050-000",
    produtos: [
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 3 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1 },
      { id: 6, nome: "Vitamina D3 (30 caps)", quantidade: 1 }
    ],
    nfe: "21098765432109876543",
    previsaoEntrega: "07/04/2025",
    observacoes: "Atraso na entrega devido a condições climáticas adversas."
  },
  {
    id: "ENV-567896",
    pedido: "PED-39839",
    cliente: "Fernanda Sousa",
    dataEnvio: "04/04/2025",
    status: "Entregue",
    transportadora: "Entregas Brasil",
    codigoRastreio: "EB789123456BR",
    statusDetalhado: [
      { data: "04/04/2025 09:30", status: "Pedido recebido", local: "Sistema interno" },
      { data: "04/04/2025 13:45", status: "Pedido em separação", local: "Centro de distribuição" },
      { data: "04/04/2025 15:15", status: "Pedido embalado", local: "Centro de distribuição" },
      { data: "04/04/2025 16:30", status: "Coletado pela transportadora", local: "Centro de distribuição" },
      { data: "04/04/2025 19:45", status: "Em trânsito", local: "Centro de distribuição - São Paulo, SP" },
      { data: "05/04/2025 08:30", status: "Em trânsito", local: "Central de distribuição - Rio de Janeiro, RJ" },
      { data: "05/04/2025 14:15", status: "Saiu para entrega", local: "Unidade local - Rio de Janeiro, RJ" },
      { data: "05/04/2025 17:00", status: "Entregue", local: "Rio de Janeiro, RJ" }
    ],
    enderecoEntrega: "Rua do Catete, 123 - Catete, Rio de Janeiro - RJ, 22220-000",
    produtos: [
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1 },
      { id: 7, nome: "Colágeno Hidrolisado (300g)", quantidade: 1 },
      { id: 8, nome: "Óleo de Coco Extra Virgem (200ml)", quantidade: 1 }
    ],
    nfe: "78901234567890123456",
    previsaoEntrega: "06/04/2025",
    observacoes: "Entrega realizada antes do prazo previsto."
  }
];

export default function Rastreamento() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [transportadoraFilter, setTransportadoraFilter] = useState("Todas");
  const [selectedEnvio, setSelectedEnvio] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Status para as badges de rastreamento
  const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
    "Entregue": { 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> 
    },
    "Em trânsito": { 
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", 
      icon: <Truck className="h-3.5 w-3.5 mr-1" /> 
    },
    "Saiu para entrega": { 
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", 
      icon: <PackageCheck className="h-3.5 w-3.5 mr-1" /> 
    },
    "Atraso": { 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300", 
      icon: <Clock className="h-3.5 w-3.5 mr-1" /> 
    },
    "Extraviado": { 
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> 
    }
  };

  // Filtragem por termo de busca, status e transportadora
  const filteredEnvios = envios.filter(envio => {
    const matchesTerm = searchTerm === "" || 
      envio.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envio.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envio.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envio.codigoRastreio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "Todos" || envio.status === statusFilter;
    const matchesTransportadora = transportadoraFilter === "Todas" || envio.transportadora === transportadoraFilter;
    
    return matchesTerm && matchesStatus && matchesTransportadora;
  });

  // Paginação
  const pageCount = Math.ceil(filteredEnvios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEnvios = filteredEnvios.slice(startIndex, startIndex + itemsPerPage);

  // Abrir detalhes do envio
  const handleViewEnvio = (envio: any) => {
    setSelectedEnvio(envio);
    setIsDetailsDialogOpen(true);
  };

  // Abrir mapa
  const handleOpenMap = (envio: any) => {
    setSelectedEnvio(envio);
    setIsMapDialogOpen(true);
  };

  // Simular atualização de status
  const handleUpdateStatus = () => {
    toast({
      title: "Status atualizado",
      description: "As informações de rastreamento foram atualizadas com sucesso.",
      variant: "default",
    });
  };

  // Navegar pelas páginas
  const nextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Lista única de transportadoras
  const transportadoras = Array.from(new Set(envios.map(e => e.transportadora)));

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Rastreamento de Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe o status de entrega dos pedidos em tempo real
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <FileText className="mr-2 h-4 w-4" />
              Relatório
            </Button>
            <Button 
              className="h-9 bg-green-600 hover:bg-green-700"
              onClick={handleUpdateStatus}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Status
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por código, pedido ou cliente..." 
              className="pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os status</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Em trânsito">Em trânsito</SelectItem>
                <SelectItem value="Saiu para entrega">Saiu para entrega</SelectItem>
                <SelectItem value="Atraso">Atraso</SelectItem>
                <SelectItem value="Extraviado">Extraviado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={transportadoraFilter} onValueChange={setTransportadoraFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Transportadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas as transportadoras</SelectItem>
                {transportadoras.map((t, index) => (
                  <SelectItem key={index} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              setSearchTerm("");
              setStatusFilter("Todos");
              setTransportadoraFilter("Todas");
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Tabela de rastreamentos */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Pedido/Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data Envio</TableHead>
                  <TableHead className="hidden md:table-cell">Transportadora</TableHead>
                  <TableHead className="hidden md:table-cell">Rastreio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEnvios.length > 0 ? (
                  paginatedEnvios.map((envio) => (
                    <TableRow key={envio.id}>
                      <TableCell>
                        <div className="font-medium">{envio.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{envio.pedido}</div>
                        <div className="text-sm text-muted-foreground">{envio.cliente}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{envio.dataEnvio}</TableCell>
                      <TableCell className="hidden md:table-cell">{envio.transportadora}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {envio.codigoRastreio}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`flex items-center ${statusConfig[envio.status]?.color}`}
                        >
                          {statusConfig[envio.status]?.icon}
                          {envio.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewEnvio(envio)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <PackageOpen className="h-12 w-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium">Nenhum envio encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Tente ajustar os filtros para encontrar os envios desejados.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Paginação */}
          {filteredEnvios.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredEnvios.length)}
                </span> de <span className="font-medium">{filteredEnvios.length}</span> envios
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={currentPage === pageCount}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Modal de Detalhes do Rastreamento */}
      {selectedEnvio && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes de Rastreamento</DialogTitle>
              <DialogDescription>
                Informações completas de rastreamento do envio {selectedEnvio.id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="timeline">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1">Linha do Tempo</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Informações do Envio</TabsTrigger>
                <TabsTrigger value="items" className="flex-1">Itens</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Status de Entrega</CardTitle>
                        <CardDescription>Acompanhamento em tempo real</CardDescription>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`${statusConfig[selectedEnvio.status]?.color}`}
                      >
                        {statusConfig[selectedEnvio.status]?.icon}
                        {selectedEnvio.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6 border-l border-gray-200 dark:border-gray-800 space-y-4 py-2">
                      {selectedEnvio.statusDetalhado.map((status: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[25px] mt-1.5 h-3.5 w-3.5 rounded-full bg-green-500 dark:bg-green-700"></div>
                          <div className="flex flex-col">
                            <div className="text-sm font-medium">{status.status}</div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{status.data}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{status.local}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => handleOpenMap(selectedEnvio)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Ver no Mapa
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="pt-4">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Informações do Envio</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Código do Envio:</div>
                          <div className="text-sm font-medium">{selectedEnvio.id}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Pedido:</div>
                          <div className="text-sm font-medium">{selectedEnvio.pedido}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Data de Envio:</div>
                          <div className="text-sm">{selectedEnvio.dataEnvio}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Previsão de Entrega:</div>
                          <div className="text-sm">{selectedEnvio.previsaoEntrega}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Transportadora:</div>
                          <div className="text-sm">{selectedEnvio.transportadora}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Código de Rastreio:</div>
                          <div className="text-sm font-mono">{selectedEnvio.codigoRastreio}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">NFe:</div>
                          <div className="text-sm font-mono">{selectedEnvio.nfe}</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Destinatário e Endereço</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm text-muted-foreground">Cliente:</div>
                          <div className="text-sm font-medium">{selectedEnvio.cliente}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Endereço de Entrega:</div>
                          <div className="text-sm border p-2 rounded-md">
                            {selectedEnvio.enderecoEntrega}
                          </div>
                        </div>
                        
                        {selectedEnvio.observacoes && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Observações:</div>
                            <div className="text-sm border p-2 rounded-md">
                              {selectedEnvio.observacoes}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Itens do Envio</CardTitle>
                    <CardDescription>
                      Produtos incluídos neste envio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEnvio.produtos.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono">{item.id}</TableCell>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Fechar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Rastreamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal do Mapa */}
      {selectedEnvio && (
        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Mapa de Rastreamento</DialogTitle>
              <DialogDescription>
                Localização atual do envio {selectedEnvio.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-md p-2 flex flex-col items-center justify-center">
              <img 
                src="https://via.placeholder.com/800x400?text=Mapa+de+Rastreamento" 
                alt="Mapa de rastreamento"
                className="h-full w-full object-cover rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Origem</Label>
                <div className="text-sm mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  <span>Centro de distribuição - São Paulo, SP</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Destino</Label>
                <div className="text-sm mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-green-500" />
                  <span>{selectedEnvio.enderecoEntrega.split(',')[1]}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Status Atual</Label>
              <div className="text-sm mt-1 border rounded-md p-2">
                <div className="flex items-center">
                  <Badge 
                    variant="outline"
                    className={`mr-2 ${statusConfig[selectedEnvio.status]?.color}`}
                  >
                    {statusConfig[selectedEnvio.status]?.icon}
                    {selectedEnvio.status}
                  </Badge>
                  <span>{selectedEnvio.statusDetalhado[selectedEnvio.statusDetalhado.length-1].local}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMapDialogOpen(false)}>
                Fechar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Clipboard className="mr-2 h-4 w-4" />
                Compartilhar Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </OrganizationLayout>
  );
}