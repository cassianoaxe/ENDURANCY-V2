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
  Check,
  Loader2,
  MinusCircle,
  Package,
  PlusCircle,
  Search,
  ShoppingCart,
  TestTube,
  Trash2,
  TriangleAlert,
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
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Interface para consumíveis HPLC
interface HplcConsumable {
  id: number;
  name: string;
  type: string;
  catalogNumber: string;
  manufacturer: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  lotNumber?: string;
  expirationDate?: string;
  location?: string;
  specifications?: any;
  notes?: string;
  laboratoryId: number;
  createdAt: string;
  updatedAt: string;
}

// Interface para registro de consumo
interface ConsumptionRecord {
  consumableId: number;
  quantity: number;
  usedBy?: number;
  runId?: number;
  notes?: string;
}

// Interface para filtros
interface ConsumableFilters {
  type: string | null;
  lowStock: boolean;
  search: string;
}

// Componente principal de Consumíveis HPLC
export default function HplcConsumables() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isNewConsumableOpen, setIsNewConsumableOpen] = useState(false);
  const [isConsumptionOpen, setIsConsumptionOpen] = useState(false);
  const [selectedConsumable, setSelectedConsumable] = useState<HplcConsumable | null>(null);
  const [filters, setFilters] = useState<ConsumableFilters>({
    type: null,
    lowStock: false,
    search: "",
  });
  const [newConsumable, setNewConsumable] = useState<Partial<HplcConsumable>>({
    name: "",
    type: "column",
    catalogNumber: "",
    manufacturer: "",
    currentQuantity: 0,
    minimumQuantity: 0,
    unit: "unidade",
  });
  const [consumptionRecord, setConsumptionRecord] = useState<ConsumptionRecord>({
    consumableId: 0,
    quantity: 1,
  });

  // Buscar consumíveis HPLC
  const { data: consumables, isLoading } = useQuery<HplcConsumable[]>({
    queryKey: ["/api/laboratory/hplc/consumables", filters],
    enabled: !!user,
  });

  // Função para adicionar novo consumível
  const addConsumableMutation = useMutation({
    mutationFn: (consumableData: Partial<HplcConsumable>) => {
      return apiRequest("/api/laboratory/hplc/consumables", {
        method: "POST",
        data: consumableData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Consumível adicionado",
        description: "O consumível foi adicionado com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/consumables"] });
      setIsNewConsumableOpen(false);
      setNewConsumable({
        name: "",
        type: "column",
        catalogNumber: "",
        manufacturer: "",
        currentQuantity: 0,
        minimumQuantity: 0,
        unit: "unidade",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar consumível",
        description: error.message || "Ocorreu um erro ao adicionar o consumível.",
        variant: "destructive",
      });
    },
  });

  // Função para registrar consumo de material
  const registerConsumptionMutation = useMutation({
    mutationFn: (record: ConsumptionRecord) => {
      return apiRequest(`/api/laboratory/hplc/consumables/${record.consumableId}/usage`, {
        method: "POST",
        data: record,
      });
    },
    onSuccess: () => {
      toast({
        title: "Consumo registrado",
        description: "O consumo do material foi registrado com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/consumables"] });
      setIsConsumptionOpen(false);
      setConsumptionRecord({
        consumableId: 0,
        quantity: 1,
      });
      setSelectedConsumable(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar consumo",
        description: error.message || "Ocorreu um erro ao registrar o consumo.",
        variant: "destructive",
      });
    },
  });

  // Função para aplicar filtros
  const applyFilters = (consumableList: HplcConsumable[] | undefined): HplcConsumable[] => {
    if (!consumableList) return [];

    return consumableList.filter((consumable) => {
      // Filtrar por tipo
      if (filters.type && consumable.type !== filters.type) {
        return false;
      }

      // Filtrar por estoque baixo
      if (filters.lowStock && consumable.currentQuantity > consumable.minimumQuantity) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          consumable.name.toLowerCase().includes(searchTerm) ||
          consumable.catalogNumber.toLowerCase().includes(searchTerm) ||
          consumable.manufacturer.toLowerCase().includes(searchTerm) ||
          (consumable.lotNumber && consumable.lotNumber.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Consumíveis filtrados
  const filteredConsumables = applyFilters(consumables);

  // Tipos de consumíveis para seleção
  const consumableTypes = [
    { value: "column", label: "Coluna" },
    { value: "solvent", label: "Solvente" },
    { value: "mobile_phase", label: "Fase Móvel" },
    { value: "standard", label: "Padrão" },
    { value: "filter", label: "Filtro" },
    { value: "vial", label: "Vial" },
    { value: "other", label: "Outro" },
  ];

  // Função para traduzir o tipo do consumível
  const translateConsumableType = (type: string): string => {
    const foundType = consumableTypes.find((t) => t.value === type);
    return foundType ? foundType.label : type;
  };

  // Função para formatar data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Função para calcular porcentagem de estoque
  const calculateStockPercentage = (current: number, minimum: number): number => {
    // Se o estoque mínimo for 0, consideramos como 100% se houver qualquer quantidade
    if (minimum === 0) {
      return current > 0 ? 100 : 0;
    }
    
    // Calculamos o estoque como proporção do mínimo x 2 (para considerar 50% quando igual ao mínimo)
    const percentage = (current / (minimum * 2)) * 100;
    return Math.min(percentage, 100);
  };

  // Função para determinar a cor de status do estoque
  const getStockStatusColor = (current: number, minimum: number): string => {
    if (current <= minimum * 0.5) return "bg-red-500";
    if (current <= minimum) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Função para abrir modal de registro de consumo
  const openConsumptionModal = (consumable: HplcConsumable) => {
    setSelectedConsumable(consumable);
    setConsumptionRecord({
      consumableId: consumable.id,
      quantity: 1,
    });
    setIsConsumptionOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Consumíveis HPLC</h1>
        <p className="text-muted-foreground">
          Gerenciamento de consumíveis e materiais para cromatografia
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
                  placeholder="Buscar consumíveis..."
                  className="max-w-xs"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) => setFilters({ ...filters, type: value || null })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {consumableTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lowStock"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="lowStock" className="font-normal">
                    Mostrar apenas estoque baixo
                  </Label>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsNewConsumableOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Consumível
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de consumíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Consumíveis HPLC</CardTitle>
          <CardDescription>
            Total de {filteredConsumables.length} consumíveis registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredConsumables.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhum consumível encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não existem consumíveis com os filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Número Catálogo</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsumables.map((consumable) => (
                  <TableRow key={consumable.id}>
                    <TableCell className="font-medium">{consumable.name}</TableCell>
                    <TableCell>{translateConsumableType(consumable.type)}</TableCell>
                    <TableCell>{consumable.manufacturer}</TableCell>
                    <TableCell>{consumable.catalogNumber}</TableCell>
                    <TableCell>{consumable.lotNumber || "-"}</TableCell>
                    <TableCell>{formatDate(consumable.expirationDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {consumable.currentQuantity} / {consumable.minimumQuantity} {consumable.unit}
                          </span>
                          {consumable.currentQuantity <= consumable.minimumQuantity && (
                            <TriangleAlert className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <Progress
                          value={calculateStockPercentage(
                            consumable.currentQuantity,
                            consumable.minimumQuantity
                          )}
                          className="h-2"
                          indicatorClassName={getStockStatusColor(
                            consumable.currentQuantity,
                            consumable.minimumQuantity
                          )}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConsumptionModal(consumable)}
                      >
                        <MinusCircle className="mr-1 h-4 w-4" />
                        Consumo
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`/laboratory/hplc/consumables/${consumable.id}`}>
                          <Package className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredConsumables.filter(c => c.currentQuantity <= c.minimumQuantity).length} consumíveis com estoque baixo
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/laboratory/hplc/consumables/reports">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Gerar lista de compras
            </a>
          </Button>
        </CardFooter>
      </Card>

      {/* Modal para novo consumível */}
      <Dialog open={isNewConsumableOpen} onOpenChange={setIsNewConsumableOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Consumível</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo consumível HPLC
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome do Consumível*</Label>
                <Input
                  id="name"
                  value={newConsumable.name}
                  onChange={(e) => setNewConsumable({ ...newConsumable, name: e.target.value })}
                  placeholder="Ex: Coluna C18 Phenomenex"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Tipo*</Label>
                <Select
                  value={newConsumable.type}
                  onValueChange={(value) => setNewConsumable({ ...newConsumable, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {consumableTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="manufacturer">Fabricante*</Label>
                <Input
                  id="manufacturer"
                  value={newConsumable.manufacturer}
                  onChange={(e) => setNewConsumable({ ...newConsumable, manufacturer: e.target.value })}
                  placeholder="Ex: Phenomenex"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="catalogNumber">Número de Catálogo*</Label>
                <Input
                  id="catalogNumber"
                  value={newConsumable.catalogNumber}
                  onChange={(e) => setNewConsumable({ ...newConsumable, catalogNumber: e.target.value })}
                  placeholder="Ex: 00D-4601-E0"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentQuantity">Quantidade Atual*</Label>
                <Input
                  id="currentQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newConsumable.currentQuantity?.toString() || "0"}
                  onChange={(e) => setNewConsumable({ ...newConsumable, currentQuantity: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="minimumQuantity">Quantidade Mínima*</Label>
                <Input
                  id="minimumQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newConsumable.minimumQuantity?.toString() || "0"}
                  onChange={(e) => setNewConsumable({ ...newConsumable, minimumQuantity: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="unit">Unidade*</Label>
                <Select
                  value={newConsumable.unit}
                  onValueChange={(value) => setNewConsumable({ ...newConsumable, unit: value })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="mL">mL</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lotNumber">Número do Lote</Label>
                <Input
                  id="lotNumber"
                  value={newConsumable.lotNumber || ""}
                  onChange={(e) => setNewConsumable({ ...newConsumable, lotNumber: e.target.value })}
                  placeholder="Ex: LT23456"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expirationDate">Data de Validade</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={newConsumable.expirationDate}
                  onChange={(e) => setNewConsumable({ ...newConsumable, expirationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={newConsumable.location || ""}
                onChange={(e) => setNewConsumable({ ...newConsumable, location: e.target.value })}
                placeholder="Ex: Freezer 2, Prateleira B"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={newConsumable.notes || ""}
                onChange={(e) => setNewConsumable({ ...newConsumable, notes: e.target.value })}
                placeholder="Informações adicionais sobre o consumível"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConsumableOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addConsumableMutation.mutate(newConsumable)}
              disabled={addConsumableMutation.isPending}
            >
              {addConsumableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Consumível
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para registrar consumo */}
      <Dialog open={isConsumptionOpen} onOpenChange={setIsConsumptionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Consumo</DialogTitle>
            <DialogDescription>
              {selectedConsumable && (
                <>Registrar o consumo de {selectedConsumable.name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedConsumable && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Quantidade Utilizada*</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selectedConsumable.currentQuantity}
                  value={consumptionRecord.quantity.toString()}
                  onChange={(e) => setConsumptionRecord({ ...consumptionRecord, quantity: parseFloat(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Estoque atual: {selectedConsumable.currentQuantity} {selectedConsumable.unit}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="runId">ID da Corrida (opcional)</Label>
                <Input
                  id="runId"
                  type="number"
                  min="1"
                  value={consumptionRecord.runId?.toString() || ""}
                  onChange={(e) => setConsumptionRecord({ ...consumptionRecord, runId: parseInt(e.target.value) || undefined })}
                  placeholder="Se utilizado em uma corrida HPLC"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="consumptionNotes">Observações</Label>
                <Textarea
                  id="consumptionNotes"
                  value={consumptionRecord.notes || ""}
                  onChange={(e) => setConsumptionRecord({ ...consumptionRecord, notes: e.target.value })}
                  placeholder="Motivo ou finalidade do consumo"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumptionOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => registerConsumptionMutation.mutate(consumptionRecord)}
              disabled={registerConsumptionMutation.isPending}
            >
              {registerConsumptionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Registrar Consumo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}