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
  ArrowRightLeft,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Package,
  SearchIcon,
  Calendar,
  Plus,
  FileText,
  Filter,
  Download,
} from "lucide-react";

// Tipos de dados
type MovementType = 
  | "entrada" 
  | "saida" 
  | "transferencia" 
  | "ajuste" 
  | "consumo" 
  | "producao";

type Movement = {
  id: string;
  code: string;
  type: MovementType;
  date: Date;
  quantity: number;
  unit: string;
  itemCode: string;
  itemName: string;
  batchNumber: string;
  origin: string;
  destination: string;
  reason: string;
  notes: string;
  processedBy: string;
  status: "concluído" | "em andamento" | "cancelado";
  reference?: string;
};

export default function MovimentacoesPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [openNewMovement, setOpenNewMovement] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null);

  const { toast } = useToast();

  // Consulta de dados (simulado por enquanto)
  const { data: movements, isLoading } = useQuery({
    queryKey: ["/api/production/movements"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          code: "ENT-00123",
          type: "entrada",
          date: new Date("2025-04-05T09:30:00"),
          quantity: 5000,
          unit: "g",
          itemCode: "MP-00123",
          itemName: "CBD Isolado",
          batchNumber: "LOTE-2025-0012",
          origin: "Fornecedor ExtracTech",
          destination: "Almoxarifado A - Prateleira 3",
          reason: "Compra",
          notes: "Nota Fiscal #123456",
          processedBy: "João Silva",
          status: "concluído",
          reference: "OC-2025-0089",
        },
        {
          id: "2",
          code: "SAI-00056",
          type: "saida",
          date: new Date("2025-04-06T14:15:00"),
          quantity: 500,
          unit: "g",
          itemCode: "MP-00123",
          itemName: "CBD Isolado",
          batchNumber: "LOTE-2025-0012",
          origin: "Almoxarifado A - Prateleira 3",
          destination: "Área de Produção",
          reason: "Produção",
          notes: "Para produção do lote LOTE-2025-0018",
          processedBy: "Maria Souza",
          status: "concluído",
          reference: "OP-2025-0034",
        },
        {
          id: "3",
          code: "TRF-00078",
          type: "transferencia",
          date: new Date("2025-04-07T10:45:00"),
          quantity: 20,
          unit: "unidades",
          itemCode: "PA-00189",
          itemName: "Óleo CBD 5% 30ml",
          batchNumber: "LOTE-2025-0022",
          origin: "Armazém de Produtos - Setor C",
          destination: "Expedição",
          reason: "Transferência para envio",
          notes: "Pedido #78901",
          processedBy: "Carlos Mendes",
          status: "concluído",
          reference: "PED-2025-0078",
        },
        {
          id: "4",
          code: "PRD-00045",
          type: "producao",
          date: new Date("2025-04-08T16:20:00"),
          quantity: 200,
          unit: "unidades",
          itemCode: "PA-00190",
          itemName: "Óleo CBD 10% 30ml",
          batchNumber: "LOTE-2025-0023",
          origin: "Produção",
          destination: "Armazém de Produtos - Setor C",
          reason: "Finalização de produção",
          notes: "Lote finalizado e aprovado pelo Controle de Qualidade",
          processedBy: "Ana Oliveira",
          status: "concluído",
          reference: "OP-2025-0036",
        },
        {
          id: "5",
          code: "AJU-00012",
          type: "ajuste",
          date: new Date("2025-04-09T11:10:00"),
          quantity: -5,
          unit: "unidades",
          itemCode: "PA-00189",
          itemName: "Óleo CBD 5% 30ml",
          batchNumber: "LOTE-2025-0022",
          origin: "Armazém de Produtos - Setor C",
          destination: "N/A",
          reason: "Ajuste de inventário",
          notes: "Divergência encontrada durante inventário mensal",
          processedBy: "Pedro Costa",
          status: "concluído",
        },
        {
          id: "6",
          code: "CON-00034",
          type: "consumo",
          date: new Date("2025-04-10T09:00:00"),
          quantity: 200,
          unit: "ml",
          itemCode: "MP-00245",
          itemName: "Óleo de Coco Fracionado",
          batchNumber: "LOTE-2025-0015",
          origin: "Almoxarifado B - Prateleira 1",
          destination: "Laboratório",
          reason: "Testes de Qualidade",
          notes: "Amostras para validação de lote",
          processedBy: "Fernanda Lima",
          status: "em andamento",
          reference: "LAB-2025-0012",
        },
      ] as Movement[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredMovements = React.useMemo(() => {
    if (!movements) return [];

    let filtered = [...movements];

    // Filtrar por tipo
    if (activeTab !== "todos") {
      filtered = filtered.filter((item) => item.type === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(term) ||
          item.itemName.toLowerCase().includes(term) ||
          item.batchNumber.toLowerCase().includes(term) ||
          item.origin.toLowerCase().includes(term) ||
          item.destination.toLowerCase().includes(term) ||
          item.processedBy.toLowerCase().includes(term)
      );
    }

    // Filtro de data
    if (dateRange.from) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(dateRange.from!)
      );
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(dateRange.to!)
      );
    }

    return filtered;
  }, [movements, activeTab, searchTerm, dateRange]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!movements) return { entrada: 0, saida: 0, transferencia: 0 };

    return {
      entrada: movements.filter((m) => m.type === "entrada").length,
      saida: movements.filter((m) => m.type === "saida").length,
      transferencia: movements.filter((m) => m.type === "transferencia").length,
    };
  }, [movements]);

  const getMovementTypeInfo = (type: MovementType) => {
    switch (type) {
      case "entrada":
        return {
          label: "Entrada",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <ArrowDown className="h-4 w-4 mr-1" />,
        };
      case "saida":
        return {
          label: "Saída",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <ArrowUp className="h-4 w-4 mr-1" />,
        };
      case "transferencia":
        return {
          label: "Transferência",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <ArrowLeftRight className="h-4 w-4 mr-1" />,
        };
      case "ajuste":
        return {
          label: "Ajuste",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          icon: <ArrowRightLeft className="h-4 w-4 mr-1" />,
        };
      case "consumo":
        return {
          label: "Consumo",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          icon: <ArrowUp className="h-4 w-4 mr-1" />,
        };
      case "producao":
        return {
          label: "Produção",
          color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
          icon: <Package className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: type,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <ArrowRightLeft className="h-4 w-4 mr-1" />,
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluído":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "em andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleShowDetails = (movement: Movement) => {
    setCurrentMovement(movement);
    setOpenDetailsModal(true);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar adição de movimentação
    toast({
      title: "Movimentação registrada com sucesso",
      description: "A movimentação foi registrada no sistema.",
    });
    setOpenNewMovement(false);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setOpenNewMovement(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center">
                <ArrowDown className="h-4 w-4 mr-2" />
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.entrada}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de entradas no estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center">
                <ArrowUp className="h-4 w-4 mr-2" />
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.saida}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de saídas do estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transferências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.transferencia}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de transferências internas
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
                  <TabsTrigger value="entrada" className="text-xs md:text-sm">
                    Entradas
                  </TabsTrigger>
                  <TabsTrigger value="saida" className="text-xs md:text-sm">
                    Saídas
                  </TabsTrigger>
                  <TabsTrigger
                    value="transferencia"
                    className="text-xs md:text-sm"
                  >
                    Transferências
                  </TabsTrigger>
                  <TabsTrigger value="producao" className="text-xs md:text-sm">
                    Produção
                  </TabsTrigger>
                  <TabsTrigger value="ajuste" className="text-xs md:text-sm">
                    Ajustes
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center w-full md:w-auto space-x-2">
                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar movimentações..."
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
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {movement.code}
                        </TableCell>
                        <TableCell>
                          {movement.date.toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={typeInfo.color}
                          >
                            <span className="flex items-center">
                              {typeInfo.icon}
                              {typeInfo.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{movement.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {movement.batchNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {movement.quantity} {movement.unit}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {movement.origin}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {movement.destination}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(movement.status)}
                          >
                            {movement.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="h-8 px-2"
                            onClick={() => handleShowDetails(movement)}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Movimentação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a movimentação de estoque
            </DialogDescription>
          </DialogHeader>

          {currentMovement && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-muted-foreground">
                    Código
                  </Label>
                  <div id="code" className="font-medium">
                    {currentMovement.code}
                  </div>
                </div>
                <div>
                  <Label htmlFor="status" className="text-muted-foreground">
                    Status
                  </Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(currentMovement.status)}
                    >
                      {currentMovement.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-muted-foreground">
                    Tipo
                  </Label>
                  <div id="type">
                    <Badge
                      variant="outline"
                      className={
                        getMovementTypeInfo(currentMovement.type).color
                      }
                    >
                      <span className="flex items-center">
                        {getMovementTypeInfo(currentMovement.type).icon}
                        {getMovementTypeInfo(currentMovement.type).label}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="date" className="text-muted-foreground">
                    Data/Hora
                  </Label>
                  <div id="date">
                    {currentMovement.date.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="item" className="text-muted-foreground">
                  Item
                </Label>
                <div id="item" className="font-medium">
                  {currentMovement.itemName}
                </div>
                <div className="text-sm text-muted-foreground">
                  Código: {currentMovement.itemCode} | Lote:{" "}
                  {currentMovement.batchNumber}
                </div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-muted-foreground">
                  Quantidade
                </Label>
                <div id="quantity" className="font-medium">
                  {currentMovement.quantity} {currentMovement.unit}
                </div>
              </div>

              <div>
                <Label htmlFor="origin" className="text-muted-foreground">
                  Origem
                </Label>
                <div id="origin">{currentMovement.origin}</div>
              </div>

              <div>
                <Label htmlFor="destination" className="text-muted-foreground">
                  Destino
                </Label>
                <div id="destination">{currentMovement.destination}</div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-muted-foreground">
                  Motivo
                </Label>
                <div id="reason">{currentMovement.reason}</div>
              </div>

              {currentMovement.reference && (
                <div>
                  <Label htmlFor="reference" className="text-muted-foreground">
                    Referência
                  </Label>
                  <div id="reference">{currentMovement.reference}</div>
                </div>
              )}

              <div>
                <Label htmlFor="processedBy" className="text-muted-foreground">
                  Processado por
                </Label>
                <div id="processedBy">{currentMovement.processedBy}</div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-muted-foreground">
                  Observações
                </Label>
                <div id="notes">
                  {currentMovement.notes || "Nenhuma observação"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">Imprimir</Button>
              {currentMovement?.status === "em andamento" && (
                <>
                  <Button variant="outline" className="text-red-500">
                    Cancelar
                  </Button>
                  <Button>Concluir</Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Movimentação */}
      <Dialog open={openNewMovement} onOpenChange={setOpenNewMovement}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma nova movimentação de estoque
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMovement}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Tipo de Movimentação</Label>
                <Select required defaultValue="entrada">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="ajuste">Ajuste de Inventário</SelectItem>
                    <SelectItem value="consumo">Consumo</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="LOTE-2025-0022">
                      LOTE-2025-0022
                    </SelectItem>
                    <SelectItem value="LOTE-2025-0023">
                      LOTE-2025-0023
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
                      <SelectValue placeholder="Selecione a unidade" />
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
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  placeholder="Local de origem"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Local de destino"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Motivo</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="ajuste">Ajuste de Inventário</SelectItem>
                    <SelectItem value="descarte">Descarte</SelectItem>
                    <SelectItem value="teste">Testes de Qualidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reference">Referência (opcional)</Label>
                <Input
                  id="reference"
                  placeholder="Ex: Nota Fiscal, Ordem de Produção, etc."
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre a movimentação"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNewMovement(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Movimentação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}