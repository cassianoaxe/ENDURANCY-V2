import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  Beaker, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  ClipboardList, 
  Copy, 
  FileText, 
  FlaskConical, 
  Link2, 
  Microscope, 
  Plus, 
  Search,
  TestTube,
  Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Definição de tipos para projetos de desenvolvimento
interface Projeto {
  id: number;
  nome: string;
  tipo: 'Metodologia' | 'Técnica' | 'Validação' | 'Otimização' | 'Pesquisa' | 'Tecnologia';
  status: 'Planejamento' | 'Em Andamento' | 'Em Validação' | 'Concluído' | 'Cancelado' | 'Em Pausa';
  dataInicio: string;
  dataEstimadaConclusao: string;
  progresso: number;
  responsavel: string;
  equipe: string[];
  descricao: string;
  resultadosAlcancados?: string[];
  documentosAssociados?: string[];
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

// Schema para o formulário de novo projeto
const projetoFormSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  tipo: z.string().min(1, {
    message: "Selecione um tipo de projeto.",
  }),
  prioridade: z.string().min(1, {
    message: "Selecione a prioridade do projeto.",
  }),
  dataInicio: z.string().min(1, {
    message: "Selecione a data de início.",
  }),
  dataEstimadaConclusao: z.string().min(1, {
    message: "Selecione a data estimada de conclusão.",
  }),
  responsavel: z.string().min(3, {
    message: "O nome do responsável deve ter pelo menos 3 caracteres.",
  }),
  equipe: z.string().min(3, {
    message: "Digite pelo menos um membro da equipe.",
  }),
  descricao: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});

type ProjetoFormValues = z.infer<typeof projetoFormSchema>;

export default function Desenvolvimento() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([
    {
      id: 1,
      nome: "Desenvolvimento de método para análise de canabinoides em formulações farmacêuticas",
      tipo: "Metodologia",
      status: "Em Andamento",
      dataInicio: "2023-02-15",
      dataEstimadaConclusao: "2023-10-30",
      progresso: 65,
      responsavel: "Dra. Ana Silva",
      equipe: ["Carlos Mendes", "Juliana Pereira", "Roberto Santos"],
      descricao: "Desenvolvimento e validação de método analítico por HPLC para quantificação de canabinoides em diferentes formas farmacêuticas.",
      resultadosAlcancados: [
        "Definição de parâmetros cromatográficos",
        "Validação parcial de especificidade e linearidade",
        "Desenvolvimento de método de extração para matrizes complexas"
      ],
      documentosAssociados: ["LAB-PROC-023", "LAB-REG-078"],
      prioridade: "Alta"
    },
    {
      id: 2,
      nome: "Otimização de extração de terpenos de matrizes vegetais",
      tipo: "Otimização",
      status: "Em Validação",
      dataInicio: "2023-04-10",
      dataEstimadaConclusao: "2023-09-15",
      progresso: 85,
      responsavel: "Dr. Marcos Oliveira",
      equipe: ["Fernanda Lima", "Victor Costa"],
      descricao: "Otimização de protocolos de extração de terpenos de matrizes vegetais utilizando diferentes solventes e técnicas.",
      resultadosAlcancados: [
        "Comparação de 5 métodos diferentes de extração",
        "Determinação do método ótimo para matrizes vegetais específicas",
        "Desenvolvimento de protocolo para validação"
      ],
      documentosAssociados: ["LAB-PROC-045"],
      prioridade: "Média"
    },
    {
      id: 3,
      nome: "Validação de método de análise microbiológica para produtos cannábicos",
      tipo: "Validação",
      status: "Em Andamento",
      dataInicio: "2023-06-01",
      dataEstimadaConclusao: "2023-12-15",
      progresso: 40,
      responsavel: "Dra. Carolina Santos",
      equipe: ["Paulo Mendes", "Luciana Costa", "André Lima"],
      descricao: "Validação de método microbiológico para análise de contaminantes em produtos derivados de cannabis, conforme requisitos regulatórios da ANVISA.",
      resultadosAlcancados: [
        "Definição de parâmetros de validação",
        "Desenvolvimento de controles positivos específicos"
      ],
      documentosAssociados: ["LAB-PROC-056", "LAB-REG-112"],
      prioridade: "Alta"
    },
    {
      id: 4,
      nome: "Implementação de técnica de espectrometria de massas para análise de pesticidas",
      tipo: "Técnica",
      status: "Planejamento",
      dataInicio: "2023-09-01",
      dataEstimadaConclusao: "2024-03-31",
      progresso: 15,
      responsavel: "Dr. Ricardo Almeida",
      equipe: ["Amanda Rodrigues", "Bruno Soares"],
      descricao: "Implementação e validação de método por LC-MS/MS para detecção e quantificação de resíduos de pesticidas em produtos cannábicos.",
      resultadosAlcancados: [
        "Revisão bibliográfica",
        "Definição de equipamentos necessários"
      ],
      documentosAssociados: [],
      prioridade: "Média"
    },
    {
      id: 5,
      nome: "Estudo de estabilidade de extratos de cannabis",
      tipo: "Pesquisa",
      status: "Concluído",
      dataInicio: "2022-10-15",
      dataEstimadaConclusao: "2023-06-30",
      progresso: 100,
      responsavel: "Dra. Laura Ferreira",
      equipe: ["Henrique Sousa", "Camila Oliveira", "Daniel Santos"],
      descricao: "Estudo de estabilidade de longo prazo de extratos de cannabis em diferentes condições de armazenamento e embalagens.",
      resultadosAlcancados: [
        "Determinação de condições ótimas de armazenamento",
        "Identificação de produtos de degradação",
        "Estabelecimento de prazo de validade para diferentes tipos de extratos"
      ],
      documentosAssociados: ["LAB-PROC-034", "LAB-REG-098", "LAB-REL-023"],
      prioridade: "Alta"
    },
    {
      id: 6,
      nome: "Automação de processo de preparação de amostras",
      tipo: "Tecnologia",
      status: "Em Pausa",
      dataInicio: "2022-11-01",
      dataEstimadaConclusao: "2023-08-31",
      progresso: 30,
      responsavel: "Dr. Gabriel Moreira",
      equipe: ["Fernando Silva", "Mariana Costa"],
      descricao: "Desenvolvimento de sistema automatizado para preparação de amostras em análises de rotina, visando aumentar a eficiência e reduzir erros.",
      resultadosAlcancados: [
        "Criação de protótipo inicial",
        "Testes preliminares de funcionalidade"
      ],
      documentosAssociados: ["LAB-PROJ-007"],
      prioridade: "Baixa"
    },
  ]);

  // Formulário para novo projeto
  const form = useForm<ProjetoFormValues>({
    resolver: zodResolver(projetoFormSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      prioridade: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataEstimadaConclusao: '',
      responsavel: '',
      equipe: '',
      descricao: '',
    },
  });

  // Funções para lidar com a adição de novo projeto
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (data: ProjetoFormValues) => {
    // Criar novo projeto
    const novoProjeto: Projeto = {
      id: Math.max(...projetos.map(p => p.id), 0) + 1,
      nome: data.nome,
      tipo: data.tipo as any,
      status: 'Planejamento',
      dataInicio: data.dataInicio,
      dataEstimadaConclusao: data.dataEstimadaConclusao,
      progresso: 0,
      responsavel: data.responsavel,
      equipe: data.equipe.split(',').map(e => e.trim()),
      descricao: data.descricao,
      resultadosAlcancados: [],
      documentosAssociados: [],
      prioridade: data.prioridade as any,
    };

    // Adicionar à lista
    setProjetos([...projetos, novoProjeto]);
    
    // Fechar diálogo e limpar formulário
    setIsDialogOpen(false);
    form.reset();

    // Mostrar notificação
    toast({
      title: "Projeto criado",
      description: `O projeto "${data.nome}" foi criado com sucesso.`,
    });
  };

  // Filtragem de projetos
  const projetosFiltrados = projetos.filter(projeto => {
    // Filtro de busca por texto
    const matchesSearch = 
      searchQuery === '' || 
      projeto.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projeto.responsavel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projeto.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de tipo
    const matchesTipo = 
      tipoFilter === null || 
      projeto.tipo === tipoFilter;
    
    // Filtro de status
    const matchesStatus = 
      statusFilter === null || 
      projeto.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  // Listas de valores únicos para filtros
  const tiposUnicos = Array.from(new Set(projetos.map(p => p.tipo)));
  const statusUnicos = Array.from(new Set(projetos.map(p => p.status)));

  // Formatação de data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Função para determinar a classe do badge de status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Planejamento':
        return 'bg-blue-100 text-blue-800';
      case 'Em Andamento':
        return 'bg-amber-100 text-amber-800';
      case 'Em Validação':
        return 'bg-purple-100 text-purple-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      case 'Em Pausa':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para escolher o ícone com base no tipo de projeto
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Metodologia':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'Técnica':
        return <Microscope className="h-5 w-5 text-purple-600" />;
      case 'Validação':
        return <ClipboardList className="h-5 w-5 text-green-600" />;
      case 'Otimização':
        return <Beaker className="h-5 w-5 text-amber-600" />;
      case 'Pesquisa':
        return <BookOpen className="h-5 w-5 text-red-600" />;
      case 'Tecnologia':
        return <FlaskConical className="h-5 w-5 text-indigo-600" />;
      default:
        return <TestTube className="h-5 w-5 text-gray-600" />;
    }
  };

  // Função para determinar a classe do badge de prioridade
  const getPrioridadeBadgeClass = (prioridade: string) => {
    switch (prioridade) {
      case 'Crítica':
        return 'bg-red-100 text-red-800';
      case 'Alta':
        return 'bg-orange-100 text-orange-800';
      case 'Média':
        return 'bg-amber-100 text-amber-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Contagem de status para resumo
  const statusCounts = {
    planejamento: projetos.filter(p => p.status === 'Planejamento').length,
    emAndamento: projetos.filter(p => p.status === 'Em Andamento').length,
    emValidacao: projetos.filter(p => p.status === 'Em Validação').length,
    concluido: projetos.filter(p => p.status === 'Concluído').length,
    emPausa: projetos.filter(p => p.status === 'Em Pausa').length,
    cancelado: projetos.filter(p => p.status === 'Cancelado').length,
  };

  // Cálculo de progresso médio dos projetos ativos
  const projetosAtivos = projetos.filter(p => 
    p.status === 'Em Andamento' || p.status === 'Em Validação' || p.status === 'Planejamento'
  );
  const progressoMedio = projetosAtivos.length > 0 
    ? Math.round(projetosAtivos.reduce((sum, p) => sum + p.progresso, 0) / projetosAtivos.length) 
    : 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">
            Desenvolvimento
          </h1>
          <p className="text-gray-600">
            Gerenciamento de projetos de desenvolvimento metodológico
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar projetos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do novo projeto de desenvolvimento.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome descritivo do projeto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Metodologia">Metodologia</SelectItem>
                              <SelectItem value="Técnica">Técnica</SelectItem>
                              <SelectItem value="Validação">Validação</SelectItem>
                              <SelectItem value="Otimização">Otimização</SelectItem>
                              <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prioridade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Média">Média</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Crítica">Crítica</SelectItem>
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
                      name="dataInicio"
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
                      control={form.control}
                      name="dataEstimadaConclusao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Estimada de Conclusão</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipe</FormLabel>
                        <FormControl>
                          <Input placeholder="Nomes separados por vírgula" {...field} />
                        </FormControl>
                        <FormDescription>
                          Digite os nomes separados por vírgula
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do projeto" 
                            className="resize-none min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Criar Projeto</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Total de Projetos</h3>
            <div className="text-3xl font-bold">{projetos.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {statusCounts.emAndamento + statusCounts.emValidacao} em desenvolvimento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-amber-100 p-2 rounded-full mb-2">
              <TestTube className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Em Andamento</h3>
            <div className="text-3xl font-bold">{statusCounts.emAndamento}</div>
            <p className="text-sm text-gray-500 mt-1">
              {statusCounts.emValidacao} em validação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-green-100 p-2 rounded-full mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Concluídos</h3>
            <div className="text-3xl font-bold">{statusCounts.concluido}</div>
            <p className="text-sm text-gray-500 mt-1">
              {statusCounts.cancelado} cancelados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-indigo-100 p-2 rounded-full mb-2">
              <FlaskConical className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Progresso Médio</h3>
            <div className="text-3xl font-bold">{progressoMedio}%</div>
            <Progress value={progressoMedio} className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros para projetos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Projetos</h2>
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {statusUnicos.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setTipoFilter(value || null)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {tiposUnicos.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de projetos */}
      <div className="grid grid-cols-1 gap-4">
        {projetosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-gray-500">
                Tente ajustar os filtros ou adicione um novo projeto.
              </p>
            </CardContent>
          </Card>
        ) : (
          projetosFiltrados.map(projeto => (
            <Card key={projeto.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    {getTipoIcon(projeto.tipo)}
                    <div>
                      <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="inline-flex items-center mr-3">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {projeto.responsavel}
                        </span>
                        <span className="inline-flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(projeto.dataInicio)} - {formatDate(projeto.dataEstimadaConclusao)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusBadgeClass(projeto.status)}>
                      {projeto.status}
                    </Badge>
                    <Badge className={getPrioridadeBadgeClass(projeto.prioridade)}>
                      Prioridade {projeto.prioridade}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{projeto.descricao}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">{projeto.progresso}%</span>
                  </div>
                  <Progress value={projeto.progresso} className="w-full" />
                </div>

                {projeto.resultadosAlcancados && projeto.resultadosAlcancados.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Resultados Alcançados:</h4>
                    <ul className="text-sm list-disc list-inside space-y-1 text-gray-600">
                      {projeto.resultadosAlcancados.slice(0, 3).map((resultado, index) => (
                        <li key={index} className="line-clamp-1">{resultado}</li>
                      ))}
                      {projeto.resultadosAlcancados.length > 3 && (
                        <li className="text-blue-600 cursor-pointer hover:underline">
                          +{projeto.resultadosAlcancados.length - 3} mais...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {projeto.documentosAssociados && projeto.documentosAssociados.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {projeto.documentosAssociados.map((doc, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                        title={`Ver documento ${doc}`}
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        {doc}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Equipe:</span>
                  <div className="flex -space-x-2">
                    {projeto.equipe.slice(0, 3).map((membro, index) => (
                      <div 
                        key={index} 
                        className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs ring-2 ring-white"
                        title={membro}
                      >
                        {membro.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {projeto.equipe.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs ring-2 ring-white">
                        +{projeto.equipe.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600" title="Ver detalhes do projeto">
                  <span>Detalhes</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}