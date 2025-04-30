import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Eye,
  PenLine,
  Filter,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Interface para o formulário
interface FormItem {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  type: 'cadastro' | 'pesquisa' | 'avaliacao' | 'outro';
  createdAt: Date;
  updatedAt: Date;
  fields: number;
  submissions: number;
}

export default function CadastroFormularios() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('todos');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'submissions'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Dados de exemplo para os formulários
  const [forms, setForms] = useState<FormItem[]>([
    {
      id: 1,
      name: "Cadastro de Associações",
      description: "Formulário padrão para cadastro de associações",
      category: "associacao",
      status: 'active',
      type: 'cadastro',
      createdAt: new Date(2025, 1, 15),
      updatedAt: new Date(2025, 3, 10),
      fields: 12,
      submissions: 45
    },
    {
      id: 2,
      name: "Cadastro de Empresas",
      description: "Formulário padrão para cadastro de empresas",
      category: "empresa",
      status: 'active',
      type: 'cadastro',
      createdAt: new Date(2025, 1, 20),
      updatedAt: new Date(2025, 3, 5),
      fields: 15,
      submissions: 62
    },
    {
      id: 3,
      name: "Pesquisa de Satisfação",
      description: "Avaliação de satisfação com a plataforma",
      category: "pesquisa",
      status: 'active',
      type: 'pesquisa',
      createdAt: new Date(2025, 2, 5),
      updatedAt: new Date(2025, 2, 5),
      fields: 8,
      submissions: 103
    },
    {
      id: 4,
      name: "Documentação para Clínica",
      description: "Formulário de envio de documentos para clínicas",
      category: "clinica",
      status: 'draft',
      type: 'cadastro',
      createdAt: new Date(2025, 3, 15),
      updatedAt: new Date(2025, 3, 28),
      fields: 10,
      submissions: 0
    },
    {
      id: 5,
      name: "Avaliação Médica",
      description: "Formulário para avaliações médicas",
      category: "avaliacao",
      status: 'active',
      type: 'avaliacao',
      createdAt: new Date(2025, 2, 20),
      updatedAt: new Date(2025, 3, 1),
      fields: 18,
      submissions: 27
    },
    {
      id: 6,
      name: "Cadastro de Laboratórios",
      description: "Formulário para cadastro e documentação de laboratórios",
      category: "laboratorio",
      status: 'archived',
      type: 'cadastro',
      createdAt: new Date(2025, 1, 5),
      updatedAt: new Date(2025, 1, 10),
      fields: 14,
      submissions: 8
    }
  ]);

  // Filtragem e ordenação dos formulários
  const filteredForms = forms.filter(form => {
    // Filtragem por tab (status)
    if (currentTab === 'ativos' && form.status !== 'active') return false;
    if (currentTab === 'rascunhos' && form.status !== 'draft') return false;
    if (currentTab === 'arquivados' && form.status !== 'archived') return false;
    
    // Filtragem por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        form.name.toLowerCase().includes(searchLower) || 
        form.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtragem por categoria
    if (categoryFilter && form.category !== categoryFilter) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Ordenação
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'updatedAt') {
      return sortOrder === 'asc'
        ? a.updatedAt.getTime() - b.updatedAt.getTime()
        : b.updatedAt.getTime() - a.updatedAt.getTime();
    } else if (sortBy === 'submissions') {
      return sortOrder === 'asc'
        ? a.submissions - b.submissions
        : b.submissions - a.submissions;
    }
    return 0;
  });

  // Função para alternar a ordem de classificação
  const toggleSort = (field: 'name' | 'updatedAt' | 'submissions') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Navegação para editor de formulário
  const navigateToEditor = (id?: number) => {
    if (id) {
      window.history.pushState({}, '', `/cadastro/formularios/editor/${id}`);
    } else {
      window.history.pushState({}, '', '/cadastro/formularios/editor');
    }
    window.dispatchEvent(new Event('popstate'));
  };

  // Duplicar um formulário
  const duplicateForm = (form: FormItem) => {
    const newForm: FormItem = {
      ...form,
      id: Math.max(0, ...forms.map(f => f.id)) + 1,
      name: `${form.name} (Cópia)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0
    };
    
    setForms([...forms, newForm]);
    
    toast({
      title: "Formulário duplicado",
      description: `Uma cópia de "${form.name}" foi criada.`,
    });
  };

  // Arquivar um formulário
  const archiveForm = (id: number) => {
    setForms(forms.map(form => 
      form.id === id 
        ? { ...form, status: 'archived', updatedAt: new Date() } 
        : form
    ));
    
    toast({
      title: "Formulário arquivado",
      description: "O formulário foi movido para arquivados.",
    });
  };

  // Excluir um formulário
  const deleteForm = (id: number) => {
    setForms(forms.filter(form => form.id !== id));
    
    toast({
      title: "Formulário excluído",
      description: "O formulário foi excluído permanentemente.",
      variant: "destructive",
    });
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClass = (status: 'active' | 'draft' | 'archived') => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'draft':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'archived':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return '';
    }
  };

  // Função para obter o ícone baseado no status
  const getStatusIcon = (status: 'active' | 'draft' | 'archived') => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case 'draft':
        return <PenLine className="h-3.5 w-3.5 mr-1" />;
      case 'archived':
        return <XCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  // Função para obter o texto baseado no status
  const getStatusText = (status: 'active' | 'draft' | 'archived') => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivado';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Formulários</h1>
          <p className="text-gray-600">Gerencie formulários personalizados para cadastro e pesquisa</p>
        </div>
        <Button onClick={() => navigateToEditor()} className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Formulário
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar formulários..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-9 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              <SelectItem value="associacao">Associação</SelectItem>
              <SelectItem value="empresa">Empresa</SelectItem>
              <SelectItem value="clinica">Clínica</SelectItem>
              <SelectItem value="laboratorio">Laboratório</SelectItem>
              <SelectItem value="pesquisa">Pesquisa</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <Tabs defaultValue="todos" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="ativos">Ativos</TabsTrigger>
              <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
              <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[400px]">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 font-medium -ml-4"
                  >
                    Formulário
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('updatedAt')}
                    className="flex items-center gap-1 font-medium -ml-4"
                  >
                    Atualizado
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('submissions')}
                    className="flex items-center gap-1 font-medium -ml-4"
                  >
                    Envios
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum formulário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="max-w-[400px]">
                      <div>
                        <div className="font-medium overflow-hidden text-ellipsis">{form.name}</div>
                        <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
                          {form.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {form.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusClass(form.status)}
                      >
                        {getStatusIcon(form.status)}
                        {getStatusText(form.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground whitespace-nowrap text-sm">
                          {format(form.updatedAt, "d 'de' MMM, yyyy", { locale: pt })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {form.fields}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {form.submissions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateToEditor(form.id)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => duplicateForm(form)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => archiveForm(form.id)}>
                              <FileText className="h-4 w-4 mr-2" /> Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteForm(form.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Exibindo {filteredForms.length} de {forms.length} formulários
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm && !categoryFilter}
            >
              <Filter className="h-3.5 w-3.5" /> Limpar filtros
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}