import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AlertCircle, 
  ArrowLeft, 
  BookOpen, 
  Check, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  Loader2, 
  MoreHorizontal, 
  PencilLine, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2, 
  Upload, 
  Users 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces
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

// Validação do formulário de documentos
const documentFormSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  category: z.enum(['research', 'guidelines', 'protocols', 'educational', 'form', 'other'], {
    required_error: "Selecione uma categoria",
  }),
  visibility: z.enum(['all', 'selected'], {
    required_error: "Selecione a visibilidade",
  }),
  targetGroupIds: z.array(z.string()).optional().default([]),
  // O campo de arquivo será tratado separadamente
});

// Componente principal
function DoctorDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Buscar documentos
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/organization/doctor-management/documents'],
  });

  // Buscar grupos de especialidades para targetting
  const { data: specialtyGroups, isLoading: isLoadingSpecialtyGroups } = useQuery({
    queryKey: ['/api/organization/doctor-specialties/groups'],
  });

  // Formulário para adicionar/editar documentos
  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "educational",
      visibility: "all",
      targetGroupIds: [],
    }
  });

  // Resetar o formulário quando o documento selecionado mudar
  React.useEffect(() => {
    if (selectedDocument) {
      const targetGroupIds = selectedDocument.targetGroups 
        ? selectedDocument.targetGroups.map(group => group.id.toString()) 
        : [];
      
      form.reset({
        title: selectedDocument.title,
        description: selectedDocument.description,
        category: selectedDocument.category,
        visibility: selectedDocument.visibility,
        targetGroupIds,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "educational",
        visibility: "all",
        targetGroupIds: [],
      });
      setSelectedFile(null);
    }
  }, [selectedDocument, form]);

  // Mutações
  const addDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentFormSchema> & { file: File }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('visibility', data.visibility);
      formData.append('file', data.file);

      if (data.visibility === 'selected' && data.targetGroupIds && data.targetGroupIds.length > 0) {
        data.targetGroupIds.forEach(groupId => {
          formData.append('targetGroupIds[]', groupId);
        });
      }

      return await apiRequest('/api/organization/doctor-management/documents', {
        method: 'POST',
        body: formData,
        skipContentType: true, // Para permitir que o browser defina o Content-Type correto para o FormData
      });
    },
    onSuccess: () => {
      toast({
        title: "Documento adicionado",
        description: "O documento foi adicionado com sucesso.",
      });
      setIsAddDocumentDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar documento",
        description: "Ocorreu um erro ao adicionar o documento. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar documento:", error);
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentFormSchema> & { id: number, file?: File }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('visibility', data.visibility);

      if (data.file) {
        formData.append('file', data.file);
      }

      if (data.visibility === 'selected' && data.targetGroupIds && data.targetGroupIds.length > 0) {
        data.targetGroupIds.forEach(groupId => {
          formData.append('targetGroupIds[]', groupId);
        });
      }

      return await apiRequest(`/api/organization/doctor-management/documents/${data.id}`, {
        method: 'PATCH',
        body: formData,
        skipContentType: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Documento atualizado",
        description: "O documento foi atualizado com sucesso.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar documento",
        description: "Ocorreu um erro ao atualizar o documento. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar documento:", error);
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/organization/doctor-management/documents/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover documento",
        description: "Ocorreu um erro ao remover o documento. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao remover documento:", error);
    }
  });

  // Funções manipuladoras
  const handleAddDocument = (values: z.infer<typeof documentFormSchema>) => {
    if (!selectedFile) {
      toast({
        title: "Arquivo não selecionado",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }
    
    addDocumentMutation.mutate({ ...values, file: selectedFile });
  };

  const handleUpdateDocument = (values: z.infer<typeof documentFormSchema>) => {
    if (!selectedDocument) return;
    
    const updateData = { 
      ...values, 
      id: selectedDocument.id,
      file: selectedFile || undefined
    };
    
    updateDocumentMutation.mutate(updateData);
  };

  const handleDeleteDocument = () => {
    if (!selectedDocument) return;
    deleteDocumentMutation.mutate(selectedDocument.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Formatação de tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtragem de documentos
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    
    let filtered = [...documents];
    
    // Filtrar por categoria
    if (categoryFilter) {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }
    
    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [documents, searchQuery, categoryFilter]);

  // Classificar documentos por categoria
  const documentsByCategory = React.useMemo(() => {
    const grouped: Record<string, MedicalDocument[]> = {
      research: [],
      guidelines: [],
      protocols: [],
      educational: [],
      form: [],
      other: [],
    };
    
    if (filteredDocuments) {
      filteredDocuments.forEach(doc => {
        grouped[doc.category].push(doc);
      });
    }
    
    return grouped;
  }, [filteredDocuments]);

  if (isLoadingDocuments || isLoadingSpecialtyGroups) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/organization/doctor-management")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Documentos Educacionais</h1>
            <p className="text-muted-foreground">
              Gestão de documentos compartilhados com médicos
            </p>
          </div>
        </div>
        
        <Button onClick={() => {
          setSelectedDocument(null);
          setIsAddDocumentDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Documento
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou descrição"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              <SelectItem value="research">Pesquisa</SelectItem>
              <SelectItem value="guidelines">Diretrizes</SelectItem>
              <SelectItem value="protocols">Protocolos</SelectItem>
              <SelectItem value="educational">Educacional</SelectItem>
              <SelectItem value="form">Formulários</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setCategoryFilter(null);
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            <FileText className="h-4 w-4 mr-2" />
            Todos os Documentos
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Filter className="h-4 w-4 mr-2" />
            Por Categoria
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Lista de todos os documentos educacionais disponíveis para os médicos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Visibilidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Acessos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {document.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {document.category === 'research' ? 'Pesquisa' :
                           document.category === 'guidelines' ? 'Diretrizes' :
                           document.category === 'protocols' ? 'Protocolos' :
                           document.category === 'educational' ? 'Educacional' :
                           document.category === 'form' ? 'Formulário' : 'Outro'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatFileSize(document.fileSize)}
                      </TableCell>
                      <TableCell>
                        {document.visibility === 'all' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <Users className="h-3 w-3 mr-1" />
                            Todos
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            <Users className="h-3 w-3 mr-1" />
                            Selecionados
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(document.updatedAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {document.accessCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocument(document);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.open(document.fileUrl, '_blank');
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocument(document);
                              setIsEditDialogOpen(true);
                            }}>
                              <PencilLine className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedDocument(document);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {searchQuery || categoryFilter ? (
                          <div>
                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p>Nenhum documento encontrado com os filtros aplicados</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSearchQuery("");
                                setCategoryFilter(null);
                              }}
                              className="mt-2"
                            >
                              Limpar filtros
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p>Não há documentos educacionais cadastrados</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSelectedDocument(null);
                                setIsAddDocumentDialogOpen(true);
                              }}
                              className="mt-2"
                            >
                              Adicionar um documento
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredDocuments.length} de {documents?.length || 0} documentos
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          {(Object.keys(documentsByCategory) as Array<keyof typeof documentsByCategory>).map((category) => {
            const docs = documentsByCategory[category];
            if (docs.length === 0) return null;
            
            return (
              <Card key={category} className="overflow-hidden">
                <CardHeader className={`
                  ${category === 'research' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${category === 'guidelines' ? 'bg-green-50 dark:bg-green-900/20' : ''}
                  ${category === 'protocols' ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                  ${category === 'educational' ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                  ${category === 'form' ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''}
                  ${category === 'other' ? 'bg-gray-50 dark:bg-gray-900/20' : ''}
                `}>
                  <CardTitle>
                    {category === 'research' ? 'Pesquisa' :
                     category === 'guidelines' ? 'Diretrizes' :
                     category === 'protocols' ? 'Protocolos' :
                     category === 'educational' ? 'Educacional' :
                     category === 'form' ? 'Formulários' : 'Outros'}
                  </CardTitle>
                  <CardDescription>
                    {docs.length} {docs.length === 1 ? 'documento' : 'documentos'} nesta categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {docs.map((document) => (
                      <div key={document.id} className="flex border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className={`
                          rounded-full p-3 mr-4 self-start
                          ${category === 'research' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                          ${category === 'guidelines' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                          ${category === 'protocols' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
                          ${category === 'educational' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                          ${category === 'form' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                          ${category === 'other' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' : ''}
                        `}>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-1">{document.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {document.description}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span className="mx-2">•</span>
                            <span>Atualizado em {format(new Date(document.updatedAt), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                window.open(document.fileUrl, '_blank');
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {Object.values(documentsByCategory).every(docs => docs.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Não há documentos educacionais cadastrados</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedDocument(null);
                    setIsAddDocumentDialogOpen(true);
                  }}
                  className="mt-2"
                >
                  Adicionar um documento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar um novo documento */}
      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
            <DialogDescription>
              Preencha as informações e faça o upload do documento educacional.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddDocument)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do conteúdo" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="research">Pesquisa</SelectItem>
                        <SelectItem value="guidelines">Diretrizes</SelectItem>
                        <SelectItem value="protocols">Protocolos</SelectItem>
                        <SelectItem value="educational">Educacional</SelectItem>
                        <SelectItem value="form">Formulários</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
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
                    <FormLabel>Visibilidade</FormLabel>
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
                        <SelectItem value="selected">Médicos selecionados</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('visibility') === 'selected' && (
                <FormField
                  control={form.control}
                  name="targetGroupIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupos de Médicos</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {specialtyGroups?.map((group: any) => (
                          <Label 
                            key={group.id} 
                            className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={field.value?.includes(group.id.toString())}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const groupId = group.id.toString();
                                
                                if (checked) {
                                  field.onChange([...field.value || [], groupId]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(id => id !== groupId) || []
                                  );
                                }
                              }}
                            />
                            <span>{group.name}</span>
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Arquivo</Label>
                <div className="border rounded-md p-4">
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                      <p><strong>Arquivo selecionado:</strong> {selectedFile.name}</p>
                      <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
                      <p><strong>Tipo:</strong> {selectedFile.type}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDocumentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={addDocumentMutation.isPending || !selectedFile}
                >
                  {addDocumentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Documento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar documento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Atualize as informações e o arquivo se necessário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateDocument)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do conteúdo" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="research">Pesquisa</SelectItem>
                        <SelectItem value="guidelines">Diretrizes</SelectItem>
                        <SelectItem value="protocols">Protocolos</SelectItem>
                        <SelectItem value="educational">Educacional</SelectItem>
                        <SelectItem value="form">Formulários</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
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
                    <FormLabel>Visibilidade</FormLabel>
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
                        <SelectItem value="selected">Médicos selecionados</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('visibility') === 'selected' && (
                <FormField
                  control={form.control}
                  name="targetGroupIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupos de Médicos</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {specialtyGroups?.map((group: any) => (
                          <Label 
                            key={group.id} 
                            className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={field.value?.includes(group.id.toString())}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const groupId = group.id.toString();
                                
                                if (checked) {
                                  field.onChange([...field.value || [], groupId]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(id => id !== groupId) || []
                                  );
                                }
                              }}
                            />
                            <span>{group.name}</span>
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Arquivo (opcional)</Label>
                <div className="border rounded-md p-4">
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png"
                  />
                  {selectedFile ? (
                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                      <p><strong>Novo arquivo:</strong> {selectedFile.name}</p>
                      <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
                      <p><strong>Tipo:</strong> {selectedFile.type}</p>
                    </div>
                  ) : selectedDocument && (
                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                      <p><strong>Arquivo atual:</strong> {selectedDocument.fileUrl.split('/').pop()}</p>
                      <p><strong>Tamanho:</strong> {formatFileSize(selectedDocument.fileSize)}</p>
                      <p><strong>Tipo:</strong> {selectedDocument.fileType}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Deixe em branco para manter o arquivo atual
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateDocumentMutation.isPending}
                >
                  {updateDocumentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes do documento */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento</DialogTitle>
            <DialogDescription>
              Informações completas sobre o documento educacional.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`
                  rounded-full p-5
                  ${selectedDocument.category === 'research' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                  ${selectedDocument.category === 'guidelines' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                  ${selectedDocument.category === 'protocols' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
                  ${selectedDocument.category === 'educational' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                  ${selectedDocument.category === 'form' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                  ${selectedDocument.category === 'other' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' : ''}
                `}>
                  <FileText className="h-8 w-8" />
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">{selectedDocument.title}</h2>
                <Badge variant="outline" className="capitalize">
                  {selectedDocument.category === 'research' ? 'Pesquisa' :
                   selectedDocument.category === 'guidelines' ? 'Diretrizes' :
                   selectedDocument.category === 'protocols' ? 'Protocolos' :
                   selectedDocument.category === 'educational' ? 'Educacional' :
                   selectedDocument.category === 'form' ? 'Formulário' : 'Outro'}
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedDocument.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Tamanho</p>
                    <p>{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Tipo de Arquivo</p>
                    <p>{selectedDocument.fileType}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Data de Criação</p>
                    <p>{format(new Date(selectedDocument.createdAt), 'PPP', { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Última Atualização</p>
                    <p>{format(new Date(selectedDocument.updatedAt), 'PPP', { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Criado por</p>
                    <p>{selectedDocument.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Acessos</p>
                    <p>{selectedDocument.accessCount} visualizações</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="font-medium text-muted-foreground mb-2">Visibilidade</p>
                  <div className="flex items-center">
                    {selectedDocument.visibility === 'all' ? (
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        <Users className="h-3 w-3 mr-1" />
                        Todos os médicos
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        <Users className="h-3 w-3 mr-1" />
                        Médicos selecionados
                      </Badge>
                    )}
                  </div>
                  
                  {selectedDocument.visibility === 'selected' && selectedDocument.targetGroups && selectedDocument.targetGroups.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Grupos direcionados:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDocument.targetGroups.map(group => (
                          <Badge key={group.id} variant="outline" className="text-xs">
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    window.open(selectedDocument.fileUrl, '_blank');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <PencilLine className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Documento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este documento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-4 p-3 border rounded-md bg-muted/20">
                <div className={`
                  rounded-full p-2
                  ${selectedDocument.category === 'research' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                  ${selectedDocument.category === 'guidelines' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                  ${selectedDocument.category === 'protocols' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
                  ${selectedDocument.category === 'educational' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                  ${selectedDocument.category === 'form' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                  ${selectedDocument.category === 'other' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' : ''}
                `}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{selectedDocument.title}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedDocument.category === 'research' ? 'Pesquisa' :
                       selectedDocument.category === 'guidelines' ? 'Diretrizes' :
                       selectedDocument.category === 'protocols' ? 'Protocolos' :
                       selectedDocument.category === 'educational' ? 'Educacional' :
                       selectedDocument.category === 'form' ? 'Formulário' : 'Outro'}
                    </Badge>
                    <span>{formatFileSize(selectedDocument.fileSize)}</span>
                  </div>
                </div>
              </div>
              
              {selectedDocument.accessCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-3 rounded-md mb-4 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Este documento foi acessado {selectedDocument.accessCount} {selectedDocument.accessCount === 1 ? 'vez' : 'vezes'} por médicos.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Documento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DocumentsPageWrapper() {
  return (
    <OrganizationLayout>
      <DoctorDocumentsPage />
    </OrganizationLayout>
  );
}