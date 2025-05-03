import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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
  Upload,
  FileText,
  Link2,
  Download,
  Users,
  Trash2,
  Edit,
  Eye,
  Search,
  BookOpen,
  Plus,
  ArrowUpDown,
  Filter,
  FileQuestion,
  CheckCircle,
  BookMarked,
  User,
  BarChart4,
  Group,
  ListFilter
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Esquema de validação para o formulário de documentos
const documentFormSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(500, "A descrição deve ter no máximo 500 caracteres"),
  category: z.enum(["research", "guidelines", "protocols", "educational", "form", "other"], {
    required_error: "Selecione uma categoria",
  }),
  visibility: z.enum(["all", "selected"], {
    required_error: "Selecione a visibilidade do documento",
  }),
  targetGroups: z.array(z.string()).optional(),
});

// Interface para objetos de documento médico
interface MedicalDocument {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: 'research' | 'guidelines' | 'protocols' | 'educational' | 'form' | 'other';
  visibility: 'all' | 'selected';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  accessCount: number;
  targetGroups?: {
    id: number;
    name: string;
  }[];
}

function DoctorDocumentsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title" | "category" | "access">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form para adicionar/editar documento
  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      visibility: "all",
      targetGroups: [],
    },
  });

  // Buscar documentos
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/organization/doctor-management/documents'],
  });

  // Buscar grupos de médicos (por especialidade, por exemplo) para o seletor de targetGroups
  const { data: doctorGroups } = useQuery({
    queryKey: ['/api/organization/doctor-management/doctor-groups'],
  });

  // Mutação para adicionar documento
  const addDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentFormSchema> & { file: File }) => {
      // Criar um FormData para enviar o arquivo
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("visibility", data.visibility);
      if (data.targetGroups && data.targetGroups.length > 0) {
        formData.append("targetGroups", JSON.stringify(data.targetGroups));
      }

      const response = await fetch("/api/organization/doctor-management/documents", {
        method: "POST",
        body: formData,
        skipContentType: true,
      });

      if (!response.ok) {
        throw new Error("Não foi possível adicionar o documento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
      toast({
        title: "Documento adicionado",
        description: "O documento foi adicionado com sucesso.",
      });
      setOpenDialog(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível adicionar o documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para editar documento
  const editDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentFormSchema> & { id: number, file?: File }) => {
      // Criar um FormData para enviar o arquivo
      const formData = new FormData();
      formData.append("id", data.id.toString());
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("visibility", data.visibility);
      if (data.targetGroups && data.targetGroups.length > 0) {
        formData.append("targetGroups", JSON.stringify(data.targetGroups));
      }
      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await fetch(`/api/organization/doctor-management/documents/${data.id}`, {
        method: "PUT",
        body: formData,
        skipContentType: true,
      });

      if (!response.ok) {
        throw new Error("Não foi possível atualizar o documento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
      toast({
        title: "Documento atualizado",
        description: "O documento foi atualizado com sucesso.",
      });
      setOpenDialog(false);
      form.reset();
      setSelectedFile(null);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir documento
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/organization/doctor-management/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Não foi possível excluir o documento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      });
      setOpenDeleteDialog(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir o documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (data: z.infer<typeof documentFormSchema>) => {
    if (!selectedFile && !selectedDocument) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDocument) {
      // Editando um documento existente
      editDocumentMutation.mutate({
        ...data,
        id: selectedDocument.id,
        file: selectedFile || undefined,
      });
    } else {
      // Adicionando um novo documento
      addDocumentMutation.mutate({
        ...data,
        file: selectedFile!,
      });
    }
  };

  // Função para abrir o dialog de edição
  const handleEditDocument = (document: MedicalDocument) => {
    setSelectedDocument(document);
    form.reset({
      title: document.title,
      description: document.description,
      category: document.category,
      visibility: document.visibility,
      targetGroups: document.targetGroups?.map(g => g.id.toString()) || [],
    });
    setOpenDialog(true);
  };

  // Função para abrir o dialog de visualização
  const handleViewDocument = (document: MedicalDocument) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };

  // Função para filtrar documentos
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];

    let filtered = [...documents];
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc => 
          doc.title.toLowerCase().includes(lowerSearchTerm) || 
          doc.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Filtrar por categoria
    if (categoryFilter) {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortDirection === "asc" 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "title") {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "category") {
        return sortDirection === "asc"
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      } else if (sortBy === "access") {
        return sortDirection === "asc"
          ? a.accessCount - b.accessCount
          : b.accessCount - a.accessCount;
      }
      return 0;
    });
    
    return filtered;
  }, [documents, searchTerm, categoryFilter, sortBy, sortDirection]);

  // Função para lidar com a mudança de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Função para alternar a direção da ordenação
  const toggleSortDirection = (field: "date" | "title" | "category" | "access") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  // Mapear tipos de categoria para seus nomes em português
  const categoryNames: Record<string, string> = {
    research: "Pesquisa",
    guidelines: "Diretrizes",
    protocols: "Protocolos",
    educational: "Educacional",
    form: "Formulário",
    other: "Outro"
  };

  // Mapear tipos de categoria para cores
  const categoryColors: Record<string, string> = {
    research: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    guidelines: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    protocols: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    educational: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    form: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  };

  // Mapear tipos de categoria para ícones
  const categoryIcons: Record<string, React.ReactNode> = {
    research: <BarChart4 className="h-4 w-4 mr-1" />,
    guidelines: <BookMarked className="h-4 w-4 mr-1" />,
    protocols: <CheckCircle className="h-4 w-4 mr-1" />,
    educational: <BookOpen className="h-4 w-4 mr-1" />,
    form: <FileText className="h-4 w-4 mr-1" />,
    other: <FileQuestion className="h-4 w-4 mr-1" />
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para lidar com o download de documento
  const handleDownload = (document: MedicalDocument) => {
    window.open(document.fileUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos Educacionais</h1>
          <p className="text-muted-foreground">
            Gerenciamento de materiais educacionais para médicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            setSelectedDocument(null);
            form.reset({
              title: "",
              description: "",
              category: undefined,
              visibility: "all",
              targetGroups: [],
            });
            setSelectedFile(null);
            setOpenDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar documento
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas categorias</SelectItem>
              <SelectItem value="research">Pesquisa</SelectItem>
              <SelectItem value="guidelines">Diretrizes</SelectItem>
              <SelectItem value="protocols">Protocolos</SelectItem>
              <SelectItem value="educational">Educacional</SelectItem>
              <SelectItem value="form">Formulário</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSortBy("date");
              setSortDirection("desc");
              setSearchTerm("");
              setCategoryFilter(null);
            }}
          >
            <ListFilter className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* Tabela de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos disponíveis</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => toggleSortDirection("category")}>
                      Categoria
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Visibilidade</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => toggleSortDirection("date")}>
                      Data
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => toggleSortDirection("access")}>
                      Acessos
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {isLoading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-4">
                          <FileText className="h-10 w-10 mb-2" />
                          <p>Nenhum documento encontrado</p>
                          {searchTerm || categoryFilter ? (
                            <p className="text-sm mt-1">Tente ajustar os filtros para ver mais resultados</p>
                          ) : (
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSelectedDocument(null);
                                form.reset();
                                setOpenDialog(true);
                              }}
                              className="mt-2"
                            >
                              Adicionar o primeiro documento
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.title}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {doc.description.length > 60 
                              ? doc.description.substring(0, 60) + "..." 
                              : doc.description}
                          </span>
                          <div className="md:hidden mt-1">
                            <Badge className={categoryColors[doc.category]} variant="outline">
                              {categoryIcons[doc.category]}
                              {categoryNames[doc.category]}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={categoryColors[doc.category]} variant="outline">
                          {categoryIcons[doc.category]}
                          {categoryNames[doc.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doc.visibility === "all" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            Todos
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <Group className="h-3 w-3 mr-1" />
                            Selecionados
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {doc.accessCount}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditDocument(doc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar documento */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDocument ? "Editar documento" : "Adicionar novo documento"}</DialogTitle>
            <DialogDescription>
              {selectedDocument 
                ? "Atualize as informações do documento educacional." 
                : "Compartilhe materiais educacionais com os médicos."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título*</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do documento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descrição do conteúdo do documento" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="research">Pesquisa</SelectItem>
                          <SelectItem value="guidelines">Diretrizes</SelectItem>
                          <SelectItem value="protocols">Protocolos</SelectItem>
                          <SelectItem value="educational">Educacional</SelectItem>
                          <SelectItem value="form">Formulário</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibilidade*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a visibilidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Todos os médicos</SelectItem>
                          <SelectItem value="selected">Grupos específicos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("visibility") === "selected" && (
                <FormField
                  control={form.control}
                  name="targetGroups"
                  render={() => (
                    <FormItem>
                      <FormLabel>Grupos alvo</FormLabel>
                      <div className="space-y-2">
                        {doctorGroups?.map((group) => (
                          <FormField
                            key={group.id}
                            control={form.control}
                            name="targetGroups"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={group.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(group.id.toString())}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), group.id.toString()])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== group.id.toString()
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {group.name}
                                    {group.count && <span className="text-xs text-muted-foreground ml-1">({group.count} médicos)</span>}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-1">
                <Label htmlFor="file">Arquivo</Label>
                <div className="mt-1">
                  <input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedDocument && !selectedFile
                        ? "Alterar arquivo"
                        : "Escolher arquivo"}
                    </Button>
                    <div className="ml-4 text-sm">
                      {selectedFile ? (
                        <div className="text-sm text-muted-foreground">
                          {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </div>
                      ) : selectedDocument ? (
                        <div className="text-sm text-muted-foreground">
                          {selectedDocument.fileUrl.split("/").pop()}{" "}
                          ({formatFileSize(selectedDocument.fileSize)})
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Nenhum arquivo selecionado
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedDocument && !selectedFile && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      * Manterá o arquivo atual se nenhum novo arquivo for selecionado
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addDocumentMutation.isPending || editDocumentMutation.isPending}>
                  {addDocumentMutation.isPending || editDocumentMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Salvando...
                    </>
                  ) : selectedDocument ? (
                    "Atualizar"
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar documento */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument?.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              {selectedDocument && (
                <Badge className={`${categoryColors[selectedDocument.category]}`} variant="outline">
                  {categoryIcons[selectedDocument.category]}
                  {categoryNames[selectedDocument.category]}
                </Badge>
              )}
              {selectedDocument?.visibility === "selected" && (
                <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <Group className="h-3 w-3 mr-1" />
                  Grupos específicos
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Descrição</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDocument?.description}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Data de criação</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDocument && formatDate(selectedDocument.createdAt)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Última atualização</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDocument && formatDate(selectedDocument.updatedAt)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Criado por</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {selectedDocument?.createdBy.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{selectedDocument?.createdBy.name}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Acessos</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDocument?.accessCount} visualizações
                </p>
              </div>
            </div>
            
            {selectedDocument?.visibility === "selected" && selectedDocument.targetGroups && selectedDocument.targetGroups.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium">Grupos com acesso</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDocument.targetGroups.map(group => (
                      <Badge key={group.id} variant="outline">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Arquivo</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted p-3 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div className="text-sm">
                      <div className="font-medium">{selectedDocument?.fileUrl.split("/").pop()}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedDocument && formatFileSize(selectedDocument.fileSize)}
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => selectedDocument && handleDownload(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar exclusão */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento{' '}
              <span className="font-medium">{selectedDocument?.title}</span> e removerá os dados do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedDocument && deleteDocumentMutation.mutate(selectedDocument.id)}
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function DocumentsPageWrapper() {
  return <DoctorDocumentsPage />;
}