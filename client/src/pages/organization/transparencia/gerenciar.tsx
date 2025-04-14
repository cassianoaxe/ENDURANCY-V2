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
          ) : documentos && Array.isArray(documentos) && documentos.length > 0 ? (
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
                  {documentos && Array.isArray(documentos) ? documentos.map((documento: any) => (
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
                  )) : null}
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [visibilidadeSelecionada, setVisibilidadeSelecionada] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [dialogoAdicionar, setDialogoAdicionar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [certificacaoAtual, setCertificacaoAtual] = useState<any>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    emissor: '',
    dataEmissao: new Date(),
    dataValidade: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    visibilidade: 'publico',
    arquivo: null as File | null
  });

  // Buscar certificações
  const { data: certificacoes, isLoading, error } = useQuery({
    queryKey: ['/api/transparencia/certificacoes', tipoSelecionado, visibilidadeSelecionada, termoBusca],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (tipoSelecionado) params.tipo = tipoSelecionado;
      if (visibilidadeSelecionada) params.visibilidade = visibilidadeSelecionada;
      if (termoBusca) params.search = termoBusca;
      
      const response = await axios.get('/api/transparencia/certificacoes', { params });
      return response.data;
    }
  });

  // Mutation para adicionar certificação
  const adicionarCertificacao = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('/api/transparencia/certificacoes', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Certificação adicionada",
        description: "A certificação foi adicionada com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/certificacoes'] });
      setDialogoAdicionar(false);
      resetarFormulario();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar certificação",
        description: error.response?.data?.message || "Ocorreu um erro ao adicionar a certificação.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar certificação
  const atualizarCertificacao = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/transparencia/certificacoes/${certificacaoAtual?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Certificação atualizada",
        description: "A certificação foi atualizada com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/certificacoes'] });
      setDialogoEditar(false);
      setCertificacaoAtual(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar certificação",
        description: error.response?.data?.message || "Ocorreu um erro ao atualizar a certificação.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir certificação
  const excluirCertificacao = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/transparencia/certificacoes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Certificação excluída",
        description: "A certificação foi excluída com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/certificacoes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir certificação",
        description: error.response?.data?.message || "Ocorreu um erro ao excluir a certificação.",
        variant: "destructive"
      });
    }
  });

  const resetarFormulario = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: '',
      emissor: '',
      dataEmissao: new Date(),
      dataValidade: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      visibilidade: 'publico',
      arquivo: null
    });
  };

  const handleSubmitAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo || !formData.emissor || !formData.arquivo) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios e selecione um arquivo.",
        variant: "destructive"
      });
      return;
    }
    
    const formSubmitData = new FormData();
    formSubmitData.append('nome', formData.nome);
    formSubmitData.append('tipo', formData.tipo);
    formSubmitData.append('emissor', formData.emissor);
    formSubmitData.append('visibilidade', formData.visibilidade);
    formSubmitData.append('dataEmissao', formData.dataEmissao.toISOString());
    formSubmitData.append('dataValidade', formData.dataValidade.toISOString());
    formSubmitData.append('organizacaoId', '1'); // Será substituído pelo ID real da organização no servidor
    if (formData.descricao) formSubmitData.append('descricao', formData.descricao);
    if (formData.arquivo) formSubmitData.append('arquivo', formData.arquivo);
    
    adicionarCertificacao.mutate(formSubmitData);
  };

  const handleSubmitEditar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificacaoAtual || !formData.nome || !formData.tipo || !formData.emissor) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const updateData = {
      nome: formData.nome,
      tipo: formData.tipo,
      emissor: formData.emissor,
      visibilidade: formData.visibilidade,
      dataEmissao: formData.dataEmissao.toISOString(),
      dataValidade: formData.dataValidade.toISOString(),
      descricao: formData.descricao || null
    };
    
    atualizarCertificacao.mutate(updateData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        arquivo: e.target.files![0]
      }));
    }
  };

  const handleEditarCertificacao = (certificacao: any) => {
    setCertificacaoAtual(certificacao);
    setFormData({
      nome: certificacao.nome,
      descricao: certificacao.descricao || '',
      tipo: certificacao.tipo,
      emissor: certificacao.emissor,
      visibilidade: certificacao.visibilidade,
      dataEmissao: new Date(certificacao.dataEmissao),
      dataValidade: new Date(certificacao.dataValidade),
      arquivo: null
    });
    setDialogoEditar(true);
  };

  const tipos = [
    { value: 'todos-tipos', label: 'Todos os tipos' },
    { value: 'utilidade_publica_municipal', label: 'Utilidade Pública Municipal' },
    { value: 'utilidade_publica_estadual', label: 'Utilidade Pública Estadual' },
    { value: 'utilidade_publica_federal', label: 'Utilidade Pública Federal' },
    { value: 'cebas', label: 'CEBAS' },
    { value: 'iso', label: 'ISO' },
    { value: 'oscip', label: 'OSCIP' },
    { value: 'organizacao_social', label: 'Organização Social' },
    { value: 'outros', label: 'Outros' }
  ];

  const visibilidades = [
    { value: 'todas-visibilidades', label: 'Todas as visibilidades' },
    { value: 'publico', label: 'Público' },
    { value: 'privado', label: 'Privado' }
  ];

  const getTipoLabel = (codigo: string) => {
    const tipo = tipos.find(t => t.value === codigo);
    return tipo ? tipo.label : codigo;
  };

  const getVisibilidadeLabel = (codigo: string) => {
    const visibilidade = visibilidades.find(vis => vis.value === codigo);
    return visibilidade ? visibilidade.label : codigo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificações</h1>
          <p className="text-muted-foreground">
            Gerencie as certificações exibidas no portal de transparência da sua associação.
          </p>
        </div>
        <Dialog open={dialogoAdicionar} onOpenChange={setDialogoAdicionar}>
          <DialogTrigger asChild>
            <Button className="flex gap-1 items-center">
              <PlusCircle className="h-4 w-4" />
              Adicionar Certificação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Certificação</DialogTitle>
              <DialogDescription>
                Preencha os dados da certificação para publicação no portal de transparência.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdicionar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Certificação <span className="text-red-500">*</span></Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Certificado de Utilidade Pública"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada da certificação"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emissor">Órgão Emissor <span className="text-red-500">*</span></Label>
                  <Input
                    id="emissor"
                    value={formData.emissor}
                    onChange={(e) => setFormData({ ...formData, emissor: e.target.value })}
                    placeholder="Ex: Prefeitura Municipal"
                    required
                  />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Emissão</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.dataEmissao
                            ? format(formData.dataEmissao, "dd/MM/yyyy")
                            : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.dataEmissao}
                          onSelect={(date) => setFormData({ ...formData, dataEmissao: date || new Date() })}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Validade</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.dataValidade
                            ? format(formData.dataValidade, "dd/MM/yyyy")
                            : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.dataValidade}
                          onSelect={(date) => setFormData({ ...formData, dataValidade: date || new Date() })}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
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
                <Button type="submit" disabled={adicionarCertificacao.isPending}>
                  {adicionarCertificacao.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de edição */}
        <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Certificação</DialogTitle>
              <DialogDescription>
                Atualize os dados da certificação.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEditar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome-edit">Nome da Certificação <span className="text-red-500">*</span></Label>
                  <Input
                    id="nome-edit"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao-edit">Descrição</Label>
                  <Textarea
                    id="descricao-edit"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo-edit">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emissor-edit">Órgão Emissor <span className="text-red-500">*</span></Label>
                  <Input
                    id="emissor-edit"
                    value={formData.emissor}
                    onChange={(e) => setFormData({ ...formData, emissor: e.target.value })}
                    required
                  />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Emissão</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.dataEmissao
                            ? format(formData.dataEmissao, "dd/MM/yyyy")
                            : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.dataEmissao}
                          onSelect={(date) => setFormData({ ...formData, dataEmissao: date || new Date() })}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Validade</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.dataValidade
                            ? format(formData.dataValidade, "dd/MM/yyyy")
                            : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.dataValidade}
                          onSelect={(date) => setFormData({ ...formData, dataValidade: date || new Date() })}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCertificacaoAtual(null);
                    setDialogoEditar(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={atualizarCertificacao.isPending}>
                  {atualizarCertificacao.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Certificações</CardTitle>
          <CardDescription>Gerencie as certificações da sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Buscar certificações..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="max-w-sm"
              />
              <Select 
                value={tipoSelecionado} 
                onValueChange={setTipoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={visibilidadeSelecionada} 
                onValueChange={setVisibilidadeSelecionada}
              >
                <SelectTrigger className="max-w-xs">
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
              <Button
                variant="outline"
                className="flex gap-1 items-center shrink-0"
                onClick={() => {
                  setTermoBusca('');
                  setTipoSelecionado('');
                  setVisibilidadeSelecionada('');
                }}
                disabled={!termoBusca && !tipoSelecionado && !visibilidadeSelecionada}
              >
                <Filter className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 rounded-full border-t-transparent"></div>
              </div>
            ) : certificacoes && Array.isArray(certificacoes) && certificacoes.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Emissor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibilidade
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificacoes && Array.isArray(certificacoes) ? certificacoes.map((certificacao: any) => (
                      <tr key={certificacao.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{certificacao.nome}</div>
                          {certificacao.descricao && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">{certificacao.descricao}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className="bg-gray-100 text-gray-800">
                            {getTipoLabel(certificacao.tipo)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {certificacao.emissor}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(certificacao.dataValidade), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={
                            certificacao.visibilidade === 'publico' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }>
                            {getVisibilidadeLabel(certificacao.visibilidade)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarCertificacao(certificacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir esta certificação?')) {
                                  excluirCertificacao.mutate(certificacao.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma certificação encontrada</h3>
                <p className="text-gray-500 mb-4">
                  {tipoSelecionado || visibilidadeSelecionada || termoBusca
                    ? "Nenhuma certificação corresponde aos filtros selecionados."
                    : "Comece adicionando uma nova certificação."}
                </p>
                <Button 
                  onClick={() => {
                    setTipoSelecionado('');
                    setVisibilidadeSelecionada('');
                    setTermoBusca('');
                  }}
                  variant="outline"
                  className="mx-auto"
                  disabled={!tipoSelecionado && !visibilidadeSelecionada && !termoBusca}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para gerenciar membros
const GerenciarMembros = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [dialogoAdicionar, setDialogoAdicionar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [membroAtual, setMembroAtual] = useState<any>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    tipo: 'diretoria',
    biografia: '',
    email: '',
    linkedin: '',
    visibilidade: 'publico',
    foto: null as File | null
  });

  // Buscar membros
  const { data: membros, isLoading, error } = useQuery({
    queryKey: ['/api/transparencia/membros', cargoSelecionado, tipoSelecionado, termoBusca],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (cargoSelecionado) params.cargo = cargoSelecionado;
      if (tipoSelecionado) params.tipo = tipoSelecionado;
      if (termoBusca) params.search = termoBusca;
      
      const response = await axios.get('/api/transparencia/membros', { params });
      return response.data;
    }
  });

  // Mutation para adicionar membro
  const adicionarMembro = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('/api/transparencia/membros', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/membros'] });
      setDialogoAdicionar(false);
      resetarFormulario();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.response?.data?.message || "Ocorreu um erro ao adicionar o membro.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar membro
  const atualizarMembro = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/transparencia/membros/${membroAtual?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Membro atualizado",
        description: "O membro foi atualizado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/membros'] });
      setDialogoEditar(false);
      setMembroAtual(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar membro",
        description: error.response?.data?.message || "Ocorreu um erro ao atualizar o membro.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir membro
  const excluirMembro = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/transparencia/membros/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Membro excluído",
        description: "O membro foi excluído com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/membros'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir membro",
        description: error.response?.data?.message || "Ocorreu um erro ao excluir o membro.",
        variant: "destructive"
      });
    }
  });

  const resetarFormulario = () => {
    setFormData({
      nome: '',
      cargo: '',
      tipo: 'diretoria',
      biografia: '',
      email: '',
      linkedin: '',
      visibilidade: 'publico',
      foto: null
    });
  };

  const handleSubmitAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cargo || !formData.tipo) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const formSubmitData = new FormData();
    formSubmitData.append('nome', formData.nome);
    formSubmitData.append('cargo', formData.cargo);
    formSubmitData.append('tipo', formData.tipo);
    formSubmitData.append('visibilidade', formData.visibilidade);
    formSubmitData.append('organizacaoId', '1'); // Será substituído pelo ID real da organização no servidor
    if (formData.biografia) formSubmitData.append('biografia', formData.biografia);
    if (formData.email) formSubmitData.append('email', formData.email);
    if (formData.linkedin) formSubmitData.append('linkedin', formData.linkedin);
    if (formData.foto) formSubmitData.append('foto', formData.foto);
    
    adicionarMembro.mutate(formSubmitData);
  };

  const handleSubmitEditar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!membroAtual || !formData.nome || !formData.cargo || !formData.tipo) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const updateData = {
      nome: formData.nome,
      cargo: formData.cargo,
      tipo: formData.tipo,
      biografia: formData.biografia || null,
      email: formData.email || null,
      linkedin: formData.linkedin || null,
      visibilidade: formData.visibilidade
    };
    
    atualizarMembro.mutate(updateData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        foto: e.target.files![0]
      }));
    }
  };

  const handleEditarMembro = (membro: any) => {
    setMembroAtual(membro);
    setFormData({
      nome: membro.nome,
      cargo: membro.cargo,
      tipo: membro.tipo,
      biografia: membro.biografia || '',
      email: membro.email || '',
      linkedin: membro.linkedin || '',
      visibilidade: membro.visibilidade,
      foto: null
    });
    setDialogoEditar(true);
  };

  const cargos = [
    { value: 'todos-cargos', label: 'Todos os cargos' },
    { value: 'presidente', label: 'Presidente' },
    { value: 'vice_presidente', label: 'Vice-Presidente' },
    { value: 'diretor_executivo', label: 'Diretor Executivo' },
    { value: 'diretor_financeiro', label: 'Diretor Financeiro' },
    { value: 'diretor_operacional', label: 'Diretor Operacional' },
    { value: 'secretario', label: 'Secretário' },
    { value: 'tesoureiro', label: 'Tesoureiro' },
    { value: 'conselheiro', label: 'Conselheiro' },
    { value: 'coordenador', label: 'Coordenador' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'colaborador', label: 'Colaborador' },
    { value: 'voluntario', label: 'Voluntário' }
  ];

  const tipos = [
    { value: 'todos-tipos', label: 'Todos os tipos' },
    { value: 'diretoria', label: 'Diretoria' },
    { value: 'conselho', label: 'Conselho' },
    { value: 'equipe', label: 'Equipe Técnica' },
    { value: 'voluntarios', label: 'Voluntários' }
  ];

  const getCargoLabel = (codigo: string) => {
    const cargo = cargos.find(c => c.value === codigo);
    return cargo ? cargo.label : codigo;
  };

  const getTipoLabel = (codigo: string) => {
    const tipo = tipos.find(t => t.value === codigo);
    return tipo ? tipo.label : codigo;
  };

  const getVisibilidadeLabel = (codigo: string) => {
    return codigo === 'publico' ? 'Público' : 'Privado';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membros e Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros exibidos no portal de transparência da sua associação.
          </p>
        </div>
        <Dialog open={dialogoAdicionar} onOpenChange={setDialogoAdicionar}>
          <DialogTrigger asChild>
            <Button className="flex gap-1 items-center">
              <PlusCircle className="h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha os dados do membro para publicação no portal de transparência.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdicionar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargo">Cargo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.cargo} 
                    onValueChange={(value) => setFormData({ ...formData, cargo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.filter(c => c.value !== 'todos-cargos').map((cargo) => (
                        <SelectItem key={cargo.value} value={cargo.value}>
                          {cargo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biografia">Biografia</Label>
                  <Textarea
                    id="biografia"
                    value={formData.biografia}
                    onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                    placeholder="Breve descrição sobre o membro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: joao@exemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="Ex: https://linkedin.com/in/joaosilva"
                  />
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
                  <Label htmlFor="foto">Foto</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('foto')?.click()}
                      className="flex-1"
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      {formData.foto ? formData.foto.name : "Selecionar foto"}
                    </Button>
                    {formData.foto && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData({ ...formData, foto: null })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 5MB.
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
                <Button type="submit" disabled={adicionarMembro.isPending}>
                  {adicionarMembro.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de edição */}
        <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
              <DialogDescription>
                Atualize os dados do membro.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEditar}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome-edit">Nome Completo <span className="text-red-500">*</span></Label>
                  <Input
                    id="nome-edit"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargo-edit">Cargo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.cargo} 
                    onValueChange={(value) => setFormData({ ...formData, cargo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.filter(c => c.value !== 'todos-cargos').map((cargo) => (
                        <SelectItem key={cargo.value} value={cargo.value}>
                          {cargo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo-edit">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biografia-edit">Biografia</Label>
                  <Textarea
                    id="biografia-edit"
                    value={formData.biografia}
                    onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email-edit">Email</Label>
                  <Input
                    id="email-edit"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin-edit">LinkedIn</Label>
                  <Input
                    id="linkedin-edit"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
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
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMembroAtual(null);
                    setDialogoEditar(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={atualizarMembro.isPending}>
                  {atualizarMembro.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>Gerencie os membros e equipe da sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Buscar membros..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="max-w-sm"
              />
              <Select 
                value={tipoSelecionado} 
                onValueChange={setTipoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={cargoSelecionado} 
                onValueChange={setCargoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos.map((cargo) => (
                    <SelectItem key={cargo.value} value={cargo.value}>
                      {cargo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="flex gap-1 items-center shrink-0"
                onClick={() => {
                  setTermoBusca('');
                  setTipoSelecionado('');
                  setCargoSelecionado('');
                }}
                disabled={!termoBusca && !tipoSelecionado && !cargoSelecionado}
              >
                <Filter className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 rounded-full border-t-transparent"></div>
              </div>
            ) : membros && Array.isArray(membros) && membros.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibilidade
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {membros && Array.isArray(membros) ? membros.map((membro: any) => (
                      <tr key={membro.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {membro.fotoUrl ? (
                              <img 
                                src={membro.fotoUrl} 
                                alt={membro.nome} 
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{membro.nome}</div>
                              {membro.biografia && (
                                <div className="text-xs text-gray-500 max-w-xs truncate">{membro.biografia}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className="bg-gray-100 text-gray-800">
                            {getCargoLabel(membro.cargo)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTipoLabel(membro.tipo)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {membro.email && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">Email:</span> {membro.email}
                            </div>
                          )}
                          {membro.linkedin && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-400">LinkedIn</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={
                            membro.visibilidade === 'publico' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }>
                            {getVisibilidadeLabel(membro.visibilidade)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarMembro(membro)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este membro?')) {
                                  excluirMembro.mutate(membro.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum membro encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {tipoSelecionado || cargoSelecionado || termoBusca
                    ? "Nenhum membro corresponde aos filtros selecionados."
                    : "Comece adicionando um novo membro."}
                </p>
                <Button 
                  onClick={() => {
                    setTipoSelecionado('');
                    setCargoSelecionado('');
                    setTermoBusca('');
                  }}
                  variant="outline"
                  className="mx-auto"
                  disabled={!tipoSelecionado && !cargoSelecionado && !termoBusca}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para gerenciar relatórios financeiros
const GerenciarFinanceiros = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [dialogoAdicionar, setDialogoAdicionar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [relatorioAtual, setRelatorioAtual] = useState<any>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    periodo: '',
    ano: new Date().getFullYear().toString(),
    valor: '',
    status: 'publicado',
    arquivo: null as File | null
  });

  // Buscar relatórios financeiros
  const { data: relatorios, isLoading, error } = useQuery({
    queryKey: ['/api/transparencia/financeiro', tipoSelecionado, periodoSelecionado, anoSelecionado],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (tipoSelecionado) params.tipo = tipoSelecionado;
      if (periodoSelecionado) params.periodo = periodoSelecionado;
      if (anoSelecionado) params.ano = anoSelecionado;
      
      const response = await axios.get('/api/transparencia/financeiro', { params });
      return response.data;
    }
  });

  // Mutation para adicionar relatório
  const adicionarRelatorio = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('/api/transparencia/financeiro', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Relatório adicionado",
        description: "O relatório financeiro foi adicionado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/financeiro'] });
      setDialogoAdicionar(false);
      resetarFormulario();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar relatório",
        description: error.response?.data?.message || "Ocorreu um erro ao adicionar o relatório.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar relatório
  const atualizarRelatorio = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/transparencia/financeiro/${relatorioAtual?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Relatório atualizado",
        description: "O relatório financeiro foi atualizado com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/financeiro'] });
      setDialogoEditar(false);
      setRelatorioAtual(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar relatório",
        description: error.response?.data?.message || "Ocorreu um erro ao atualizar o relatório.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir relatório
  const excluirRelatorio = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/transparencia/financeiro/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Relatório excluído",
        description: "O relatório financeiro foi excluído com sucesso.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparencia/financeiro'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir relatório",
        description: error.response?.data?.message || "Ocorreu um erro ao excluir o relatório.",
        variant: "destructive"
      });
    }
  });

  const resetarFormulario = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: '',
      periodo: '',
      ano: new Date().getFullYear().toString(),
      valor: '',
      status: 'publicado',
      arquivo: null
    });
  };

  const handleSubmitAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.tipo || !formData.periodo || !formData.ano || !formData.arquivo) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios e selecione um arquivo.",
        variant: "destructive"
      });
      return;
    }
    
    const formSubmitData = new FormData();
    formSubmitData.append('titulo', formData.titulo);
    formSubmitData.append('tipo', formData.tipo);
    formSubmitData.append('periodo', formData.periodo);
    formSubmitData.append('ano', formData.ano);
    formSubmitData.append('status', formData.status);
    formSubmitData.append('organizacaoId', '1'); // Será substituído pelo ID real da organização no servidor
    if (formData.descricao) formSubmitData.append('descricao', formData.descricao);
    if (formData.valor) formSubmitData.append('valor', formData.valor);
    if (formData.arquivo) formSubmitData.append('arquivo', formData.arquivo);
    
    adicionarRelatorio.mutate(formSubmitData);
  };

  const handleSubmitEditar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!relatorioAtual || !formData.titulo || !formData.tipo || !formData.periodo || !formData.ano) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const updateData = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      periodo: formData.periodo,
      ano: formData.ano,
      valor: formData.valor || null,
      descricao: formData.descricao || null,
      status: formData.status
    };
    
    atualizarRelatorio.mutate(updateData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        arquivo: e.target.files![0]
      }));
    }
  };

  const handleEditarRelatorio = (relatorio: any) => {
    setRelatorioAtual(relatorio);
    setFormData({
      titulo: relatorio.titulo,
      descricao: relatorio.descricao || '',
      tipo: relatorio.tipo,
      periodo: relatorio.periodo,
      ano: relatorio.ano.toString(),
      valor: relatorio.valor?.toString() || '',
      status: relatorio.status,
      arquivo: null
    });
    setDialogoEditar(true);
  };

  const tipos = [
    { value: 'todos-tipos', label: 'Todos os tipos' },
    { value: 'balanco_patrimonial', label: 'Balanço Patrimonial' },
    { value: 'demonstracao_resultado', label: 'Demonstração de Resultado (DRE)' },
    { value: 'fluxo_caixa', label: 'Fluxo de Caixa' },
    { value: 'prestacao_contas', label: 'Prestação de Contas' },
    { value: 'orcamento', label: 'Orçamento' },
    { value: 'auditoria', label: 'Relatório de Auditoria' },
    { value: 'outros', label: 'Outros' }
  ];

  const periodos = [
    { value: 'todos-periodos', label: 'Todos os períodos' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  const anos = (() => {
    const anoAtual = new Date().getFullYear();
    const resultado = [{ value: 'todos-anos', label: 'Todos os anos' }];
    for (let ano = anoAtual; ano >= anoAtual - 10; ano--) {
      resultado.push({ value: ano.toString(), label: ano.toString() });
    }
    return resultado;
  })();

  const getTipoLabel = (codigo: string) => {
    const tipo = tipos.find(t => t.value === codigo);
    return tipo ? tipo.label : codigo;
  };

  const getPeriodoLabel = (codigo: string) => {
    const periodo = periodos.find(p => p.value === codigo);
    return periodo ? periodo.label : codigo;
  };

  const formatarValor = (valor: string | number) => {
    if (!valor) return '';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Gerencie os relatórios financeiros exibidos no portal de transparência da sua associação.
          </p>
        </div>
        <Dialog open={dialogoAdicionar} onOpenChange={setDialogoAdicionar}>
          <DialogTrigger asChild>
            <Button className="flex gap-1 items-center">
              <PlusCircle className="h-4 w-4" />
              Adicionar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Relatório Financeiro</DialogTitle>
              <DialogDescription>
                Preencha os dados do relatório para publicação no portal de transparência.
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
                    placeholder="Ex: Balanço Patrimonial 2023"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada do relatório"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="periodo">Período <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.periodo} 
                      onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.filter(p => p.value !== 'todos-periodos').map((periodo) => (
                          <SelectItem key={periodo.value} value={periodo.value}>
                            {periodo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ano">Ano <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.ano} 
                      onValueChange={(value) => setFormData({ ...formData, ano: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.filter(a => a.value !== 'todos-anos').map((ano) => (
                          <SelectItem key={ano.value} value={ano.value}>
                            {ano.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor Total (opcional)</Label>
                  <Input
                    id="valor"
                    value={formData.valor}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                      setFormData({ ...formData, valor: value });
                    }}
                    placeholder="Ex: 10000.50"
                  />
                  <p className="text-xs text-gray-500">
                    Informe o valor em reais, usando ponto ou vírgula como separador decimal.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Formatos aceitos: PDF, DOCX, XLSX. Tamanho máximo: 10MB.
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
                <Button type="submit" disabled={adicionarRelatorio.isPending}>
                  {adicionarRelatorio.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de edição */}
        <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Relatório Financeiro</DialogTitle>
              <DialogDescription>
                Atualize os dados do relatório.
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
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao-edit">Descrição</Label>
                  <Textarea
                    id="descricao-edit"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo-edit">Tipo <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.filter(t => t.value !== 'todos-tipos').map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="periodo-edit">Período <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.periodo} 
                      onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.filter(p => p.value !== 'todos-periodos').map((periodo) => (
                          <SelectItem key={periodo.value} value={periodo.value}>
                            {periodo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ano-edit">Ano <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.ano} 
                      onValueChange={(value) => setFormData({ ...formData, ano: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.filter(a => a.value !== 'todos-anos').map((ano) => (
                          <SelectItem key={ano.value} value={ano.value}>
                            {ano.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valor-edit">Valor Total (opcional)</Label>
                  <Input
                    id="valor-edit"
                    value={formData.valor}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                      setFormData({ ...formData, valor: value });
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status-edit">Status <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRelatorioAtual(null);
                    setDialogoEditar(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={atualizarRelatorio.isPending}>
                  {atualizarRelatorio.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Relatórios Financeiros</CardTitle>
          <CardDescription>Gerencie os relatórios financeiros da sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Select 
                value={tipoSelecionado} 
                onValueChange={setTipoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={periodoSelecionado} 
                onValueChange={setPeriodoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo.value} value={periodo.value}>
                      {periodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={anoSelecionado} 
                onValueChange={setAnoSelecionado}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value}>
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="flex gap-1 items-center shrink-0"
                onClick={() => {
                  setTipoSelecionado('');
                  setPeriodoSelecionado('');
                  setAnoSelecionado('');
                }}
                disabled={!tipoSelecionado && !periodoSelecionado && !anoSelecionado}
              >
                <Filter className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 rounded-full border-t-transparent"></div>
              </div>
            ) : relatorios && Array.isArray(relatorios) && relatorios.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Período/Ano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {relatorios && Array.isArray(relatorios) ? relatorios.map((relatorio: any) => (
                      <tr key={relatorio.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{relatorio.titulo}</div>
                          {relatorio.descricao && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">{relatorio.descricao}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className="bg-gray-100 text-gray-800">
                            {getTipoLabel(relatorio.tipo)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{getPeriodoLabel(relatorio.periodo)}</span>
                            <span>•</span>
                            <span>{relatorio.ano}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {relatorio.valor ? formatarValor(relatorio.valor) : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={
                            relatorio.status === 'publicado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {relatorio.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarRelatorio(relatorio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
                                  excluirRelatorio.mutate(relatorio.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum relatório encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {tipoSelecionado || periodoSelecionado || anoSelecionado
                    ? "Nenhum relatório corresponde aos filtros selecionados."
                    : "Comece adicionando um novo relatório financeiro."}
                </p>
                <Button 
                  onClick={() => {
                    setTipoSelecionado('');
                    setPeriodoSelecionado('');
                    setAnoSelecionado('');
                  }}
                  variant="outline"
                  className="mx-auto"
                  disabled={!tipoSelecionado && !periodoSelecionado && !anoSelecionado}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            )}
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