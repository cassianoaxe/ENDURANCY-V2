import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Beaker,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  FlaskConical,
  Loader2,
  PlusCircle,
  Search,
  User,
  XCircle,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Interface para equipamentos HPLC
interface HplcEquipment {
  id: number;
  name: string;
  model: string;
}

// Interface para colunas (consumíveis tipo "column")
interface HplcColumn {
  id: number;
  name: string;
  catalogNumber: string;
  manufacturer: string;
}

// Interface para corridas HPLC
interface HplcRun {
  id: number;
  equipmentId: number;
  columnId?: number;
  runName: string;
  method: string;
  startTime: string;
  endTime?: string;
  analyst: number;
  sampleCount: number;
  status: "scheduled" | "in_progress" | "completed" | "aborted" | "failed";
  mobilePhase?: string;
  flowRate?: string;
  detectionWavelength?: string;
  injectionVolume?: string;
  temperature?: string;
  notes?: string;
  result?: any;
  processingDetails?: any;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais de join
  equipment_name?: string;
  analyst_name?: string;
  column_name?: string;
}

// Interface para filtros
interface RunFilters {
  status: string | null;
  equipment: number | null;
  startDate: string | null;
  endDate: string | null;
  search: string;
}

// Componente principal de Corridas HPLC
export default function HplcRuns() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);
  const [filters, setFilters] = useState<RunFilters>({
    status: null,
    equipment: null,
    startDate: null,
    endDate: null,
    search: "",
  });
  const [newRun, setNewRun] = useState<Partial<HplcRun>>({
    runName: "",
    method: "",
    startTime: new Date().toISOString().slice(0, 16),
    sampleCount: 1,
    status: "scheduled",
  });

  // Buscar corridas HPLC
  const { data: runs, isLoading: isLoadingRuns } = useQuery<HplcRun[]>({
    queryKey: ["/api/laboratory/hplc/runs", filters],
    enabled: !!user,
  });

  // Buscar equipamentos para o formulário
  const { data: equipments, isLoading: isLoadingEquipments } = useQuery<HplcEquipment[]>({
    queryKey: ["/api/laboratory/hplc/equipments"],
    enabled: !!user,
  });

  // Buscar colunas (consumíveis tipo "column") para o formulário
  const { data: columns, isLoading: isLoadingColumns } = useQuery<HplcColumn[]>({
    queryKey: ["/api/laboratory/hplc/consumables", { type: "column" }],
    enabled: !!user,
  });

  // Função para adicionar nova corrida
  const addRunMutation = useMutation({
    mutationFn: (runData: Partial<HplcRun>) => {
      return apiRequest("/api/laboratory/hplc/runs", {
        method: "POST",
        data: runData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Corrida registrada",
        description: "A corrida HPLC foi registrada com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/runs"] });
      setIsNewRunOpen(false);
      setNewRun({
        runName: "",
        method: "",
        startTime: new Date().toISOString().slice(0, 16),
        sampleCount: 1,
        status: "scheduled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar corrida",
        description: error.message || "Ocorreu um erro ao registrar a corrida.",
        variant: "destructive",
      });
    },
  });

  // Função para aplicar filtros
  const applyFilters = (runList: HplcRun[] | undefined): HplcRun[] => {
    if (!runList) return [];

    return runList.filter((run) => {
      // Filtrar por status
      if (filters.status && filters.status !== "all" && run.status !== filters.status) {
        return false;
      }

      // Filtrar por equipamento
      if (filters.equipment && filters.equipment !== "all" && run.equipmentId !== filters.equipment) {
        return false;
      }

      // Filtrar por data de início
      if (filters.startDate) {
        const runDate = new Date(run.startTime);
        const filterDate = new Date(filters.startDate);
        if (runDate < filterDate) {
          return false;
        }
      }

      // Filtrar por data de fim
      if (filters.endDate) {
        const runDate = new Date(run.startTime);
        const filterDate = new Date(filters.endDate);
        filterDate.setHours(23, 59, 59); // Fim do dia
        if (runDate > filterDate) {
          return false;
        }
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          run.runName.toLowerCase().includes(searchTerm) ||
          run.method.toLowerCase().includes(searchTerm) ||
          (run.equipment_name && run.equipment_name.toLowerCase().includes(searchTerm)) ||
          (run.analyst_name && run.analyst_name.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Corridas filtradas
  const filteredRuns = applyFilters(runs);

  // Renderizar badge de status com cor apropriada
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Agendada
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Em Andamento
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluída
          </Badge>
        );
      case "aborted":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <XCircle className="mr-1 h-3 w-3" /> Abortada
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Falha
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para formatar data e hora
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para formatar duração
  const formatDuration = (start: string, end: string | undefined) => {
    if (!end) return "-";
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Corridas HPLC</h1>
        <p className="text-muted-foreground">
          Gerenciamento de corridas cromatográficas
        </p>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar corridas..."
                  className="max-w-xs"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => setFilters({ ...filters, status: value || null })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="aborted">Abortada</SelectItem>
                    <SelectItem value="failed">Falha</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.equipment?.toString() || ""}
                  onValueChange={(value) => setFilters({ ...filters, equipment: value ? parseInt(value) : null })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os equipamentos</SelectItem>
                    {equipments?.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="startDate" className="whitespace-nowrap">
                  Data Início:
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-auto"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value || null })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate" className="whitespace-nowrap">
                  Data Fim:
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="w-auto"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value || null })}
                />
              </div>
              <Button onClick={() => setIsNewRunOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Corrida
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de corridas */}
      <Card>
        <CardHeader>
          <CardTitle>Corridas HPLC</CardTitle>
          <CardDescription>
            Total de {filteredRuns.length} corridas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRuns ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhuma corrida encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Não existem corridas com os filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Corrida</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Amostras</TableHead>
                  <TableHead>Analista</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.runName}</TableCell>
                    <TableCell>{run.equipment_name}</TableCell>
                    <TableCell>{renderStatusBadge(run.status)}</TableCell>
                    <TableCell>{run.method}</TableCell>
                    <TableCell>{formatDateTime(run.startTime)}</TableCell>
                    <TableCell>{formatDateTime(run.endTime)}</TableCell>
                    <TableCell>{formatDuration(run.startTime, run.endTime)}</TableCell>
                    <TableCell>{run.sampleCount}</TableCell>
                    <TableCell>{run.analyst_name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/laboratory/hplc/runs/${run.id}`}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Detalhes</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para nova corrida */}
      <Dialog open={isNewRunOpen} onOpenChange={setIsNewRunOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nova Corrida HPLC</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar uma nova corrida
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="runName">Nome da Corrida*</Label>
                <Input
                  id="runName"
                  value={newRun.runName}
                  onChange={(e) => setNewRun({ ...newRun, runName: e.target.value })}
                  placeholder="Ex: Análise CBD-01"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="method">Método*</Label>
                <Input
                  id="method"
                  value={newRun.method}
                  onChange={(e) => setNewRun({ ...newRun, method: e.target.value })}
                  placeholder="Ex: CBD-HPLC-01"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="equipmentId">Equipamento*</Label>
                <Select
                  value={newRun.equipmentId?.toString() || ""}
                  onValueChange={(value) => setNewRun({ ...newRun, equipmentId: parseInt(value) })}
                  disabled={isLoadingEquipments}
                >
                  <SelectTrigger id="equipmentId">
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments?.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.name} ({equipment.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="columnId">Coluna</Label>
                <Select
                  value={newRun.columnId?.toString() || ""}
                  onValueChange={(value) => setNewRun({ ...newRun, columnId: parseInt(value) })}
                  disabled={isLoadingColumns}
                >
                  <SelectTrigger id="columnId">
                    <SelectValue placeholder="Selecione a coluna (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {columns?.map((column) => (
                      <SelectItem key={column.id} value={column.id.toString()}>
                        {column.name} ({column.manufacturer})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startTime">Data e Hora de Início*</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newRun.startTime}
                  onChange={(e) => setNewRun({ ...newRun, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endTime">Data e Hora de Término</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={newRun.endTime}
                  onChange={(e) => setNewRun({ ...newRun, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sampleCount">Número de Amostras*</Label>
                <Input
                  id="sampleCount"
                  type="number"
                  min="1"
                  value={newRun.sampleCount?.toString() || "1"}
                  onChange={(e) => setNewRun({ ...newRun, sampleCount: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={newRun.status}
                  onValueChange={(value) => setNewRun({ ...newRun, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="aborted">Abortada</SelectItem>
                    <SelectItem value="failed">Falha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mobilePhase">Fase Móvel</Label>
                <Input
                  id="mobilePhase"
                  value={newRun.mobilePhase || ""}
                  onChange={(e) => setNewRun({ ...newRun, mobilePhase: e.target.value })}
                  placeholder="Ex: Acetonitrila:Água (70:30)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="flowRate">Vazão</Label>
                <Input
                  id="flowRate"
                  value={newRun.flowRate || ""}
                  onChange={(e) => setNewRun({ ...newRun, flowRate: e.target.value })}
                  placeholder="Ex: 1.0 mL/min"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="detectionWavelength">Comprimento de Onda</Label>
                <Input
                  id="detectionWavelength"
                  value={newRun.detectionWavelength || ""}
                  onChange={(e) => setNewRun({ ...newRun, detectionWavelength: e.target.value })}
                  placeholder="Ex: 210 nm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="injectionVolume">Volume de Injeção</Label>
                <Input
                  id="injectionVolume"
                  value={newRun.injectionVolume || ""}
                  onChange={(e) => setNewRun({ ...newRun, injectionVolume: e.target.value })}
                  placeholder="Ex: 10 μL"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="temperature">Temperatura</Label>
                <Input
                  id="temperature"
                  value={newRun.temperature || ""}
                  onChange={(e) => setNewRun({ ...newRun, temperature: e.target.value })}
                  placeholder="Ex: 30 °C"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newRun.notes || ""}
                onChange={(e) => setNewRun({ ...newRun, notes: e.target.value })}
                placeholder="Observações adicionais sobre a corrida"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRunOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addRunMutation.mutate(newRun)}
              disabled={addRunMutation.isPending}
            >
              {addRunMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Beaker className="mr-2 h-4 w-4" />
                  Registrar Corrida
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}