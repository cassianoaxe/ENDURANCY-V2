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
  FileText,
  FlaskConical,
  Info,
  Loader2,
  PlusCircle,
  Search,
  Settings,
  Trash2,
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
  acquisitionDate: string;
  installationDate: string;
  status: 'operational' | 'maintenance' | 'out_of_service';
  location: string;
  documents?: string;
  specifications?: any;
  warrantyExpiration?: string;
  nextCalibrationDate?: string;
  notes?: string;
  laboratoryId: number;
  createdAt: string;
  updatedAt: string;
}

// Interface para filtros
interface EquipmentFilters {
  status: string | null;
  search: string;
}

// Componente principal de Equipamentos HPLC
export default function HplcEquipments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isNewEquipmentOpen, setIsNewEquipmentOpen] = useState(false);
  const [filters, setFilters] = useState<EquipmentFilters>({
    status: "all",
    search: "",
  });
  const [newEquipment, setNewEquipment] = useState<Partial<HplcEquipment>>({
    name: "",
    model: "",
    serialNumber: "",
    manufacturer: "",
    status: "operational",
    location: "",
  });

  // Buscar equipamentos HPLC
  const { data: equipments, isLoading } = useQuery<HplcEquipment[]>({
    queryKey: ["/api/laboratory/hplc/equipments", filters],
    enabled: !!user,
  });

  // Função para adicionar novo equipamento
  const addEquipmentMutation = useMutation({
    mutationFn: (equipmentData: Partial<HplcEquipment>) => {
      return apiRequest("/api/laboratory/hplc/equipments", {
        method: "POST",
        data: equipmentData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Equipamento adicionado",
        description: "O equipamento foi adicionado com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/equipments"] });
      setIsNewEquipmentOpen(false);
      setNewEquipment({
        name: "",
        model: "",
        serialNumber: "",
        manufacturer: "",
        status: "operational",
        location: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar equipamento",
        description: error.message || "Ocorreu um erro ao adicionar o equipamento.",
        variant: "destructive",
      });
    },
  });

  // Função para aplicar filtros
  const applyFilters = (equipmentList: HplcEquipment[] | undefined): HplcEquipment[] => {
    if (!equipmentList) return [];

    return equipmentList.filter((equipment) => {
      // Filtrar por status (ignorar filtro se for "all")
      if (filters.status && filters.status !== "all" && equipment.status !== filters.status) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          equipment.name.toLowerCase().includes(searchTerm) ||
          equipment.model.toLowerCase().includes(searchTerm) ||
          equipment.serialNumber.toLowerCase().includes(searchTerm) ||
          equipment.manufacturer.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  };

  // Equipamentos filtrados
  const filteredEquipments = applyFilters(equipments);

  // Renderizar badge de status com cor apropriada
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Operacional
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Settings className="mr-1 h-3 w-3" /> Em Manutenção
          </Badge>
        );
      case "out_of_service":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Fora de Serviço
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Info className="mr-1 h-3 w-3" /> {status}
          </Badge>
        );
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
        <h1 className="text-2xl font-bold">Equipamentos HPLC</h1>
        <p className="text-muted-foreground">
          Gerenciamento de equipamentos de cromatografia líquida de alta eficiência
        </p>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipamentos..."
                className="max-w-xs"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Select
                value={filters.status || ""}
                onValueChange={(value) => setFilters({ ...filters, status: value || null })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsNewEquipmentOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de equipamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Equipamentos HPLC</CardTitle>
          <CardDescription>
            Total de {filteredEquipments.length} equipamentos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não existem equipamentos com os filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Número de Série</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Instalação</TableHead>
                  <TableHead>Próxima Calibração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{equipment.model}</TableCell>
                    <TableCell>{equipment.serialNumber}</TableCell>
                    <TableCell>{equipment.manufacturer}</TableCell>
                    <TableCell>{renderStatusBadge(equipment.status)}</TableCell>
                    <TableCell>{formatDate(equipment.installationDate)}</TableCell>
                    <TableCell>{formatDate(equipment.nextCalibrationDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/laboratory/hplc/equipments/${equipment.id}`}>
                          <Info className="h-4 w-4" />
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

      {/* Modal para novo equipamento */}
      <Dialog open={isNewEquipmentOpen} onOpenChange={setIsNewEquipmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo equipamento HPLC
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome do Equipamento*</Label>
                <Input
                  id="name"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  placeholder="Ex: HPLC Agilent 1260"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="model">Modelo*</Label>
                <Input
                  id="model"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                  placeholder="Ex: 1260 Infinity II"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="serialNumber">Número de Série*</Label>
                <Input
                  id="serialNumber"
                  value={newEquipment.serialNumber}
                  onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                  placeholder="Ex: SN12345"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="manufacturer">Fabricante*</Label>
                <Input
                  id="manufacturer"
                  value={newEquipment.manufacturer}
                  onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                  placeholder="Ex: Agilent Technologies"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={newEquipment.acquisitionDate}
                  onChange={(e) => setNewEquipment({ ...newEquipment, acquisitionDate: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="installationDate">Data de Instalação</Label>
                <Input
                  id="installationDate"
                  type="date"
                  value={newEquipment.installationDate}
                  onChange={(e) => setNewEquipment({ ...newEquipment, installationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Localização*</Label>
                <Input
                  id="location"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                  placeholder="Ex: Sala 101, Laboratório Central"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={newEquipment.status}
                  onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="warrantyExpiration">Data de Expiração da Garantia</Label>
                <Input
                  id="warrantyExpiration"
                  type="date"
                  value={newEquipment.warrantyExpiration}
                  onChange={(e) => setNewEquipment({ ...newEquipment, warrantyExpiration: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nextCalibrationDate">Próxima Data de Calibração</Label>
                <Input
                  id="nextCalibrationDate"
                  type="date"
                  value={newEquipment.nextCalibrationDate}
                  onChange={(e) => setNewEquipment({ ...newEquipment, nextCalibrationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newEquipment.notes || ""}
                onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                placeholder="Informações adicionais sobre o equipamento"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEquipmentOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addEquipmentMutation.mutate(newEquipment)}
              disabled={addEquipmentMutation.isPending}
            >
              {addEquipmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Equipamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}