import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Award, Users, BarChart, PlusCircle, Trash2, Edit, Search, FileUp, Download, Calendar, Filter } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Componente para gerenciar documentos de transparência
const GerenciarDocumentos = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [visibilidadeSelecionada, setVisibilidadeSelecionada] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [dialogoAdicionar, setDialogoAdicionar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [documentoAtual, setDocumentoAtual] = useState<any>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    visibilidade: 'publico',
    dataDocumento: new Date(),
    arquivo: null as File | null
  });

  // Buscar documentos
  const { data: documentos, isLoading, error } = useQuery({
    queryKey: ['/api/transparencia/documentos', categoriaSelecionada, visibilidadeSelecionada, termoBusca],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (categoriaSelecionada) params.categoria = categoriaSelecionada;
      if (visibilidadeSelecionada) params.visibilidade = visibilidadeSelecionada;
      if (termoBusca) params.search = termoBusca;
      
      const response = await axios.get('/api/transparencia/documentos', { params });
      return response.data;
    }
  });

  // Mutation para adicionar documento
  const adicionarDocumento = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('/api/transparencia/documentos', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Documento adicionado",
        description: "O documento foi adicionado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/documentos'] });
      setDialogoAdicionar(false);
      resetarFormulario();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar documento",
        description: error.response?.data?.message || "Ocorreu um erro ao adicionar o documento.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar documento
  const atualizarDocumento = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/transparencia/documentos/${documentoAtual?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Documento atualizado",
        description: "O documento foi atualizado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/documentos'] });
      setDialogoEditar(false);
      setDocumentoAtual(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar documento",
        description: error.response?.data?.message || "Ocorreu um erro ao atualizar o documento.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir documento
  const excluirDocumento = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/transparencia/documentos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/documentos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir documento",
        description: error.response?.data?.message || "Ocorreu um erro ao excluir o documento.",
        variant: "destructive"
      });
    }
  });

  const resetarFormulario = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: '',
      visibilidade: 'publico',
      dataDocumento: new Date(),
      arquivo: null
    });
  };

  const handleSubmitAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.categoria || !formData.arquivo) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios e selecione um arquivo.",
        variant: "destructive"
      });
      return;
    }
    
    const formSubmitData = new FormData();
    formSubmitData.append('titulo', formData.titulo);
    formSubmitData.append('categoria', formData.categoria);
    formSubmitData.append('visibilidade', formData.visibilidade);
    formSubmitData.append('dataDocumento', formData.dataDocumento.toISOString());
    formSubmitData.append('organizacaoId', '1'); // Será substituído pelo ID real da organização no servidor
    if (formData.descricao) formSubmitData.append('descricao', formData.descricao);
    if (formData.arquivo) formSubmitData.append('arquivo', formData.arquivo);
    
    adicionarDocumento.mutate(formSubmitData);
  };

  const handleSubmitEditar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentoAtual || !formData.titulo || !formData.categoria) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const updateData = {
      titulo: formData.titulo,
      categoria: formData.categoria,
      visibilidade: formData.visibilidade,
      dataDocumento: formData.dataDocumento.toISOString(),
      descricao: formData.descricao || null
    };
    
    atualizarDocumento.mutate(updateData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        arquivo: e.target.files![0]
      }));
    }
  };

  const handleEditarDocumento = (documento: any) => {
    setDocumentoAtual(documento);
    setFormData({
      titulo: documento.titulo,
      descricao: documento.descricao || '',
      categoria: documento.categoria,
      visibilidade: documento.visibilidade,
      dataDocumento: new Date(documento.dataDocumento),
      arquivo: null
    });
    setDialogoEditar(true);
  };

  const categorias = [
    { value: 'todas-categorias', label: 'Todas as categorias' },
    { value: 'estatuto', label: 'Estatuto' },
    { value: 'ata_assembleia', label: 'Ata de Assembleia' },
    { value: 'regimento_interno', label: 'Regimento Interno' },
    { value: 'balanco_financeiro', label: 'Balanço Financeiro' },
    { value: 'relatorio_atividades', label: 'Relatório de Atividades' },
    { value: 'prestacao_contas', label: 'Prestação de Contas' },
    { value: 'certificacao', label: 'Certificação' },
    { value: 'declaracao_utilidade_publica', label: 'Declaração de Utilidade Pública' },
    { value: 'outros', label: 'Outros' }
  ];

  const visibilidades = [
    { value: 'todas-visibilidades', label: 'Todas as visibilidades' },
    { value: 'publico', label: 'Público' },
    { value: 'privado', label: 'Privado' }
  ];

  const getCategoriaLabel = (codigo: string) => {
    const categoria = categorias.find(cat => cat.value === codigo);
    return categoria ? categoria.label : codigo;
  };

  const getVisibilidadeLabel = (codigo: string) => {
    const visibilidade = visibilidades.find(vis => vis.value === codigo);
    return visibilidade ? visibilidade.label : codigo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos de Transparência</h1>
          <p className="text-muted-foreground">
            Gerencie os documentos exibidos no portal de transparência da sua associação.
          </p>
        </div>
        <Dialog open={dialogoAdicionar} onOpenChange={setDialogoAdicionar}>
          <DialogTrigger asChild>
            <Button className="flex gap-1 items-center">
              <PlusCircle className="h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Documento</DialogTitle>
              <DialogDescription>
                Preencha os dados do documento para publicação no portal de transparência.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdicionar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título <span className="text-red-500">*</span></Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Estatuto Social"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do documento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.filter(cat => cat.value).map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="visibilidade">Visibilidade <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.visibilidade} 
                    onValueChange={(value) => setFormData({ ...formData, visibilidade: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a visibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público - Visível no portal</SelectItem>
                      <SelectItem value="privado">Privado - Somente interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Data do Documento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.dataDocumento
                          ? format(formData.dataDocumento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.dataDocumento}
                        onSelect={(date) => setFormData({ ...formData, dataDocumento: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arquivo">Arquivo <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="arquivo"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('arquivo')?.click()}
                      className="flex-1"
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      {formData.arquivo ? formData.arquivo.name : "Selecionar arquivo"}
                    </Button>
                    {formData.arquivo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData({ ...formData, arquivo: null })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: PDF, DOCX, XLSX, PNG, JPG. Tamanho máximo: 10MB.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetarFormulario();
                    setDialogoAdicionar(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={adicionarDocumento.isPending}>
                  {adicionarDocumento.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de edição */}
        <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Documento</DialogTitle>
              <DialogDescription>
                Atualize as informações do documento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEditar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo-edit">Título <span className="text-red-500">*</span></Label>
                  <Input
                    id="titulo-edit"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Estatuto Social"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao-edit">Descrição</Label>
                  <Textarea
                    id="descricao-edit"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do documento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria-edit">Categoria <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.filter(cat => cat.value).map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="visibilidade-edit">Visibilidade <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.visibilidade} 
                    onValueChange={(value) => setFormData({ ...formData, visibilidade: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a visibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público - Visível no portal</SelectItem>
                      <SelectItem value="privado">Privado - Somente interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Data do Documento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.dataDocumento
                          ? format(formData.dataDocumento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.dataDocumento}
                        onSelect={(date) => setFormData({ ...formData, dataDocumento: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p className="font-medium">Arquivo atual:</p>
                  <div className="flex items-center mt-1">
                    <FileText className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{documentoAtual?.arquivoUrl?.split('/').pop() || 'Arquivo não disponível'}</span>
                  </div>
                  <p className="mt-2">
                    Para alterar o arquivo, exclua este documento e faça upload de um novo.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogoEditar(false);
                    setDocumentoAtual(null);
                    resetarFormulario();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={atualizarDocumento.isPending}>
                  {atualizarDocumento.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Liste e gerencie os documentos disponíveis no portal de transparência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={categoriaSelecionada}
                onValueChange={setCategoriaSelecionada}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={visibilidadeSelecionada}
                onValueChange={setVisibilidadeSelecionada}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Visibilidade" />
                </SelectTrigger>
                <SelectContent>
                  {visibilidades.map((visibilidade) => (
                    <SelectItem key={visibilidade.value} value={visibilidade.value}>
                      {visibilidade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
              Erro ao carregar documentos. Por favor, tente novamente mais tarde.
            </div>
          ) : documentos?.data && documentos.data.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibilidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {documentos?.data ? documentos.data.map((documento: any) => (
                    <tr key={documento.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{documento.titulo}</div>
                        {documento.descricao && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">{documento.descricao}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className="bg-gray-100 text-gray-800">
                          {getCategoriaLabel(documento.categoria)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(documento.dataDocumento), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={
                          documento.visibilidade === 'publico' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {getVisibilidadeLabel(documento.visibilidade)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(documento.arquivoUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarDocumento(documento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este documento?')) {
                                excluirDocumento.mutate(documento.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))) : null}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento encontrado</h3>
              <p className="text-gray-500 mb-4">
                {categoriaSelecionada || visibilidadeSelecionada || termoBusca
                  ? "Nenhum documento corresponde aos filtros selecionados."
                  : "Comece adicionando um novo documento."}
              </p>
              <Button 
                onClick={() => {
                  setCategoriaSelecionada('');
                  setVisibilidadeSelecionada('');
                  setTermoBusca('');
                }}
                variant="outline"
                className="mx-auto"
                disabled={!categoriaSelecionada && !visibilidadeSelecionada && !termoBusca}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para gerenciar certificações
const GerenciarCertificacoes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificações</h1>
          <p className="text-muted-foreground">
            Gerencie as certificações exibidas no portal de transparência da sua associação.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementação Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            <p>A interface para gerenciamento de certificações está em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para gerenciar membros
const GerenciarMembros = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membros e Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros exibidos no portal de transparência da sua associação.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementação Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            <p>A interface para gerenciamento de membros está em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para gerenciar relatórios financeiros
const GerenciarFinanceiros = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Gerencie os relatórios financeiros exibidos no portal de transparência da sua associação.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementação Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            <p>A interface para gerenciamento de relatórios financeiros está em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal de gerenciamento de transparência
const GerenciarTransparencia = () => {
  return (
    <OrganizationLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal de Transparência</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as informações exibidas no portal público de transparência.
          </p>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 max-w-3xl">
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="certificacoes" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificações
            </TabsTrigger>
            <TabsTrigger value="membros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="financeiros" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Relatórios Financeiros
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentos">
            <GerenciarDocumentos />
          </TabsContent>
          
          <TabsContent value="certificacoes">
            <GerenciarCertificacoes />
          </TabsContent>
          
          <TabsContent value="membros">
            <GerenciarMembros />
          </TabsContent>
          
          <TabsContent value="financeiros">
            <GerenciarFinanceiros />
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default GerenciarTransparencia;