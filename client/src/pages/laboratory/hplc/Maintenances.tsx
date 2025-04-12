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
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  PlusCircle,
  Search,
  Settings,
  User,
  Wrench,
  X,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Interface para os equipamentos HPLC
interface HplcEquipment {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
}

// Interface para manutenções HPLC
interface HplcMaintenance {
  id: number;
  equipmentId: number;
  maintenanceType: "preventive" | "corrective" | "calibration";
  status: "scheduled" | "in_progress" | "completed" | "canceled";
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  description: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  equipmentName?: string; // Campo adicional da join
}

// Interface para filtros
interface MaintenanceFilters {
  status: string | null;
  type: string | null;
  search: string;
}

// Componente principal de Manutenções HPLC
export default function HplcMaintenances() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    status: "all",
    type: "all",
    search: "",
  });
  const [newMaintenance, setNewMaintenance] = useState<Partial<HplcMaintenance>>({
    maintenanceType: "preventive",
    status: "scheduled",
    description: "",
  });

  // Buscar manutenções HPLC
  const { data: maintenances, isLoading: isLoadingMaintenances } = useQuery<HplcMaintenance[]>({
    queryKey: ["/api/laboratory/hplc/maintenances", filters],
    enabled: !!user,
  });

  // Buscar equipamentos para o formulário
  const { data: equipments, isLoading: isLoadingEquipments } = useQuery<HplcEquipment[]>({
    queryKey: ["/api/laboratory/hplc/equipments"],
    enabled: !!user,
  });

  // Função para adicionar nova manutenção
  const addMaintenanceMutation = useMutation({
    mutationFn: (maintenanceData: Partial<HplcMaintenance>) => {
      return apiRequest("/api/laboratory/hplc/maintenances", {
        method: "POST",
        data: maintenanceData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Manutenção agendada",
        description: "A manutenção foi agendada com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/maintenances"] });
      setIsNewMaintenanceOpen(false);
      setNewMaintenance({
        maintenanceType: "preventive",
        status: "scheduled",
        description: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao agendar manutenção",
        description: error.message || "Ocorreu um erro ao agendar a manutenção.",
        variant: "destructive",
      });
    },
  });

  // Função para aplicar filtros
  const applyFilters = (maintenanceList: HplcMaintenance[] | undefined): HplcMaintenance[] => {
    if (!maintenanceList) return [];

    return maintenanceList.filter((maintenance) => {
      // Filtrar por status
      if (filters.status && filters.status !== "all" && maintenance.status !== filters.status) {
        return false;
      }

      // Filtrar por tipo
      if (filters.type && filters.type !== "all" && maintenance.maintenanceType !== filters.type) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          maintenance.description.toLowerCase().includes(searchTerm) ||
          (maintenance.equipmentName && maintenance.equipmentName.toLowerCase().includes(searchTerm)) ||
          (maintenance.technician && maintenance.technician.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Manutenções filtradas
  const filteredMaintenances = applyFilters(maintenances);

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
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Cancelada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar badge de tipo de manutenção
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "preventive":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="mr-1 h-3 w-3" /> Preventiva
          </Badge>
        );
      case "corrective":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Wrench className="mr-1 h-3 w-3" /> Corretiva
          </Badge>
        );
      case "calibration":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Settings className="mr-1 h-3 w-3" /> Calibração
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Manutenções HPLC</h1>
        <p className="text-muted-foreground">
          Gerenciamento de manutenções e calibrações de equipamentos HPLC
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
                  placeholder="Buscar manutenções..."
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
                    <SelectItem value="canceled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) => setFilters({ ...filters, type: value || null })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="calibration">Calibração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setIsNewMaintenanceOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Manutenção
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de manutenções */}
      <Card>
        <CardHeader>
          <CardTitle>Manutenções Agendadas</CardTitle>
          <CardDescription>
            Total de {filteredMaintenances.length} manutenções registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMaintenances ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMaintenances.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhuma manutenção encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Não existem manutenções com os filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Data Concluída</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell className="font-medium">{maintenance.equipmentName}</TableCell>
                    <TableCell>{renderTypeBadge(maintenance.maintenanceType)}</TableCell>
                    <TableCell>{renderStatusBadge(maintenance.status)}</TableCell>
                    <TableCell>{formatDate(maintenance.scheduledDate)}</TableCell>
                    <TableCell>{formatDate(maintenance.completedDate)}</TableCell>
                    <TableCell>{maintenance.technician || "-"}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={maintenance.description}>
                        {maintenance.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/laboratory/hplc/maintenances/${maintenance.id}`}>
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

      {/* Modal para nova manutenção */}
      <Dialog open={isNewMaintenanceOpen} onOpenChange={setIsNewMaintenanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendar Nova Manutenção</DialogTitle>
            <DialogDescription>
              Preencha as informações para agendar uma nova manutenção
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="equipmentId">Equipamento*</Label>
                <Select
                  value={newMaintenance.equipmentId?.toString() || ""}
                  onValueChange={(value) => setNewMaintenance({ ...newMaintenance, equipmentId: parseInt(value) })}
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
                <Label htmlFor="maintenanceType">Tipo de Manutenção*</Label>
                <Select
                  value={newMaintenance.maintenanceType}
                  onValueChange={(value) => setNewMaintenance({ ...newMaintenance, maintenanceType: value as any })}
                >
                  <SelectTrigger id="maintenanceType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="calibration">Calibração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="scheduledDate">Data Agendada*</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="technician">Técnico Responsável</Label>
                <Input
                  id="technician"
                  value={newMaintenance.technician || ""}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, technician: e.target.value })}
                  placeholder="Nome do técnico"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição*</Label>
              <Textarea
                id="description"
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                placeholder="Descreva a manutenção a ser realizada"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost">Custo Estimado (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newMaintenance.cost?.toString() || ""}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={newMaintenance.status}
                  onValueChange={(value) => setNewMaintenance({ ...newMaintenance, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="canceled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newMaintenance.notes || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, notes: e.target.value })}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMaintenanceOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addMaintenanceMutation.mutate(newMaintenance)}
              disabled={addMaintenanceMutation.isPending}
            >
              {addMaintenanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Manutenção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}