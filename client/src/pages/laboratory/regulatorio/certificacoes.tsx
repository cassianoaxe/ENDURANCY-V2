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
  Award, 
  Calendar, 
  Check, 
  Clock, 
  Download, 
  Eye, 
  FileCheck, 
  FilePlus, 
  Filter, 
  Info, 
  Plus, 
  Search,
  Settings, 
  Upload 
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

// Definição de tipos para certificações
interface Certificacao {
  id: number;
  nome: string;
  tipo: string;
  emissor: string;
  status: 'Válido' | 'Expirado' | 'Em Renovação' | 'Pendente';
  dataEmissao: string;
  dataExpiracao: string;
  responsavel: string;
  observacoes?: string;
  documentos?: {
    id: number;
    nome: string;
    tipo: string;
    dataUpload: string;
    tamanho: string;
  }[];
}

// Schema para o formulário de nova certificação
const certificacaoFormSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  tipo: z.string().min(1, {
    message: "Selecione um tipo de certificação.",
  }),
  emissor: z.string().min(3, {
    message: "O nome do emissor deve ter pelo menos 3 caracteres.",
  }),
  dataEmissao: z.string().min(1, {
    message: "Selecione a data de emissão.",
  }),
  dataExpiracao: z.string().min(1, {
    message: "Selecione a data de expiração.",
  }),
  responsavel: z.string().min(3, {
    message: "O nome do responsável deve ter pelo menos 3 caracteres.",
  }),
  observacoes: z.string().optional(),
  enviarNotificacao: z.boolean().default(false),
});

type CertificacaoFormValues = z.infer<typeof certificacaoFormSchema>;

export default function Certificacoes() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [certificacoes, setCertificacoes] = useState<Certificacao[]>([
    {
      id: 1,
      nome: "ISO 9001:2015",
      tipo: "Gestão da Qualidade",
      emissor: "Bureau Veritas",
      status: "Válido",
      dataEmissao: "2023-05-15",
      dataExpiracao: "2026-05-14",
      responsavel: "Ana Silva",
      observacoes: "Certificação do Sistema de Gestão da Qualidade do laboratório.",
      documentos: [
        {
          id: 101,
          nome: "Certificado ISO 9001-2023.pdf",
          tipo: "PDF",
          dataUpload: "2023-05-20",
          tamanho: "2.4 MB"
        },
        {
          id: 102,
          nome: "Relatório de Auditoria ISO 9001.pdf",
          tipo: "PDF",
          dataUpload: "2023-05-18",
          tamanho: "5.8 MB"
        }
      ]
    },
    {
      id: 2,
      nome: "ISO/IEC 17025:2017",
      tipo: "Competência Técnica",
      emissor: "INMETRO",
      status: "Válido",
      dataEmissao: "2022-11-10",
      dataExpiracao: "2025-11-09",
      responsavel: "Carlos Mendes",
      observacoes: "Acreditação para ensaios químicos e microbiológicos específicos.",
      documentos: [
        {
          id: 201,
          nome: "Certificado Acreditação INMETRO.pdf",
          tipo: "PDF",
          dataUpload: "2022-11-15",
          tamanho: "3.1 MB"
        }
      ]
    },
    {
      id: 3,
      nome: "ISO 14001:2015",
      tipo: "Gestão Ambiental",
      emissor: "SGS",
      status: "Em Renovação",
      dataEmissao: "2020-07-22",
      dataExpiracao: "2023-07-21",
      responsavel: "Marcos Santos",
      observacoes: "Processo de renovação iniciado em 01/06/2023.",
      documentos: [
        {
          id: 301,
          nome: "Certificado ISO 14001.pdf",
          tipo: "PDF",
          dataUpload: "2020-07-25",
          tamanho: "1.8 MB"
        },
        {
          id: 302,
          nome: "Formulário de Renovação.pdf",
          tipo: "PDF",
          dataUpload: "2023-06-05",
          tamanho: "0.9 MB"
        }
      ]
    },
    {
      id: 4,
      nome: "Licença de Operação Ambiental",
      tipo: "Licença",
      emissor: "Órgão Ambiental Estadual",
      status: "Válido",
      dataEmissao: "2021-09-30",
      dataExpiracao: "2024-09-29",
      responsavel: "Juliana Costa",
      observacoes: "Licença para operação do laboratório conforme legislação ambiental."
    },
    {
      id: 5,
      nome: "Certificação de Boas Práticas",
      tipo: "BPL",
      emissor: "ANVISA",
      status: "Expirado",
      dataEmissao: "2020-03-15",
      dataExpiracao: "2022-03-14",
      responsavel: "Roberto Alves",
      observacoes: "Requer renovação urgente. Processo de inspeção agendado."
    },
    {
      id: 6,
      nome: "ISO 15189:2022",
      tipo: "Laboratórios Clínicos",
      emissor: "TÜV Rheinland",
      status: "Pendente",
      dataEmissao: "2023-08-10",
      dataExpiracao: "2026-08-09",
      responsavel: "Cláudia Ferreira",
      observacoes: "Documentação enviada, aguardando auditoria final."
    },
  ]);

  // Formulário para nova certificação
  const form = useForm<CertificacaoFormValues>({
    resolver: zodResolver(certificacaoFormSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      emissor: '',
      dataEmissao: '',
      dataExpiracao: '',
      responsavel: '',
      observacoes: '',
      enviarNotificacao: false,
    },
  });

  // Funções para lidar com a adição de nova certificação
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (data: CertificacaoFormValues) => {
    // Criar nova certificação
    const novaCertificacao: Certificacao = {
      id: Math.max(...certificacoes.map(c => c.id), 0) + 1,
      nome: data.nome,
      tipo: data.tipo,
      emissor: data.emissor,
      status: 'Válido',
      dataEmissao: data.dataEmissao,
      dataExpiracao: data.dataExpiracao,
      responsavel: data.responsavel,
      observacoes: data.observacoes,
    };

    // Adicionar à lista
    setCertificacoes([...certificacoes, novaCertificacao]);
    
    // Fechar diálogo e limpar formulário
    setIsDialogOpen(false);
    form.reset();

    // Mostrar notificação
    toast({
      title: "Certificação adicionada",
      description: `A certificação ${data.nome} foi adicionada com sucesso.`,
    });

    // Se a opção de notificação estiver marcada
    if (data.enviarNotificacao) {
      toast({
        title: "Notificação enviada",
        description: `Uma notificação foi enviada ao responsável: ${data.responsavel}.`,
      });
    }
  };

  // Filtragem de certificações
  const certificacoesFiltradas = certificacoes.filter(cert => {
    // Filtro de busca por texto
    const matchesSearch = 
      searchQuery === '' || 
      cert.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.emissor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.responsavel.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    const matchesStatus = 
      statusFilter === null || 
      statusFilter === 'todos' || 
      cert.status === statusFilter;
    
    // Filtro de tipo
    const matchesTipo = 
      tipoFilter === null || 
      tipoFilter === 'todos' || 
      cert.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Lista de tipos únicos para o filtro
  const tiposUnicos = Array.from(new Set(certificacoes.map(cert => cert.tipo)));

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
      case 'Válido':
        return 'bg-green-100 text-green-800';
      case 'Expirado':
        return 'bg-red-100 text-red-800';
      case 'Em Renovação':
        return 'bg-amber-100 text-amber-800';
      case 'Pendente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar certificações próximas da expiração (90 dias)
  const certificacoesProximasExpiracao = certificacoes.filter(cert => {
    if (cert.status === 'Válido') {
      const dataExpiracao = new Date(cert.dataExpiracao);
      const hoje = new Date();
      const diferencaDias = Math.floor((dataExpiracao.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
      return diferencaDias <= 90 && diferencaDias > 0;
    }
    return false;
  });

  // Contagem de status para resumo
  const statusCounts = {
    validas: certificacoes.filter(c => c.status === 'Válido').length,
    emRenovacao: certificacoes.filter(c => c.status === 'Em Renovação').length,
    expiradas: certificacoes.filter(c => c.status === 'Expirado').length,
    pendentes: certificacoes.filter(c => c.status === 'Pendente').length,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">
            Certificações
          </h1>
          <p className="text-gray-600">
            Gerenciamento de certificações e acreditações do laboratório
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar certificações..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Certificação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Certificação</DialogTitle>
                <DialogDescription>
                  Preencha os dados da certificação ou acreditação.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Certificação</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ISO 9001:2015" {...field} />
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
                            <SelectItem value="Gestão da Qualidade">Gestão da Qualidade</SelectItem>
                            <SelectItem value="Competência Técnica">Competência Técnica</SelectItem>
                            <SelectItem value="Gestão Ambiental">Gestão Ambiental</SelectItem>
                            <SelectItem value="Licença">Licença</SelectItem>
                            <SelectItem value="BPL">Boas Práticas de Laboratório</SelectItem>
                            <SelectItem value="Laboratórios Clínicos">Laboratórios Clínicos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emissor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emissor/Organismo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: INMETRO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataEmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Emissão</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataExpiracao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Expiração</FormLabel>
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
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações adicionais sobre a certificação" 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enviarNotificacao"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enviar notificação</FormLabel>
                          <FormDescription>
                            Notificar o responsável sobre esta certificação
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Adicionar Certificação</Button>
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
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Válidas</h3>
            <div className="text-3xl font-bold">{statusCounts.validas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-amber-100 p-2 rounded-full mb-2">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Em Renovação</h3>
            <div className="text-3xl font-bold">{statusCounts.emRenovacao}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-red-100 p-2 rounded-full mb-2">
              <Info className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Expiradas</h3>
            <div className="text-3xl font-bold">{statusCounts.expiradas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">Pendentes</h3>
            <div className="text-3xl font-bold">{statusCounts.pendentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de certificações próximas da expiração */}
      {certificacoesProximasExpiracao.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <CardTitle className="text-amber-800 text-lg">Certificações Próximas da Expiração</CardTitle>
                <CardDescription className="text-amber-700">
                  As seguintes certificações expiram nos próximos 90 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {certificacoesProximasExpiracao.map(cert => (
                <li key={cert.id} className="flex justify-between items-center">
                  <span className="font-medium">{cert.nome}</span>
                  <span className="text-amber-700">Expira em: {formatDate(cert.dataExpiracao)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-100">
              Programar Renovações
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="todas" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="validas">Válidas</TabsTrigger>
            <TabsTrigger value="em-renovacao">Em Renovação</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Válido">Válido</SelectItem>
                <SelectItem value="Expirado">Expirado</SelectItem>
                <SelectItem value="Em Renovação">Em Renovação</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setTipoFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposUnicos.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="todas">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificacoesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        Nenhuma certificação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificacoesFiltradas.map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.nome}</TableCell>
                        <TableCell>{cert.tipo}</TableCell>
                        <TableCell>{cert.emissor}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(cert.status)}>
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(cert.dataEmissao)}</TableCell>
                        <TableCell>{formatDate(cert.dataExpiracao)}</TableCell>
                        <TableCell>{cert.responsavel}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
        </TabsContent>
        
        <TabsContent value="validas">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificacoes
                    .filter(cert => cert.status === 'Válido')
                    .map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.nome}</TableCell>
                        <TableCell>{cert.tipo}</TableCell>
                        <TableCell>{cert.emissor}</TableCell>
                        <TableCell>{formatDate(cert.dataEmissao)}</TableCell>
                        <TableCell>{formatDate(cert.dataExpiracao)}</TableCell>
                        <TableCell>{cert.responsavel}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="em-renovacao">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificacoes
                    .filter(cert => cert.status === 'Em Renovação')
                    .map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.nome}</TableCell>
                        <TableCell>{cert.tipo}</TableCell>
                        <TableCell>{cert.emissor}</TableCell>
                        <TableCell>{formatDate(cert.dataExpiracao)}</TableCell>
                        <TableCell>{cert.responsavel}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{cert.observacoes}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end p-4">
              <Button>
                <FilePlus className="h-4 w-4 mr-2" />
                Upload de Documentos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiradas">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Emissor</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificacoes
                    .filter(cert => cert.status === 'Expirado')
                    .map(cert => (
                      <TableRow key={cert.id} className="bg-red-50">
                        <TableCell className="font-medium">{cert.nome}</TableCell>
                        <TableCell>{cert.tipo}</TableCell>
                        <TableCell>{cert.emissor}</TableCell>
                        <TableCell className="text-red-600">{formatDate(cert.dataExpiracao)}</TableCell>
                        <TableCell>{cert.responsavel}</TableCell>
                        <TableCell className="text-right">
                          <Button>
                            <Award className="h-4 w-4 mr-2" />
                            Iniciar Renovação
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}