import React, { useState } from "react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  Download,
  FileText,
  ClipboardList,
  Truck,
  BarChart3,
  QrCode,
  Printer,
  Check,
  AlertTriangle,
  Clock,
  PackagePlus,
  ArrowUpDown,
  PackageCheck,
  Warehouse,
  Calendar,
  CalendarClock,
  ShieldCheck,
  FileBarChart,
  ArrowRightLeft,
  Users,
  MapPin,
  History,
  Building,
  HeartPulse
} from "lucide-react";

// Dados simulados para estoque e distribuição
const stockData = [
  {
    id: "STK-0001",
    product: "CBD Óleo 1000mg",
    batchNumber: "FN-1000-0423",
    quantity: 750,
    location: "Armazém Principal A3",
    status: "disponível",
    createdAt: new Date("2025-03-15"),
    expiryDate: new Date("2027-03-15"),
    quality: "aprovado",
    notes: "Lote em condições ideais de armazenamento."
  },
  {
    id: "STK-0002",
    product: "CBD Óleo 3000mg",
    batchNumber: "FN-3000-0423",
    quantity: 425,
    location: "Armazém Principal B2",
    status: "disponível",
    createdAt: new Date("2025-03-18"),
    expiryDate: new Date("2027-03-18"),
    quality: "aprovado",
    notes: "Produto premium em área climatizada."
  },
  {
    id: "STK-0003",
    product: "CBD Óleo 2000mg",
    batchNumber: "FN-2000-0423",
    quantity: 580,
    location: "Armazém Principal A4",
    status: "em separação",
    createdAt: new Date("2025-03-20"),
    expiryDate: new Date("2027-03-20"),
    quality: "aprovado",
    notes: "Lote parcialmente separado para envio."
  },
  {
    id: "STK-0004",
    product: "Full Spectrum Óleo 1500mg",
    batchNumber: "FN-FULL-0423",
    quantity: 320,
    location: "Armazém Secundário C1",
    status: "disponível",
    createdAt: new Date("2025-03-22"),
    expiryDate: new Date("2027-03-22"),
    quality: "aprovado",
    notes: "Produto de alta demanda."
  },
  {
    id: "STK-0005",
    product: "CBD Óleo 5000mg",
    batchNumber: "FN-5000-0423",
    quantity: 180,
    location: "Área Segura S1",
    status: "bloqueado",
    createdAt: new Date("2025-03-25"),
    expiryDate: new Date("2027-03-25"),
    quality: "em análise",
    notes: "Pendente de revisão de controle de qualidade."
  }
];

const distributionData = [
  {
    id: "DIST-0001",
    reference: "PED-5782",
    product: "CBD Óleo 1000mg",
    batchNumber: "FN-1000-0423",
    quantity: 50,
    destination: "Farmácia Central SP",
    status: "entregue",
    shippedDate: new Date("2025-04-01"),
    deliveryDate: new Date("2025-04-03"),
    carrier: "Transportadora Segura",
    trackingCode: "TS78925463BR"
  },
  {
    id: "DIST-0002",
    reference: "PED-5790",
    product: "CBD Óleo 3000mg",
    batchNumber: "FN-3000-0423",
    quantity: 25,
    destination: "Clínica Especial RJ",
    status: "em trânsito",
    shippedDate: new Date("2025-04-05"),
    deliveryDate: new Date("2025-04-07"),
    carrier: "Transportadora Segura",
    trackingCode: "TS79012345BR"
  },
  {
    id: "DIST-0003",
    reference: "PED-5795",
    product: "CBD Óleo 2000mg",
    batchNumber: "FN-2000-0423",
    quantity: 40,
    destination: "Distribuidora Médica MG",
    status: "separado",
    shippedDate: null,
    deliveryDate: null,
    carrier: "ExpressMed",
    trackingCode: null
  },
  {
    id: "DIST-0004",
    reference: "PED-5802",
    product: "Full Spectrum Óleo 1500mg",
    batchNumber: "FN-FULL-0423",
    quantity: 30,
    destination: "Hospital Regional PE",
    status: "agendado",
    shippedDate: null,
    deliveryDate: new Date("2025-04-10"),
    carrier: "MedExpress",
    trackingCode: null
  },
  {
    id: "DIST-0005",
    reference: "PED-5810",
    product: "CBD Óleo 1000mg",
    batchNumber: "FN-1000-0423",
    quantity: 100,
    destination: "Rede de Farmácias Sul",
    status: "preparando",
    shippedDate: null,
    deliveryDate: null,
    carrier: "LogMed",
    trackingCode: null
  }
];

interface StockItem {
  id: string;
  product: string;
  batchNumber: string;
  quantity: number;
  location: string;
  status: "disponível" | "em separação" | "bloqueado";
  createdAt: Date;
  expiryDate: Date;
  quality: "aprovado" | "em análise" | "rejeitado";
  notes: string;
}

interface DistributionItem {
  id: string;
  reference: string;
  product: string;
  batchNumber: string;
  quantity: number;
  destination: string;
  status: "separado" | "preparando" | "agendado" | "em trânsito" | "entregue";
  shippedDate: Date | null;
  deliveryDate: Date | null;
  carrier: string;
  trackingCode: string | null;
}

function EstoqueDistribuicaoPage() {
  const [searchStock, setSearchStock] = useState("");
  const [searchDistribution, setSearchDistribution] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionItem | null>(null);
  const [showStockDetailDialog, setShowStockDetailDialog] = useState(false);
  const [showDistributionDetailDialog, setShowDistributionDetailDialog] = useState(false);
  const [showNewStockDialog, setShowNewStockDialog] = useState(false);
  const [showNewDistributionDialog, setShowNewDistributionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("estoque");

  const filteredStockData = stockData.filter(item => 
    item.product.toLowerCase().includes(searchStock.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchStock.toLowerCase()) ||
    item.id.toLowerCase().includes(searchStock.toLowerCase())
  );

  const filteredDistributionData = distributionData.filter(item => 
    item.product.toLowerCase().includes(searchDistribution.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchDistribution.toLowerCase()) ||
    item.destination.toLowerCase().includes(searchDistribution.toLowerCase()) ||
    item.reference.toLowerCase().includes(searchDistribution.toLowerCase()) ||
    item.id.toLowerCase().includes(searchDistribution.toLowerCase())
  );

  const openStockDetails = (stock: StockItem) => {
    setSelectedStock(stock);
    setShowStockDetailDialog(true);
  };

  const openDistributionDetails = (distribution: DistributionItem) => {
    setSelectedDistribution(distribution);
    setShowDistributionDetailDialog(true);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Estoque e Distribuição</h1>
          <p className="text-muted-foreground">
            Gestão de produtos acabados e distribuição logística
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileBarChart className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Relatórios</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <QrCode className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Código QR</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="estoque" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estoque">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <Card className="lg:w-3/4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Gestão de Estoque</CardTitle>
                      <CardDescription>
                        Produtos finalizados disponíveis para distribuição
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowNewStockDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por produto, lote ou ID..."
                        className="pl-8"
                        value={searchStock}
                        onChange={(e) => setSearchStock(e.target.value)}
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="separacao">Em Separação</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as Localizações</SelectItem>
                        <SelectItem value="principal">Armazém Principal</SelectItem>
                        <SelectItem value="secundario">Armazém Secundário</SelectItem>
                        <SelectItem value="seguro">Área Segura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Lote</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStockData.length > 0 ? (
                          filteredStockData.map((stock) => (
                            <TableRow key={stock.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openStockDetails(stock)}>
                              <TableCell className="font-medium">{stock.id}</TableCell>
                              <TableCell>{stock.product}</TableCell>
                              <TableCell>{stock.batchNumber}</TableCell>
                              <TableCell>{stock.quantity} unid.</TableCell>
                              <TableCell>{stock.location}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    stock.status === "disponível" ? "bg-green-50 text-green-700 border-green-200" :
                                    stock.status === "em separação" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                    "bg-red-50 text-red-700 border-red-200"
                                  )}
                                >
                                  {stock.status.charAt(0).toUpperCase() + stock.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(stock.expiryDate, "dd/MM/yyyy")}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menu</span>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      openStockDetails(stock);
                                    }}>
                                      Ver detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Atualizar quantidade
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Alterar localização
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Reservar para distribuição
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              Nenhum item de estoque encontrado para os filtros aplicados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:w-1/4">
                <CardHeader>
                  <CardTitle>Resumo do Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-primary" />
                        <span>Total em Estoque</span>
                      </div>
                      <span className="font-bold">2,255 unid.</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-amber-500" />
                        <span>Reservados</span>
                      </div>
                      <span className="font-bold">170 unid.</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-500" />
                        <span>Disponíveis</span>
                      </div>
                      <span className="font-bold">1,905 unid.</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                        <span>Bloqueados</span>
                      </div>
                      <span className="font-bold">180 unid.</span>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3">Produtos Críticos</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>CBD Óleo 5000mg</span>
                          <Badge className="bg-red-50 text-red-700 border-red-200">Baixo estoque</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Full Spectrum Óleo 1500mg</span>
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200">Estoque médio</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Relatório Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Análise do Estoque</CardTitle>
                  <CardDescription>
                    Valores por categoria de produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px] flex items-end gap-1">
                    {[60, 85, 75, 45, 20].map((value, index) => (
                      <div
                        key={index}
                        className="bg-primary/80 rounded-t h-[calc(100%*var(--value)/100)]"
                        style={{ '--value': value, width: 'calc(100% / 5)' } as React.CSSProperties}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>1000mg</span>
                    <span>2000mg</span>
                    <span>3000mg</span>
                    <span>5000mg</span>
                    <span>Full Sp.</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Rastreabilidade</CardTitle>
                  <CardDescription>
                    Status de testes e controle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                        <span className="text-sm">Lotes Aprovados</span>
                      </div>
                      <span className="font-medium">4/5</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-sm">Documentos Gerados</span>
                      </div>
                      <span className="font-medium">28</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ArrowRightLeft className="h-5 w-5 mr-2 text-amber-500" />
                        <span className="text-sm">Movimentações</span>
                      </div>
                      <span className="font-medium">36</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t">
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Trilha de Auditoria</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Validade</CardTitle>
                  <CardDescription>
                    Controle de expiração de lotes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-green-500" />
                        <span className="text-sm">Longo Prazo (&gt;1 ano)</span>
                      </div>
                      <span className="font-medium">2,075 unid.</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarClock className="h-5 w-5 mr-2 text-amber-500" />
                        <span className="text-sm">Médio Prazo (6-12m)</span>
                      </div>
                      <span className="font-medium">180 unid.</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-red-500" />
                        <span className="text-sm">Curto Prazo (&lt;6m)</span>
                      </div>
                      <span className="font-medium">0 unid.</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t">
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Configurar Alertas</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="distribuicao">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <Card className="lg:w-3/4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Gestão de Distribuição</CardTitle>
                      <CardDescription>
                        Pedidos em processo de distribuição e entrega
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowNewDistributionDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Distribuição
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por produto, destino ou referência..."
                        className="pl-8"
                        value={searchDistribution}
                        onChange={(e) => setSearchDistribution(e.target.value)}
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="separado">Separado</SelectItem>
                        <SelectItem value="preparando">Preparando</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="transito">Em Trânsito</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Transportadora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="segura">Transportadora Segura</SelectItem>
                        <SelectItem value="expressmed">ExpressMed</SelectItem>
                        <SelectItem value="medexpress">MedExpress</SelectItem>
                        <SelectItem value="logmed">LogMed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Previsão</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDistributionData.length > 0 ? (
                          filteredDistributionData.map((dist) => (
                            <TableRow key={dist.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDistributionDetails(dist)}>
                              <TableCell className="font-medium">{dist.id}</TableCell>
                              <TableCell>{dist.reference}</TableCell>
                              <TableCell>{dist.product}</TableCell>
                              <TableCell>{dist.quantity} unid.</TableCell>
                              <TableCell>{dist.destination}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    dist.status === "entregue" ? "bg-green-50 text-green-700 border-green-200" :
                                    dist.status === "em trânsito" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                    dist.status === "agendado" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                    dist.status === "preparando" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    "bg-gray-50 text-gray-700 border-gray-200"
                                  )}
                                >
                                  {dist.status.charAt(0).toUpperCase() + dist.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {dist.deliveryDate 
                                  ? format(dist.deliveryDate, "dd/MM/yyyy") 
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menu</span>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      openDistributionDetails(dist);
                                    }}>
                                      Ver detalhes
                                    </DropdownMenuItem>
                                    {dist.status === "separado" && (
                                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        Preparar para envio
                                      </DropdownMenuItem>
                                    )}
                                    {dist.status === "preparando" && (
                                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        Agendar envio
                                      </DropdownMenuItem>
                                    )}
                                    {dist.status === "agendado" && (
                                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        Confirmar envio
                                      </DropdownMenuItem>
                                    )}
                                    {dist.status === "em trânsito" && (
                                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        Confirmar entrega
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                      Gerar documentação
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              Nenhum item de distribuição encontrado para os filtros aplicados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:w-1/4">
                <CardHeader>
                  <CardTitle>Status de Entregas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-gray-500" />
                        <span>Separados</span>
                      </div>
                      <span className="font-bold">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <PackageCheck className="h-5 w-5 mr-2 text-amber-500" />
                        <span>Em Preparação</span>
                      </div>
                      <span className="font-bold">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                        <span>Agendados</span>
                      </div>
                      <span className="font-bold">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Em Trânsito</span>
                      </div>
                      <span className="font-bold">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-500" />
                        <span>Entregues</span>
                      </div>
                      <span className="font-bold">1 pedido</span>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3">Transportadoras Ativas</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-primary" />
                            <span>Transportadora Segura</span>
                          </div>
                          <span>2 pedidos</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-blue-500" />
                            <span>ExpressMed</span>
                          </div>
                          <span>1 pedido</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-amber-500" />
                            <span>MedExpress</span>
                          </div>
                          <span>1 pedido</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-green-500" />
                            <span>LogMed</span>
                          </div>
                          <span>1 pedido</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mapa de Entregas</CardTitle>
                  <CardDescription>
                    Distribuição por região
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[240px] bg-muted/20 rounded-md border">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Mapa interativo de distribuição</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span>Sudeste: 3 pedidos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Nordeste: 1 pedido</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                      <span>Sul: 1 pedido</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Centro-Oeste: 0 pedidos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Destinos</CardTitle>
                  <CardDescription>
                    Tipos de estabelecimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-sm">Farmácias</span>
                      </div>
                      <span className="font-medium">2 pedidos</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HeartPulse className="h-5 w-5 mr-2 text-red-500" />
                        <span className="text-sm">Clínicas</span>
                      </div>
                      <span className="font-medium">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Warehouse className="h-5 w-5 mr-2 text-amber-500" />
                        <span className="text-sm">Distribuidoras</span>
                      </div>
                      <span className="font-medium">1 pedido</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-sm">Hospitais</span>
                      </div>
                      <span className="font-medium">1 pedido</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t">
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Análise Detalhada</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Histórico</CardTitle>
                  <CardDescription>
                    Entregas recentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <History className="h-5 w-5 mr-2 text-primary" />
                          <span className="text-sm font-medium">Entregas do Mês</span>
                        </div>
                        <span className="font-bold">56</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Total de 2,240 unidades</div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-green-500" />
                          <span className="text-sm font-medium">Novos Clientes</span>
                        </div>
                        <span className="font-bold">8</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">15% de aumento</div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">Tempo Médio</span>
                        </div>
                        <span className="font-bold">2.3 dias</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Redução de 0.5 dias</div>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t">
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Relatório Histórico</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para detalhes do item de estoque */}
      {selectedStock && (
        <Dialog open={showStockDetailDialog} onOpenChange={setShowStockDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Item de Estoque</DialogTitle>
              <DialogDescription>
                Informações detalhadas do item {selectedStock.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">ID</h3>
                  <p>{selectedStock.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedStock.status === "disponível" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedStock.status === "em separação" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {selectedStock.status.charAt(0).toUpperCase() + selectedStock.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Produto</h3>
                  <p>{selectedStock.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Lote</h3>
                  <p>{selectedStock.batchNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Quantidade</h3>
                  <p>{selectedStock.quantity} unidades</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Localização</h3>
                  <p>{selectedStock.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Data de Entrada</h3>
                  <p>{format(selectedStock.createdAt, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data de Vencimento</h3>
                  <p>{format(selectedStock.expiryDate, "dd/MM/yyyy")}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Qualidade</h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    selectedStock.quality === "aprovado" ? "bg-green-50 text-green-700 border-green-200" :
                    selectedStock.quality === "em análise" ? "bg-amber-50 text-amber-700 border-amber-200" : 
                    "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {selectedStock.quality.charAt(0).toUpperCase() + selectedStock.quality.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Observações</h3>
                <p className="text-sm text-muted-foreground">{selectedStock.notes}</p>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-2">Documentos Relacionados</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Certificado de Análise
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório QC
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowStockDetailDialog(false)}>
                Fechar
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center">
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Criar Distribuição
                </Button>
                <Button>
                  Editar Item
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo para detalhes da distribuição */}
      {selectedDistribution && (
        <Dialog open={showDistributionDetailDialog} onOpenChange={setShowDistributionDetailDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Distribuição</DialogTitle>
              <DialogDescription>
                Informações detalhadas da distribuição {selectedDistribution.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">ID</h3>
                  <p>{selectedDistribution.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Referência</h3>
                  <p>{selectedDistribution.reference}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Produto</h3>
                  <p>{selectedDistribution.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Lote</h3>
                  <p>{selectedDistribution.batchNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Quantidade</h3>
                  <p>{selectedDistribution.quantity} unidades</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedDistribution.status === "entregue" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedDistribution.status === "em trânsito" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                      selectedDistribution.status === "agendado" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      selectedDistribution.status === "preparando" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    {selectedDistribution.status.charAt(0).toUpperCase() + selectedDistribution.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Destino</h3>
                  <p>{selectedDistribution.destination}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Transportadora</h3>
                  <p>{selectedDistribution.carrier}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Data de Envio</h3>
                  <p>{selectedDistribution.shippedDate ? format(selectedDistribution.shippedDate, "dd/MM/yyyy") : "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data de Entrega Prevista</h3>
                  <p>{selectedDistribution.deliveryDate ? format(selectedDistribution.deliveryDate, "dd/MM/yyyy") : "-"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Código de Rastreamento</h3>
                <p>{selectedDistribution.trackingCode || "-"}</p>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-2">Documentos de Transporte</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Nota Fiscal
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Conhecimento
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    Etiquetas
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowDistributionDetailDialog(false)}>
                Fechar
              </Button>
              <div className="flex space-x-2">
                {selectedDistribution.trackingCode && (
                  <Button variant="outline" className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    Rastrear Envio
                  </Button>
                )}
                <Button>
                  Atualizar Status
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo para novo item de estoque */}
      <Dialog open={showNewStockDialog} onOpenChange={setShowNewStockDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Item de Estoque</DialogTitle>
            <DialogDescription>
              Adicione um novo produto ao estoque
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="product">Produto</Label>
                <Select>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd-1000">CBD Óleo 1000mg</SelectItem>
                    <SelectItem value="cbd-2000">CBD Óleo 2000mg</SelectItem>
                    <SelectItem value="cbd-3000">CBD Óleo 3000mg</SelectItem>
                    <SelectItem value="cbd-5000">CBD Óleo 5000mg</SelectItem>
                    <SelectItem value="full-spec">Full Spectrum Óleo 1500mg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="batchNumber">Número do Lote</Label>
                <Input id="batchNumber" placeholder="Ex: FN-1000-0423" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" placeholder="Quantidade em unidades" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location">Localização</Label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a1">Armazém Principal A1</SelectItem>
                    <SelectItem value="a2">Armazém Principal A2</SelectItem>
                    <SelectItem value="a3">Armazém Principal A3</SelectItem>
                    <SelectItem value="b1">Armazém Secundário B1</SelectItem>
                    <SelectItem value="s1">Área Segura S1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="createdAt">Data de Entrada</Label>
                <Input id="createdAt" type="date" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="expiryDate">Data de Vencimento</Label>
                <Input id="expiryDate" type="date" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="quality">Qualidade</Label>
              <Select>
                <SelectTrigger id="quality">
                  <SelectValue placeholder="Selecione o status de qualidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em-analise">Em Análise</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre o item..." />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStockDialog(false)}>Cancelar</Button>
            <Button type="submit" onClick={() => setShowNewStockDialog(false)}>Adicionar ao Estoque</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para nova distribuição */}
      <Dialog open={showNewDistributionDialog} onOpenChange={setShowNewDistributionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Distribuição</DialogTitle>
            <DialogDescription>
              Cadastre uma nova distribuição de produtos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="reference">Referência/Pedido</Label>
                <Input id="reference" placeholder="Ex: PED-5820" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="product">Produto</Label>
                <Select>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd-1000">CBD Óleo 1000mg</SelectItem>
                    <SelectItem value="cbd-2000">CBD Óleo 2000mg</SelectItem>
                    <SelectItem value="cbd-3000">CBD Óleo 3000mg</SelectItem>
                    <SelectItem value="cbd-5000">CBD Óleo 5000mg</SelectItem>
                    <SelectItem value="full-spec">Full Spectrum Óleo 1500mg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="batchNumber">Lote</Label>
                <Select>
                  <SelectTrigger id="batchNumber">
                    <SelectValue placeholder="Selecione o lote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fn-1000-0423">FN-1000-0423</SelectItem>
                    <SelectItem value="fn-2000-0423">FN-2000-0423</SelectItem>
                    <SelectItem value="fn-3000-0423">FN-3000-0423</SelectItem>
                    <SelectItem value="fn-5000-0423">FN-5000-0423</SelectItem>
                    <SelectItem value="fn-full-0423">FN-FULL-0423</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" placeholder="Quantidade em unidades" />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="destination">Destino</Label>
              <Input id="destination" placeholder="Nome e localização do destinatário" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="carrier">Transportadora</Label>
                <Select>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="Selecione a transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segura">Transportadora Segura</SelectItem>
                    <SelectItem value="expressmed">ExpressMed</SelectItem>
                    <SelectItem value="medexpress">MedExpress</SelectItem>
                    <SelectItem value="logmed">LogMed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Status Inicial</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="separado">Separado</SelectItem>
                    <SelectItem value="preparando">Preparando</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="shippedDate">Data de Envio</Label>
                <Input id="shippedDate" type="date" />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="deliveryDate">Data de Entrega Prevista</Label>
                <Input id="deliveryDate" type="date" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDistributionDialog(false)}>Cancelar</Button>
            <Button type="submit" onClick={() => setShowNewDistributionDialog(false)}>Cadastrar Distribuição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </OrganizationLayout>
  );
}

export default EstoqueDistribuicaoPage;