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
  Truck,
  Search,
  RefreshCw,
  Clock,
  PackageCheck,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  MapPin,
  CalendarClock,
  PackageOpen,
  Check,
  X,
  LocateFixed,
  BellPlus,
  Download,
  Upload,
  Boxes,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Dados simulados de rastreios
const rastreiosData = [
  {
    id: "TS-12345678",
    pedido: "PED-12345",
    transportadora: "Correios",
    codigoRastreio: "BR123456789BR",
    status: "transito",
    ultimaAtualizacao: "2025-04-07T10:15:00",
    destino: "São Paulo/SP",
    tempoTransito: 2,
    estimativaEntrega: "2025-04-09",
    cliente: "João Silva",
    possuiNotificacao: true,
    historico: [
      { data: "2025-04-07T10:15:00", status: "transito", local: "Centro de Distribuição, Barueri/SP", descricao: "Objeto em trânsito" },
      { data: "2025-04-07T08:30:00", status: "postado", local: "Agência dos Correios, São Paulo/SP", descricao: "Objeto postado" }
    ]
  },
  {
    id: "TS-12345679",
    pedido: "PED-12346",
    transportadora: "Jadlog",
    codigoRastreio: "JL987654321",
    status: "entrega",
    ultimaAtualizacao: "2025-04-07T09:45:00",
    destino: "Campinas/SP",
    tempoTransito: 1,
    estimativaEntrega: "2025-04-08",
    cliente: "Maria Oliveira",
    possuiNotificacao: true,
    historico: [
      { data: "2025-04-07T09:45:00", status: "entrega", local: "Em rota de entrega, Campinas/SP", descricao: "Saiu para entrega" },
      { data: "2025-04-07T07:30:00", status: "transito", local: "Centro de Distribuição, Campinas/SP", descricao: "Chegou na cidade de destino" },
      { data: "2025-04-06T21:15:00", status: "transito", local: "Centro de Distribuição, São Paulo/SP", descricao: "Em trânsito para a cidade de destino" },
      { data: "2025-04-06T18:00:00", status: "postado", local: "Centro de Postagem, São Paulo/SP", descricao: "Objeto postado" }
    ]
  },
  {
    id: "TS-12345680",
    pedido: "PED-12347",
    transportadora: "Sequoia",
    codigoRastreio: "SQ456789123",
    status: "entregue",
    ultimaAtualizacao: "2025-04-07T08:30:00",
    destino: "São Paulo/SP",
    tempoTransito: 1,
    estimativaEntrega: "2025-04-07",
    cliente: "Carlos Eduardo",
    possuiNotificacao: false,
    historico: [
      { data: "2025-04-07T08:30:00", status: "entregue", local: "Endereço do destinatário, São Paulo/SP", descricao: "Objeto entregue ao destinatário" },
      { data: "2025-04-07T07:15:00", status: "entrega", local: "Em rota de entrega, São Paulo/SP", descricao: "Saiu para entrega" },
      { data: "2025-04-06T19:40:00", status: "transito", local: "Centro de Distribuição, São Paulo/SP", descricao: "Chegou na cidade de destino" },
      { data: "2025-04-06T14:20:00", status: "postado", local: "Centro de Postagem, São Paulo/SP", descricao: "Objeto postado" }
    ]
  },
  {
    id: "TS-12345681",
    pedido: "PED-12348",
    transportadora: "Correios",
    codigoRastreio: "BR987654321BR",
    status: "problema",
    ultimaAtualizacao: "2025-04-06T15:45:00",
    destino: "Rio de Janeiro/RJ",
    tempoTransito: 3,
    estimativaEntrega: "2025-04-10",
    cliente: "Ana Carolina",
    possuiNotificacao: true,
    historico: [
      { data: "2025-04-06T15:45:00", status: "problema", local: "Centro de Distribuição, Rio de Janeiro/RJ", descricao: "Endereço insuficiente para entrega" },
      { data: "2025-04-06T09:20:00", status: "transito", local: "Centro de Distribuição, Rio de Janeiro/RJ", descricao: "Chegou na cidade de destino" },
      { data: "2025-04-05T18:30:00", status: "transito", local: "Centro de Distribuição, São Paulo/SP", descricao: "Em trânsito para a cidade de destino" },
      { data: "2025-04-05T16:15:00", status: "postado", local: "Agência dos Correios, São Paulo/SP", descricao: "Objeto postado" }
    ]
  },
  {
    id: "TS-12345682",
    pedido: "PED-12349",
    transportadora: "Mercado Envios",
    codigoRastreio: "ME789456123",
    status: "transito",
    ultimaAtualizacao: "2025-04-06T14:30:00",
    destino: "Belo Horizonte/MG",
    tempoTransito: 4,
    estimativaEntrega: "2025-04-10",
    cliente: "Roberto Santos",
    possuiNotificacao: false,
    historico: [
      { data: "2025-04-06T14:30:00", status: "transito", local: "Centro de Distribuição, Contagem/MG", descricao: "Em trânsito para a cidade de destino" },
      { data: "2025-04-05T19:15:00", status: "transito", local: "Centro de Distribuição, São Paulo/SP", descricao: "Em trânsito" },
      { data: "2025-04-05T17:00:00", status: "postado", local: "Central de Expedição, São Paulo/SP", descricao: "Objeto postado" }
    ]
  },
  {
    id: "TS-12345683",
    pedido: "PED-12350",
    transportadora: "Jadlog",
    codigoRastreio: "JL456123789",
    status: "postado",
    ultimaAtualizacao: "2025-04-06T11:10:00",
    destino: "Curitiba/PR",
    tempoTransito: 3,
    estimativaEntrega: "2025-04-09",
    cliente: "Juliana Mendes",
    possuiNotificacao: false,
    historico: [
      { data: "2025-04-06T11:10:00", status: "postado", local: "Centro de Postagem, São Paulo/SP", descricao: "Objeto postado" }
    ]
  }
];

export default function AtualizacaoRastreios() {
  const { toast } = useToast();
  const [termoBusca, setTermoBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [transportadoraFiltro, setTransportadoraFiltro] = useState("");
  const [rastreioSelecionado, setRastreioSelecionado] = useState<string | null>(null);
  const [atualizandoRastreios, setAtualizandoRastreios] = useState(false);
  const [notificacaoDialogAberta, setNotificacaoDialogAberta] = useState(false);
  const [rastreioParaNotificar, setRastreioParaNotificar] = useState<string | null>(null);
  
  // Filtrar rastreios
  const rastreiosFiltrados = rastreiosData.filter(rastreio => {
    // Filtro de status
    if (statusFiltro && rastreio.status !== statusFiltro) {
      return false;
    }
    
    // Filtro de transportadora
    if (transportadoraFiltro && rastreio.transportadora !== transportadoraFiltro) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && 
        !rastreio.pedido.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !rastreio.codigoRastreio.toLowerCase().includes(termoBusca.toLowerCase()) &&
        !rastreio.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Transportadoras únicas
  const transportadoras = Array.from(new Set(rastreiosData.map(r => r.transportadora)));
  
  // Formatar a data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Função para formatar a data simplificada
  const formatarDataSimples = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Função para atualizar rastreios
  const atualizarRastreios = () => {
    setAtualizandoRastreios(true);
    
    // Simulação de requisição
    setTimeout(() => {
      setAtualizandoRastreios(false);
      toast({
        title: "Rastreios atualizados",
        description: "Os rastreios foram atualizados com sucesso"
      });
    }, 2000);
  };
  
  // Função para enviar notificação
  const enviarNotificacao = () => {
    toast({
      title: "Notificação enviada",
      description: "O cliente foi notificado sobre o status do pedido"
    });
    
    setNotificacaoDialogAberta(false);
    setRastreioParaNotificar(null);
  };
  
  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'postado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'transito':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'entrega':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'entregue':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'problema':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'postado':
        return <PackageOpen className="h-3.5 w-3.5 mr-1" />;
      case 'transito':
        return <Truck className="h-3.5 w-3.5 mr-1" />;
      case 'entrega':
        return <MapPin className="h-3.5 w-3.5 mr-1" />;
      case 'entregue':
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case 'problema':
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Obter nome do status
  const getStatusNome = (status: string) => {
    switch (status) {
      case 'postado':
        return 'Postado';
      case 'transito':
        return 'Em Trânsito';
      case 'entrega':
        return 'Em Entrega';
      case 'entregue':
        return 'Entregue';
      case 'problema':
        return 'Problema';
      default:
        return status;
    }
  };
  
  // Obter detalhes do rastreio selecionado
  const rastreioDetalhes = rastreioSelecionado 
    ? rastreiosData.find(r => r.id === rastreioSelecionado) 
    : null;

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Atualização de Rastreios</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie e atualize o status de rastreamento de pedidos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={atualizandoRastreios}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={atualizandoRastreios}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={atualizarRastreios}
              disabled={atualizandoRastreios}
            >
              {atualizandoRastreios ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Rastreios
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Rastreios</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{rastreiosData.length}</span>
                  <span className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Truck className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Em Trânsito</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {rastreiosData.filter(r => r.status === 'transito').length}
                  </span>
                  <span className="p-2 bg-amber-100 rounded-full text-amber-600">
                    <Truck className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Em Entrega</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {rastreiosData.filter(r => r.status === 'entrega').length}
                  </span>
                  <span className="p-2 bg-purple-100 rounded-full text-purple-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Entregues</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {rastreiosData.filter(r => r.status === 'entregue').length}
                  </span>
                  <span className="p-2 bg-green-100 rounded-full text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Problemas</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {rastreiosData.filter(r => r.status === 'problema').length}
                  </span>
                  <span className="p-2 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda com a tabela de rastreios */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filtros e busca */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 w-full md:w-auto items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por pedido, rastreio ou cliente..."
                    className="pl-8"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                </div>
                
                <Select
                  value={statusFiltro}
                  onValueChange={setStatusFiltro}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="postado">Postado</SelectItem>
                    <SelectItem value="transito">Em Trânsito</SelectItem>
                    <SelectItem value="entrega">Em Entrega</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="problema">Problema</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={transportadoraFiltro}
                  onValueChange={setTransportadoraFiltro}
                >
                  <SelectTrigger className="w-[150px]">
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
              </div>
              
              <div className="text-sm text-muted-foreground">
                Exibindo {rastreiosFiltrados.length} de {rastreiosData.length} rastreios
              </div>
            </div>
            
            {/* Tabela de rastreios */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rastreio</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rastreiosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Nenhum rastreio encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    rastreiosFiltrados.map((rastreio) => (
                      <TableRow 
                        key={rastreio.id}
                        className={rastreioSelecionado === rastreio.id ? "bg-blue-50 dark:bg-blue-900/10" : ""}
                        onClick={() => setRastreioSelecionado(rastreio.id)}
                      >
                        <TableCell className="font-medium">{rastreio.pedido}</TableCell>
                        <TableCell>{rastreio.cliente}</TableCell>
                        <TableCell>{rastreio.codigoRastreio}</TableCell>
                        <TableCell>{rastreio.transportadora}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`flex w-fit items-center ${getStatusColor(rastreio.status)}`}>
                            {getStatusIcon(rastreio.status)}
                            <span>{getStatusNome(rastreio.status)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatarData(rastreio.ultimaAtualizacao)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setRastreioSelecionado(rastreio.id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setRastreioParaNotificar(rastreio.id);
                                setNotificacaoDialogAberta(true);
                              }}>
                                <BellPlus className="h-4 w-4 mr-2" />
                                Notificar Cliente
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Atualizar Manualmente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <LocateFixed className="h-4 w-4 mr-2" />
                                Rastrear Externamente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Coluna da direita com os detalhes do rastreio */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Detalhes do Rastreio</CardTitle>
                <CardDescription>
                  {rastreioSelecionado 
                    ? "Informações detalhadas e atualizações do rastreio"
                    : "Selecione um rastreio para ver detalhes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!rastreioSelecionado ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Truck className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum rastreio selecionado</h3>
                    <p className="text-muted-foreground">
                      Clique em um rastreio na tabela para ver os detalhes
                    </p>
                  </div>
                ) : (
                  <>
                    {rastreioDetalhes && (
                      <div className="space-y-6">
                        {/* Informações básicas */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{rastreioDetalhes.pedido}</h3>
                            <Badge variant="outline" className={`${getStatusColor(rastreioDetalhes.status)}`}>
                              {getStatusNome(rastreioDetalhes.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Código:</span>{' '}
                              <span className="font-medium">{rastreioDetalhes.codigoRastreio}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cliente:</span>{' '}
                              <span className="font-medium">{rastreioDetalhes.cliente}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Transportadora:</span>{' '}
                              <span className="font-medium">{rastreioDetalhes.transportadora}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Destino:</span>{' '}
                              <span className="font-medium">{rastreioDetalhes.destino}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status e Previsão */}
                        <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <h4 className="text-sm font-medium">Previsão de Entrega</h4>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold">{formatarDataSimples(rastreioDetalhes.estimativaEntrega)}</p>
                              <p className="text-xs text-muted-foreground">
                                {rastreioDetalhes.status === 'entregue' 
                                  ? 'Entregue no prazo'
                                  : `Em ${rastreioDetalhes.tempoTransito} ${rastreioDetalhes.tempoTransito === 1 ? 'dia' : 'dias'} (estimado)`}
                              </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <CalendarClock className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Histórico de rastreio */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Histórico de Rastreamento</h4>
                          
                          <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
                            {rastreioDetalhes.historico.map((evento, index) => (
                              <div 
                                key={index}
                                className="relative pb-4"
                              >
                                <div className="absolute -left-[21px] mt-1.5 h-3 w-3 rounded-full bg-white dark:bg-gray-900 border-[3px] border-blue-600"></div>
                                
                                <div className="mb-1 flex items-center">
                                  <p className="text-sm font-medium">
                                    {getStatusNome(evento.status)}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 ${getStatusColor(evento.status)}`}
                                  >
                                    {getStatusIcon(evento.status)}
                                    <span className="text-xs">{getStatusNome(evento.status)}</span>
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground">{evento.local}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatarData(evento.data)}</p>
                                
                                <p className="text-sm mt-1">{evento.descricao}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Ações disponíveis */}
                        <div className="pt-4 border-t">
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="justify-start"
                              onClick={() => {
                                setRastreioParaNotificar(rastreioDetalhes.id);
                                setNotificacaoDialogAberta(true);
                              }}
                            >
                              <BellPlus className="h-4 w-4 mr-2" />
                              Notificar Cliente
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start">
                              <LocateFixed className="h-4 w-4 mr-2" />
                              Rastrear Externamente
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Atualizar Status Manualmente
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Diálogo de Notificação */}
        <Dialog open={notificacaoDialogAberta} onOpenChange={setNotificacaoDialogAberta}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Notificar Cliente</DialogTitle>
              <DialogDescription>
                Envie uma notificação para o cliente sobre o status do pedido
              </DialogDescription>
            </DialogHeader>
            
            {rastreioParaNotificar && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  {(() => {
                    const rastreio = rastreiosData.find(r => r.id === rastreioParaNotificar);
                    if (!rastreio) return null;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Pedido:</span>
                          <span>{rastreio.pedido}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cliente:</span>
                          <span>{rastreio.cliente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Status Atual:</span>
                          <Badge variant="outline" className={`${getStatusColor(rastreio.status)}`}>
                            {getStatusNome(rastreio.status)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem Personalizada (opcional)</Label>
                  <Textarea 
                    id="mensagem"
                    placeholder="Adicione uma mensagem personalizada para o cliente..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    A notificação incluirá automaticamente informações sobre o status atual do pedido
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Método de Notificação</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email" defaultChecked />
                      <Label htmlFor="email" className="font-normal">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sms" />
                      <Label htmlFor="sms" className="font-normal">SMS</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setNotificacaoDialogAberta(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={enviarNotificacao}
                className="bg-green-600 hover:bg-green-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Notificação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </OrganizationLayout>
  );
}