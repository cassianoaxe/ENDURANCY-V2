import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import {
  Loader2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Tag,
  Hash,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Beaker,
  Microscope,
  TestTube,
  FlaskConical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Progress } from "@/components/ui/progress";

// Interface para validações de métodos HPLC
interface HplcValidation {
  id: number;
  laboratoryId: number;
  methodName: string;
  methodCode: string;
  analytes: string;
  matrix: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  validationParameters: string[];
  validationStartDate: string;
  validationEndDate?: string;
  responsibleId: number;
  responsibleName?: string;
  equipment?: string;
  column?: string;
  analyticalConditions?: string;
  notes?: string;
  results?: string;
  progress: number;
  documents?: any[];
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Schema para validação do formulário
const validationFormSchema = z.object({
  methodName: z.string().min(3, {
    message: "O nome do método deve ter pelo menos 3 caracteres."
  }),
  methodCode: z.string().min(2, {
    message: "O código do método é obrigatório."
  }),
  analytes: z.string().min(2, {
    message: "Os analitos são obrigatórios."
  }),
  matrix: z.string().min(2, {
    message: "A matriz é obrigatória."
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed'], {
    message: "Selecione um status válido."
  }),
  validationParameters: z.string().array().min(1, {
    message: "Selecione pelo menos um parâmetro de validação."
  }),
  validationStartDate: z.string().min(1, {
    message: "A data de início é obrigatória."
  }),
  validationEndDate: z.string().optional(),
  responsibleId: z.number({
    message: "Selecione um responsável."
  }),
  equipment: z.string().optional(),
  column: z.string().optional(),
  analyticalConditions: z.string().optional(),
  notes: z.string().optional(),
  results: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  documents: z.any().optional()
});

export default function Validations() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<HplcValidation | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });

  // Lista de parâmetros de validação disponíveis
  const availableParameters = [
    "Seletividade",
    "Linearidade",
    "Intervalo",
    "Precisão",
    "Repetibilidade",
    "Precisão Intermediária",
    "Exatidão",
    "Limite de Detecção",
    "Limite de Quantificação",
    "Robustez",
    "Estabilidade"
  ];

  // Consulta para buscar validações
  const { data: validations, isLoading: isLoadingValidations } = useQuery({
    queryKey: ["/api/laboratory/hplc/validations"],
    select: (data) => data as HplcValidation[]
  });

  // Consulta para buscar equipamentos (para o dropdown)
  const { data: equipments } = useQuery({
    queryKey: ["/api/laboratory/hplc/equipments"],
    select: (data: any[]) => data.filter(equip => equip.status === 'operational')
  });

  // Consulta para buscar usuários do laboratório (para o dropdown de responsáveis)
  const { data: labUsers } = useQuery({
    queryKey: ["/api/laboratory/users"],
    select: (data: any[]) => data.filter(user => user.active)
  });

  // Formulário para criar validação
  const createForm = useForm<z.infer<typeof validationFormSchema>>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      methodName: "",
      methodCode: "",
      analytes: "",
      matrix: "",
      status: "pending",
      validationParameters: [],
      validationStartDate: format(new Date(), "yyyy-MM-dd"),
      validationEndDate: "",
      responsibleId: 0,
      equipment: "",
      column: "",
      analyticalConditions: "",
      notes: "",
      results: "",
      progress: 0,
      documents: []
    }
  });

  // Formulário para editar validação
  const editForm = useForm<z.infer<typeof validationFormSchema>>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      methodName: "",
      methodCode: "",
      analytes: "",
      matrix: "",
      status: "pending",
      validationParameters: [],
      validationStartDate: "",
      validationEndDate: "",
      responsibleId: 0,
      equipment: "",
      column: "",
      analyticalConditions: "",
      notes: "",
      results: "",
      progress: 0,
      documents: []
    }
  });

  // Atualizar formulário de edição quando uma validação é selecionada
  useEffect(() => {
    if (selectedValidation) {
      editForm.reset({
        methodName: selectedValidation.methodName,
        methodCode: selectedValidation.methodCode,
        analytes: selectedValidation.analytes,
        matrix: selectedValidation.matrix,
        status: selectedValidation.status,
        validationParameters: selectedValidation.validationParameters,
        validationStartDate: selectedValidation.validationStartDate.split("T")[0],
        validationEndDate: selectedValidation.validationEndDate ? selectedValidation.validationEndDate.split("T")[0] : "",
        responsibleId: selectedValidation.responsibleId,
        equipment: selectedValidation.equipment || "",
        column: selectedValidation.column || "",
        analyticalConditions: selectedValidation.analyticalConditions || "",
        notes: selectedValidation.notes || "",
        results: selectedValidation.results || "",
        progress: selectedValidation.progress,
        documents: selectedValidation.documents || []
      });
    }
  }, [selectedValidation, editForm]);

  // Mutação para criar validação
  const createValidationMutation = useMutation({
    mutationFn: (data: z.infer<typeof validationFormSchema>) => {
      return apiRequest("/api/laboratory/hplc/validations", {
        method: "POST",
        data: data
      });
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/validations"] });
      toast({
        title: "Validação criada",
        description: "A validação de método foi criada com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar validação:", error);
      toast({
        title: "Erro ao criar validação",
        description: "Ocorreu um erro ao criar a validação de método",
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar validação
  const updateValidationMutation = useMutation({
    mutationFn: (data: z.infer<typeof validationFormSchema> & { id: number }) => {
      return apiRequest(`/api/laboratory/hplc/validations/${data.id}`, {
        method: "PUT",
        data: {
          methodName: data.methodName,
          methodCode: data.methodCode,
          analytes: data.analytes,
          matrix: data.matrix,
          status: data.status,
          validationParameters: data.validationParameters,
          validationStartDate: data.validationStartDate,
          validationEndDate: data.validationEndDate,
          responsibleId: data.responsibleId,
          equipment: data.equipment,
          column: data.column,
          analyticalConditions: data.analyticalConditions,
          notes: data.notes,
          results: data.results,
          progress: data.progress,
          documents: data.documents
        }
      });
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedValidation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/validations"] });
      toast({
        title: "Validação atualizada",
        description: "A validação de método foi atualizada com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar validação:", error);
      toast({
        title: "Erro ao atualizar validação",
        description: "Ocorreu um erro ao atualizar a validação de método",
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir validação
  const deleteValidationMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/laboratory/hplc/validations/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/validations"] });
      toast({
        title: "Validação excluída",
        description: "A validação de método foi excluída com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir validação:", error);
      toast({
        title: "Erro ao excluir validação",
        description: "Ocorreu um erro ao excluir a validação de método",
        variant: "destructive",
      });
    },
  });

  // Função para lidar com a criação de validação
  const handleCreateValidation = (data: z.infer<typeof validationFormSchema>) => {
    createValidationMutation.mutate(data);
  };

  // Função para lidar com a atualização de validação
  const handleUpdateValidation = (data: z.infer<typeof validationFormSchema>) => {
    if (selectedValidation) {
      updateValidationMutation.mutate({ ...data, id: selectedValidation.id });
    }
  };

  // Função para lidar com a exclusão de validação
  const handleDeleteValidation = (id: number) => {
    deleteValidationMutation.mutate(id);
  };

  // Função para abrir o diálogo de edição
  const openEditDialog = (validation: HplcValidation) => {
    setSelectedValidation(validation);
    setIsEditDialogOpen(true);
  };

  // Função para visualizar detalhes da validação
  const viewValidationDetails = (validationId: number) => {
    navigate(`/laboratory/hplc/validations/${validationId}`);
  };

  // Função para aplicar filtros
  const applyFilters = (validationList: HplcValidation[] | undefined): HplcValidation[] => {
    if (!validationList) return [];

    return validationList.filter((validation) => {
      // Filtrar por status
      if (filters.status && filters.status !== "all" && validation.status !== filters.status) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          validation.methodName.toLowerCase().includes(searchTerm) ||
          validation.methodCode.toLowerCase().includes(searchTerm) ||
          validation.analytes.toLowerCase().includes(searchTerm) ||
          validation.matrix.toLowerCase().includes(searchTerm) ||
          (validation.responsibleName && validation.responsibleName.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Validações filtradas
  const filteredValidations = applyFilters(validations);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para renderizar o badge de status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
            <Clock className="mr-1 h-3 w-3" /> Pendente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            <Beaker className="mr-1 h-3 w-3" /> Em Andamento
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
            <AlertCircle className="mr-1 h-3 w-3" /> Falha
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Validações de Métodos HPLC</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe as validações de métodos analíticos HPLC
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Validação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Validação de Método</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da validação do método analítico
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateValidation)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="methodName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Método</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do método analítico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="methodCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Método</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: MET-HPLC-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="analytes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Analitos</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: CBD, THC, CBN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="matrix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matriz</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Óleo, Extrato, Flor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="validationStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="validationEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término (Previsão)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
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
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="failed">Falha</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="responsibleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o responsável" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {labUsers?.map((user: any) => (
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
                  <FormField
                    control={createForm.control}
                    name="validationParameters"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Parâmetros de Validação</FormLabel>
                          <FormDescription>
                            Selecione os parâmetros que serão validados
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {availableParameters.map((parameter) => (
                            <FormField
                              key={parameter}
                              control={createForm.control}
                              name="validationParameters"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={parameter}
                                    className="flex flex-row items-start space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value?.includes(parameter)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            field.onChange([...field.value, parameter]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter(
                                                (value) => value !== parameter
                                              )
                                            );
                                          }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {parameter}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipamento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o equipamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {equipments?.map((equipment: any) => (
                                <SelectItem key={equipment.id} value={equipment.name}>
                                  {equipment.name} ({equipment.model})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="column"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coluna</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: C18, 250mm x 4.6mm, 5µm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="analyticalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condições Analíticas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva as condições analíticas (fase móvel, fluxo, temperatura, detecção, etc.)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais sobre a validação"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progresso (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createValidationMutation.isPending}
                    >
                      {createValidationMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Criar Validação
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar validações..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingValidations ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredValidations && filteredValidations.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Analitos</TableHead>
                <TableHead>Matriz</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredValidations.map((validation) => (
                <TableRow key={validation.id}>
                  <TableCell className="font-medium">{validation.methodCode}</TableCell>
                  <TableCell>{validation.methodName}</TableCell>
                  <TableCell>{validation.analytes}</TableCell>
                  <TableCell>{validation.matrix}</TableCell>
                  <TableCell>{renderStatusBadge(validation.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={validation.progress} 
                        className="h-2 w-[60px]" 
                      />
                      <span className="text-xs">{validation.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(validation.validationStartDate)}</TableCell>
                  <TableCell>{validation.validationEndDate ? formatDate(validation.validationEndDate) : "-"}</TableCell>
                  <TableCell>{validation.responsibleName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewValidationDetails(validation.id)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Detalhes</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver detalhes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(validation)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta validação de método?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteValidation(validation.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Microscope className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma validação encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {filters.search || filters.status !== "all"
                ? "Nenhuma validação corresponde aos filtros aplicados."
                : "Você ainda não possui validações de métodos cadastradas."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Validação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Editar Validação de Método</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da validação do método analítico
            </DialogDescription>
          </DialogHeader>
          {selectedValidation && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateValidation)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="methodName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Método</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do método analítico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="methodCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Método</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: MET-HPLC-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="analytes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analitos</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: CBD, THC, CBN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="matrix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matriz</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Óleo, Extrato, Flor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="validationStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="validationEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Término</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
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
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="failed">Falha</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {labUsers?.map((user: any) => (
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
                <FormField
                  control={editForm.control}
                  name="validationParameters"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Parâmetros de Validação</FormLabel>
                        <FormDescription>
                          Selecione os parâmetros que serão validados
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableParameters.map((parameter) => (
                          <FormField
                            key={parameter}
                            control={editForm.control}
                            name="validationParameters"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={parameter}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(parameter)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...field.value, parameter]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter(
                                              (value) => value !== parameter
                                            )
                                          );
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {parameter}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o equipamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {equipments?.map((equipment: any) => (
                              <SelectItem key={equipment.id} value={equipment.name}>
                                {equipment.name} ({equipment.model})
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
                    name="column"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coluna</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: C18, 250mm x 4.6mm, 5µm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="analyticalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições Analíticas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as condições analíticas (fase móvel, fluxo, temperatura, detecção, etc.)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre a validação"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultados</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Resultados da validação"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progresso (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value > 0 && (
                          <Progress 
                            value={field.value} 
                            className="h-2 mt-2" 
                          />
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={updateValidationMutation.isPending}
                  >
                    {updateValidationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Atualizar Validação
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}