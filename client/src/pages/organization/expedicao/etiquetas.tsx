import React, { useState, useRef } from "react";
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
  ArrowLeft,
  Printer,
  Search,
  Download,
  FileText,
  Tag,
  QrCode,
  Truck,
  X,
  Check,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Barcode,
  Info,
  ClipboardCopy,
  Plus,
  Folder
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

// Tipo para modelo de etiqueta
interface LabelTemplate {
  id: string;
  title: string;
  format: string;
  carrier: string;
  description: string;
  dimensions: string;
  isDefault: boolean;
  paperSize: string;
  labelsPerPage?: number;
  previewImage?: string;
}

// Tipo para etiqueta
interface ShippingLabel {
  id: string;
  pedido: string;
  cliente: string;
  data: string;
  transportadora: string;
  formato: string;
  status: "pendente" | "gerada" | "impressa";
  codigoRastreio?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  items?: number;
  peso?: string;
  dimensoes?: string;
}

// Dados de exemplo para etiquetas
const mockLabels: ShippingLabel[] = [
  { 
    id: "ETQ-12345", 
    pedido: "PED-12345",
    cliente: "Carlos Silva", 
    data: "07/04/2025", 
    transportadora: "Correios", 
    formato: "10x15cm",
    status: "pendente",
    endereco: "Av. Paulista, 1000, Apto 123",
    cep: "01310-100",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 98765-4321",
    email: "carlos.silva@exemplo.com",
    codigoRastreio: "BR123456789BR",
    peso: "1,2 kg",
    dimensoes: "30x20x10 cm",
    items: 4,
    observacoes: "Entregar somente em horário comercial"
  },
  { 
    id: "ETQ-12346", 
    pedido: "PED-12346",
    cliente: "Maria Oliveira", 
    data: "07/04/2025", 
    transportadora: "JADLOG", 
    formato: "A6",
    status: "gerada",
    endereco: "Rua das Flores, 250, Bloco B",
    cep: "30130-110",
    cidade: "Belo Horizonte",
    estado: "MG",
    telefone: "(31) 99876-5432",
    email: "maria.oliveira@exemplo.com",
    codigoRastreio: "JD987654321JD",
    peso: "0,8 kg",
    dimensoes: "25x15x5 cm",
    items: 2,
    observacoes: "Cuidado: contém material frágil"
  },
  { 
    id: "ETQ-12347", 
    pedido: "PED-12347",
    cliente: "João Santos", 
    data: "06/04/2025", 
    transportadora: "Correios", 
    formato: "10x15cm",
    status: "impressa",
    endereco: "Av. Santos Dumont, 485",
    cep: "50010-000",
    cidade: "Recife",
    estado: "PE",
    telefone: "(81) 98765-4321",
    email: "joao.santos@exemplo.com",
    codigoRastreio: "BR654789123BR",
    peso: "1,5 kg",
    dimensoes: "30x22x8 cm",
    items: 3,
    observacoes: "Entrega rápida solicitada"
  },
  { 
    id: "ETQ-12348", 
    pedido: "PED-12348",
    cliente: "Ana Pereira", 
    data: "06/04/2025", 
    transportadora: "LATAM Cargo", 
    formato: "A4",
    status: "pendente",
    endereco: "Rua Bela Vista, 789, Apto 302",
    cep: "90450-230",
    cidade: "Porto Alegre",
    estado: "RS",
    telefone: "(51) 98765-4321",
    email: "ana.pereira@exemplo.com",
    codigoRastreio: "LC123456789LC",
    peso: "3,2 kg",
    dimensoes: "40x30x15 cm",
    items: 5,
    observacoes: "Enviar aviso de entrega 1h antes"
  },
  { 
    id: "ETQ-12349", 
    pedido: "PED-12349", 
    cliente: "Roberto Almeida", 
    data: "05/04/2025", 
    transportadora: "Transportadora Própria", 
    formato: "10x15cm",
    status: "impressa",
    endereco: "Rua das Palmeiras, 150",
    cep: "79002-300",
    cidade: "Campo Grande",
    estado: "MS",
    telefone: "(67) 98765-4321",
    email: "roberto.almeida@exemplo.com",
    codigoRastreio: "TP987654321TP",
    peso: "0,9 kg",
    dimensoes: "25x18x5 cm",
    items: 1,
    observacoes: "Cliente solicitou entrega no período da manhã"
  },
  { 
    id: "ETQ-12350", 
    pedido: "PED-12350",
    cliente: "Fernanda Costa", 
    data: "05/04/2025", 
    transportadora: "Correios", 
    formato: "A6",
    status: "gerada",
    endereco: "Av. Getúlio Vargas, 567, Bloco C, Apto 404",
    cep: "66055-240",
    cidade: "Belém",
    estado: "PA",
    telefone: "(91) 98765-4321",
    email: "fernanda.costa@exemplo.com",
    codigoRastreio: "BR456789123BR",
    peso: "0,5 kg",
    dimensoes: "20x15x5 cm",
    items: 3,
    observacoes: "Deixar com porteiro se destinatário não estiver"
  }
];

// Dados de exemplo para modelos de etiquetas
const labelTemplates: LabelTemplate[] = [
  {
    id: "template-1",
    title: "Padrão 10x15cm",
    format: "10x15cm",
    carrier: "Correios",
    description: "Etiqueta padrão dos Correios para encomendas nacionais",
    dimensions: "10x15cm",
    isDefault: true,
    paperSize: "Personalizado",
    labelsPerPage: 1
  },
  {
    id: "template-2",
    title: "Formato A6",
    format: "A6",
    carrier: "JADLOG",
    description: "Etiqueta no formato A6 para JADLOG",
    dimensions: "10.5x14.8cm",
    isDefault: false,
    paperSize: "A6"
  },
  {
    id: "template-3",
    title: "Formato A4 - 2 por página",
    format: "A4",
    carrier: "Múltiplas",
    description: "Layout A4 com 2 etiquetas por página, para qualquer transportadora",
    dimensions: "21x29.7cm",
    isDefault: false,
    paperSize: "A4",
    labelsPerPage: 2
  },
  {
    id: "template-4",
    title: "Transportadora Própria",
    format: "10x15cm",
    carrier: "Transportadora Própria",
    description: "Etiqueta personalizada para transportadora própria",
    dimensions: "10x15cm",
    isDefault: false,
    paperSize: "Personalizado"
  },
  {
    id: "template-5",
    title: "Etiqueta Térmica",
    format: "58mm",
    carrier: "Múltiplas",
    description: "Etiqueta para impressora térmica de 58mm",
    dimensions: "5.8x8cm",
    isDefault: false,
    paperSize: "Rolo 58mm"
  }
];

export default function Etiquetas() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormato, setSelectedFormato] = useState("all");
  const [selectedTransportadora, setSelectedTransportadora] = useState("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<ShippingLabel | null>(null);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(labelTemplates[0]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newTemplateModalOpen, setNewTemplateModalOpen] = useState(false);

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar etiquetas com base na guia selecionada e no termo de pesquisa
  const filteredLabels = mockLabels.filter(label => {
    // Filtro de status
    if (selectedTab === "pendentes" && label.status !== "pendente") return false;
    if (selectedTab === "geradas" && label.status !== "gerada") return false;
    if (selectedTab === "impressas" && label.status !== "impressa") return false;
    
    // Filtro de formato
    if (selectedFormato && selectedFormato !== "all" && label.formato !== selectedFormato) return false;
    
    // Filtro de transportadora
    if (selectedTransportadora && selectedTransportadora !== "all" && label.transportadora !== selectedTransportadora) return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        label.id.toLowerCase().includes(searchLower) ||
        label.pedido.toLowerCase().includes(searchLower) ||
        label.cliente.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Função para lidar com a seleção de etiquetas
  const toggleLabelSelection = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(selectedLabels.filter(id => id !== labelId));
    } else {
      setSelectedLabels([...selectedLabels, labelId]);
    }
  };

  // Função para selecionar todas as etiquetas
  const selectAllLabels = () => {
    if (selectedLabels.length === filteredLabels.length) {
      setSelectedLabels([]);
    } else {
      setSelectedLabels(filteredLabels.map(label => label.id));
    }
  };
  
  // Função para visualizar a etiqueta
  const viewLabel = (label: ShippingLabel) => {
    setSelectedLabel(label);
    setLabelModalOpen(true);
  };
  
  // Função para gerar a etiqueta
  const generateLabel = (labelId: string) => {
    const label = mockLabels.find(l => l.id === labelId);
    if (!label) return;
    
    // Simulando a geração da etiqueta
    toast({
      title: "Etiqueta gerada com sucesso",
      description: `A etiqueta ${labelId} para ${label.cliente} foi gerada e está pronta para impressão`,
      variant: "default",
    });
    
    // Exibir a etiqueta gerada
    viewLabel(label);
  };
  
  // Função para impressão de etiqueta
  const printLabel = () => {
    if (!labelRef.current || !selectedLabel) return;
    
    // Feedback visual antes de impressão
    toast({
      title: "Preparando impressão",
      description: "Abrindo caixa de diálogo de impressão...",
      variant: "default",
    });
    
    // Simulação de impressão
    setTimeout(() => {
      toast({
        title: "Impressão bem-sucedida",
        description: "A etiqueta foi enviada para a impressora.",
        variant: "default",
      });
    }, 1500);
  };
  
  // Função para imprimir múltiplas etiquetas
  const printMultipleLabels = () => {
    if (selectedLabels.length === 0) return;
    
    toast({
      title: "Impressão iniciada",
      description: `Imprimindo ${selectedLabels.length} etiquetas...`,
      variant: "default",
    });
    
    // Simulação de impressão em lote
    setTimeout(() => {
      toast({
        title: "Impressão concluída",
        description: `${selectedLabels.length} etiquetas foram impressas com sucesso.`,
        variant: "default",
      });
    }, 2000);
  };
  
  // Função para baixar uma etiqueta
  const downloadLabel = (labelId: string) => {
    const label = mockLabels.find(l => l.id === labelId);
    if (!label) return;
    
    try {
      toast({
        title: "Download iniciado",
        description: `A etiqueta ${labelId} está sendo baixada...`,
        variant: "default",
      });
      
      // Simulação de download
      setTimeout(() => {
        toast({
          title: "Download concluído",
          description: `A etiqueta foi salva em seus downloads`,
          variant: "default",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao tentar baixar a etiqueta. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Função para baixar múltiplas etiquetas
  const downloadMultipleLabels = () => {
    if (selectedLabels.length === 0) return;
    
    try {
      toast({
        title: "Download iniciado",
        description: `Preparando ${selectedLabels.length} etiquetas para download...`,
        variant: "default",
      });
      
      // Simulação de download em lote
      setTimeout(() => {
        toast({
          title: "Download concluído",
          description: `${selectedLabels.length} etiquetas foram baixadas com sucesso.`,
          variant: "default",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao tentar baixar as etiquetas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
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
          <h1 className="text-2xl font-bold tracking-tight">Etiquetas</h1>
          <p className="text-muted-foreground mt-1">
            Gere e imprima etiquetas para seus pedidos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            disabled={selectedLabels.length === 0}
            onClick={() => downloadMultipleLabels()}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar ({selectedLabels.length})
          </Button>
          <Button 
            variant="outline"
            onClick={() => setTemplateDialogOpen(true)}
          >
            <Folder className="h-4 w-4 mr-2" />
            Modelos
          </Button>
          <Button 
            disabled={selectedLabels.length === 0}
            onClick={() => printMultipleLabels()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir ({selectedLabels.length})
          </Button>
        </div>
      </div>

      {/* Estatísticas de Etiquetas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Total de Etiquetas</span>
              <div className="mt-1">
                <span className="text-3xl font-bold">{mockLabels.length}</span>
              </div>
              <div className="mt-4 text-blue-600 text-xs">
                <Tag className="h-3 w-3 inline mr-1" />
                Para {mockLabels.length} pedidos
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Etiquetas Pendentes</span>
              <div className="mt-1">
                <span className="text-3xl font-bold">
                  {mockLabels.filter(label => label.status === "pendente").length}
                </span>
              </div>
              <div className="mt-4 text-amber-600 text-xs">
                <X className="h-3 w-3 inline mr-1" />
                Aguardando geração
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Etiquetas Geradas</span>
              <div className="mt-1">
                <span className="text-3xl font-bold">
                  {mockLabels.filter(label => label.status === "gerada").length}
                </span>
              </div>
              <div className="mt-4 text-blue-600 text-xs">
                <QrCode className="h-3 w-3 inline mr-1" />
                Prontas para impressão
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Já Impressas</span>
              <div className="mt-1">
                <span className="text-3xl font-bold">
                  {mockLabels.filter(label => label.status === "impressa").length}
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

      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por etiqueta, pedido ou cliente..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedFormato} onValueChange={setSelectedFormato}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os formatos</SelectItem>
              <SelectItem value="10x15cm">10x15cm</SelectItem>
              <SelectItem value="A6">A6</SelectItem>
              <SelectItem value="A4">A4</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTransportadora} onValueChange={setSelectedTransportadora}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Transportadora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as transportadoras</SelectItem>
              <SelectItem value="Correios">Correios</SelectItem>
              <SelectItem value="JADLOG">JADLOG</SelectItem>
              <SelectItem value="LATAM Cargo">LATAM Cargo</SelectItem>
              <SelectItem value="Transportadora Própria">Transportadora Própria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs de categorias */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full" defaultValue="todas">
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas as Etiquetas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="geradas">Geradas</TabsTrigger>
          <TabsTrigger value="impressas">Impressas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="space-y-4">
          {/* Tabela de etiquetas */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
                        onCheckedChange={selectAllLabels}
                        aria-label="Selecionar todas as etiquetas"
                      />
                    </TableHead>
                    <TableHead>Nº Etiqueta</TableHead>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabels.length > 0 ? (
                    filteredLabels.map((label) => (
                      <TableRow key={label.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedLabels.includes(label.id)}
                            onCheckedChange={() => toggleLabelSelection(label.id)}
                            aria-label={`Selecionar etiqueta ${label.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{label.id}</TableCell>
                        <TableCell>{label.pedido}</TableCell>
                        <TableCell>{label.cliente}</TableCell>
                        <TableCell>{label.data}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Truck className="h-3 w-3 mr-1 text-muted-foreground" />
                            {label.transportadora}
                          </div>
                        </TableCell>
                        <TableCell>{label.formato}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${label.status === "pendente" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                              ${label.status === "gerada" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                              ${label.status === "impressa" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                            `}
                          >
                            {label.status === "pendente" ? "Pendente" : 
                            label.status === "gerada" ? "Gerada" : 
                            "Impressa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {label.status === "pendente" ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateLabel(label.id)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Gerar
                              </Button>
                            ) : (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => viewLabel(label)}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Visualizar etiqueta</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => downloadLabel(label.id)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Baixar etiqueta</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          viewLabel(label);
                                          setTimeout(printLabel, 500);
                                        }}
                                      >
                                        <Printer className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Imprimir etiqueta</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        Nenhuma etiqueta encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredLabels.length} de {mockLabels.length} etiquetas
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={filteredLabels.length === 0}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={filteredLabels.length === 0}>
                  Próximo
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modelo de Etiqueta */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modelos de Etiquetas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { title: "Padrão 10x15cm", icon: <Tag size={20} />, info: "Correios" },
            { title: "Formato A6", icon: <Tag size={20} />, info: "JADLOG" },
            { title: "Formato A4 - 2 por página", icon: <Tag size={20} />, info: "Múltiplas" },
            { title: "Transportadora Própria", icon: <Tag size={20} />, info: "Personalizada" },
            { title: "Etiqueta Térmica", icon: <Tag size={20} />, info: "58mm" },
            { title: "Adicionar novo modelo", icon: <Plus size={20} />, info: "Personalizada" }
          ].map((modelo, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  {React.cloneElement(modelo.icon, { className: "text-green-600" })}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{modelo.title}</h3>
                  <p className="text-xs text-muted-foreground">{modelo.info}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Diálogo de seleção de modelo de etiqueta */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Modelos de Etiquetas
            </DialogTitle>
            <DialogDescription>
              Selecione um modelo de etiqueta existente ou crie um novo modelo personalizado para usar na geração de etiquetas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {labelTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{template.title}</CardTitle>
                  <CardDescription className="text-xs">{template.carrier}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Formato:</span>
                      <span className="font-medium">{template.format}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Dimensões:</span>
                      <span className="font-medium">{template.dimensions}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Papel:</span>
                      <span className="font-medium">{template.paperSize}</span>
                    </div>
                    {template.labelsPerPage && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Etiquetas por página:</span>
                        <span className="font-medium">{template.labelsPerPage}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {template.isDefault && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                      Padrão
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            <Card 
              className="cursor-pointer transition-all hover:shadow-md border-dashed"
              onClick={() => {
                setTemplateDialogOpen(false);
                setNewTemplateModalOpen(true);
              }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-center">Criar novo modelo</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Personalize seu próprio modelo de etiqueta
                </p>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                disabled={!selectedTemplate}
                onClick={() => {
                  toast({
                    title: "Modelo definido",
                    description: `O modelo "${selectedTemplate?.title}" foi definido como padrão.`,
                    variant: "default",
                  });
                  setTemplateDialogOpen(false);
                }}
              >
                Confirmar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização de etiqueta */}
      <Dialog open={labelModalOpen} onOpenChange={setLabelModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Etiqueta de Envio
            </DialogTitle>
            <DialogDescription>
              {selectedLabel?.id} - {selectedLabel?.cliente}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLabel && (
            <div className="mt-4" ref={labelRef}>
              <div className="border border-gray-200 rounded-lg p-6 relative">
                <div className="absolute top-3 right-3 flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => {
                          navigator.clipboard.writeText(selectedLabel.codigoRastreio || "");
                          toast({
                            title: "Código copiado",
                            description: "Código de rastreio copiado para a área de transferência",
                            variant: "default",
                          });
                        }}>
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copiar código de rastreio</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-primary" />
                  {selectedLabel.transportadora}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="border bg-gray-50 rounded-md p-1 text-center mb-4">
                      <Barcode className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-sm font-mono">{selectedLabel.codigoRastreio}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedLabel.cliente}</p>
                          <p className="text-sm">{selectedLabel.endereco}</p>
                          <p className="text-sm">{selectedLabel.cidade} - {selectedLabel.estado}, {selectedLabel.cep}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">{selectedLabel.telefone}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">{selectedLabel.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-500">Informações do Envio</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Pedido:</span>
                          <span className="text-sm font-medium">{selectedLabel.pedido}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Data:</span>
                          <span className="text-sm">{selectedLabel.data}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Itens:</span>
                          <span className="text-sm">{selectedLabel.items} itens</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Peso:</span>
                          <span className="text-sm">{selectedLabel.peso}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Dimensões:</span>
                          <span className="text-sm">{selectedLabel.dimensoes}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedLabel.observacoes && (
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <div className="flex items-center mb-1">
                          <Info className="h-4 w-4 text-amber-600 mr-1" />
                          <p className="text-sm font-medium text-amber-800">Observações:</p>
                        </div>
                        <p className="text-sm text-amber-700">{selectedLabel.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <QrCode className="h-28 w-28 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">ID da Etiqueta: {selectedLabel.id}</p>
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => downloadLabel(selectedLabel.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                
                <Button onClick={printLabel}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}