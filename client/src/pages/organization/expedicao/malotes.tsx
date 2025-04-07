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
  PackageOpen,
  Truck,
  Search,
  Filter,
  Plus,
  Scan,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  Boxes,
  ChevronDown,
  QrCode,
  Package,
  LockKeyhole
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Dados simulados de malotes
const malotesExistentes = [
  {
    id: "ML-001234",
    tipo: "padrao",
    transportadora: "Correios",
    destino: "São Paulo/SP",
    status: "pendente",
    dataCriacao: "2025-04-07T10:30:00",
    pedidos: 3,
    peso: 4.5,
    volume: 0.027,
    lacre: "LC-987654",
    etiquetaGerada: true
  },
  {
    id: "ML-001235",
    tipo: "seguro",
    transportadora: "Jadlog",
    destino: "Campinas/SP",
    status: "despachado",
    dataCriacao: "2025-04-07T09:15:00",
    pedidos: 5,
    peso: 7.8,
    volume: 0.052,
    lacre: "LC-987655",
    etiquetaGerada: true
  },
  {
    id: "ML-001236",
    tipo: "padrao",
    transportadora: "Sequoia",
    destino: "Rio de Janeiro/RJ",
    status: "pendente",
    dataCriacao: "2025-04-07T08:45:00",
    pedidos: 2,
    peso: 3.2,
    volume: 0.019,
    lacre: "LC-987656",
    etiquetaGerada: false
  },
  {
    id: "ML-001237",
    tipo: "seguro",
    transportadora: "Correios",
    destino: "Belo Horizonte/MG",
    status: "despachado",
    dataCriacao: "2025-04-06T15:20:00",
    pedidos: 4,
    peso: 6.1,
    volume: 0.038,
    lacre: "LC-987657",
    etiquetaGerada: true
  },
  {
    id: "ML-001238",
    tipo: "padrao",
    transportadora: "Mercado Envios",
    destino: "Curitiba/PR",
    status: "pendente",
    dataCriacao: "2025-04-06T14:10:00",
    pedidos: 3,
    peso: 4.3,
    volume: 0.025,
    lacre: "LC-987658",
    etiquetaGerada: false
  },
  {
    id: "ML-001239",
    tipo: "seguro",
    transportadora: "Shopee Logística",
    destino: "Florianópolis/SC",
    status: "despachado",
    dataCriacao: "2025-04-06T13:05:00",
    pedidos: 6,
    peso: 9.5,
    volume: 0.063,
    lacre: "LC-987659",
    etiquetaGerada: true
  }
];

// Grupos de pedidos disponíveis para malotes
const gruposDisponiveis = [
  {
    id: "GRP-001",
    transportadora: "Correios",
    destino: "Brasília/DF",
    pedidos: 4,
    itens: 12,
    peso: 5.8,
    volume: 0.035
  },
  {
    id: "GRP-002",
    transportadora: "Jadlog",
    destino: "Salvador/BA",
    pedidos: 3,
    itens: 9,
    peso: 4.2,
    volume: 0.026
  },
  {
    id: "GRP-003",
    transportadora: "Correios",
    destino: "Recife/PE",
    pedidos: 5,
    itens: 14,
    peso: 6.7,
    volume: 0.042
  }
];

export default function RegistroMalotes() {
  const { toast } = useToast();
  const [termoBusca, setTermoBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [transportadoraFiltro, setTransportadoraFiltro] = useState("");
  const [novoMaloteAberto, setNovoMaloteAberto] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [tipoMalote, setTipoMalote] = useState("padrao");
  
  // Filtrar malotes
  const malotesFiltrados = malotesExistentes.filter(malote => {
    // Filtro de status
    if (statusFiltro && malote.status !== statusFiltro) {
      return false;
    }
    
    // Filtro de transportadora
    if (transportadoraFiltro && malote.transportadora !== transportadoraFiltro) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && 
        !malote.id.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !malote.destino.toLowerCase().includes(termoBusca.toLowerCase()) &&
        !malote.lacre.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Transportadoras únicas
  const transportadoras = Array.from(new Set(malotesExistentes.map(m => m.transportadora)));
  
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
  
  // Função para criar um novo malote
  const criarNovoMalote = () => {
    if (!grupoSelecionado) {
      toast({
        title: "Erro ao criar malote",
        description: "Selecione um grupo de pedidos",
        variant: "destructive",
      });
      return;
    }
    
    // Em um app real, enviaria ao backend
    const grupo = gruposDisponiveis.find(g => g.id === grupoSelecionado);
    
    toast({
      title: "Malote criado com sucesso",
      description: `Malote para ${grupo?.destino} via ${grupo?.transportadora} criado`
    });
    
    // Resetar estado e fechar diálogo
    setNovoMaloteAberto(false);
    setGrupoSelecionado("");
    setTipoMalote("padrao");
  };
  
  // Função para gerar etiqueta
  const gerarEtiqueta = (maloteId: string) => {
    toast({
      title: "Etiqueta gerada",
      description: `Etiqueta para o malote ${maloteId} gerada com sucesso`
    });
  };
  
  // Função para despachar malote
  const despacharMalote = (maloteId: string) => {
    toast({
      title: "Malote despachado",
      description: `Malote ${maloteId} despachado para transportadora`
    });
  };
  
  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'despachado':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case 'despachado':
        return <Truck className="h-3.5 w-3.5 mr-1" />;
      default:
        return <PackageOpen className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Obter ícone do tipo de malote
  const getTipoMaloteIcon = (tipo: string) => {
    switch (tipo) {
      case 'seguro':
        return <LockKeyhole className="h-4 w-4 mr-2 text-purple-600" />;
      default:
        return <PackageOpen className="h-4 w-4 mr-2 text-blue-600" />;
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registro de Malotes</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie malotes para despacho de pedidos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Scan className="w-4 h-4 mr-2" />
              Escanear
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Etiquetas
            </Button>
            <Dialog open={novoMaloteAberto} onOpenChange={setNovoMaloteAberto}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Malote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Malote</DialogTitle>
                  <DialogDescription>
                    Selecione um grupo de pedidos para criar um novo malote
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="grupo">Grupo de Pedidos</Label>
                    <Select value={grupoSelecionado} onValueChange={setGrupoSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {gruposDisponiveis.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.id}>
                            {grupo.id} - {grupo.destino} ({grupo.pedidos} pedidos)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {grupoSelecionado && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Detalhes do Grupo</h4>
                      {(() => {
                        const grupo = gruposDisponiveis.find(g => g.id === grupoSelecionado);
                        if (!grupo) return null;
                        
                        return (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Destino:</span>{' '}
                              <span className="font-medium">{grupo.destino}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Transportadora:</span>{' '}
                              <span className="font-medium">{grupo.transportadora}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pedidos:</span>{' '}
                              <span className="font-medium">{grupo.pedidos}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Itens:</span>{' '}
                              <span className="font-medium">{grupo.itens}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Peso:</span>{' '}
                              <span className="font-medium">{grupo.peso.toFixed(1)} kg</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Volume:</span>{' '}
                              <span className="font-medium">{grupo.volume.toFixed(3)} m³</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Malote</Label>
                    <Select value={tipoMalote} onValueChange={setTipoMalote}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrao">Malote Padrão</SelectItem>
                        <SelectItem value="seguro">Malote de Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tipoMalote === "seguro" ? 
                        "Malote com lacre de segurança e rastreamento especial" : 
                        "Malote padrão para envio de mercadorias"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setNovoMaloteAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={criarNovoMalote}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!grupoSelecionado}
                  >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Criar Malote
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Malotes</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{malotesExistentes.length}</span>
                  <span className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <PackageOpen className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pendentes</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {malotesExistentes.filter(m => m.status === 'pendente').length}
                  </span>
                  <span className="p-2 bg-amber-100 rounded-full text-amber-600">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Despachados</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {malotesExistentes.filter(m => m.status === 'despachado').length}
                  </span>
                  <span className="p-2 bg-green-100 rounded-full text-green-600">
                    <Truck className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Grupos Disponíveis</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{gruposDisponiveis.length}</span>
                  <span className="p-2 bg-purple-100 rounded-full text-purple-600">
                    <Boxes className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="malotes">
          <TabsList className="mb-4">
            <TabsTrigger value="malotes">Malotes</TabsTrigger>
            <TabsTrigger value="grupos">Grupos Disponíveis</TabsTrigger>
          </TabsList>
          
          {/* Tab de Malotes */}
          <TabsContent value="malotes" className="space-y-4">
            {/* Filtros e busca */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 w-full md:w-auto items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID, destino ou lacre..."
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
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="despachado">Despachados</SelectItem>
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
                Exibindo {malotesFiltrados.length} de {malotesExistentes.length} malotes
              </div>
            </div>
            
            {/* Tabela de malotes */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Lacre</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {malotesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                        Nenhum malote encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    malotesFiltrados.map((malote) => (
                      <TableRow key={malote.id}>
                        <TableCell className="font-medium">{malote.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getTipoMaloteIcon(malote.tipo)}
                            <span>
                              {malote.tipo === 'seguro' ? 'Segurança' : 'Padrão'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{malote.destino}</TableCell>
                        <TableCell>{malote.transportadora}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`flex w-fit items-center ${getStatusColor(malote.status)}`}>
                            {getStatusIcon(malote.status)}
                            <span>
                              {malote.status === 'pendente' ? 'Pendente' : 
                               malote.status === 'despachado' ? 'Despachado' : 
                               malote.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>{malote.pedidos}</TableCell>
                        <TableCell>{malote.peso.toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{malote.lacre}</span>
                            {malote.tipo === 'seguro' && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                <LockKeyhole className="h-3 w-3 mr-1" />
                                Seguro
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              
                              {!malote.etiquetaGerada && (
                                <DropdownMenuItem onClick={() => gerarEtiqueta(malote.id)}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Gerar etiqueta
                                </DropdownMenuItem>
                              )}
                              
                              {malote.etiquetaGerada && (
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Imprimir etiqueta
                                </DropdownMenuItem>
                              )}
                              
                              {malote.status === 'pendente' && (
                                <DropdownMenuItem onClick={() => despacharMalote(malote.id)}>
                                  <Truck className="h-4 w-4 mr-2" />
                                  Despachar
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Gerar QR Code
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
          </TabsContent>
          
          {/* Tab de Grupos Disponíveis */}
          <TabsContent value="grupos">
            <Card>
              <CardHeader>
                <CardTitle>Grupos Disponíveis para Malotes</CardTitle>
                <CardDescription>
                  Grupos de pedidos que podem ser convertidos em malotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Transportadora</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gruposDisponiveis.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            Não há grupos disponíveis para criação de malotes
                          </TableCell>
                        </TableRow>
                      ) : (
                        gruposDisponiveis.map((grupo) => (
                          <TableRow key={grupo.id}>
                            <TableCell className="font-medium">{grupo.id}</TableCell>
                            <TableCell>{grupo.destino}</TableCell>
                            <TableCell>{grupo.transportadora}</TableCell>
                            <TableCell>{grupo.pedidos}</TableCell>
                            <TableCell>{grupo.itens}</TableCell>
                            <TableCell>{grupo.peso.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setGrupoSelecionado(grupo.id);
                                  setNovoMaloteAberto(true);
                                }}
                              >
                                <PackagePlus className="h-4 w-4 mr-2" />
                                Criar Malote
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}