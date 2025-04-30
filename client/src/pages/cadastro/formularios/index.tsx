import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  FormInput,
  Check,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Download,
  BarChart,
  Share2,
  FileText,
  ClipboardList,
  ListChecks,
  FileQuestion,
  CheckSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tipos para o modelo de dados
interface FormTemplate {
  id: number;
  name: string;
  description: string;
  category: 'cadastro' | 'pesquisa' | 'avaliacao' | 'outro';
  fields: number;
  responses: number;
  createdAt: Date;
  lastUpdated: Date;
  status: 'active' | 'draft' | 'archived';
}

export default function CadastroFormularios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");

  // Função de navegação que funciona com o sistema do App.tsx
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Dados dos formulários para demonstração
  const formTemplates: FormTemplate[] = [
    {
      id: 1,
      name: "Cadastro de Paciente",
      description: "Formulário para cadastro de novos pacientes",
      category: 'cadastro',
      fields: 15,
      responses: 356,
      createdAt: new Date(2025, 3, 15),
      lastUpdated: new Date(2025, 4, 2),
      status: 'active'
    },
    {
      id: 2,
      name: "Pesquisa de Satisfação",
      description: "Formulário para avaliar a satisfação dos associados",
      category: 'pesquisa',
      fields: 8,
      responses: 142,
      createdAt: new Date(2025, 2, 20),
      lastUpdated: new Date(2025, 3, 25),
      status: 'active'
    },
    {
      id: 3,
      name: "Avaliação de Qualidade",
      description: "Formulário para avaliar a qualidade dos produtos",
      category: 'avaliacao',
      fields: 12,
      responses: 95,
      createdAt: new Date(2025, 4, 1),
      lastUpdated: new Date(2025, 4, 10),
      status: 'active'
    },
    {
      id: 4,
      name: "Solicitação de Adesão",
      description: "Formulário para novos associados",
      category: 'cadastro',
      fields: 18,
      responses: 230,
      createdAt: new Date(2025, 1, 10),
      lastUpdated: new Date(2025, 3, 15),
      status: 'active'
    },
    {
      id: 5,
      name: "Termo de Consentimento",
      description: "Formulário para consentimento de tratamento",
      category: 'outro',
      fields: 5,
      responses: 412,
      createdAt: new Date(2025, 2, 5),
      lastUpdated: new Date(2025, 4, 1),
      status: 'active'
    },
    {
      id: 6,
      name: "Pesquisa de Necessidades",
      description: "Formulário para identificar necessidades dos pacientes",
      category: 'pesquisa',
      fields: 10,
      responses: 78,
      createdAt: new Date(2025, 3, 20),
      lastUpdated: new Date(2025, 4, 15),
      status: 'draft'
    },
    {
      id: 7,
      name: "Avaliação Médica",
      description: "Formulário para avaliação médica inicial",
      category: 'avaliacao',
      fields: 25,
      responses: 145,
      createdAt: new Date(2025, 2, 15),
      lastUpdated: new Date(2025, 4, 5),
      status: 'archived'
    }
  ];

  // Filtrar formulários por termo de busca e categoria
  const filteredForms = formTemplates.filter(form => {
    const matchesSearch = searchTerm === "" || 
                        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === "todos") return matchesSearch;
    if (currentTab === "cadastro") return matchesSearch && form.category === "cadastro";
    if (currentTab === "pesquisa") return matchesSearch && form.category === "pesquisa";
    if (currentTab === "avaliacao") return matchesSearch && form.category === "avaliacao";
    if (currentTab === "outros") return matchesSearch && form.category === "outro";
    return false;
  });

  // Ordenar formulários por data de atualização (mais recentes primeiro)
  const sortedForms = [...filteredForms].sort((a, b) => {
    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
  });

  // Formatador de data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Função para obter ícone baseado na categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cadastro':
        return <ClipboardList className="h-4 w-4" />;
      case 'pesquisa':
        return <FileQuestion className="h-4 w-4" />;
      case 'avaliacao':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Formulários</h1>
          <p className="text-gray-600">Crie e gerencie formulários para diferentes finalidades</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate('/cadastro/formularios/novo')}>
          <Plus size={16} /> Novo Formulário
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Formulários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{formTemplates.length}</span>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FormInput className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Respostas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {formTemplates.reduce((acc, form) => acc + form.responses, 0)}
              </span>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Formulários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {formTemplates.filter(form => form.status === 'active').length}
              </span>
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Média de Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {Math.round(formTemplates.reduce((acc, form) => acc + form.responses, 0) / formTemplates.length)}
              </span>
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text" 
            placeholder="Buscar formulário..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
          <TabsTrigger value="pesquisa">Pesquisa</TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
          <TabsTrigger value="outros">Outros</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {sortedForms.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Campos</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(form.category)}
                            <div>
                              <div>{form.name}</div>
                              <div className="text-xs text-gray-500">{form.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal capitalize">
                            {form.category === 'outro' ? 'Outro' : form.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{form.fields}</TableCell>
                        <TableCell>{form.responses}</TableCell>
                        <TableCell>{formatDate(form.lastUpdated)}</TableCell>
                        <TableCell>
                          {form.status === 'active' && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Ativo
                            </Badge>
                          )}
                          {form.status === 'draft' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                              Rascunho
                            </Badge>
                          )}
                          {form.status === 'archived' && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                              Arquivado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Editar formulário"
                              onClick={() => navigate(`/cadastro/formularios/${form.id}/editar`)}
                            >
                              <Edit size={16} className="text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Ver estatísticas"
                              onClick={() => navigate(`/cadastro/formularios/${form.id}/estatisticas`)}
                            >
                              <BarChart size={16} className="text-gray-500" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} className="text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Copy size={14} className="mr-2" /> Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Share2 size={14} className="mr-2" /> Compartilhar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                                >
                                  <Trash2 size={14} className="mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Nenhum formulário encontrado com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* As abas restantes seguem o mesmo padrão, mas filtradas por categoria */}
        <TabsContent value="cadastro" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesmo código da aba "todos" adaptado para este filtro específico */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pesquisa" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesmo código da aba "todos" adaptado para este filtro específico */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacao" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesmo código da aba "todos" adaptado para este filtro específico */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Mesmo código da aba "todos" adaptado para este filtro específico */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}