import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock,
  FileText,
  Pencil,
  Plus,
  Search,
  AlertCircle,
  XCircle,
  GraduationCap,
  User,
  Award,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface Training {
  id: number;
  userId: number;
  procedureId?: number;
  equipmentId?: number;
  trainingTitle: string;
  trainingType: "inicial" | "recorrente" | "específico";
  startDate: string;
  completionDate?: string;
  trainedBy: number;
  status: "scheduled" | "in_progress" | "completed" | "failed";
  assessmentScore?: number;
  certificateIssued: boolean;
  comments?: string;
  attachments?: any;
  user_name?: string;
  user_email?: string;
  trainer_name?: string;
  equipment_name?: string;
  procedure_title?: string;
}

interface UserOption {
  id: number;
  name: string;
  email?: string;
}

interface EquipmentOption {
  id: number;
  name: string;
  model: string;
}

interface ProcedureOption {
  id: number;
  title: string;
  documentNumber: string;
}

export default function Trainings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoadingTrainings, setIsLoadingTrainings] = useState(true);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);
  const [procedureOptions, setProcedureOptions] = useState<ProcedureOption[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Função para buscar treinamentos
  React.useEffect(() => {
    fetchTrainings();
    fetchOptions();
  }, []);

  const fetchTrainings = async () => {
    setIsLoadingTrainings(true);
    try {
      const response = await fetch("/api/laboratory/hplc/trainings");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTrainings(data);
      } else {
        setTrainings([]);
      }
    } catch (error) {
      console.error("Erro ao buscar treinamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os treinamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTrainings(false);
    }
  };

  // Buscar opções para usuários, equipamentos e procedimentos
  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Buscar usuários
      const usersResponse = await fetch("/api/users?limit=50");
      const usersData = await usersResponse.json();
      if (Array.isArray(usersData)) {
        setUserOptions(usersData);
      }

      // Buscar equipamentos
      const equipmentsResponse = await fetch("/api/laboratory/hplc/equipments");
      const equipmentsData = await equipmentsResponse.json();
      if (Array.isArray(equipmentsData)) {
        setEquipmentOptions(equipmentsData);
      }

      // Buscar procedimentos
      const proceduresResponse = await fetch("/api/laboratory/hplc/procedures");
      const proceduresData = await proceduresResponse.json();
      if (Array.isArray(proceduresData)) {
        setProcedureOptions(proceduresData);
      }
    } catch (error) {
      console.error("Erro ao buscar opções:", error);
      toast({
        title: "Aviso",
        description: "Algumas opções podem não estar disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Função para criar treinamento
  const handleCreateTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Converter checkboxes
    const certificateIssued = formData.get("certificateIssued") === "on";

    const trainingData = {
      userId: Number(formData.get("userId")),
      procedureId: formData.get("procedureId") ? Number(formData.get("procedureId")) : null,
      equipmentId: formData.get("equipmentId") ? Number(formData.get("equipmentId")) : null,
      trainingTitle: formData.get("trainingTitle"),
      trainingType: formData.get("trainingType"),
      startDate: formData.get("startDate"),
      completionDate: formData.get("completionDate") || null,
      status: formData.get("status") || "scheduled",
      assessmentScore: formData.get("assessmentScore") ? Number(formData.get("assessmentScore")) : null,
      certificateIssued,
      comments: formData.get("comments") || null,
    };

    try {
      const response = await fetch("/api/laboratory/hplc/trainings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
      });

      if (response.ok) {
        setIsCreating(false);
        fetchTrainings();
        toast({
          title: "Sucesso",
          description: "Treinamento criado com sucesso.",
          variant: "default",
        });
        form.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar treinamento");
      }
    } catch (error) {
      console.error("Erro ao criar treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o treinamento.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar treinamento
  const handleUpdateTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTraining) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Converter checkboxes
    const certificateIssued = formData.get("certificateIssued") === "on";

    const trainingData = {
      status: formData.get("status"),
      completionDate: formData.get("completionDate") || null,
      assessmentScore: formData.get("assessmentScore") ? Number(formData.get("assessmentScore")) : null,
      certificateIssued,
      comments: formData.get("comments") || null,
    };

    try {
      const response = await fetch(`/api/laboratory/hplc/trainings/${selectedTraining.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchTrainings();
        toast({
          title: "Sucesso",
          description: "Treinamento atualizado com sucesso.",
          variant: "default",
        });
        setSelectedTraining(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar treinamento");
      }
    } catch (error) {
      console.error("Erro ao atualizar treinamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o treinamento.",
        variant: "destructive",
      });
    }
  };

  // Função para aplicar filtros
  const applyFilters = (trainingList: Training[]): Training[] => {
    if (!trainingList) return [];

    return trainingList.filter((training) => {
      // Filtrar por status
      if (filters.status && filters.status !== "all" && training.status !== filters.status) {
        return false;
      }

      // Filtrar por tipo
      if (filters.type && filters.type !== "all" && training.trainingType !== filters.type) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          training.trainingTitle.toLowerCase().includes(searchTerm) ||
          (training.user_name && training.user_name.toLowerCase().includes(searchTerm)) ||
          (training.trainer_name && training.trainer_name.toLowerCase().includes(searchTerm)) ||
          (training.equipment_name && training.equipment_name.toLowerCase().includes(searchTerm)) ||
          (training.procedure_title && training.procedure_title.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Treinamentos filtrados
  const filteredTrainings = applyFilters(trainings);

  // Renderizar badge de status com cor apropriada
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Agendado
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
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Reprovado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar badge de tipo com cor apropriada
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "inicial":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <GraduationCap className="mr-1 h-3 w-3" /> Inicial
          </Badge>
        );
      case "recorrente":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Recorrente
          </Badge>
        );
      case "específico":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Filter className="mr-1 h-3 w-3" /> Específico
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treinamentos HPLC</h1>
          <p className="text-muted-foreground">
            Gerencie treinamentos para equipamentos e procedimentos HPLC
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Treinamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleCreateTraining}>
              <DialogHeader>
                <DialogTitle>Novo Treinamento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para registrar um novo treinamento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingTitle">Título do Treinamento</Label>
                    <Input id="trainingTitle" name="trainingTitle" placeholder="Ex: Operação do HPLC Agilent" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">Usuário (Participante)</Label>
                    <Select name="userId" required>
                      <SelectTrigger id="userId">
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Usuários</SelectLabel>
                          {userOptions.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} {user.email && `(${user.email})`}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingType">Tipo de Treinamento</Label>
                    <Select name="trainingType" defaultValue="inicial" required>
                      <SelectTrigger id="trainingType">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="inicial">Inicial</SelectItem>
                          <SelectItem value="recorrente">Recorrente</SelectItem>
                          <SelectItem value="específico">Específico</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentId">Equipamento (opcional)</Label>
                    <Select name="equipmentId">
                      <SelectTrigger id="equipmentId">
                        <SelectValue placeholder="Selecione um equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Equipamentos</SelectLabel>
                          <SelectItem value="">Nenhum</SelectItem>
                          {equipmentOptions.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id.toString()}>
                              {equipment.name} ({equipment.model})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedureId">Procedimento (opcional)</Label>
                    <Select name="procedureId">
                      <SelectTrigger id="procedureId">
                        <SelectValue placeholder="Selecione um procedimento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Procedimentos</SelectLabel>
                          <SelectItem value="">Nenhum</SelectItem>
                          {procedureOptions.map((procedure) => (
                            <SelectItem key={procedure.id} value={procedure.id.toString()}>
                              {procedure.title} ({procedure.documentNumber})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Data de Conclusão (opcional)</Label>
                    <Input id="completionDate" name="completionDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="scheduled">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="failed">Reprovado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessmentScore">Nota da Avaliação (0-100)</Label>
                    <Input
                      id="assessmentScore"
                      name="assessmentScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Ex: 85"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="certificateIssued" name="certificateIssued" />
                    <label
                      htmlFor="certificateIssued"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Certificado Emitido
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Comentários</Label>
                  <Textarea
                    id="comments"
                    name="comments"
                    placeholder="Observações sobre o treinamento..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Treinamento</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a lista de treinamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="failed">Reprovado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-filter">Tipo</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="inicial">Inicial</SelectItem>
                      <SelectItem value="recorrente">Recorrente</SelectItem>
                      <SelectItem value="específico">Específico</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-filter">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-filter"
                    type="search"
                    placeholder="Buscar por título, participante..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Treinamentos</CardTitle>
            <CardDescription>
              {filteredTrainings.length} treinamentos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrainings ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTrainings.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Nenhum treinamento encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não existem treinamentos com os filtros selecionados.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Conclusão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">{training.trainingTitle}</TableCell>
                      <TableCell>
                        {training.user_name ? (
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            {training.user_name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Usuário ID: {training.userId}</span>
                        )}
                      </TableCell>
                      <TableCell>{renderTypeBadge(training.trainingType)}</TableCell>
                      <TableCell>{renderStatusBadge(training.status)}</TableCell>
                      <TableCell>
                        {training.startDate ? format(new Date(training.startDate), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {training.completionDate ? format(new Date(training.completionDate), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedTraining(training);
                              setIsViewingDetails(true);
                            }}
                            title="Ver Detalhes"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedTraining(training);
                              setIsEditing(true);
                            }}
                            title="Atualizar Status"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de visualização de detalhes */}
      <Dialog open={isViewingDetails && !!selectedTraining} onOpenChange={setIsViewingDetails}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedTraining && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Treinamento</DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre o treinamento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTraining.trainingTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {renderTypeBadge(selectedTraining.trainingType)}{" "}
                    {renderStatusBadge(selectedTraining.status)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Participante</h4>
                    <p className="mt-1">
                      {selectedTraining.user_name || `Usuário ID: ${selectedTraining.userId}`}
                      {selectedTraining.user_email && <span className="text-sm text-muted-foreground block">{selectedTraining.user_email}</span>}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Instrutor</h4>
                    <p className="mt-1">
                      {selectedTraining.trainer_name || `Instrutor ID: ${selectedTraining.trainedBy}`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Data de Início</h4>
                    <p className="mt-1">
                      {selectedTraining.startDate 
                        ? format(new Date(selectedTraining.startDate), "dd/MM/yyyy") 
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Data de Conclusão</h4>
                    <p className="mt-1">
                      {selectedTraining.completionDate 
                        ? format(new Date(selectedTraining.completionDate), "dd/MM/yyyy") 
                        : "-"}
                    </p>
                  </div>
                </div>
                
                {(selectedTraining.equipment_name || selectedTraining.procedure_title) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTraining.equipment_name && (
                      <div>
                        <h4 className="text-sm font-medium">Equipamento</h4>
                        <p className="mt-1">{selectedTraining.equipment_name}</p>
                      </div>
                    )}
                    {selectedTraining.procedure_title && (
                      <div>
                        <h4 className="text-sm font-medium">Procedimento</h4>
                        <p className="mt-1">{selectedTraining.procedure_title}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {(selectedTraining.assessmentScore !== undefined || selectedTraining.certificateIssued) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTraining.assessmentScore !== undefined && selectedTraining.assessmentScore !== null && (
                      <div>
                        <h4 className="text-sm font-medium">Nota da Avaliação</h4>
                        <p className="mt-1">{selectedTraining.assessmentScore}/100</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium">Certificado</h4>
                      <p className="mt-1">
                        {selectedTraining.certificateIssued 
                          ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Award className="mr-1 h-3 w-3" /> Emitido
                            </Badge>
                          : <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Não Emitido
                            </Badge>
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedTraining.comments && (
                  <div>
                    <h4 className="text-sm font-medium">Comentários</h4>
                    <p className="mt-1 text-sm whitespace-pre-line">{selectedTraining.comments}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsViewingDetails(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={isEditing && !!selectedTraining} onOpenChange={setIsEditing}>
        <DialogContent>
          {selectedTraining && (
            <form onSubmit={handleUpdateTraining}>
              <DialogHeader>
                <DialogTitle>Atualizar Treinamento</DialogTitle>
                <DialogDescription>
                  Atualize o status e os resultados do treinamento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedTraining.status}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="failed">Reprovado</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-completionDate">Data de Conclusão</Label>
                  <Input
                    id="edit-completionDate"
                    name="completionDate"
                    type="date"
                    defaultValue={selectedTraining.completionDate ? selectedTraining.completionDate.split('T')[0] : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assessmentScore">Nota da Avaliação (0-100)</Label>
                  <Input
                    id="edit-assessmentScore"
                    name="assessmentScore"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedTraining.assessmentScore?.toString() || ""}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-certificateIssued" 
                    name="certificateIssued" 
                    defaultChecked={selectedTraining.certificateIssued}
                  />
                  <label
                    htmlFor="edit-certificateIssued"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Certificado Emitido
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-comments">Comentários</Label>
                  <Textarea
                    id="edit-comments"
                    name="comments"
                    defaultValue={selectedTraining.comments || ""}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Atualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}