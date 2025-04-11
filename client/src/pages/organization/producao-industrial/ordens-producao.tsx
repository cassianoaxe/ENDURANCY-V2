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
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  Search,
  Calendar,
  Filter,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowUpDown,
  BarChart,
  Download,
  Printer,
  List,
  ListChecks,
  Users,
} from "lucide-react";

// Tipos de dados
type ProductionOrderStatus =
  | "planejada"
  | "em andamento"
  | "pausada"
  | "concluída"
  | "cancelada";

type ProductionOrderPriority = 
  | "baixa" 
  | "média" 
  | "alta" 
  | "urgente";

type ProductionOrder = {
  id: string;
  code: string;
  product: string;
  productCode: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  progress: number;
  startDate: Date | null;
  dueDate: Date;
  completionDate: Date | null;
  responsiblePerson: string;
  notes: string;
  createdAt: Date;
  createdBy: string;
  steps: ProductionOrderStep[];
  materials: ProductionOrderMaterial[];
};

type ProductionOrderStep = {
  id: string;
  name: string;
  status: "pendente" | "em andamento" | "concluída" | "pausada";
  startDate: Date | null;
  completionDate: Date | null;
  duration: number; // em minutos
  responsible: string;
  notes: string;
};

type ProductionOrderMaterial = {
  id: string;
  name: string;
  code: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  allocated: boolean;
};

export default function OrdensProducaoPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [openNewOrder, setOpenNewOrder] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(null);
  const [detailsActiveTab, setDetailsActiveTab] = useState("geral");

  const { toast } = useToast();

  // Consulta de dados (simulado)
  const { data: productionOrders, isLoading } = useQuery({
    queryKey: ["/api/production/orders"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          code: "OP-2025-0034",
          product: "Óleo CBD 5% 30ml",
          productCode: "PA-00189",
          quantity: 500,
          unit: "unidades",
          batchNumber: "LOTE-2025-0022",
          status: "concluída",
          priority: "média",
          progress: 100,
          startDate: new Date("2025-04-02T08:00:00"),
          dueDate: new Date("2025-04-05T17:00:00"),
          completionDate: new Date("2025-04-05T15:30:00"),
          responsiblePerson: "Maria Souza",
          notes: "Produção padrão para reposição de estoque",
          createdAt: new Date("2025-04-01T14:30:00"),
          createdBy: "João Silva",
          steps: [
            {
              id: "s1",
              name: "Preparação de Matérias-Primas",
              status: "concluída",
              startDate: new Date("2025-04-02T08:00:00"),
              completionDate: new Date("2025-04-02T11:30:00"),
              duration: 210,
              responsible: "Carlos Mendes",
              notes: "Todas as matérias-primas preparadas conforme especificação",
            },
            {
              id: "s2",
              name: "Mistura e Homogeneização",
              status: "concluída",
              startDate: new Date("2025-04-02T13:00:00"),
              completionDate: new Date("2025-04-03T10:00:00"),
              duration: 300,
              responsible: "Maria Souza",
              notes: "Homogeneização concluída sem problemas",
            },
            {
              id: "s3",
              name: "Envase",
              status: "concluída",
              startDate: new Date("2025-04-03T13:00:00"),
              completionDate: new Date("2025-04-04T12:00:00"),
              duration: 420,
              responsible: "Pedro Costa",
              notes: "Todas as unidades envasadas conforme especificação",
            },
            {
              id: "s4",
              name: "Rotulagem e Embalagem",
              status: "concluída",
              startDate: new Date("2025-04-04T14:00:00"),
              completionDate: new Date("2025-04-05T11:30:00"),
              duration: 270,
              responsible: "Ana Oliveira",
              notes: "Rotulagem concluída sem problemas",
            },
            {
              id: "s5",
              name: "Controle de Qualidade",
              status: "concluída",
              startDate: new Date("2025-04-05T13:00:00"),
              completionDate: new Date("2025-04-05T15:30:00"),
              duration: 150,
              responsible: "Renato Lima",
              notes: "Todos os testes de qualidade aprovados",
            },
          ],
          materials: [
            {
              id: "m1",
              name: "CBD Isolado",
              code: "MP-00123",
              batchNumber: "LOTE-2025-0012",
              quantity: 750,
              unit: "g",
              allocated: true,
            },
            {
              id: "m2",
              name: "Óleo de Coco Fracionado",
              code: "MP-00245",
              batchNumber: "LOTE-2025-0015",
              quantity: 15000,
              unit: "ml",
              allocated: true,
            },
            {
              id: "m3",
              name: "Frascos 30ml com Conta-Gotas",
              code: "EMB-00078",
              batchNumber: "LOTE-2025-0019",
              quantity: 500,
              unit: "unidades",
              allocated: true,
            },
          ],
        },
        {
          id: "2",
          code: "OP-2025-0035",
          product: "Tinturas CBD 5%",
          productCode: "PA-00191",
          quantity: 300,
          unit: "unidades",
          batchNumber: "LOTE-2025-0025",
          status: "em andamento",
          priority: "alta",
          progress: 60,
          startDate: new Date("2025-04-06T08:00:00"),
          dueDate: new Date("2025-04-10T17:00:00"),
          completionDate: null,
          responsiblePerson: "Carlos Mendes",
          notes: "Produção prioritária para atender pedido #12345",
          createdAt: new Date("2025-04-05T10:15:00"),
          createdBy: "João Silva",
          steps: [
            {
              id: "s1",
              name: "Preparação de Matérias-Primas",
              status: "concluída",
              startDate: new Date("2025-04-06T08:00:00"),
              completionDate: new Date("2025-04-06T12:00:00"),
              duration: 240,
              responsible: "Carlos Mendes",
              notes: "Todas as matérias-primas preparadas conforme especificação",
            },
            {
              id: "s2",
              name: "Mistura e Homogeneização",
              status: "concluída",
              startDate: new Date("2025-04-06T13:30:00"),
              completionDate: new Date("2025-04-07T11:00:00"),
              duration: 330,
              responsible: "Maria Souza",
              notes: "Homogeneização concluída conforme especificação",
            },
            {
              id: "s3",
              name: "Envase",
              status: "em andamento",
              startDate: new Date("2025-04-07T13:00:00"),
              completionDate: null,
              duration: 0,
              responsible: "Pedro Costa",
              notes: "Em processo de envase",
            },
            {
              id: "s4",
              name: "Rotulagem e Embalagem",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Ana Oliveira",
              notes: "",
            },
            {
              id: "s5",
              name: "Controle de Qualidade",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Renato Lima",
              notes: "",
            },
          ],
          materials: [
            {
              id: "m1",
              name: "CBD Isolado",
              code: "MP-00123",
              batchNumber: "LOTE-2025-0012",
              quantity: 450,
              unit: "g",
              allocated: true,
            },
            {
              id: "m2",
              name: "Álcool de Cereais",
              code: "MP-00247",
              batchNumber: "LOTE-2025-0016",
              quantity: 10000,
              unit: "ml",
              allocated: true,
            },
            {
              id: "m3",
              name: "Frascos 30ml com Conta-Gotas",
              code: "EMB-00078",
              batchNumber: "LOTE-2025-0019",
              quantity: 300,
              unit: "unidades",
              allocated: true,
            },
          ],
        },
        {
          id: "3",
          code: "OP-2025-0036",
          product: "Óleo CBD 10% 30ml",
          productCode: "PA-00190",
          quantity: 200,
          unit: "unidades",
          batchNumber: "LOTE-2025-0023",
          status: "planejada",
          priority: "média",
          progress: 0,
          startDate: null,
          dueDate: new Date("2025-04-15T17:00:00"),
          completionDate: null,
          responsiblePerson: "Maria Souza",
          notes: "Produção para reposição de estoque",
          createdAt: new Date("2025-04-08T09:45:00"),
          createdBy: "João Silva",
          steps: [
            {
              id: "s1",
              name: "Preparação de Matérias-Primas",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Carlos Mendes",
              notes: "",
            },
            {
              id: "s2",
              name: "Mistura e Homogeneização",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Maria Souza",
              notes: "",
            },
            {
              id: "s3",
              name: "Envase",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Pedro Costa",
              notes: "",
            },
            {
              id: "s4",
              name: "Rotulagem e Embalagem",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Ana Oliveira",
              notes: "",
            },
            {
              id: "s5",
              name: "Controle de Qualidade",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Renato Lima",
              notes: "",
            },
          ],
          materials: [
            {
              id: "m1",
              name: "CBD Isolado",
              code: "MP-00123",
              batchNumber: "LOTE-2025-0012",
              quantity: 600,
              unit: "g",
              allocated: false,
            },
            {
              id: "m2",
              name: "Óleo de Coco Fracionado",
              code: "MP-00245",
              batchNumber: "LOTE-2025-0015",
              quantity: 6000,
              unit: "ml",
              allocated: false,
            },
            {
              id: "m3",
              name: "Frascos 30ml com Conta-Gotas",
              code: "EMB-00078",
              batchNumber: "LOTE-2025-0019",
              quantity: 200,
              unit: "unidades",
              allocated: false,
            },
          ],
        },
        {
          id: "4",
          code: "OP-2025-0037",
          product: "Cápsulas CBD 10mg",
          productCode: "PA-00192",
          quantity: 5000,
          unit: "unidades",
          batchNumber: "LOTE-2025-0027",
          status: "pausada",
          priority: "baixa",
          progress: 40,
          startDate: new Date("2025-04-04T08:00:00"),
          dueDate: new Date("2025-04-12T17:00:00"),
          completionDate: null,
          responsiblePerson: "Pedro Costa",
          notes: "Produção pausada devido à falta de material complementar",
          createdAt: new Date("2025-04-03T11:20:00"),
          createdBy: "João Silva",
          steps: [
            {
              id: "s1",
              name: "Preparação de Matérias-Primas",
              status: "concluída",
              startDate: new Date("2025-04-04T08:00:00"),
              completionDate: new Date("2025-04-04T15:00:00"),
              duration: 420,
              responsible: "Carlos Mendes",
              notes: "Todas as matérias-primas preparadas conforme especificação",
            },
            {
              id: "s2",
              name: "Mistura e Homogeneização",
              status: "concluída",
              startDate: new Date("2025-04-05T08:00:00"),
              completionDate: new Date("2025-04-05T16:00:00"),
              duration: 480,
              responsible: "Maria Souza",
              notes: "Homogeneização concluída conforme especificação",
            },
            {
              id: "s3",
              name: "Encapsulamento",
              status: "pausada",
              startDate: new Date("2025-04-06T08:00:00"),
              completionDate: null,
              duration: 0,
              responsible: "Pedro Costa",
              notes: "Processo pausado devido à falta de cápsulas",
            },
            {
              id: "s4",
              name: "Embalagem",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Ana Oliveira",
              notes: "",
            },
            {
              id: "s5",
              name: "Controle de Qualidade",
              status: "pendente",
              startDate: null,
              completionDate: null,
              duration: 0,
              responsible: "Renato Lima",
              notes: "",
            },
          ],
          materials: [
            {
              id: "m1",
              name: "CBD Isolado",
              code: "MP-00123",
              batchNumber: "LOTE-2025-0012",
              quantity: 50,
              unit: "g",
              allocated: true,
            },
            {
              id: "m2",
              name: "Pó Inerte",
              code: "MP-00248",
              batchNumber: "LOTE-2025-0017",
              quantity: 1000,
              unit: "g",
              allocated: true,
            },
            {
              id: "m3",
              name: "Cápsulas Gelatinosas",
              code: "EMB-00079",
              batchNumber: "LOTE-2025-0020",
              quantity: 5000,
              unit: "unidades",
              allocated: false,
            },
          ],
        },
      ] as ProductionOrder[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredOrders = React.useMemo(() => {
    if (!productionOrders) return [];

    let filtered = [...productionOrders];

    // Filtrar por status
    if (activeTab !== "todos") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.code.toLowerCase().includes(term) ||
          order.product.toLowerCase().includes(term) ||
          order.batchNumber.toLowerCase().includes(term) ||
          order.responsiblePerson.toLowerCase().includes(term)
      );
    }

    // Filtro de data de vencimento
    if (dateRange.from) {
      filtered = filtered.filter(
        (order) => new Date(order.dueDate) >= new Date(dateRange.from!)
      );
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(
        (order) => new Date(order.dueDate) <= new Date(dateRange.to!)
      );
    }

    return filtered;
  }, [productionOrders, activeTab, searchTerm, dateRange]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!productionOrders) return { 
      total: 0, 
      emAndamento: 0, 
      concluidas: 0, 
      atrasadas: 0 
    };

    const now = new Date();
    
    return {
      total: productionOrders.length,
      emAndamento: productionOrders.filter(o => o.status === "em andamento").length,
      concluidas: productionOrders.filter(o => o.status === "concluída").length,
      atrasadas: productionOrders.filter(o => 
        (o.status === "em andamento" || o.status === "pausada" || o.status === "planejada") && 
        new Date(o.dueDate) < now
      ).length,
    };
  }, [productionOrders]);

  const getStatusInfo = (status: ProductionOrderStatus) => {
    switch (status) {
      case "planejada":
        return {
          label: "Planejada",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <ClipboardList className="h-4 w-4 mr-1" />,
        };
      case "em andamento":
        return {
          label: "Em Andamento",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <Play className="h-4 w-4 mr-1" />,
        };
      case "pausada":
        return {
          label: "Pausada",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <Pause className="h-4 w-4 mr-1" />,
        };
      case "concluída":
        return {
          label: "Concluída",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
        };
      case "cancelada":
        return {
          label: "Cancelada",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <ClipboardList className="h-4 w-4 mr-1" />,
        };
    }
  };

  const getPriorityInfo = (priority: ProductionOrderPriority) => {
    switch (priority) {
      case "baixa":
        return {
          label: "Baixa",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "média":
        return {
          label: "Média",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
      case "alta":
        return {
          label: "Alta",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
      case "urgente":
        return {
          label: "Urgente",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
      default:
        return {
          label: priority,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const getStepStatusInfo = (status: string) => {
    switch (status) {
      case "pendente":
        return {
          label: "Pendente",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "em andamento":
        return {
          label: "Em Andamento",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
      case "concluída":
        return {
          label: "Concluída",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "pausada":
        return {
          label: "Pausada",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const handleShowDetails = (order: ProductionOrder) => {
    setCurrentOrder(order);
    setOpenDetailsModal(true);
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar criação de ordem de produção
    toast({
      title: "Ordem de Produção Criada",
      description: "A ordem de produção foi criada com sucesso.",
    });
    setOpenNewOrder(false);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ordens de Produção</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setOpenNewOrder(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="flex items-center">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
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
                Total de Ordens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todas as ordens de produção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.emAndamento}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ordens em processo de produção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.concluidas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ordens finalizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.atrasadas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ordens com prazo expirado
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
                    Todas
                  </TabsTrigger>
                  <TabsTrigger value="planejada" className="text-xs md:text-sm">
                    Planejadas
                  </TabsTrigger>
                  <TabsTrigger
                    value="em andamento"
                    className="text-xs md:text-sm"
                  >
                    Em Andamento
                  </TabsTrigger>
                  <TabsTrigger value="pausada" className="text-xs md:text-sm">
                    Pausadas
                  </TabsTrigger>
                  <TabsTrigger value="concluída" className="text-xs md:text-sm">
                    Concluídas
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
                    placeholder="Buscar ordens..."
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
                    buttonLabel="Data Inicial"
                    placeholder="Data Inicial"
                  />
                  <DatePicker
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    buttonLabel="Data Final"
                    placeholder="Data Final"
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
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">
                      Nenhuma ordem de produção encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const priorityInfo = getPriorityInfo(order.priority);
                    const isLate =
                      (order.status === "em andamento" ||
                        order.status === "pausada" ||
                        order.status === "planejada") &&
                      new Date(order.dueDate) < new Date();

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.code}
                        </TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.batchNumber}</TableCell>
                        <TableCell className="text-right">
                          {order.quantity} {order.unit}
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
                          <Badge
                            variant="outline"
                            className={priorityInfo.color}
                          >
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={order.progress} className="h-2 w-24" />
                            <span className="text-xs">{order.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`${
                              isLate ? "text-red-600 font-medium" : ""
                            }`}
                          >
                            {new Date(order.dueDate).toLocaleDateString()}
                            {isLate && " (Atrasada)"}
                          </div>
                        </TableCell>
                        <TableCell>{order.responsiblePerson}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="h-8 px-2"
                            onClick={() => handleShowDetails(order)}
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Produção</DialogTitle>
            <DialogDescription>
              Informações completas sobre a ordem {currentOrder?.code}
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <>
              <Tabs
                defaultValue="geral"
                value={detailsActiveTab}
                onValueChange={setDetailsActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
                  <TabsTrigger value="etapas">Etapas</TabsTrigger>
                  <TabsTrigger value="materiais">Materiais</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Código</Label>
                      <div className="font-medium">{currentOrder.code}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div>
                        <Badge
                          variant="outline"
                          className={getStatusInfo(currentOrder.status).color}
                        >
                          <span className="flex items-center">
                            {getStatusInfo(currentOrder.status).icon}
                            {getStatusInfo(currentOrder.status).label}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Prioridade</Label>
                      <div>
                        <Badge
                          variant="outline"
                          className={getPriorityInfo(currentOrder.priority).color}
                        >
                          {getPriorityInfo(currentOrder.priority).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Produto</Label>
                    <div className="font-medium">{currentOrder.product}</div>
                    <div className="text-sm text-muted-foreground">
                      Código: {currentOrder.productCode}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Quantidade</Label>
                      <div>
                        {currentOrder.quantity} {currentOrder.unit}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Lote</Label>
                      <div>{currentOrder.batchNumber}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Data de Início
                      </Label>
                      <div>
                        {currentOrder.startDate
                          ? new Date(
                              currentOrder.startDate
                            ).toLocaleDateString()
                          : "Não iniciada"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Data de Entrega
                      </Label>
                      <div>
                        {new Date(currentOrder.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Data de Conclusão
                      </Label>
                      <div>
                        {currentOrder.completionDate
                          ? new Date(
                              currentOrder.completionDate
                            ).toLocaleDateString()
                          : "Não concluída"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Responsável
                    </Label>
                    <div>{currentOrder.responsiblePerson}</div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Progresso Geral
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={currentOrder.progress}
                        className="h-2 flex-1"
                      />
                      <span>{currentOrder.progress}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Observações
                    </Label>
                    <div>
                      {currentOrder.notes || "Nenhuma observação"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Criado em
                      </Label>
                      <div>
                        {new Date(currentOrder.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Criado por
                      </Label>
                      <div>{currentOrder.createdBy}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="etapas" className="space-y-4">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Etapa</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Conclusão</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrder.steps.map((step) => (
                          <TableRow key={step.id}>
                            <TableCell className="font-medium">
                              {step.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  getStepStatusInfo(step.status).color
                                }
                              >
                                {getStepStatusInfo(step.status).label}
                              </Badge>
                            </TableCell>
                            <TableCell>{step.responsible}</TableCell>
                            <TableCell>
                              {step.startDate
                                ? new Date(step.startDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {step.completionDate
                                ? new Date(
                                    step.completionDate
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {step.duration > 0
                                ? `${Math.floor(step.duration / 60)}h ${
                                    step.duration % 60
                                  }m`
                                : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {step.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="materiais" className="space-y-4">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Lote</TableHead>
                          <TableHead className="text-right">
                            Quantidade
                          </TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrder.materials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">
                              {material.name}
                            </TableCell>
                            <TableCell>{material.code}</TableCell>
                            <TableCell>{material.batchNumber}</TableCell>
                            <TableCell className="text-right">
                              {material.quantity} {material.unit}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  material.allocated
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                }
                              >
                                {material.allocated
                                  ? "Alocado"
                                  : "Não Alocado"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              {currentOrder?.status === "planejada" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Produção
                </Button>
              )}
              {currentOrder?.status === "em andamento" && (
                <>
                  <Button variant="outline" className="text-yellow-600">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                </>
              )}
              {currentOrder?.status === "pausada" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Retomar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Ordem de Produção */}
      <Dialog open={openNewOrder} onOpenChange={setOpenNewOrder}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Produção</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova ordem de produção
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOrder}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="product">Produto</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PA-00189">
                      PA-00189 - Óleo CBD 5% 30ml
                    </SelectItem>
                    <SelectItem value="PA-00190">
                      PA-00190 - Óleo CBD 10% 30ml
                    </SelectItem>
                    <SelectItem value="PA-00191">
                      PA-00191 - Tinturas CBD 5%
                    </SelectItem>
                    <SelectItem value="PA-00192">
                      PA-00192 - Cápsulas CBD 10mg
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
                    min="1"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select required defaultValue="unidades">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="l">Litros (l)</SelectItem>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="batchNumber">Lote</Label>
                <Input
                  id="batchNumber"
                  placeholder="Ex: LOTE-2025-0030"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select required defaultValue="média">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select required defaultValue="planejada">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dueDate">Data de Entrega</Label>
                <Input id="dueDate" type="date" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maria Souza">Maria Souza</SelectItem>
                    <SelectItem value="Carlos Mendes">Carlos Mendes</SelectItem>
                    <SelectItem value="Pedro Costa">Pedro Costa</SelectItem>
                    <SelectItem value="Ana Oliveira">Ana Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre a ordem de produção"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNewOrder(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Ordem</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}