import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import {
  Loader2,
  FilePlus,
  Search,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Tag,
  Hash,
  Clock,
  User,
  AlertCircle
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

// Interface para procedimentos HPLC
interface HplcProcedure {
  id: number;
  laboratoryId: number;
  title: string;
  documentNumber: string;
  version: string;
  effectiveDate: string;
  category: string;
  content: string;
  attachments?: any;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  relatedTrainings?: any[];
}

// Validação para o formulário de procedimento
const procedureFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres."
  }),
  documentNumber: z.string().min(2, {
    message: "O número do documento é obrigatório."
  }),
  version: z.string().min(1, {
    message: "A versão é obrigatória."
  }),
  effectiveDate: z.string().min(1, {
    message: "A data de efetivação é obrigatória."
  }),
  category: z.string().min(2, {
    message: "A categoria é obrigatória."
  }),
  content: z.string().min(10, {
    message: "O conteúdo deve ter pelo menos 10 caracteres."
  }),
  attachments: z.any().optional()
});

export default function Procedures() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<HplcProcedure | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "all"
  });

  // Consulta para buscar procedimentos
  const { data: procedures, isLoading: isLoadingProcedures } = useQuery({
    queryKey: ["/api/laboratory/hplc/procedures"],
    select: (data) => data as HplcProcedure[]
  });

  // Categorias disponíveis para procedimentos (extraídas dos dados)
  const availableCategories = procedures
    ? Array.from(new Set(procedures.map((procedure) => procedure.category)))
    : [];

  // Formulário para criar/editar procedimento
  const createForm = useForm<z.infer<typeof procedureFormSchema>>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      title: "",
      documentNumber: "",
      version: "1.0",
      effectiveDate: format(new Date(), "yyyy-MM-dd"),
      category: "",
      content: "",
      attachments: null
    }
  });

  // Formulário para editar procedimento
  const editForm = useForm<z.infer<typeof procedureFormSchema>>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      title: "",
      documentNumber: "",
      version: "",
      effectiveDate: "",
      category: "",
      content: "",
      attachments: null
    }
  });

  // Atualizar formulário de edição quando um procedimento é selecionado
  useEffect(() => {
    if (selectedProcedure) {
      editForm.reset({
        title: selectedProcedure.title,
        documentNumber: selectedProcedure.documentNumber,
        version: selectedProcedure.version,
        effectiveDate: selectedProcedure.effectiveDate.split("T")[0],
        category: selectedProcedure.category,
        content: selectedProcedure.content,
        attachments: selectedProcedure.attachments
      });
    }
  }, [selectedProcedure, editForm]);

  // Mutação para criar procedimento
  const createProcedureMutation = useMutation({
    mutationFn: (data: z.infer<typeof procedureFormSchema>) => {
      return apiRequest("/api/laboratory/hplc/procedures", {
        method: "POST",
        data: data
      });
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/procedures"] });
      toast({
        title: "Procedimento criado",
        description: "O procedimento foi criado com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar procedimento:", error);
      toast({
        title: "Erro ao criar procedimento",
        description: "Ocorreu um erro ao criar o procedimento",
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar procedimento
  const updateProcedureMutation = useMutation({
    mutationFn: (data: z.infer<typeof procedureFormSchema> & { id: number }) => {
      return apiRequest(`/api/laboratory/hplc/procedures/${data.id}`, {
        method: "PUT",
        data: {
          title: data.title,
          documentNumber: data.documentNumber,
          version: data.version,
          effectiveDate: data.effectiveDate,
          category: data.category,
          content: data.content,
          attachments: data.attachments
        }
      });
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedProcedure(null);
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/procedures"] });
      toast({
        title: "Procedimento atualizado",
        description: "O procedimento foi atualizado com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar procedimento:", error);
      toast({
        title: "Erro ao atualizar procedimento",
        description: "Ocorreu um erro ao atualizar o procedimento",
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir procedimento
  const deleteProcedureMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/laboratory/hplc/procedures/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/hplc/procedures"] });
      toast({
        title: "Procedimento excluído",
        description: "O procedimento foi excluído com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir procedimento:", error);
      toast({
        title: "Erro ao excluir procedimento",
        description: "Ocorreu um erro ao excluir o procedimento. Verifique se não há treinamentos associados a este procedimento.",
        variant: "destructive",
      });
    },
  });

  // Função para lidar com a criação de procedimento
  const handleCreateProcedure = (data: z.infer<typeof procedureFormSchema>) => {
    createProcedureMutation.mutate(data);
  };

  // Função para lidar com a atualização de procedimento
  const handleUpdateProcedure = (data: z.infer<typeof procedureFormSchema>) => {
    if (selectedProcedure) {
      updateProcedureMutation.mutate({ ...data, id: selectedProcedure.id });
    }
  };

  // Função para lidar com a exclusão de procedimento
  const handleDeleteProcedure = (id: number) => {
    deleteProcedureMutation.mutate(id);
  };

  // Função para abrir o diálogo de edição
  const openEditDialog = (procedure: HplcProcedure) => {
    setSelectedProcedure(procedure);
    setIsEditDialogOpen(true);
  };

  // Função para visualizar detalhes do procedimento
  const viewProcedureDetails = (procedureId: number) => {
    navigate(`/laboratory/hplc/procedures/${procedureId}`);
  };

  // Função para aplicar filtros
  const applyFilters = (procedureList: HplcProcedure[] | undefined): HplcProcedure[] => {
    if (!procedureList) return [];

    return procedureList.filter((procedure) => {
      // Filtrar por categoria
      if (filters.category && filters.category !== "all" && procedure.category !== filters.category) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          procedure.title.toLowerCase().includes(searchTerm) ||
          procedure.documentNumber.toLowerCase().includes(searchTerm) ||
          procedure.category.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  };

  // Procedimentos filtrados
  const filteredProcedures = applyFilters(procedures);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Procedimentos HPLC</h1>
            <p className="text-muted-foreground">
              Gerencie procedimentos operacionais padrão (POPs) para análises HPLC
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus className="mr-2 h-4 w-4" />
                Novo Procedimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Procedimento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do procedimento operacional padrão
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateProcedure)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título do procedimento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="documentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Documento</FormLabel>
                          <FormControl>
                            <Input placeholder="POP-HPLC-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versão</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Efetivação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="Operação, Manutenção, etc" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo do Procedimento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o procedimento operacional padrão em detalhes..."
                            className="min-h-[200px]"
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
                      disabled={createProcedureMutation.isPending}
                    >
                      {createProcedureMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Criar Procedimento
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
              placeholder="Buscar procedimentos..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procedimentos</CardTitle>
          <CardDescription>
            {filteredProcedures && filteredProcedures.length > 0
              ? `Mostrando ${filteredProcedures.length} procedimento(s)`
              : "Nenhum procedimento encontrado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProcedures ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProcedures && filteredProcedures.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Nenhum procedimento encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não existem procedimentos com os filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data de Efetivação</TableHead>
                  <TableHead>Criado Por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcedures?.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell className="font-medium">{procedure.documentNumber}</TableCell>
                    <TableCell>{procedure.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{procedure.category}</Badge>
                    </TableCell>
                    <TableCell>{procedure.version}</TableCell>
                    <TableCell>{formatDate(procedure.effectiveDate)}</TableCell>
                    <TableCell>{procedure.createdByName || "Usuário"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => viewProcedureDetails(procedure.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver Detalhes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(procedure)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Procedimento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o procedimento "{procedure.title}"?
                                  <br /><br />
                                  <strong>Esta ação não pode ser desfeita.</strong>
                                  <br /><br />
                                  Nota: Procedimentos com treinamentos associados não podem ser excluídos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProcedure(procedure.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Procedimento</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do procedimento operacional padrão
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateProcedure)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do procedimento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="POP-HPLC-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versão</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Efetivação</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Operação, Manutenção, etc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo do Procedimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o procedimento operacional padrão em detalhes..."
                        className="min-h-[200px]"
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
                  disabled={updateProcedureMutation.isPending}
                >
                  {updateProcedureMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Atualizar Procedimento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}