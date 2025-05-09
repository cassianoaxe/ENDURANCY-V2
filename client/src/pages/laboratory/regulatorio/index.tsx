import React, { useState } from 'react';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ScrollText,
  FileText,
  Download,
  ExternalLink,
  Search,
  Plus,
  Filter,
  FileUp,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  Book,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define o esquema de validação para o formulário
const documentSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  code: z.string().min(2, { message: 'O código deve ter pelo menos 2 caracteres' }),
  documentType: z.string().min(1, { message: 'Selecione um tipo de documento' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  publishedDate: z.string().min(1, { message: 'Selecione uma data de publicação' }),
  status: z.string().min(1, { message: 'Selecione um status' }),
  link: z.string().url({ message: 'Insira uma URL válida' }).optional().or(z.literal('')),
});

// Tipos baseados no esquema
type DocumentFormValues = z.infer<typeof documentSchema>;

// Dados iniciais de exemplo de documentos regulatórios
const initialDocuments = [
  {
    id: 1,
    title: 'Boas Práticas de Fabricação e Peticionamento de AFE/AE',
    code: 'RDC 16/2014',
    documentType: 'Resolução',
    description: 'Dispõe sobre os requisitos de Boas Práticas de Fabricação para concessão de Autorização de Funcionamento (AFE) e Autorização Especial (AE).',
    publishedDate: '2014-03-28',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2014/publicada-rdc-que-atualiza-normas-de-funcionamento-de-empresas-de-medicamentos',
    file: 'rdc16_2014.pdf',
  },
  {
    id: 2,
    title: 'Boas Práticas de Fabricação de Medicamentos',
    code: 'RDC 658/2022',
    documentType: 'Resolução',
    description: 'Dispõe sobre as Boas Práticas de Fabricação de Medicamentos.',
    publishedDate: '2022-03-30',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/rdc-658-atualiza-boas-praticas-de-fabricacao-de-medicamentos',
    file: 'rdc658_2022.pdf',
  },
  {
    id: 3,
    title: 'Boas Práticas de Fabricação de Insumos Farmacêuticos Ativos',
    code: 'RDC 654/2022',
    documentType: 'Resolução',
    description: 'Dispõe sobre as Boas Práticas de Fabricação de Insumos Farmacêuticos Ativos, incluindo extratos de Cannabis.',
    publishedDate: '2022-03-24',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/rdc-654-atualizacao-das-bpf-de-insumos-farmaceuticos-ativos',
    file: 'rdc654_2022.pdf',
  },
  {
    id: 4, 
    title: 'Terceirização de Etapas de Produção e Controle de Qualidade',
    code: 'RDC 234/2018',
    documentType: 'Resolução',
    description: 'Dispõe sobre a terceirização de etapas de produção, de análises de controle de qualidade, de transporte e de armazenamento de medicamentos e produtos biológicos.',
    publishedDate: '2018-06-20',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2018/anvisa-aprova-norma-de-terceirizacao-de-etapas-de-producao',
    file: 'rdc234_2018.pdf',
  },
  {
    id: 5,
    title: 'Registro de Medicamentos Fitoterápicos',
    code: 'RDC 26/2014',
    documentType: 'Resolução',
    description: 'Dispõe sobre o registro de medicamentos fitoterápicos e o registro e a notificação de produtos tradicionais fitoterápicos.',
    publishedDate: '2014-05-13',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2014/anvisa-atualiza-norma-sobre-fitoterapicos',
    file: 'rdc26_2014.pdf',
  },
  {
    id: 6,
    title: 'Boas Práticas de Distribuição e Armazenamento',
    code: 'RDC 430/2020',
    documentType: 'Resolução',
    description: 'Dispõe sobre as Boas Práticas de Distribuição, Armazenagem e de Transporte de Medicamentos.',
    publishedDate: '2020-10-08',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2020/publicada-norma-sobre-distribuicao-armazenagem-e-transporte-de-medicamentos',
    file: 'rdc430_2020.pdf',
  },
  {
    id: 7,
    title: 'Validação de Métodos Analíticos',
    code: 'RDC 166/2017',
    documentType: 'Resolução',
    description: 'Dispõe sobre a validação de métodos analíticos e dá outras providências.',
    publishedDate: '2017-07-24',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2017/publicada-rdc-sobre-validacao-de-metodos-analiticos',
    file: 'rdc166_2017.pdf',
  },
  {
    id: 8,
    title: 'Farmacopeia Brasileira 7ª Edição',
    code: 'FB 7ª Ed (2024)',
    documentType: 'Farmacopeia',
    description: 'Código oficial farmacêutico do país, onde são estabelecidos os requisitos mínimos de qualidade para fármacos, medicamentos e insumos.',
    publishedDate: '2024-02-15',
    status: 'Vigente',
    link: 'https://www.gov.br/anvisa/pt-br/assuntos/farmacopeia',
    file: 'farmacopeia_brasileira_7ed.pdf',
  },
  {
    id: 9,
    title: 'Farmacopeia Alemã',
    code: 'DAB',
    documentType: 'Farmacopeia',
    description: 'Deutsches Arzneibuch - Farmacopeia alemã contendo padrões de qualidade para substâncias farmacêuticas.',
    publishedDate: '2023-01-01',
    status: 'Vigente',
    link: 'https://www.abda.de/fuer-apotheker/arzneimittelkommission/publikationen/dab-darf/',
    file: 'deutsche_arzneibuch.pdf',
  },
];

export default function RegulatoryDocuments() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState(initialDocuments);
  const [documentFilter, setDocumentFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [documentViewId, setDocumentViewId] = useState<number | null>(null);
  const [documentEditId, setDocumentEditId] = useState<number | null>(null);
  
  // Inicializar formulário
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      code: '',
      documentType: '',
      description: '',
      publishedDate: '',
      status: 'Vigente',
      link: '',
    },
  });
  
  // Reiniciar formulário para adição
  const resetForm = () => {
    form.reset({
      title: '',
      code: '',
      documentType: '',
      description: '',
      publishedDate: '',
      status: 'Vigente',
      link: '',
    });
  };
  
  // Carregar dados para edição
  const loadDocumentForEdit = (id: number) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      form.reset({
        title: document.title,
        code: document.code,
        documentType: document.documentType,
        description: document.description,
        publishedDate: document.publishedDate,
        status: document.status,
        link: document.link || '',
      });
      setDocumentEditId(id);
      setIsAddDialogOpen(true);
    }
  };
  
  // Documento sendo visualizado
  const viewingDocument = documents.find(doc => doc.id === documentViewId);
  
  // Manipular envio do formulário
  const onSubmit = (data: DocumentFormValues) => {
    if (documentEditId) {
      // Editar documento existente
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === documentEditId 
            ? { 
                ...doc, 
                ...data, 
                link: data.link || '', // Garantir que o link nunca seja undefined
                file: doc.file // Manter o arquivo existente
              } 
            : doc
        )
      );
      
      toast({
        title: "Documento atualizado",
        description: `${data.code} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo documento
      const newDocument = {
        id: documents.length > 0 ? Math.max(...documents.map(doc => doc.id)) + 1 : 1,
        ...data,
        link: data.link || '', // Garantir que o link nunca seja undefined
        file: `documento_${data.code.replace(/\//g, '_').toLowerCase()}.pdf`,
      };
      
      setDocuments([...documents, newDocument]);
      
      toast({
        title: "Documento adicionado",
        description: `${data.code} foi adicionado ao sistema.`,
      });
    }
    
    setIsAddDialogOpen(false);
    setDocumentEditId(null);
    resetForm();
  };
  
  // Excluir documento
  const deleteDocument = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      setDocuments(docs => docs.filter(doc => doc.id !== id));
      
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso.",
        variant: "destructive",
      });
    }
  };
  
  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesDocType = documentFilter === 'todos' ? true : doc.documentType === documentFilter;
    const matchesStatus = statusFilter === 'todos' ? true : doc.status === statusFilter;
    const matchesSearch = searchTerm 
      ? doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesDocType && matchesStatus && matchesSearch;
  });
  
  // Simular upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Arquivo carregado",
        description: `${files[0].name} selecionado para upload.`,
      });
    }
  };
  
  // Documento types disponíveis
  const documentTypes = [
    { value: 'Resolução', label: 'RDC - Resolução da Diretoria Colegiada' },
    { value: 'Farmacopeia', label: 'Farmacopeia' },
    { value: 'Guia', label: 'Guia de Orientação' },
    { value: 'Manual', label: 'Manual' },
    { value: 'Norma', label: 'Norma Técnica' },
    { value: 'Instrução', label: 'Instrução Normativa' },
  ];
  
  // Status disponíveis
  const statusOptions = [
    { value: 'Vigente', label: 'Vigente' },
    { value: 'Revogada', label: 'Revogada' },
    { value: 'Em Consulta', label: 'Em Consulta Pública' },
    { value: 'Suspensa', label: 'Suspensa Temporariamente' },
  ];

  return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">
              Base de Documentos Regulatórios
            </h1>
            <p className="text-gray-600">
              Gerencie e acesse todos os documentos regulatórios relevantes para o laboratório
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                  resetForm();
                  setDocumentEditId(null);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{documentEditId ? 'Editar Documento' : 'Adicionar Novo Documento'}</DialogTitle>
                  <DialogDescription>
                    {documentEditId 
                      ? 'Atualize as informações do documento regulatório'
                      : 'Preencha o formulário para adicionar um novo documento regulatório ao sistema'}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do Documento</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Boas Práticas de Fabricação" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código/Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: RDC 16/2014" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Documento</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {documentTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="publishedDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Publicação</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map(status => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link Externo</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              URL para o documento oficial, se disponível.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve descrição ou resumo do documento..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t pt-4">
                      <Label htmlFor="document-file" className="block mb-2">Anexar Documento (PDF)</Label>
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor="document-file" 
                          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          <FileUp className="h-4 w-4 mr-2" />
                          Selecionar PDF
                        </label>
                        <input 
                          id="document-file" 
                          type="file" 
                          accept=".pdf"
                          className="hidden" 
                          onChange={handleFileUpload}
                        />
                        <span className="text-sm text-gray-500">
                          Anexe o PDF oficial do documento
                        </span>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setDocumentEditId(null);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {documentEditId ? 'Atualizar Documento' : 'Adicionar Documento'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Dialog para visualizar documento */}
            <Dialog open={documentViewId !== null} onOpenChange={() => setDocumentViewId(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {viewingDocument && (
                  <>
                    <DialogHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <DialogTitle className="text-xl">{viewingDocument.code}</DialogTitle>
                          <DialogDescription className="text-base font-medium">
                            {viewingDocument.title}
                          </DialogDescription>
                        </div>
                        <Badge variant="outline" className={
                          viewingDocument.status === 'Vigente' 
                            ? 'border-green-300 text-green-700' 
                            : viewingDocument.status === 'Revogada'
                            ? 'border-red-300 text-red-700'
                            : 'border-yellow-300 text-yellow-700'
                        }>
                          {viewingDocument.status}
                        </Badge>
                      </div>
                    </DialogHeader>
                    
                    <Tabs defaultValue="detalhes" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                        <TabsTrigger value="documento">Documento PDF</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="detalhes" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Tipo de Documento</h3>
                            <p>{viewingDocument.documentType}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Data de Publicação</h3>
                            <p>{new Date(viewingDocument.publishedDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                          <p className="text-gray-700 mt-1">{viewingDocument.description}</p>
                        </div>
                        
                        {viewingDocument.link && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Link Externo</h3>
                            <a 
                              href={viewingDocument.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center mt-1"
                            >
                              {viewingDocument.link}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex gap-2">
                            {viewingDocument.code === 'RDC 16/2014' ? (
                              <>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => window.location.href = '/laboratory/regulatorio/rdc-16-2014'}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Página Completa
                                </Button>
                                <Button variant="outline">
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar PDF
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="outline">
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar PDF
                                </Button>
                                <Button variant="outline" onClick={() => loadDocumentForEdit(viewingDocument.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="documento" className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-md text-center min-h-[400px] flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                            <h3 className="font-medium">Visualização do PDF não disponível</h3>
                            <p className="text-gray-500 mt-2">Por favor, faça o download do documento para visualizá-lo.</p>
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar {viewingDocument.file}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 min-w-[400px]">
                <Select value={documentFilter} onValueChange={setDocumentFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Tipo de documento" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de documentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Documentos Regulatórios</CardTitle>
            <CardDescription>
              {filteredDocuments.length} documento(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[50px]">Tipo</TableHead>
                    <TableHead className="w-[150px]">Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="w-[120px]">Publicação</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {doc.documentType === 'Resolução' ? (
                            <ScrollText className="h-5 w-5 text-blue-600" />
                          ) : doc.documentType === 'Farmacopeia' ? (
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          ) : doc.documentType === 'Guia' ? (
                            <FileText className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Book className="h-5 w-5 text-blue-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{doc.code}</TableCell>
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>{new Date(doc.publishedDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            doc.status === 'Vigente' 
                              ? 'border-green-300 text-green-700' 
                              : doc.status === 'Revogada'
                              ? 'border-red-300 text-red-700'
                              : 'border-yellow-300 text-yellow-700'
                          }>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Verificar se é o documento RDC 16/2014 para ir para página específica
                              if (doc.code === 'RDC 16/2014') {
                                window.location.href = '/laboratory/regulatorio/rdc-16-2014';
                              } else {
                                setDocumentViewId(doc.id);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => loadDocumentForEdit(doc.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhum documento encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
          </CardFooter>
        </Card>
      </div>
  );
}