import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Trash2,
  Search,
  Calendar,
  Filter,
  Plus,
  FileText,
  BarChart2,
  Download,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  AlarmClock,
  Camera,
  Users,
} from "lucide-react";

// Tipos de dados
type DisposalReason =
  | "expirado"
  | "danificado"
  | "contaminado"
  | "fora_especificacao"
  | "teste_qualidade"
  | "erro_producao"
  | "outro";

type DisposalStatus =
  | "pendente"
  | "aprovado"
  | "realizado"
  | "documentado"
  | "cancelado";

type DisposalMethod =
  | "incineração"
  | "reciclagem"
  | "tratamento_quimico"
  | "descarte_especial"
  | "outro";

type Disposal = {
  id: string;
  code: string;
  itemName: string;
  itemCode: string;
  itemType: "materia-prima" | "em-processamento" | "produto-acabado";
  batchNumber: string;
  quantity: number;
  unit: string;
  dateRequested: Date;
  dateProcessed: Date | null;
  reason: DisposalReason;
  details: string;
  method: DisposalMethod;
  status: DisposalStatus;
  requestedBy: string;
  approvedBy: string | null;
  processedBy: string | null;
  location: string;
  disposalCertificate: string | null;
  images: string[];
  cost: number | null;
};

export default function DescartesPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [openNewDisposal, setOpenNewDisposal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentDisposal, setCurrentDisposal] = useState<Disposal | null>(null);

  const { toast } = useToast();

  // Consulta de dados (simulado por enquanto)
  const { data: disposals, isLoading } = useQuery({
    queryKey: ["/api/production/disposals"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          code: "DESC-00123",
          itemName: "CBD Isolado",
          itemCode: "MP-00123",
          itemType: "materia-prima",
          batchNumber: "LOTE-2025-0002",
          quantity: 500,
          unit: "g",
          dateRequested: new Date("2025-03-15T10:30:00"),
          dateProcessed: new Date("2025-03-18T14:45:00"),
          reason: "expirado",
          details: "Material expirado em 10/03/2025",
          method: "incineração",
          status: "documentado",
          requestedBy: "Maria Souza",
          approvedBy: "João Silva",
          processedBy: "Pedro Costa",
          location: "Armazém A - Setor de Materiais",
          disposalCertificate: "CERT-2025-0045",
          images: ["img1.jpg", "img2.jpg"],
          cost: 150.75,
        },
        {
          id: "2",
          code: "DESC-00124",
          itemName: "Óleo CBD 5% 30ml",
          itemCode: "PA-00189",
          itemType: "produto-acabado",
          batchNumber: "LOTE-2025-0010",
          quantity: 20,
          unit: "unidades",
          dateRequested: new Date("2025-03-20T09:15:00"),
          dateProcessed: new Date("2025-03-22T11:30:00"),
          reason: "danificado",
          details: "Frascos danificados durante transporte interno",
          method: "reciclagem",
          status: "documentado",
          requestedBy: "Carlos Mendes",
          approvedBy: "João Silva",
          processedBy: "Pedro Costa",
          location: "Armazém C - Setor de Produtos Acabados",
          disposalCertificate: "CERT-2025-0048",
          images: ["img3.jpg", "img4.jpg"],
          cost: 85.20,
        },
        {
          id: "3",
          code: "DESC-00125",
          itemName: "Tintura CBD 10% - Em Processamento",
          itemCode: "PP-00056",
          itemType: "em-processamento",
          batchNumber: "LOTE-2025-0018",
          quantity: 2000,
          unit: "ml",
          dateRequested: new Date("2025-04-02T15:20:00"),
          dateProcessed: null,
          reason: "fora_especificacao",
          details: "Testes de laboratório indicaram concentração incorreta de CBD",
          method: "tratamento_quimico",
          status: "aprovado",
          requestedBy: "Ana Oliveira",
          approvedBy: "João Silva",
          processedBy: null,
          location: "Área de Produção - Tanque 2",
          disposalCertificate: null,
          images: ["img5.jpg"],
          cost: null,
        },
        {
          id: "4",
          code: "DESC-00126",
          itemName: "Óleo de Coco Fracionado",
          itemCode: "MP-00245",
          itemType: "materia-prima",
          batchNumber: "LOTE-2025-0008",
          quantity: 5000,
          unit: "ml",
          dateRequested: new Date("2025-04-05T11:45:00"),
          dateProcessed: null,
          reason: "contaminado",
          details: "Contaminação detectada durante teste microbiológico",
          method: "descarte_especial",
          status: "pendente",
          requestedBy: "Renato Lima",
          approvedBy: null,
          processedBy: null,
          location: "Almoxarifado B - Prateleira 1",
          disposalCertificate: null,
          images: [],
          cost: null,
        },
        {
          id: "5",
          code: "DESC-00127",
          itemName: "Cápsulas CBD 10mg",
          itemCode: "PA-00192",
          itemType: "produto-acabado",
          batchNumber: "LOTE-2025-0020",
          quantity: 100,
          unit: "unidades",
          dateRequested: new Date("2025-04-06T16:10:00"),
          dateProcessed: null,
          reason: "teste_qualidade",
          details: "Amostras utilizadas em testes destrutivos de qualidade",
          method: "descarte_especial",
          status: "realizado",
          requestedBy: "Fernanda Lima",
          approvedBy: "João Silva",
          processedBy: "Pedro Costa",
          location: "Laboratório de Controle de Qualidade",
          disposalCertificate: null,
          images: ["img6.jpg"],
          cost: 45.50,
        },
      ] as Disposal[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredDisposals = React.useMemo(() => {
    if (!disposals) return [];

    let filtered = [...disposals];

    // Filtrar por status
    if (activeTab !== "todos") {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(term) ||
          item.itemName.toLowerCase().includes(term) ||
          item.batchNumber.toLowerCase().includes(term) ||
          item.requestedBy.toLowerCase().includes(term)
      );
    }

    // Filtro de data
    if (dateRange.from) {
      filtered = filtered.filter(
        (item) => new Date(item.dateRequested) >= new Date(dateRange.from!)
      );
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(
        (item) => new Date(item.dateRequested) <= new Date(dateRange.to!)
      );
    }

    return filtered;
  }, [disposals, activeTab, searchTerm, dateRange]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!disposals) return { 
      total: 0, 
      pendentes: 0, 
      realizados: 0, 
      custoTotal: 0 
    };
    
    return {
      total: disposals.length,
      pendentes: disposals.filter(d => d.status === "pendente" || d.status === "aprovado").length,
      realizados: disposals.filter(d => d.status === "realizado" || d.status === "documentado").length,
      custoTotal: disposals.reduce((acc, item) => acc + (item.cost || 0), 0),
    };
  }, [disposals]);

  const getReasonInfo = (reason: DisposalReason) => {
    switch (reason) {
      case "expirado":
        return {
          label: "Material Expirado",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
      case "danificado":
        return {
          label: "Material Danificado",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
      case "contaminado":
        return {
          label: "Material Contaminado",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "fora_especificacao":
        return {
          label: "Fora de Especificação",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
      case "teste_qualidade":
        return {
          label: "Testes de Qualidade",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
      case "erro_producao":
        return {
          label: "Erro de Produção",
          color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
        };
      case "outro":
        return {
          label: "Outro Motivo",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      default:
        return {
          label: reason,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const getStatusInfo = (status: DisposalStatus) => {
    switch (status) {
      case "pendente":
        return {
          label: "Pendente",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <AlarmClock className="h-4 w-4 mr-1" />,
        };
      case "aprovado":
        return {
          label: "Aprovado",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case "realizado":
        return {
          label: "Realizado",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case "documentado":
        return {
          label: "Documentado",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          icon: <ClipboardList className="h-4 w-4 mr-1" />,
        };
      case "cancelado":
        return {
          label: "Cancelado",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
        };
    }
  };

  const getMethodInfo = (method: DisposalMethod) => {
    switch (method) {
      case "incineração":
        return {
          label: "Incineração",
        };
      case "reciclagem":
        return {
          label: "Reciclagem",
        };
      case "tratamento_quimico":
        return {
          label: "Tratamento Químico",
        };
      case "descarte_especial":
        return {
          label: "Descarte Especial",
        };
      case "outro":
        return {
          label: "Outro Método",
        };
      default:
        return {
          label: method,
        };
    }
  };

  const getItemTypeInfo = (type: string) => {
    switch (type) {
      case "materia-prima":
        return {
          label: "Matéria-Prima",
        };
      case "em-processamento":
        return {
          label: "Em Processamento",
        };
      case "produto-acabado":
        return {
          label: "Produto Acabado",
        };
      default:
        return {
          label: type,
        };
    }
  };

  const handleShowDetails = (disposal: Disposal) => {
    setCurrentDisposal(disposal);
    setOpenDetailsModal(true);
  };

  const handleAddDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar criação de descarte
    toast({
      title: "Solicitação de Descarte Registrada",
      description: "A solicitação de descarte foi registrada com sucesso.",
    });
    setOpenNewDisposal(false);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Descartes</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setOpenNewDisposal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Descarte
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Estatísticas
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Descartes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os descartes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendentes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando aprovação ou processamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.realizados}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Descartes concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Custo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {stats.custoTotal.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor total dos descartes realizados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                defaultValue="todos"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="todos" className="text-xs md:text-sm">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="pendente" className="text-xs md:text-sm">
                    Pendentes
                  </TabsTrigger>
                  <TabsTrigger value="aprovado" className="text-xs md:text-sm">
                    Aprovados
                  </TabsTrigger>
                  <TabsTrigger value="realizado" className="text-xs md:text-sm">
                    Realizados
                  </TabsTrigger>
                  <TabsTrigger
                    value="documentado"
                    className="text-xs md:text-sm"
                  >
                    Documentados
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center w-full md:w-auto space-x-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar descartes..."
                    className="w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center w-full md:w-auto space-x-2">
                <div className="flex items-center space-x-2">
                  <DatePicker
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, from: date })
                    }
                    buttonLabel="De"
                    placeholder="De"
                  />
                  <DatePicker
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    buttonLabel="Até"
                    placeholder="Até"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Filtros avançados"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Solicitado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredDisposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      Nenhum descarte encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisposals.map((disposal) => {
                    const reasonInfo = getReasonInfo(disposal.reason);
                    const statusInfo = getStatusInfo(disposal.status);

                    return (
                      <TableRow key={disposal.id}>
                        <TableCell className="font-medium">
                          {disposal.code}
                        </TableCell>
                        <TableCell>
                          <div>{disposal.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {disposal.itemCode} | {getItemTypeInfo(disposal.itemType).label}
                          </div>
                        </TableCell>
                        <TableCell>{disposal.batchNumber}</TableCell>
                        <TableCell className="text-right">
                          {disposal.quantity} {disposal.unit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={reasonInfo.color}
                          >
                            {reasonInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusInfo.color}
                          >
                            <span className="flex items-center">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(disposal.dateRequested).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{disposal.requestedBy}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="h-8 px-2"
                            onClick={() => handleShowDetails(disposal)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Descarte</DialogTitle>
            <DialogDescription>
              Informações completas sobre o descarte {currentDisposal?.code}
            </DialogDescription>
          </DialogHeader>

          {currentDisposal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <div className="font-medium">{currentDisposal.code}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getStatusInfo(currentDisposal.status).color}
                    >
                      <span className="flex items-center">
                        {getStatusInfo(currentDisposal.status).icon}
                        {getStatusInfo(currentDisposal.status).label}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Motivo</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getReasonInfo(currentDisposal.reason).color}
                    >
                      {getReasonInfo(currentDisposal.reason).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Item</Label>
                <div className="font-medium">{currentDisposal.itemName}</div>
                <div className="text-sm text-muted-foreground">
                  Código: {currentDisposal.itemCode} | Tipo: {getItemTypeInfo(currentDisposal.itemType).label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Lote</Label>
                  <div>{currentDisposal.batchNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantidade</Label>
                  <div>
                    {currentDisposal.quantity} {currentDisposal.unit}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Localização</Label>
                <div>{currentDisposal.location}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Método de Descarte
                </Label>
                <div>
                  {getMethodInfo(currentDisposal.method).label}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Detalhes do Descarte
                </Label>
                <div className="text-sm">
                  {currentDisposal.details}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Data da Solicitação
                  </Label>
                  <div>
                    {new Date(currentDisposal.dateRequested).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Data do Processamento
                  </Label>
                  <div>
                    {currentDisposal.dateProcessed
                      ? new Date(currentDisposal.dateProcessed).toLocaleString()
                      : "Não processado"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Solicitado por
                  </Label>
                  <div>{currentDisposal.requestedBy}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Aprovado por
                  </Label>
                  <div>
                    {currentDisposal.approvedBy || "Não aprovado"}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Processado por
                  </Label>
                  <div>
                    {currentDisposal.processedBy || "Não processado"}
                  </div>
                </div>
              </div>

              {currentDisposal.disposalCertificate && (
                <div>
                  <Label className="text-muted-foreground">
                    Certificado de Descarte
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span>{currentDisposal.disposalCertificate}</span>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>
                </div>
              )}

              {currentDisposal.cost !== null && (
                <div>
                  <Label className="text-muted-foreground">
                    Custo do Descarte
                  </Label>
                  <div className="font-medium">
                    R$ {currentDisposal.cost.toFixed(2)}
                  </div>
                </div>
              )}

              {currentDisposal.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">
                    Imagens ({currentDisposal.images.length})
                  </Label>
                  <div className="flex mt-1 space-x-2">
                    {currentDisposal.images.map((img, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Imagem {idx + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              {currentDisposal?.status === "pendente" && (
                <>
                  <Button variant="outline" className="text-red-500">
                    Rejeitar
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Aprovar
                  </Button>
                </>
              )}
              {currentDisposal?.status === "aprovado" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  Processar Descarte
                </Button>
              )}
              {currentDisposal?.status === "realizado" && (
                <Button>Finalizar Documentação</Button>
              )}
              {currentDisposal?.status === "documentado" && (
                <Button variant="outline">Exportar Certificado</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Descarte */}
      <Dialog open={openNewDisposal} onOpenChange={setOpenNewDisposal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Descarte</DialogTitle>
            <DialogDescription>
              Preencha os dados para solicitar um novo descarte
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDisposal}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="item">Item</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MP-00123">
                      MP-00123 - CBD Isolado
                    </SelectItem>
                    <SelectItem value="MP-00245">
                      MP-00245 - Óleo de Coco Fracionado
                    </SelectItem>
                    <SelectItem value="PA-00189">
                      PA-00189 - Óleo CBD 5% 30ml
                    </SelectItem>
                    <SelectItem value="PA-00190">
                      PA-00190 - Óleo CBD 10% 30ml
                    </SelectItem>
                    <SelectItem value="PP-00056">
                      PP-00056 - Tintura CBD 10% - Em Processamento
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="batchNumber">Lote</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOTE-2025-0012">
                      LOTE-2025-0012
                    </SelectItem>
                    <SelectItem value="LOTE-2025-0015">
                      LOTE-2025-0015
                    </SelectItem>
                    <SelectItem value="LOTE-2025-0018">
                      LOTE-2025-0018
                    </SelectItem>
                    <SelectItem value="LOTE-2025-0022">
                      LOTE-2025-0022
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select required defaultValue="g">
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="l">Litros (l)</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Motivo do Descarte</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expirado">Material Expirado</SelectItem>
                    <SelectItem value="danificado">Material Danificado</SelectItem>
                    <SelectItem value="contaminado">Material Contaminado</SelectItem>
                    <SelectItem value="fora_especificacao">Fora de Especificação</SelectItem>
                    <SelectItem value="teste_qualidade">Testes de Qualidade</SelectItem>
                    <SelectItem value="erro_producao">Erro de Produção</SelectItem>
                    <SelectItem value="outro">Outro Motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="method">Método de Descarte</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incineração">Incineração</SelectItem>
                    <SelectItem value="reciclagem">Reciclagem</SelectItem>
                    <SelectItem value="tratamento_quimico">Tratamento Químico</SelectItem>
                    <SelectItem value="descarte_especial">Descarte Especial</SelectItem>
                    <SelectItem value="outro">Outro Método</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Local onde o item está armazenado"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="details">Detalhes</Label>
                <Textarea
                  id="details"
                  placeholder="Informações detalhadas sobre o motivo do descarte"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="images">Imagens (opcional)</Label>
                <Input id="images" type="file" multiple accept="image/*" />
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione fotos do material a ser descartado para documentação
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNewDisposal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Solicitar Descarte</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}