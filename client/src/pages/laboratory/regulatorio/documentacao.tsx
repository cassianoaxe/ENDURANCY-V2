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
import { 
  Archive, 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  File, 
  FileCheck, 
  FileEdit, 
  FilePlus, 
  FileSpreadsheet, 
  FileText, 
  Filter,
  Link,
  Pencil,
  Plus, 
  Search,
  Share2,
  Trash
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Definição de tipos para documentos
interface Documento {
  id: number;
  nome: string;
  tipo: 'SOP' | 'Procedimento' | 'Formulário' | 'Manual' | 'Política' | 'Instrução de Trabalho' | 'Registro';
  codigo: string;
  versao: string;
  departamento: string;
  status: 'Vigente' | 'Em Revisão' | 'Obsoleto' | 'Rascunho';
  dataCriacao: string;
  dataRevisao: string;
  proximaRevisao: string;
  autores: string[];
  revisores: string[];
  tamanho?: string;
  formato?: string;
  descricao?: string;
}

// Schema para o formulário de novo documento
const documentoFormSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  tipo: z.string().min(1, {
    message: "Selecione um tipo de documento.",
  }),
  codigo: z.string().min(1, {
    message: "Digite o código do documento.",
  }),
  versao: z.string().min(1, {
    message: "Digite a versão do documento.",
  }),
  departamento: z.string().min(1, {
    message: "Selecione o departamento.",
  }),
  dataCriacao: z.string().min(1, {
    message: "Selecione a data de criação.",
  }),
  dataRevisao: z.string().min(1, {
    message: "Selecione a data de revisão.",
  }),
  proximaRevisao: z.string().min(1, {
    message: "Selecione a data da próxima revisão.",
  }),
  autores: z.string().min(3, {
    message: "Digite pelo menos um autor.",
  }),
  revisores: z.string().min(3, {
    message: "Digite pelo menos um revisor.",
  }),
  descricao: z.string().optional(),
});

type DocumentoFormValues = z.infer<typeof documentoFormSchema>;

export default function Documentacao() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [departamentoFilter, setDepartamentoFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: 1,
      nome: "Procedimento de Análise de Amostras",
      tipo: "Procedimento",
      codigo: "LAB-PROC-001",
      versao: "2.3",
      departamento: "Laboratório",
      status: "Vigente",
      dataCriacao: "2022-01-15",
      dataRevisao: "2023-04-22",
      proximaRevisao: "2024-04-22",
      autores: ["Ana Silva", "Carlos Mendes"],
      revisores: ["Maria Santos"],
      tamanho: "1.2 MB",
      formato: "PDF",
      descricao: "Procedimento padrão para análise de amostras no laboratório."
    },
    {
      id: 2,
      nome: "Manual da Qualidade",
      tipo: "Manual",
      codigo: "QUA-MAN-001",
      versao: "5.0",
      departamento: "Qualidade",
      status: "Vigente",
      dataCriacao: "2020-05-10",
      dataRevisao: "2023-05-10",
      proximaRevisao: "2024-05-10",
      autores: ["Roberto Alves"],
      revisores: ["Juliana Costa", "Fernando Lima"],
      tamanho: "4.5 MB",
      formato: "PDF",
      descricao: "Manual da Qualidade do laboratório, baseado na ISO 9001 e ISO 17025."
    },
    {
      id: 3,
      nome: "Instrução de Uso do HPLC",
      tipo: "Instrução de Trabalho",
      codigo: "LAB-IT-003",
      versao: "1.2",
      departamento: "Laboratório",
      status: "Em Revisão",
      dataCriacao: "2022-07-08",
      dataRevisao: "2023-02-15",
      proximaRevisao: "2023-08-15",
      autores: ["Marcos Santos"],
      revisores: ["Ana Silva"],
      tamanho: "2.3 MB",
      formato: "PDF",
      descricao: "Instrução detalhada para uso do equipamento HPLC."
    },
    {
      id: 4,
      nome: "Formulário de Recebimento de Amostras",
      tipo: "Formulário",
      codigo: "LAB-FORM-005",
      versao: "1.0",
      departamento: "Laboratório",
      status: "Vigente",
      dataCriacao: "2023-01-05",
      dataRevisao: "2023-01-05",
      proximaRevisao: "2024-01-05",
      autores: ["Juliana Costa"],
      revisores: ["Carlos Mendes", "Roberto Alves"],
      tamanho: "450 KB",
      formato: "DOCX",
      descricao: "Formulário para registro do recebimento de amostras no laboratório."
    },
    {
      id: 5,
      nome: "Política de Confidencialidade",
      tipo: "Política",
      codigo: "QUA-POL-002",
      versao: "3.1",
      departamento: "Qualidade",
      status: "Vigente",
      dataCriacao: "2021-03-20",
      dataRevisao: "2023-03-20",
      proximaRevisao: "2025-03-20",
      autores: ["Cláudia Ferreira", "Fernando Lima"],
      revisores: ["Roberto Alves"],
      tamanho: "780 KB",
      formato: "PDF",
      descricao: "Política de confidencialidade e sigilo das informações do laboratório."
    },
    {
      id: 6,
      nome: "Registro de Manutenção de Equipamentos",
      tipo: "Registro",
      codigo: "LAB-REG-008",
      versao: "2.0",
      departamento: "Laboratório",
      status: "Vigente",
      dataCriacao: "2022-05-12",
      dataRevisao: "2023-05-12",
      proximaRevisao: "2024-05-12",
      autores: ["Marcos Santos"],
      revisores: ["Ana Silva", "Carlos Mendes"],
      tamanho: "550 KB",
      formato: "XLSX",
      descricao: "Planilha para registro de manutenções preventivas e corretivas dos equipamentos."
    },
    {
      id: 7,
      nome: "SOP para Validação de Métodos",
      tipo: "SOP",
      codigo: "LAB-SOP-012",
      versao: "1.5",
      departamento: "Laboratório",
      status: "Obsoleto",
      dataCriacao: "2021-08-30",
      dataRevisao: "2022-08-30",
      proximaRevisao: "2023-08-30",
      autores: ["Ana Silva", "Roberto Alves"],
      revisores: ["Fernando Lima"],
      tamanho: "1.8 MB",
      formato: "PDF",
      descricao: "Procedimento operacional padrão para validação de métodos analíticos."
    },
    {
      id: 8,
      nome: "Novo Procedimento de Calibração",
      tipo: "Procedimento",
      codigo: "LAB-PROC-015",
      versao: "0.9",
      departamento: "Laboratório",
      status: "Rascunho",
      dataCriacao: "2023-07-01",
      dataRevisao: "2023-07-01",
      proximaRevisao: "2024-07-01",
      autores: ["Carlos Mendes"],
      revisores: [],
      tamanho: "950 KB",
      formato: "DOCX",
      descricao: "Novo procedimento de calibração de instrumentos analíticos."
    },
  ]);

  // Formulário para novo documento
  const form = useForm<DocumentoFormValues>({
    resolver: zodResolver(documentoFormSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      codigo: '',
      versao: '1.0',
      departamento: '',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataRevisao: new Date().toISOString().split('T')[0],
      proximaRevisao: '',
      autores: '',
      revisores: '',
      descricao: '',
    },
  });

  // Funções para lidar com a adição de novo documento
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (data: DocumentoFormValues) => {
    // Criar novo documento
    const novoDocumento: Documento = {
      id: Math.max(...documentos.map(d => d.id), 0) + 1,
      nome: data.nome,
      tipo: data.tipo as any,
      codigo: data.codigo,
      versao: data.versao,
      departamento: data.departamento,
      status: 'Rascunho',
      dataCriacao: data.dataCriacao,
      dataRevisao: data.dataRevisao,
      proximaRevisao: data.proximaRevisao,
      autores: data.autores.split(',').map(a => a.trim()),
      revisores: data.revisores.split(',').map(r => r.trim()),
      descricao: data.descricao,
      formato: 'DOCX',
      tamanho: '0 KB',
    };

    // Adicionar à lista
    setDocumentos([...documentos, novoDocumento]);
    
    // Fechar diálogo e limpar formulário
    setIsDialogOpen(false);
    form.reset();

    // Mostrar notificação
    toast({
      title: "Documento criado",
      description: `O documento ${data.nome} foi criado com sucesso.`,
    });
  };

  // Filtragem de documentos
  const documentosFiltrados = documentos.filter(doc => {
    // Filtro de busca por texto
    const matchesSearch = 
      searchQuery === '' || 
      doc.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de tipo
    const matchesTipo = 
      tipoFilter === null || 
      doc.tipo === tipoFilter;
    
    // Filtro de departamento
    const matchesDepartamento = 
      departamentoFilter === null || 
      doc.departamento === departamentoFilter;
    
    // Filtro de status
    const matchesStatus = 
      statusFilter === null || 
      doc.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesDepartamento && matchesStatus;
  });

  // Listas de valores únicos para filtros
  const tiposUnicos = Array.from(new Set(documentos.map(doc => doc.tipo)));
  const departamentosUnicos = Array.from(new Set(documentos.map(doc => doc.departamento)));
  const statusUnicos = Array.from(new Set(documentos.map(doc => doc.status)));

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
      case 'Vigente':
        return 'bg-green-100 text-green-800';
      case 'Em Revisão':
        return 'bg-amber-100 text-amber-800';
      case 'Obsoleto':
        return 'bg-red-100 text-red-800';
      case 'Rascunho':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para escolher o ícone com base no formato do arquivo
  const getFileIcon = (formato?: string) => {
    switch (formato?.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Verificar documentos que precisam de revisão (30 dias)
  const documentosParaRevisao = documentos.filter(doc => {
    if (doc.status === 'Vigente') {
      const dataProximaRevisao = new Date(doc.proximaRevisao);
      const hoje = new Date();
      const diferencaDias = Math.floor((dataProximaRevisao.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
      return diferencaDias <= 30 && diferencaDias > 0;
    }
    return false;
  });

  // Contagem de status para resumo
  const statusCounts = {
    vigentes: documentos.filter(doc => doc.status === 'Vigente').length,
    emRevisao: documentos.filter(doc => doc.status === 'Em Revisão').length,
    obsoletos: documentos.filter(doc => doc.status === 'Obsoleto').length,
    rascunhos: documentos.filter(doc => doc.status === 'Rascunho').length,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">
            Documentação
          </h1>
          <p className="text-gray-600">
            Gerenciamento de documentos do sistema de qualidade
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Documento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do novo documento.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Documento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Procedimento de Análise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SOP">SOP</SelectItem>
                            <SelectItem value="Procedimento">Procedimento</SelectItem>
                            <SelectItem value="Formulário">Formulário</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Política">Política</SelectItem>
                            <SelectItem value="Instrução de Trabalho">Instrução de Trabalho</SelectItem>
                            <SelectItem value="Registro">Registro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: LAB-PROC-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="versao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versão</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="departamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Qualidade">Qualidade</SelectItem>
                            <SelectItem value="Laboratório">Laboratório</SelectItem>
                            <SelectItem value="Administrativo">Administrativo</SelectItem>
                            <SelectItem value="RH">RH</SelectItem>
                            <SelectItem value="Operações">Operações</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataCriacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Criação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataRevisao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Revisão</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="autores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autores</FormLabel>
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
                    name="revisores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revisores</FormLabel>
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
                            placeholder="Descrição do documento" 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Criar Documento</Button>
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
            <div className="bg-green-100 p-2 rounded-full mb-2">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Vigentes</h3>
            <div className="text-3xl font-bold">{statusCounts.vigentes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-amber-100 p-2 rounded-full mb-2">
              <FileEdit className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Em Revisão</h3>
            <div className="text-3xl font-bold">{statusCounts.emRevisao}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-red-100 p-2 rounded-full mb-2">
              <Archive className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Obsoletos</h3>
            <div className="text-3xl font-bold">{statusCounts.obsoletos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
              <Pencil className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Rascunhos</h3>
            <div className="text-3xl font-bold">{statusCounts.rascunhos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de documentos para revisão */}
      {documentosParaRevisao.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <CardTitle className="text-amber-800 text-lg">Documentos a Serem Revisados</CardTitle>
                <CardDescription className="text-amber-700">
                  Os seguintes documentos precisam ser revisados nos próximos 30 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documentosParaRevisao.map(doc => (
                <li key={doc.id} className="flex justify-between items-center">
                  <span className="font-medium">{doc.nome}</span>
                  <span className="text-amber-700">Revisão até: {formatDate(doc.proximaRevisao)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-100">
              Agendar Revisões
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="todos" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="por-tipo">Por Tipo</TabsTrigger>
            <TabsTrigger value="por-dpto">Por Departamento</TabsTrigger>
          </TabsList>
          
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
            <Select onValueChange={(value) => setDepartamentoFilter(value || null)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {departamentosUnicos.map(dpto => (
                  <SelectItem key={dpto} value={dpto}>{dpto}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="todos" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revisão</TableHead>
                    <TableHead>Próxima Revisão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                        Nenhum documento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    documentosFiltrados.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {getFileIcon(doc.formato)}
                        </TableCell>
                        <TableCell className="font-medium">{doc.nome}</TableCell>
                        <TableCell>{doc.codigo}</TableCell>
                        <TableCell>{doc.versao}</TableCell>
                        <TableCell>{doc.departamento}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(doc.dataRevisao)}</TableCell>
                        <TableCell>{formatDate(doc.proximaRevisao)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Compartilhar">
                              <Share2 className="h-4 w-4" />
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
        </TabsContent>
        
        <TabsContent value="por-tipo" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposUnicos.map(tipo => (
              <Card key={tipo} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{tipo}</CardTitle>
                    <Badge>
                      {documentos.filter(d => d.tipo === tipo).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[220px]">
                    <ul className="p-4 space-y-2">
                      {documentos
                        .filter(d => d.tipo === tipo)
                        .map(doc => (
                          <li key={doc.id} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center">
                              {getFileIcon(doc.formato)}
                              <span className="ml-2">{doc.nome}</span>
                            </div>
                            <Badge className={getStatusBadgeClass(doc.status)}>
                              {doc.status}
                            </Badge>
                          </li>
                        ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="bg-gray-50 p-2 flex justify-end">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="por-dpto" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departamentosUnicos.map(dpto => (
              <Card key={dpto} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Departamento: {dpto}</CardTitle>
                    <Badge>
                      {documentos.filter(d => d.departamento === dpto).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[250px]">
                    <ul className="p-4 space-y-2">
                      {documentos
                        .filter(d => d.departamento === dpto)
                        .map(doc => (
                          <li key={doc.id} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              {getFileIcon(doc.formato)}
                              <div>
                                <p className="font-medium">{doc.nome}</p>
                                <p className="text-xs text-gray-500">{doc.codigo} • v{doc.versao}</p>
                              </div>
                            </div>
                            <Badge className={getStatusBadgeClass(doc.status)}>
                              {doc.status}
                            </Badge>
                          </li>
                        ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="bg-gray-50 p-2 flex justify-between">
                  <span className="text-sm text-gray-500">Última atualização: {
                    formatDate(
                      documentos
                        .filter(d => d.departamento === dpto)
                        .sort((a, b) => new Date(b.dataRevisao).getTime() - new Date(a.dataRevisao).getTime())[0]?.dataRevisao
                    )
                  }</span>
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}