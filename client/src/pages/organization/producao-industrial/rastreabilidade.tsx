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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FileSearch,
  Search,
  Calendar,
  Filter,
  FileText,
  Download,
  User,
  Clock,
  BarChart2,
  Package,
  ArrowRightLeft,
  List,
  Clipboard,
  ChevronRight,
  FileDigit,
  Loader2,
  QrCode,
} from "lucide-react";

// Tipos de dados
type AuditTrailType =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "view"
  | "print"
  | "export"
  | "approve"
  | "reject"
  | "process"
  | "batch"
  | "movement";

type AuditTrailCategory =
  | "system"
  | "user"
  | "inventory"
  | "production"
  | "quality"
  | "disposal"
  | "batch"
  | "report";

type AuditTrailEntity =
  | "user"
  | "product"
  | "material"
  | "batch"
  | "order"
  | "disposal"
  | "movement"
  | "report"
  | "certificate"
  | "test"
  | "system";

type AuditTrailEntry = {
  id: string;
  timestamp: Date;
  type: AuditTrailType;
  category: AuditTrailCategory;
  entity: AuditTrailEntity;
  entityId: string;
  entityName: string;
  action: string;
  details: string;
  userId: number;
  username: string;
  userIp: string;
  changes: Record<string, { before: any; after: any }> | null;
  relatedBatch?: string;
  relatedIds?: string[];
};

export default function RastreabilidadePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<AuditTrailEntry | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceData, setTraceData] = useState<AuditTrailEntry[] | null>(null);

  const { toast } = useToast();

  // Consulta de dados (simulado)
  const { data: auditTrail, isLoading } = useQuery({
    queryKey: ["/api/audit-trail"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          timestamp: new Date("2025-04-08T09:15:30"),
          type: "create",
          category: "production",
          entity: "order",
          entityId: "OP-2025-0034",
          entityName: "Ordem de Produção",
          action: "Criação de Ordem de Produção",
          details: "Criação de nova ordem de produção para Óleo CBD 5% 30ml",
          userId: 1,
          username: "joao.silva",
          userIp: "192.168.1.101",
          changes: null,
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "2",
          timestamp: new Date("2025-04-08T10:30:45"),
          type: "update",
          category: "production",
          entity: "order",
          entityId: "OP-2025-0034",
          entityName: "Ordem de Produção",
          action: "Atualização de Status",
          details: "Ordem de produção iniciada",
          userId: 2,
          username: "maria.souza",
          userIp: "192.168.1.102",
          changes: {
            status: {
              before: "planejada",
              after: "em andamento",
            },
          },
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "3",
          timestamp: new Date("2025-04-08T11:45:20"),
          type: "movement",
          category: "inventory",
          entity: "material",
          entityId: "MOV-00056",
          entityName: "Movimentação de Estoque",
          action: "Saída de Material",
          details: "Retirada de CBD Isolado para uso na produção",
          userId: 2,
          username: "maria.souza",
          userIp: "192.168.1.102",
          changes: null,
          relatedBatch: "LOTE-2025-0012",
          relatedIds: ["OP-2025-0034"],
        },
        {
          id: "4",
          timestamp: new Date("2025-04-08T14:20:15"),
          type: "update",
          category: "production",
          entity: "batch",
          entityId: "LOTE-2025-0022",
          entityName: "Lote de Produção",
          action: "Atualização de Etapa",
          details: "Etapa de Mistura e Homogeneização concluída",
          userId: 2,
          username: "maria.souza",
          userIp: "192.168.1.102",
          changes: {
            currentStep: {
              before: "Mistura e Homogeneização",
              after: "Envase",
            },
            progress: {
              before: 30,
              after: 60,
            },
          },
          relatedBatch: "LOTE-2025-0022",
          relatedIds: ["OP-2025-0034"],
        },
        {
          id: "5",
          timestamp: new Date("2025-04-09T09:10:25"),
          type: "create",
          category: "quality",
          entity: "test",
          entityId: "TST-00078",
          entityName: "Teste de Qualidade",
          action: "Registro de Teste",
          details: "Teste de Concentração de CBD realizado",
          userId: 3,
          username: "renato.lima",
          userIp: "192.168.1.103",
          changes: null,
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "6",
          timestamp: new Date("2025-04-09T10:45:30"),
          type: "approve",
          category: "quality",
          entity: "batch",
          entityId: "LOTE-2025-0022",
          entityName: "Lote de Produção",
          action: "Aprovação de Lote",
          details: "Lote aprovado pelo controle de qualidade",
          userId: 3,
          username: "renato.lima",
          userIp: "192.168.1.103",
          changes: {
            status: {
              before: "em análise",
              after: "aprovado",
            },
          },
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "7",
          timestamp: new Date("2025-04-09T15:30:20"),
          type: "update",
          category: "production",
          entity: "order",
          entityId: "OP-2025-0034",
          entityName: "Ordem de Produção",
          action: "Atualização de Status",
          details: "Ordem de produção concluída",
          userId: 2,
          username: "maria.souza",
          userIp: "192.168.1.102",
          changes: {
            status: {
              before: "em andamento",
              after: "concluída",
            },
            progress: {
              before: 90,
              after: 100,
            },
          },
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "8",
          timestamp: new Date("2025-04-10T08:45:10"),
          type: "movement",
          category: "inventory",
          entity: "movement",
          entityId: "MOV-00078",
          entityName: "Movimentação de Estoque",
          action: "Entrada de Produto",
          details: "Entrada de produto acabado no estoque",
          userId: 4,
          username: "pedro.costa",
          userIp: "192.168.1.104",
          changes: null,
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "9",
          timestamp: new Date("2025-04-11T09:20:15"),
          type: "create",
          category: "quality",
          entity: "certificate",
          entityId: "CERT-00045",
          entityName: "Certificado de Análise",
          action: "Emissão de Certificado",
          details: "Certificado de análise emitido para o lote",
          userId: 3,
          username: "renato.lima",
          userIp: "192.168.1.103",
          changes: null,
          relatedBatch: "LOTE-2025-0022",
        },
        {
          id: "10",
          timestamp: new Date("2025-04-10T14:45:30"),
          type: "create",
          category: "disposal",
          entity: "disposal",
          entityId: "DESC-00124",
          entityName: "Solicitação de Descarte",
          action: "Registro de Descarte",
          details: "Descarte de frascos danificados",
          userId: 2,
          username: "maria.souza",
          userIp: "192.168.1.102",
          changes: null,
          relatedBatch: "LOTE-2025-0010",
        },
      ] as AuditTrailEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredEntries = React.useMemo(() => {
    if (!auditTrail) return [];

    let filtered = [...auditTrail];

    // Filtrar por categoria
    if (activeTab !== "all") {
      filtered = filtered.filter((entry) => entry.category === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.entityId.toLowerCase().includes(term) ||
          entry.entityName.toLowerCase().includes(term) ||
          entry.action.toLowerCase().includes(term) ||
          entry.details.toLowerCase().includes(term) ||
          entry.username.toLowerCase().includes(term) ||
          (entry.relatedBatch && entry.relatedBatch.toLowerCase().includes(term))
      );
    }

    // Filtro de data
    if (dateRange.from) {
      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) >= new Date(dateRange.from!)
      );
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) <= new Date(dateRange.to!)
      );
    }

    return filtered;
  }, [auditTrail, activeTab, searchTerm, dateRange]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!auditTrail) return { 
      total: 0, 
      producao: 0, 
      qualidade: 0, 
      movimentacao: 0 
    };
    
    return {
      total: auditTrail.length,
      producao: auditTrail.filter(e => e.category === "production").length,
      qualidade: auditTrail.filter(e => e.category === "quality").length,
      movimentacao: auditTrail.filter(e => e.category === "inventory").length,
    };
  }, [auditTrail]);

  const getTypeInfo = (type: AuditTrailType) => {
    switch (type) {
      case "create":
        return {
          label: "Criação",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
      case "update":
        return {
          label: "Atualização",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
      case "delete":
        return {
          label: "Exclusão",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
      case "view":
        return {
          label: "Visualização",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "login":
        return {
          label: "Login",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "logout":
        return {
          label: "Logout",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "print":
        return {
          label: "Impressão",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "export":
        return {
          label: "Exportação",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "approve":
        return {
          label: "Aprovação",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
      case "reject":
        return {
          label: "Rejeição",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
      case "process":
        return {
          label: "Processamento",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
      case "batch":
        return {
          label: "Lote",
          color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
        };
      case "movement":
        return {
          label: "Movimentação",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
      default:
        return {
          label: type,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const getCategoryInfo = (category: AuditTrailCategory) => {
    switch (category) {
      case "system":
        return {
          label: "Sistema",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "user":
        return {
          label: "Usuário",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "inventory":
        return {
          label: "Estoque",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
      case "production":
        return {
          label: "Produção",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
      case "quality":
        return {
          label: "Qualidade",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
      case "disposal":
        return {
          label: "Descarte",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
      case "batch":
        return {
          label: "Lote",
          color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
        };
      case "report":
        return {
          label: "Relatório",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
      default:
        return {
          label: category,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const handleShowDetails = (entry: AuditTrailEntry) => {
    setCurrentEntry(entry);
    setOpenDetailsModal(true);
  };

  const handleTraceability = () => {
    if (!selectedBatch) {
      toast({
        title: "Lote não informado",
        description: "Por favor, informe o número do lote para rastreabilidade.",
        variant: "destructive",
      });
      return;
    }

    setTraceLoading(true);

    // Simulação de chamada à API
    setTimeout(() => {
      if (auditTrail) {
        const trace = auditTrail.filter(
          (entry) => entry.relatedBatch === selectedBatch
        ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setTraceData(trace);
      }
      setTraceLoading(false);
    }, 1000);
  };

  const clearTraceability = () => {
    setSelectedBatch(null);
    setTraceData(null);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rastreabilidade e Trilha de Auditoria</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Rastreabilidade de Lote</CardTitle>
              <CardDescription>
                Rastreie o histórico completo de um lote, desde a matéria-prima até o produto final
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="w-full md:w-96">
                  <Label htmlFor="batch-number">Número do Lote</Label>
                  <Input
                    id="batch-number"
                    placeholder="Ex: LOTE-2025-0022"
                    className="mt-1"
                    value={selectedBatch || ""}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTraceability}
                    className="flex items-center"
                    disabled={traceLoading}
                  >
                    {traceLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSearch className="h-4 w-4 mr-2" />
                    )}
                    Rastrear
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearTraceability}
                    className="flex items-center"
                    disabled={!traceData}
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center"
                    title="Escanear QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {traceData && (
                <div className="mt-4 border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">
                      Histórico do Lote: {selectedBatch}
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                    >
                      {traceData.length} Eventos
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {traceData.map((event, index) => (
                      <div
                        key={event.id}
                        className="flex flex-col md:flex-row md:items-start gap-4 border-b last:border-0 pb-4"
                      >
                        <div className="flex-none">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <Badge
                                variant="outline"
                                className={getCategoryInfo(event.category).color}
                              >
                                {getCategoryInfo(event.category).label}
                              </Badge>{" "}
                              <Badge
                                variant="outline"
                                className={getTypeInfo(event.type).color}
                              >
                                {getTypeInfo(event.type).label}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                          <div className="mt-1 font-medium">{event.action}</div>
                          <div className="text-sm">{event.details}</div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <User className="h-3 w-3" /> {event.username} | <FileDigit className="h-3 w-3" /> {event.entityId}
                          </div>
                        </div>
                        <div className="flex-none">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowDetails(event)}
                          >
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de registros na trilha de auditoria
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.producao}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Eventos de produção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.qualidade}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Eventos de controle de qualidade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Movimentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.movimentacao}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Eventos de movimentação de estoque
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all" className="text-xs md:text-sm">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="production" className="text-xs md:text-sm">
                    Produção
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="text-xs md:text-sm">
                    Estoque
                  </TabsTrigger>
                  <TabsTrigger value="quality" className="text-xs md:text-sm">
                    Qualidade
                  </TabsTrigger>
                  <TabsTrigger value="disposal" className="text-xs md:text-sm">
                    Descarte
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
                    placeholder="Buscar eventos..."
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
                  <TableHead className="w-1/6">Data/Hora</TableHead>
                  <TableHead className="w-1/12">Tipo</TableHead>
                  <TableHead className="w-1/12">Categoria</TableHead>
                  <TableHead className="w-1/6">ID Relacionado</TableHead>
                  <TableHead className="w-1/4">Ação</TableHead>
                  <TableHead className="w-1/6">Usuário</TableHead>
                  <TableHead className="w-1/12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => {
                    const typeInfo = getTypeInfo(entry.type);
                    const categoryInfo = getCategoryInfo(entry.category);

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.timestamp).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={typeInfo.color}
                          >
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={categoryInfo.color}
                          >
                            {categoryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{entry.entityId}</div>
                          {entry.relatedBatch && (
                            <div className="text-xs text-muted-foreground">
                              Lote: {entry.relatedBatch}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{entry.action}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {entry.details}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-2">
                              <User className="h-4 w-4" />
                            </div>
                            {entry.username}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="h-8 px-2"
                            onClick={() => handleShowDetails(entry)}
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
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>
              Informações completas sobre o evento de auditoria
            </DialogDescription>
          </DialogHeader>

          {currentEntry && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID do Evento</Label>
                  <div className="font-medium">{currentEntry.id}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data/Hora</Label>
                  <div>
                    {new Date(currentEntry.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP do Usuário</Label>
                  <div>{currentEntry.userIp}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getTypeInfo(currentEntry.type).color}
                    >
                      {getTypeInfo(currentEntry.type).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getCategoryInfo(currentEntry.category).color}
                    >
                      {getCategoryInfo(currentEntry.category).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Entidade</Label>
                <div>
                  <div className="font-medium">
                    {currentEntry.entityName} ({currentEntry.entity})
                  </div>
                  <div>ID: {currentEntry.entityId}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Usuário</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-2">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{currentEntry.username}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {currentEntry.userId}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Ação</Label>
                <div className="font-medium">{currentEntry.action}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Detalhes</Label>
                <div>{currentEntry.details}</div>
              </div>

              {currentEntry.relatedBatch && (
                <div>
                  <Label className="text-muted-foreground">Lote Relacionado</Label>
                  <div>{currentEntry.relatedBatch}</div>
                </div>
              )}

              {currentEntry.relatedIds && currentEntry.relatedIds.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">IDs Relacionados</Label>
                  <div>
                    {currentEntry.relatedIds.map((id, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2 mt-1">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentEntry.changes && Object.keys(currentEntry.changes).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Alterações</Label>
                  <div className="border rounded-md mt-1">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Valor Atual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(currentEntry.changes).map(([field, values]) => (
                          <TableRow key={field}>
                            <TableCell className="font-medium">
                              {field}
                            </TableCell>
                            <TableCell>
                              {typeof values.before === "object"
                                ? JSON.stringify(values.before)
                                : String(values.before)}
                            </TableCell>
                            <TableCell>
                              {typeof values.after === "object"
                                ? JSON.stringify(values.after)
                                : String(values.after)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}