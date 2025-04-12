import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, SearchIcon, BadgeCheckIcon, CalendarClockIcon, School, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Definição do schema de validação para o formulário de treinamento
const trainingFormSchema = z.object({
  trainingTitle: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  trainingType: z.string().min(1, "Selecione um tipo de treinamento"),
  userId: z.string().min(1, "Selecione um usuário"),
  trainedBy: z.string().min(1, "Selecione um responsável pelo treinamento"),
  procedureId: z.string().optional(),
  equipmentId: z.string().optional(),
  startDate: z.date({ required_error: "Data de início é obrigatória" }),
  completionDate: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
  evaluationScore: z.coerce.number().min(0, "Pontuação mínima é 0").max(100, "Pontuação máxima é 100").optional(),
  notes: z.string().optional(),
});

type StatusColors = {
  [key: string]: { color: string; bgColor: string; textColor: string };
};

// Cores para status de treinamento
const statusColors: StatusColors = {
  scheduled: { color: "bg-blue-100", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  in_progress: { color: "bg-yellow-100", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
  completed: { color: "bg-green-100", bgColor: "bg-green-100", textColor: "text-green-800" },
  cancelled: { color: "bg-red-100", bgColor: "bg-red-100", textColor: "text-red-800" },
  pending_evaluation: { color: "bg-purple-100", bgColor: "bg-purple-100", textColor: "text-purple-800" },
};

const formatStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    scheduled: "Agendado",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
    pending_evaluation: "Avaliação Pendente",
  };
  return statusMap[status] || status;
};

// Tipo para os dados de treinamento
type Training = {
  id: number;
  trainingTitle: string;
  trainingType: string;
  userId: number;
  user_name: string;
  user_email: string;
  trainedBy: number;
  trained_by_name: string;
  procedureId: number | null;
  procedure_title: string | null;
  equipmentId: number | null;
  equipment_name: string | null;
  equipment_model: string | null;
  startDate: string;
  completionDate: string | null;
  status: string;
  evaluationScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

// Tipo para o filtro
type TrainingFilter = {
  status: string;
  search: string;
};

export default function Trainings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [filters, setFilters] = useState<TrainingFilter>({
    status: "all",
    search: "",
  });

  // Formulário para adicionar treinamento
  const form = useForm<z.infer<typeof trainingFormSchema>>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      trainingTitle: "",
      trainingType: "",
      userId: "",
      trainedBy: "",
      procedureId: "",
      equipmentId: "",
      status: "scheduled",
      evaluationScore: undefined,
      notes: "",
    },
  });

  // Formulário para editar treinamento
  const editForm = useForm<z.infer<typeof trainingFormSchema>>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      trainingTitle: "",
      trainingType: "",
      userId: "",
      trainedBy: "",
      procedureId: "",
      equipmentId: "",
      status: "",
      evaluationScore: undefined,
      notes: "",
    },
  });

  // Buscar dados de treinamentos usando a rota alternativa
  const { data: trainings, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["/api/trainer", filters],
    queryFn: async () => {
      // Construir URL com filtros
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      
      const url = `/api/trainer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erro ao buscar treinamentos");
      }
      return response.json();
    },
  });

  // Buscar usuários disponíveis para treinamento usando rota alternativa
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/trainer/users"],
    queryFn: async () => {
      const response = await fetch("/api/trainer/users");
      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      return response.json();
    },
  });

  // Buscar procedimentos disponíveis para treinamento usando rota alternativa
  const { data: procedures, isLoading: isLoadingProcedures } = useQuery({
    queryKey: ["/api/trainer/procedures"],
    queryFn: async () => {
      const response = await fetch("/api/trainer/procedures");
      if (!response.ok) {
        throw new Error("Erro ao buscar procedimentos");
      }
      return response.json();
    },
  });

  // Buscar equipamentos disponíveis para treinamento usando rota alternativa
  const { data: equipments, isLoading: isLoadingEquipments } = useQuery({
    queryKey: ["/api/trainer/equipments"],
    queryFn: async () => {
      const response = await fetch("/api/trainer/equipments");
      if (!response.ok) {
        throw new Error("Erro ao buscar equipamentos");
      }
      return response.json();
    },
  });

  // Mutação para adicionar treinamento
  const addTrainingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingFormSchema>) => {
      // Converter campos para o formato esperado pela API
      const trainingData = {
        trainingTitle: data.trainingTitle,
        trainingType: data.trainingType,
        userId: parseInt(data.userId),
        trainedBy: parseInt(data.trainedBy),
        procedureId: data.procedureId ? parseInt(data.procedureId) : null,
        equipmentId: data.equipmentId ? parseInt(data.equipmentId) : null,
        startDate: data.startDate.toISOString(),
        completionDate: data.completionDate ? data.completionDate.toISOString() : null,
        status: data.status,
        evaluationScore: data.evaluationScore || null,
        notes: data.notes || null,
      };

      const response = await apiRequest("/api/trainer/create", {
        method: "POST",
        data: trainingData,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Treinamento adicionado",
        description: "O treinamento foi adicionado com sucesso.",
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/trainings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao adicionar treinamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar treinamento
  const updateTrainingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingFormSchema>) => {
      if (!selectedTraining) throw new Error("Nenhum treinamento selecionado");

      // Converter campos para o formato esperado pela API
      const trainingData = {
        trainingTitle: data.trainingTitle,
        trainingType: data.trainingType,
        userId: parseInt(data.userId),
        trainedBy: parseInt(data.trainedBy),
        procedureId: data.procedureId ? parseInt(data.procedureId) : null,
        equipmentId: data.equipmentId ? parseInt(data.equipmentId) : null,
        startDate: data.startDate.toISOString(),
        completionDate: data.completionDate ? data.completionDate.toISOString() : null,
        status: data.status,
        evaluationScore: data.evaluationScore || null,
        notes: data.notes || null,
      };

      const response = await apiRequest(`/api/trainer/update/${selectedTraining.id}`, {
        method: "PUT",
        data: trainingData,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Treinamento atualizado",
        description: "O treinamento foi atualizado com sucesso.",
      });
      setIsEditDialogOpen(false);
      setSelectedTraining(null);
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/trainings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar treinamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir treinamento
  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/trainer/delete/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Treinamento excluído",
        description: "O treinamento foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/trainings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir treinamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  // Handler para submeter o formulário de adicionar treinamento
  const onSubmitAddTraining = (data: z.infer<typeof trainingFormSchema>) => {
    addTrainingMutation.mutate(data);
  };

  // Handler para submeter o formulário de editar treinamento
  const onSubmitEditTraining = (data: z.infer<typeof trainingFormSchema>) => {
    updateTrainingMutation.mutate(data);
  };

  // Função para abrir o diálogo de edição e preencher o formulário
  const handleEditTraining = (training: Training) => {
    setSelectedTraining(training);
    
    // Preparar dados para o formulário
    editForm.reset({
      trainingTitle: training.trainingTitle,
      trainingType: training.trainingType,
      userId: training.userId.toString(),
      trainedBy: training.trainedBy.toString(),
      procedureId: training.procedureId ? training.procedureId.toString() : undefined,
      equipmentId: training.equipmentId ? training.equipmentId.toString() : undefined,
      startDate: new Date(training.startDate),
      completionDate: training.completionDate ? new Date(training.completionDate) : undefined,
      status: training.status,
      evaluationScore: training.evaluationScore || undefined,
      notes: training.notes || "",
    });
    
    setIsEditDialogOpen(true);
  };

  // Handler para confirmar a exclusão de um treinamento
  const handleDeleteTraining = (id: number) => {
    deleteTrainingMutation.mutate(id);
  };

  // Handler para atualizar os filtros
  const handleFilterChange = (key: keyof TrainingFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Conteúdo enquanto carrega
  if (isLoadingTrainings || isLoadingUsers || isLoadingProcedures || isLoadingEquipments) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Treinamentos HPLC</h2>
          <p className="text-muted-foreground">
            Organize e acompanhe treinamentos para usuários do laboratório.
          </p>
        </div>
        <div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Treinamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Treinamento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do treinamento. Campos marcados com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAddTraining)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trainingTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Treinamento *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Operação Básica HPLC" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trainingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Treinamento *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="initial">Inicial</SelectItem>
                              <SelectItem value="refresher">Reciclagem</SelectItem>
                              <SelectItem value="specialized">Especializado</SelectItem>
                              <SelectItem value="certification">Certificação</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participante *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o participante" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users && users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trainedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável pelo Treinamento *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o responsável" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users && users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="procedureId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Procedimento Relacionado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {procedures && procedures.map((procedure: any) => (
                                <SelectItem key={procedure.id} value={procedure.id.toString()}>
                                  {procedure.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="equipmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipamento Relacionado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {equipments && equipments.map((equipment: any) => (
                                <SelectItem key={equipment.id} value={equipment.id.toString()}>
                                  {equipment.name} ({equipment.model})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Início *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    formatDate(field.value)
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="completionDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Conclusão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    formatDate(field.value)
                                  ) : (
                                    <span>Opcional</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="scheduled">Agendado</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                              <SelectItem value="pending_evaluation">Avaliação Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="evaluationScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pontuação de Avaliação (0-100)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              placeholder="Opcional"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais sobre o treinamento"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={addTrainingMutation.isPending}
                    >
                      {addTrainingMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar Treinamento
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="py-2 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Filtrar por:</p>
          <Select 
            defaultValue="all"
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
              <SelectItem value="pending_evaluation">Avaliação Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar treinamentos..."
            className="w-[300px]"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/trainings"] })}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de treinamentos */}
      {trainings && trainings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Título</TableHead>
              <TableHead>Participante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.map((training: Training) => (
              <TableRow key={training.id}>
                <TableCell className="font-medium">
                  {training.trainingTitle}
                  {training.evaluationScore !== null && (
                    <Badge variant="outline" className="ml-2">
                      {training.evaluationScore}/100
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{training.user_name}</TableCell>
                <TableCell>
                  {training.trainingType === "initial" && "Inicial"}
                  {training.trainingType === "refresher" && "Reciclagem"}
                  {training.trainingType === "specialized" && "Especializado"}
                  {training.trainingType === "certification" && "Certificação"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Início: {formatDate(new Date(training.startDate))}</span>
                    {training.completionDate && (
                      <span className="text-xs text-muted-foreground">Conclusão: {formatDate(new Date(training.completionDate))}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={cn(
                      statusColors[training.status]?.bgColor,
                      statusColors[training.status]?.textColor
                    )}
                  >
                    {formatStatusText(training.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={isEditDialogOpen && selectedTraining?.id === training.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEditTraining(training)}
                      >
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Editar Treinamento</DialogTitle>
                        <DialogDescription>
                          Atualize os detalhes do treinamento. Campos marcados com * são obrigatórios.
                        </DialogDescription>
                      </DialogHeader>
                      {selectedTraining && (
                        <Form {...editForm}>
                          <form onSubmit={editForm.handleSubmit(onSubmitEditTraining)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="trainingTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título do Treinamento *</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Ex: Operação Básica HPLC" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="trainingType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de Treinamento *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="initial">Inicial</SelectItem>
                                        <SelectItem value="refresher">Reciclagem</SelectItem>
                                        <SelectItem value="specialized">Especializado</SelectItem>
                                        <SelectItem value="certification">Certificação</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="userId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Participante *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o participante" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {users && users.map((user: any) => (
                                          <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="trainedBy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Responsável pelo Treinamento *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o responsável" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {users && users.map((user: any) => (
                                          <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="procedureId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Procedimento Relacionado</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="">Nenhum</SelectItem>
                                        {procedures && procedures.map((procedure: any) => (
                                          <SelectItem key={procedure.id} value={procedure.id.toString()}>
                                            {procedure.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="equipmentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Equipamento Relacionado</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="">Nenhum</SelectItem>
                                        {equipments && equipments.map((equipment: any) => (
                                          <SelectItem key={equipment.id} value={equipment.id.toString()}>
                                            {equipment.name} ({equipment.model})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Data de Início *</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              formatDate(field.value)
                                            ) : (
                                              <span>Selecione a data</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="completionDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Data de Conclusão</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              formatDate(field.value)
                                            ) : (
                                              <span>Opcional</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status *</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="scheduled">Agendado</SelectItem>
                                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                        <SelectItem value="pending_evaluation">Avaliação Pendente</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name="evaluationScore"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pontuação de Avaliação (0-100)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0" 
                                        max="100"
                                        placeholder="Opcional"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={editForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Observações</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Observações adicionais sobre o treinamento"
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={updateTrainingMutation.isPending}
                              >
                                {updateTrainingMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Atualizar Treinamento
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o treinamento "{training.trainingTitle}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTraining(training.id)}
                          disabled={deleteTrainingMutation.isPending}
                        >
                          {deleteTrainingMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <School className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum treinamento encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            {filters.search || filters.status !== "all"
              ? "Nenhum treinamento corresponde aos filtros aplicados. Tente ajustar seus critérios de busca."
              : "Nenhum treinamento foi registrado ainda. Clique em 'Adicionar Treinamento' para começar."}
          </p>
        </div>
      )}
      
      {/* Resumo de treinamentos */}
      {trainings && trainings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Resumo de Treinamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Treinamentos Agendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {trainings.filter((t: Training) => t.status === "scheduled").length}
                  </div>
                  <CalendarClockIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Treinamentos Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {trainings.filter((t: Training) => t.status === "completed").length}
                  </div>
                  <BadgeCheckIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {trainings.filter((t: Training) => t.status === "pending_evaluation").length}
                  </div>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}