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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Beaker, 
  BookOpen, 
  Calendar, 
  Check, 
  ChevronRight, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  FlaskConical, 
  GraduationCap, 
  Link2, 
  MoreHorizontal, 
  Microscope, 
  Plus,
  Search,
  Settings,
  TicketCheck
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
import { cn } from '@/lib/utils';

// Definição de tipos para métodos analíticos
interface Metodo {
  id: number;
  nome: string;
  codigo: string;
  tipo: 'HPLC' | 'GC' | 'Espectrofotometria' | 'LC-MS' | 'Titulação' | 'Microbiologia' | 'PCR' | 'Outro';
  categoria: 'Quantitativo' | 'Qualitativo' | 'Identificação' | 'Avaliação' | 'Microbiológico';
  matriz: string;
  analitos: string[];
  status: 'Em Desenvolvimento' | 'Em Validação' | 'Validado' | 'Em Revisão' | 'Retirado' | 'Em Uso Rotineiro';
  perfilAnalitico?: {
    limiteDeteccao?: string;
    limiteQuantificacao?: string;
    faixaTrabalho?: string;
    precisao?: string;
    exatidao?: string;
    robustez?: string;
  };
  validacao?: {
    dataValidacao?: string;
    responsavelValidacao?: string;
    documentoValidacao?: string;
    validoAte?: string;
  };
  ultimaRevisao: string;
  proximaRevisao: string;
  responsavel: string;
  departamento: string;
  documentos?: {
    id: number;
    nome: string;
    tipo: string;
    url: string;
  }[];
  equipamentos?: string[];
  reagentes?: string[];
  procedimento: string;
}

// Schema para o formulário de novo método
const metodoFormSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  codigo: z.string().min(1, {
    message: "Digite o código do método.",
  }),
  tipo: z.string().min(1, {
    message: "Selecione o tipo do método.",
  }),
  categoria: z.string().min(1, {
    message: "Selecione a categoria do método.",
  }),
  matriz: z.string().min(1, {
    message: "Digite a matriz ou matrizes aplicáveis.",
  }),
  analitos: z.string().min(3, {
    message: "Digite pelo menos um analito.",
  }),
  departamento: z.string().min(1, {
    message: "Selecione o departamento responsável.",
  }),
  responsavel: z.string().min(3, {
    message: "Digite o nome do responsável.",
  }),
  procedimento: z.string().min(10, {
    message: "Descreva brevemente o procedimento.",
  }),
  ultimaRevisao: z.string().min(1, {
    message: "Selecione a data da última revisão.",
  }),
  proximaRevisao: z.string().min(1, {
    message: "Selecione a data da próxima revisão.",
  }),
});

type MetodoFormValues = z.infer<typeof metodoFormSchema>;

export default function Metodos() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [metodos, setMetodos] = useState<Metodo[]>([
    {
      id: 1,
      nome: "Determinação de canabinoides em extrato oleoso por HPLC",
      codigo: "MET-HPLC-001",
      tipo: "HPLC",
      categoria: "Quantitativo",
      matriz: "Extrato oleoso",
      analitos: ["CBD", "THC", "CBG", "CBC"],
      status: "Validado",
      perfilAnalitico: {
        limiteDeteccao: "0.01 mg/mL",
        limiteQuantificacao: "0.05 mg/mL",
        faixaTrabalho: "0.05 - 50 mg/mL",
        precisao: "CV ≤ 2.0%",
        exatidao: "97-103%",
        robustez: "Testado para variações de pH, temperatura e fase móvel"
      },
      validacao: {
        dataValidacao: "2023-03-15",
        responsavelValidacao: "Dra. Ana Silva",
        documentoValidacao: "VAL-HPLC-001",
        validoAte: "2025-03-15"
      },
      ultimaRevisao: "2023-03-15",
      proximaRevisao: "2024-03-15",
      responsavel: "Dra. Ana Silva",
      departamento: "Laboratório Analítico",
      documentos: [
        {
          id: 101,
          nome: "SOP-HPLC-001",
          tipo: "SOP",
          url: "/docs/sop-hplc-001.pdf"
        },
        {
          id: 102,
          nome: "VAL-HPLC-001",
          tipo: "Relatório de Validação",
          url: "/docs/val-hplc-001.pdf"
        }
      ],
      equipamentos: ["HPLC Agilent 1260", "Coluna Zorbax C18", "Sistema de filtração a vácuo"],
      reagentes: ["Metanol HPLC", "Acetonitrila HPLC", "Ácido fórmico", "Padrões de canabinoides"],
      procedimento: "Extração dos canabinoides com metanol:clorofórmio (9:1), sonificação por 15 minutos, centrifugação, filtração em membrana 0.22µm e injeção no HPLC. Método de gradiente com fase móvel A (água + 0.1% ácido fórmico) e fase móvel B (acetonitrila + 0.1% ácido fórmico)."
    },
    {
      id: 2,
      nome: "Análise de resíduos de pesticidas em material vegetal por LC-MS/MS",
      codigo: "MET-LCMS-001",
      tipo: "LC-MS",
      categoria: "Quantitativo",
      matriz: "Material vegetal",
      analitos: ["Diversos pesticidas", "Contaminantes"],
      status: "Em Validação",
      perfilAnalitico: {
        limiteDeteccao: "0.001 mg/kg",
        limiteQuantificacao: "0.005 mg/kg",
        faixaTrabalho: "0.005 - 5 mg/kg",
        precisao: "CV ≤ 15%",
        exatidao: "80-120%"
      },
      ultimaRevisao: "2023-05-10",
      proximaRevisao: "2023-11-10",
      responsavel: "Dr. Carlos Mendes",
      departamento: "Laboratório Analítico",
      documentos: [
        {
          id: 201,
          nome: "SOP-LCMS-001",
          tipo: "SOP",
          url: "/docs/sop-lcms-001.pdf"
        }
      ],
      equipamentos: ["LC-MS Sciex 6500", "Coluna Phenomenex Kinetex", "QuEChERS Kit"],
      reagentes: ["Acetonitrila", "Ácido fórmico", "Sais QuEChERS", "Padrões de pesticidas"],
      procedimento: "Extração por método QuEChERS modificado, clean-up com PSA, injeção no LC-MS/MS. Monitoramento de múltiplas reações (MRM) para quantificação e confirmação de cada pesticida."
    },
    {
      id: 3,
      nome: "Pesquisa de contaminantes microbiológicos em produtos farmacêuticos",
      codigo: "MET-MIC-001",
      tipo: "Microbiologia",
      categoria: "Microbiológico",
      matriz: "Formulações farmacêuticas",
      analitos: ["Bactérias aeróbias", "Fungos e leveduras", "E. coli", "Salmonella", "S. aureus"],
      status: "Validado",
      validacao: {
        dataValidacao: "2022-10-05",
        responsavelValidacao: "Dra. Juliana Costa",
        documentoValidacao: "VAL-MIC-001",
        validoAte: "2024-10-05"
      },
      ultimaRevisao: "2022-10-05",
      proximaRevisao: "2023-10-05",
      responsavel: "Dra. Juliana Costa",
      departamento: "Microbiologia",
      documentos: [
        {
          id: 301,
          nome: "SOP-MIC-001",
          tipo: "SOP",
          url: "/docs/sop-mic-001.pdf"
        },
        {
          id: 302,
          nome: "VAL-MIC-001",
          tipo: "Relatório de Validação",
          url: "/docs/val-mic-001.pdf"
        }
      ],
      equipamentos: ["Incubadora", "Capela de fluxo laminar", "Autoclave"],
      reagentes: ["Meios de cultura específicos", "Diluentes"],
      procedimento: "Preparação da amostra, diluição seriada, inoculação em meios de cultura específicos, incubação nas condições apropriadas, contagem e identificação conforme farmacopeia."
    },
    {
      id: 4,
      nome: "Determinação de terpenos por GC-MS",
      codigo: "MET-GC-001",
      tipo: "GC",
      categoria: "Identificação",
      matriz: "Extratos vegetais",
      analitos: ["Terpenos", "Terpenoides"],
      status: "Em Uso Rotineiro",
      perfilAnalitico: {
        limiteDeteccao: "0.001%",
        limiteQuantificacao: "0.005%",
        faixaTrabalho: "0.005 - 5%",
        precisao: "CV ≤ 10%",
        exatidao: "90-110%"
      },
      validacao: {
        dataValidacao: "2022-08-20",
        responsavelValidacao: "Dr. Marcos Oliveira",
        documentoValidacao: "VAL-GC-001",
        validoAte: "2024-08-20"
      },
      ultimaRevisao: "2023-02-15",
      proximaRevisao: "2024-02-15",
      responsavel: "Dr. Marcos Oliveira",
      departamento: "Laboratório Analítico",
      documentos: [
        {
          id: 401,
          nome: "SOP-GC-001",
          tipo: "SOP",
          url: "/docs/sop-gc-001.pdf"
        }
      ],
      equipamentos: ["GC-MS Agilent 7890B/5977A", "Coluna DB-5MS"],
      reagentes: ["Hexano", "Metanol", "Padrões de terpenos"],
      procedimento: "Extração com hexano, filtração, concentração e injeção direta no GC-MS. Identificação por comparação com biblioteca NIST e padrões autênticos."
    },
    {
      id: 5,
      nome: "Determinação de metais pesados por ICP-MS",
      codigo: "MET-ICP-001",
      tipo: "Outro",
      categoria: "Quantitativo",
      matriz: "Diversos",
      analitos: ["Chumbo", "Arsênio", "Cádmio", "Mercúrio"],
      status: "Em Desenvolvimento",
      ultimaRevisao: "2023-07-01",
      proximaRevisao: "2023-10-01",
      responsavel: "Dra. Carolina Santos",
      departamento: "Laboratório Analítico",
      documentos: [
        {
          id: 501,
          nome: "DRAFT-ICP-001",
          tipo: "Draft SOP",
          url: "/docs/draft-icp-001.pdf"
        }
      ],
      equipamentos: ["ICP-MS Agilent 7900"],
      reagentes: ["Ácido nítrico", "Peróxido de hidrogênio", "Padrões de metais"],
      procedimento: "Digestão ácida assistida por micro-ondas, diluição e análise por ICP-MS. Calibração com padrões externos e uso de padrões internos para correção de matriz."
    },
    {
      id: 6,
      nome: "Avaliação de estabilidade por HPLC",
      codigo: "MET-HPLC-002",
      tipo: "HPLC",
      categoria: "Avaliação",
      matriz: "Produtos acabados",
      analitos: ["Princípios ativos", "Produtos de degradação"],
      status: "Validado",
      perfilAnalitico: {
        limiteDeteccao: "0.05%",
        limiteQuantificacao: "0.1%",
        faixaTrabalho: "0.1 - 120%",
        precisao: "CV ≤ 2.0%",
        exatidao: "98-102%"
      },
      validacao: {
        dataValidacao: "2023-01-10",
        responsavelValidacao: "Dra. Ana Silva",
        documentoValidacao: "VAL-HPLC-002",
        validoAte: "2025-01-10"
      },
      ultimaRevisao: "2023-01-10",
      proximaRevisao: "2024-01-10",
      responsavel: "Dra. Ana Silva",
      departamento: "Laboratório Analítico",
      procedimento: "Análise de amostras submetidas a condições de estresse (temperatura, umidade, luz) conforme ICH Q1B."
    },
  ]);

  // Formulário para novo método
  const form = useForm<MetodoFormValues>({
    resolver: zodResolver(metodoFormSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      tipo: '',
      categoria: '',
      matriz: '',
      analitos: '',
      departamento: '',
      responsavel: '',
      procedimento: '',
      ultimaRevisao: new Date().toISOString().split('T')[0],
      proximaRevisao: '',
    },
  });

  // Funções para lidar com a adição de novo método
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (data: MetodoFormValues) => {
    // Criar novo método
    const novoMetodo: Metodo = {
      id: Math.max(...metodos.map(m => m.id), 0) + 1,
      nome: data.nome,
      codigo: data.codigo,
      tipo: data.tipo as any,
      categoria: data.categoria as any,
      matriz: data.matriz,
      analitos: data.analitos.split(',').map(a => a.trim()),
      status: 'Em Desenvolvimento',
      ultimaRevisao: data.ultimaRevisao,
      proximaRevisao: data.proximaRevisao,
      responsavel: data.responsavel,
      departamento: data.departamento,
      procedimento: data.procedimento,
    };

    // Adicionar à lista
    setMetodos([...metodos, novoMetodo]);
    
    // Fechar diálogo e limpar formulário
    setIsDialogOpen(false);
    form.reset();

    // Mostrar notificação
    toast({
      title: "Método criado",
      description: `O método "${data.nome}" foi criado com sucesso.`,
    });
  };

  // Filtragem de métodos
  const metodosFiltrados = metodos.filter(metodo => {
    // Filtro de busca por texto
    const matchesSearch = 
      searchQuery === '' || 
      metodo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metodo.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metodo.analitos.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro de tipo
    const matchesTipo = 
      tipoFilter === null || 
      metodo.tipo === tipoFilter;
    
    // Filtro de categoria
    const matchesCategoria = 
      categoriaFilter === null || 
      metodo.categoria === categoriaFilter;
    
    // Filtro de status
    const matchesStatus = 
      statusFilter === null || 
      metodo.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesCategoria && matchesStatus;
  });

  // Listas de valores únicos para filtros
  const tiposUnicos = Array.from(new Set(metodos.map(m => m.tipo)));
  const categoriasUnicas = Array.from(new Set(metodos.map(m => m.categoria)));
  const statusUnicos = Array.from(new Set(metodos.map(m => m.status)));

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
      case 'Em Desenvolvimento':
        return 'bg-blue-100 text-blue-800';
      case 'Em Validação':
        return 'bg-amber-100 text-amber-800';
      case 'Validado':
        return 'bg-green-100 text-green-800';
      case 'Em Revisão':
        return 'bg-purple-100 text-purple-800';
      case 'Retirado':
        return 'bg-red-100 text-red-800';
      case 'Em Uso Rotineiro':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para escolher o ícone com base no tipo de método
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'HPLC':
        return <FlaskConical className="h-5 w-5 text-blue-600" />;
      case 'GC':
        return <Activity className="h-5 w-5 text-green-600" />;
      case 'Espectrofotometria':
        return <Eye className="h-5 w-5 text-purple-600" />;
      case 'LC-MS':
        return <Microscope className="h-5 w-5 text-indigo-600" />;
      case 'Titulação':
        return <Beaker className="h-5 w-5 text-amber-600" />;
      case 'Microbiologia':
        return <GraduationCap className="h-5 w-5 text-red-600" />;
      case 'PCR':
        return <FileText className="h-5 w-5 text-cyan-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  // Verificar métodos que precisam de revisão (60 dias)
  const metodosParaRevisao = metodos.filter(metodo => {
    const dataProximaRevisao = new Date(metodo.proximaRevisao);
    const hoje = new Date();
    const diferencaDias = Math.floor((dataProximaRevisao.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
    return diferencaDias <= 60 && diferencaDias > 0;
  });

  // Contagem de status para resumo
  const statusCounts = {
    emDesenvolvimento: metodos.filter(m => m.status === 'Em Desenvolvimento').length,
    emValidacao: metodos.filter(m => m.status === 'Em Validação').length,
    validado: metodos.filter(m => m.status === 'Validado').length,
    emRevisao: metodos.filter(m => m.status === 'Em Revisão').length,
    retirado: metodos.filter(m => m.status === 'Retirado').length,
    emUsoRotineiro: metodos.filter(m => m.status === 'Em Uso Rotineiro').length,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">
            Métodos Analíticos
          </h1>
          <p className="text-gray-600">
            Gerenciamento de métodos e técnicas analíticas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar métodos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Método
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Método Analítico</DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas do método. Detalhes adicionais podem ser incorporados posteriormente.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Método</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Determinação de canabinoides por HPLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: MET-HPLC-001" {...field} />
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
                              <SelectItem value="HPLC">HPLC</SelectItem>
                              <SelectItem value="GC">GC</SelectItem>
                              <SelectItem value="Espectrofotometria">Espectrofotometria</SelectItem>
                              <SelectItem value="LC-MS">LC-MS</SelectItem>
                              <SelectItem value="Titulação">Titulação</SelectItem>
                              <SelectItem value="Microbiologia">Microbiologia</SelectItem>
                              <SelectItem value="PCR">PCR</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Quantitativo">Quantitativo</SelectItem>
                              <SelectItem value="Qualitativo">Qualitativo</SelectItem>
                              <SelectItem value="Identificação">Identificação</SelectItem>
                              <SelectItem value="Avaliação">Avaliação</SelectItem>
                              <SelectItem value="Microbiológico">Microbiológico</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="matriz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matriz</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Extrato oleoso, material vegetal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="analitos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analitos</FormLabel>
                        <FormControl>
                          <Input placeholder="Analitos separados por vírgula" {...field} />
                        </FormControl>
                        <FormDescription>
                          Digite os analitos separados por vírgula
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Laboratório Analítico">Laboratório Analítico</SelectItem>
                              <SelectItem value="Microbiologia">Microbiologia</SelectItem>
                              <SelectItem value="Controle de Qualidade">Controle de Qualidade</SelectItem>
                              <SelectItem value="P&D">P&D</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ultimaRevisao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Última Revisão</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="proximaRevisao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Próxima Revisão</FormLabel>
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
                    name="procedimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Procedimento</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição breve do procedimento" 
                            className="resize-none min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Criar Método</Button>
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
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-base">Total de Métodos</h3>
              <div className="text-2xl font-bold">{metodos.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-full">
              <TicketCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-base">Validados</h3>
              <div className="text-2xl font-bold">{statusCounts.validado + statusCounts.emUsoRotineiro}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <FlaskConical className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-base">Em Desenvolvimento</h3>
              <div className="text-2xl font-bold">{statusCounts.emDesenvolvimento + statusCounts.emValidacao}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-base">Para Revisar</h3>
              <div className="text-2xl font-bold">{metodosParaRevisao.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de métodos para revisão */}
      {metodosParaRevisao.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <CardTitle className="text-amber-800 text-lg">Métodos Próximos da Revisão</CardTitle>
                <CardDescription className="text-amber-700">
                  Os seguintes métodos precisam ser revisados nos próximos 60 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metodosParaRevisao.map(metodo => (
                <li key={metodo.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(metodo.tipo)}
                    <span className="font-medium">{metodo.nome}</span>
                  </div>
                  <span className="text-amber-700">Revisão até: {formatDate(metodo.proximaRevisao)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-100">
              Programar Revisões
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select onValueChange={(value) => setTipoFilter(value || null)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposUnicos.map(tipo => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => setCategoriaFilter(value || null)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {categoriasUnicas.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => setStatusFilter(value || null)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {statusUnicos.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de métodos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Matriz</TableHead>
                <TableHead>Analitos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Revisão</TableHead>
                <TableHead>Próxima Revisão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metodosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                    Nenhum método encontrado
                  </TableCell>
                </TableRow>
              ) : (
                metodosFiltrados.map(metodo => (
                  <TableRow key={metodo.id}>
                    <TableCell>
                      {getTipoIcon(metodo.tipo)}
                    </TableCell>
                    <TableCell className="font-medium">{metodo.nome}</TableCell>
                    <TableCell>{metodo.codigo}</TableCell>
                    <TableCell>{metodo.matriz}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {metodo.analitos.slice(0, 2).map((analito, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">
                            {analito}
                          </Badge>
                        ))}
                        {metodo.analitos.length > 2 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{metodo.analitos.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(metodo.status)}>
                        {metodo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(metodo.ultimaRevisao)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        new Date(metodo.proximaRevisao) < new Date() ? "text-red-600 font-medium" : ""
                      )}>
                        {formatDate(metodo.proximaRevisao)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Configurações">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}