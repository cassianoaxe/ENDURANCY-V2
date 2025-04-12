import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation, useParams } from "wouter";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Hash,
  Clock,
  User,
  School,
  AlertCircle,
  CheckCircle2,
  Edit,
  Beaker,
  Upload,
  Download,
  X,
  Plus,
  Microscope,
  FlaskConical,
  TestTube
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  TableCaption,
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
  DialogClose,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

// Interface para documentos da validação
interface ValidationDocument {
  id: number;
  validationId: number;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName?: string;
  uploadedAt: string;
  filePath: string;
}

// Interface para resultados de parâmetros de validação
interface ValidationParameterResult {
  id: number;
  validationId: number;
  parameter: string;
  result: string;
  status: 'pending' | 'completed' | 'failed';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Schema para formulário de resultados de parâmetros
const parameterResultFormSchema = z.object({
  parameter: z.string().min(1, {
    message: "Selecione um parâmetro de validação."
  }),
  result: z.string().min(1, {
    message: "O resultado é obrigatório."
  }),
  status: z.enum(['pending', 'completed', 'failed'], {
    message: "Selecione um status válido."
  })
});

// Schema para formulário de upload de documento
const documentUploadFormSchema = z.object({
  name: z.string().min(1, {
    message: "O nome do documento é obrigatório."
  }),
  description: z.string().optional(),
  file: z.instanceof(File, {
    message: "Selecione um arquivo para upload."
  })
});

export default function ValidationDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const validationId = params.id ? parseInt(params.id) : null;
  const [isAddingResult, setIsAddingResult] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  
  // Consulta para buscar detalhes da validação
  const { data: validation, isLoading, error } = useQuery({
    queryKey: [`/api/laboratory/hplc/validations/${validationId}`],
    enabled: !!validationId,
    select: (data) => data as HplcValidation
  });

  // Consulta para buscar resultados de parâmetros
  const { data: parameterResults, isLoading: isLoadingResults } = useQuery({
    queryKey: [`/api/laboratory/hplc/validations/${validationId}/results`],
    enabled: !!validationId,
    select: (data) => data as ValidationParameterResult[]
  });

  // Consulta para buscar documentos da validação
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: [`/api/laboratory/hplc/validations/${validationId}/documents`],
    enabled: !!validationId,
    select: (data) => data as ValidationDocument[]
  });

  // Formulário para adicionar resultado de parâmetro
  const parameterResultForm = useForm<z.infer<typeof parameterResultFormSchema>>({
    resolver: zodResolver(parameterResultFormSchema),
    defaultValues: {
      parameter: "",
      result: "",
      status: "completed"
    }
  });

  // Formulário para upload de documento
  const documentUploadForm = useForm<z.infer<typeof documentUploadFormSchema>>({
    resolver: zodResolver(documentUploadFormSchema),
    defaultValues: {
      name: "",
      description: "",
      file: undefined
    }
  });

  // Mutação para adicionar resultado de parâmetro
  const addParameterResultMutation = useMutation({
    mutationFn: (data: z.infer<typeof parameterResultFormSchema>) => {
      return apiRequest(`/api/laboratory/hplc/validations/${validationId}/results`, {
        method: "POST",
        data: data
      });
    },
    onSuccess: () => {
      setIsAddingResult(false);
      parameterResultForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}/results`] });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}`] });
      toast({
        title: "Resultado adicionado",
        description: "O resultado do parâmetro foi adicionado com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao adicionar resultado:", error);
      toast({
        title: "Erro ao adicionar resultado",
        description: "Ocorreu um erro ao adicionar o resultado do parâmetro",
        variant: "destructive",
      });
    },
  });

  // Mutação para upload de documento
  const uploadDocumentMutation = useMutation({
    mutationFn: (data: z.infer<typeof documentUploadFormSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      formData.append("file", data.file);

      return apiRequest(`/api/laboratory/hplc/validations/${validationId}/documents`, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    },
    onSuccess: () => {
      setIsUploadingDocument(false);
      documentUploadForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}/documents`] });
      toast({
        title: "Documento enviado",
        description: "O documento foi enviado com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao enviar documento:", error);
      toast({
        title: "Erro ao enviar documento",
        description: "Ocorreu um erro ao enviar o documento",
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir documento
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) => {
      return apiRequest(`/api/laboratory/hplc/documents/${documentId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}/documents`] });
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir documento:", error);
      toast({
        title: "Erro ao excluir documento",
        description: "Ocorreu um erro ao excluir o documento",
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir resultado de parâmetro
  const deleteParameterResultMutation = useMutation({
    mutationFn: (resultId: number) => {
      return apiRequest(`/api/laboratory/hplc/validation-results/${resultId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}/results`] });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/hplc/validations/${validationId}`] });
      toast({
        title: "Resultado excluído",
        description: "O resultado do parâmetro foi excluído com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir resultado:", error);
      toast({
        title: "Erro ao excluir resultado",
        description: "Ocorreu um erro ao excluir o resultado do parâmetro",
        variant: "destructive",
      });
    },
  });

  // Função para lidar com adição de resultado de parâmetro
  const handleAddParameterResult = (data: z.infer<typeof parameterResultFormSchema>) => {
    addParameterResultMutation.mutate(data);
  };

  // Função para lidar com upload de documento
  const handleUploadDocument = (data: z.infer<typeof documentUploadFormSchema>) => {
    uploadDocumentMutation.mutate(data);
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para renderizar o badge de status da validação
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Pendente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Beaker className="mr-1 h-3 w-3" /> Em Andamento
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
            <AlertCircle className="mr-1 h-3 w-3" /> Falha
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para renderizar o badge de status do resultado de parâmetro
  const renderParameterStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Aprovado
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Reprovado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para baixar documento
  const downloadDocument = (documentPath: string, documentName: string) => {
    window.open(`/api${documentPath}`, '_blank');
  };

  // Verificar se parâmetro já tem resultado
  const hasParameterResult = (parameter: string) => {
    return parameterResults?.some(result => result.parameter === parameter);
  };

  // Filtrar parâmetros sem resultados
  const getParametersWithoutResults = () => {
    if (!validation || !parameterResults) return [];
    return validation.validationParameters.filter(parameter => !hasParameterResult(parameter));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/laboratory/hplc/validations")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Validações
        </Button>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Erro ao Carregar Validação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h3 className="text-lg font-semibold">Validação não encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar os detalhes da validação solicitada.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : validation ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-primary">
                        <Hash className="mr-1 h-3 w-3" /> {validation.methodCode}
                      </Badge>
                      {renderStatusBadge(validation.status)}
                    </div>
                    <CardTitle className="text-2xl">{validation.methodName}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                          Analitos: <span className="font-medium ml-1">{validation.analytes}</span>
                        </div>
                        <div className="flex items-center">
                          <FlaskConical className="mr-1 h-4 w-4 text-muted-foreground" />
                          Matriz: <span className="font-medium ml-1">{validation.matrix}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          Início: <span className="font-medium ml-1">{formatDate(validation.validationStartDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          Término: <span className="font-medium ml-1">{validation.validationEndDate ? formatDate(validation.validationEndDate) : "Não definido"}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4 text-muted-foreground" />
                          Responsável: <span className="font-medium ml-1">{validation.responsibleName || "Não definido"}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="text-sm text-muted-foreground">Progresso</p>
                      <p className="text-xl font-bold">{validation.progress}%</p>
                    </div>
                    <Progress 
                      value={validation.progress} 
                      className="h-3 w-[100px]" 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="parameters">Parâmetros ({validation.validationParameters.length})</TabsTrigger>
                    <TabsTrigger value="results">Resultados ({parameterResults?.length || 0})</TabsTrigger>
                    <TabsTrigger value="documents">Documentos ({documents?.length || 0})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Detalhes do Método</h3>
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-muted-foreground">Equipamento:</div>
                            <div className="col-span-2 font-medium">{validation.equipment || "Não especificado"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-muted-foreground">Coluna:</div>
                            <div className="col-span-2 font-medium">{validation.column || "Não especificada"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 items-start">
                            <div className="text-muted-foreground">Condições Analíticas:</div>
                            <div className="col-span-2 font-medium whitespace-pre-wrap">
                              {validation.analyticalConditions || "Não especificadas"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Notas e Observações</h3>
                        <div className="bg-gray-50 rounded-md p-3 text-sm min-h-[100px] whitespace-pre-wrap">
                          {validation.notes || "Nenhuma nota adicionada."}
                        </div>
                      </div>
                    </div>
                    
                    {validation.results && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Resultados Gerais</h3>
                        <div className="bg-gray-50 rounded-md p-3 text-sm whitespace-pre-wrap">
                          {validation.results}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Informações Adicionais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="grid grid-cols-3 gap-1">
                          <div className="text-muted-foreground">Criado por:</div>
                          <div className="col-span-2 font-medium">{validation.createdByName || "Usuário do sistema"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="text-muted-foreground">Data de criação:</div>
                          <div className="col-span-2 font-medium">{formatDate(validation.createdAt)}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="text-muted-foreground">Última atualização:</div>
                          <div className="col-span-2 font-medium">{formatDate(validation.updatedAt)}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="parameters">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Parâmetros de Validação</h3>
                      
                      {validation.validationParameters.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {validation.validationParameters.map((parameter, index) => (
                            <Card key={index} className={`overflow-hidden ${hasParameterResult(parameter) ? 'border-green-200' : ''}`}>
                              <CardHeader className="py-3 px-4">
                                <CardTitle className="text-base flex items-center">
                                  <Microscope className="h-4 w-4 mr-2" />
                                  {parameter}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-2 px-4 text-sm">
                                {hasParameterResult(parameter) ? (
                                  <div className="text-green-600 font-semibold flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Resultado registrado
                                  </div>
                                ) : (
                                  <div className="text-yellow-600 font-semibold flex items-center">
                                    <Clock className="h-4 w-4 mr-1" /> Aguardando resultado
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-center p-4 border rounded-md">
                          Nenhum parâmetro de validação definido.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="results">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Resultados por Parâmetro</h3>
                        <Dialog open={isAddingResult} onOpenChange={setIsAddingResult}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              disabled={getParametersWithoutResults().length === 0}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Resultado
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adicionar Resultado de Parâmetro</DialogTitle>
                              <DialogDescription>
                                Registre o resultado da validação para um parâmetro específico
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...parameterResultForm}>
                              <form onSubmit={parameterResultForm.handleSubmit(handleAddParameterResult)} className="space-y-4">
                                <FormField
                                  control={parameterResultForm.control}
                                  name="parameter"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Parâmetro</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o parâmetro" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {getParametersWithoutResults().map((parameter) => (
                                            <SelectItem key={parameter} value={parameter}>
                                              {parameter}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={parameterResultForm.control}
                                  name="result"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Resultado</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Descreva o resultado da validação para este parâmetro"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={parameterResultForm.control}
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
                                          <SelectItem value="completed">Aprovado</SelectItem>
                                          <SelectItem value="failed">Reprovado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button 
                                    type="submit" 
                                    disabled={addParameterResultMutation.isPending}
                                  >
                                    {addParameterResultMutation.isPending && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Salvar Resultado
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {isLoadingResults ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : parameterResults && parameterResults.length > 0 ? (
                        <div className="space-y-4">
                          {parameterResults.map((result) => (
                            <Card key={result.id} className="overflow-hidden">
                              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base flex items-center">
                                  <Microscope className="h-4 w-4 mr-2" />
                                  {result.parameter}
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                  {renderParameterStatusBadge(result.status)}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteParameterResultMutation.mutate(result.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2 px-4">
                                <div className="text-sm whitespace-pre-wrap">
                                  {result.result}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 border rounded-md">
                          <Microscope className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-semibold">Nenhum resultado registrado</h3>
                          <p className="text-muted-foreground mt-1 mb-4">
                            Adicione resultados para os parâmetros de validação definidos
                          </p>
                          {getParametersWithoutResults().length > 0 ? (
                            <Button onClick={() => setIsAddingResult(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Resultado
                            </Button>
                          ) : (
                            <p className="text-amber-500 text-sm">
                              Todos os parâmetros já possuem resultados registrados
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Documentação</h3>
                        <Dialog open={isUploadingDocument} onOpenChange={setIsUploadingDocument}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Enviar Documento
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enviar Documento</DialogTitle>
                              <DialogDescription>
                                Adicione documentação relacionada à validação deste método
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...documentUploadForm}>
                              <form onSubmit={documentUploadForm.handleSubmit(handleUploadDocument)} className="space-y-4">
                                <FormField
                                  control={documentUploadForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome do Documento</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="ex: Relatório de Validação, Protocolo, etc." 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={documentUploadForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Descrição (opcional)</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Descreva brevemente o conteúdo deste documento" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={documentUploadForm.control}
                                  name="file"
                                  render={({ field: { onChange, value, ...rest } }) => (
                                    <FormItem>
                                      <FormLabel>Arquivo</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="file"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              onChange(file);
                                            }
                                          }}
                                          {...rest}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Formatos aceitos: PDF, DOCX, XLSX, JPG, PNG (máx. 10MB)
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button 
                                    type="submit" 
                                    disabled={uploadDocumentMutation.isPending}
                                  >
                                    {uploadDocumentMutation.isPending && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Enviar
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {isLoadingDocuments ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : documents && documents.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border shadow">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Enviado por</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                  <TableCell className="font-medium">{doc.name}</TableCell>
                                  <TableCell>{doc.description || "-"}</TableCell>
                                  <TableCell>{doc.fileType.toUpperCase()}</TableCell>
                                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                                  <TableCell>{doc.uploadedByName || "Usuário"}</TableCell>
                                  <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => downloadDocument(doc.filePath, doc.name)}
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Excluir</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center p-8 border rounded-md">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-semibold">Nenhum documento enviado</h3>
                          <p className="text-muted-foreground mt-1 mb-4">
                            Adicione documentação relacionada à validação deste método
                          </p>
                          <Button onClick={() => setIsUploadingDocument(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Documento
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}