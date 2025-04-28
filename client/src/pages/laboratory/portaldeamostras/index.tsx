import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertCircle, 
  FileText, 
  FlaskConical, 
  Search, 
  Truck, 
  FileUp, 
  Package, 
  Filter, 
  Clock,
  Download,
  ExternalLink,
  MailCheck,
  RotateCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDate } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Schema de validação para o formulário de solicitação de amostras
const sampleRequestSchema = z.object({
  companyName: z.string().min(3, { message: 'Nome da empresa é obrigatório (mínimo 3 caracteres)' }),
  contactName: z.string().min(3, { message: 'Nome do contato é obrigatório (mínimo 3 caracteres)' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido (mínimo 10 dígitos)' }),
  address: z.string().min(5, { message: 'Endereço é obrigatório (mínimo 5 caracteres)' }),
  sampleType: z.string().min(1, { message: 'Tipo de amostra é obrigatório' }),
  quantity: z.string().min(1, { message: 'Quantidade é obrigatória' }),
  analysisType: z.string().min(1, { message: 'Tipo de análise é obrigatório' }),
  description: z.string().min(10, { message: 'Descrição é obrigatória (mínimo 10 caracteres)' }),
  pickupNeeded: z.boolean().optional(),
  scheduledDate: z.string().optional(),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: 'Você precisa aceitar os termos e condições',
  }),
});

type SampleRequestValues = z.infer<typeof sampleRequestSchema>;

// Dados de exemplo para histórico de amostras
const sampleRequestsHistory = [
  {
    id: 'SR-2025-0127',
    date: '2025-04-20',
    company: 'Dall Solutions Ltda',
    sampleType: 'Canabidiol',
    analysisType: 'Potência e Pureza',
    status: 'em_transito',
    trackingCode: 'BR123456789',
    lastUpdate: '2025-04-21',
  },
  {
    id: 'SR-2025-0125',
    date: '2025-04-18',
    company: 'Dall Solutions Ltda',
    sampleType: 'Tintura',
    analysisType: 'Perfil de Terpenos',
    status: 'recebida',
    trackingCode: 'BR123456788',
    lastUpdate: '2025-04-19',
  },
  {
    id: 'SR-2025-0120',
    date: '2025-04-15',
    company: 'Dall Solutions Ltda',
    sampleType: 'Óleo',
    analysisType: 'Completa',
    status: 'em_analise',
    trackingCode: 'BR123456787',
    lastUpdate: '2025-04-17',
  },
  {
    id: 'SR-2025-0115',
    date: '2025-04-10',
    company: 'Dall Solutions Ltda',
    sampleType: 'Cânhamo',
    analysisType: 'Potência e Segurança',
    status: 'concluida',
    trackingCode: 'BR123456786',
    lastUpdate: '2025-04-15',
  },
  {
    id: 'SR-2025-0110',
    date: '2025-04-05',
    company: 'Dall Solutions Ltda',
    sampleType: 'Extrato',
    analysisType: 'Completa',
    status: 'concluida',
    trackingCode: 'BR123456785',
    lastUpdate: '2025-04-12',
  },
];

// Componente para mostrar o status com ícone e cor
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'solicitada':
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          <Clock className="h-3 w-3 mr-1" />
          Solicitada
        </Badge>
      );
    case 'em_transito':
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700">
          <Truck className="h-3 w-3 mr-1" />
          Em trânsito
        </Badge>
      );
    case 'recebida':
      return (
        <Badge variant="outline" className="border-indigo-300 text-indigo-700">
          <Package className="h-3 w-3 mr-1" />
          Recebida
        </Badge>
      );
    case 'em_analise':
      return (
        <Badge variant="outline" className="border-yellow-300 text-yellow-700">
          <FlaskConical className="h-3 w-3 mr-1" />
          Em análise
        </Badge>
      );
    case 'concluida':
      return (
        <Badge variant="outline" className="border-green-300 text-green-700">
          <FileText className="h-3 w-3 mr-1" />
          Concluída
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          {status}
        </Badge>
      );
  }
};

export default function PortalDeAmostras() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('solicitar');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleRequests, setSampleRequests] = useState<any[]>(sampleRequestsHistory); // Iniciar com dados de exemplo
  
  // Carregar amostras do servidor
  const loadSampleRequests = async () => {
    if (currentTab === 'historico') {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/laboratory/samples');
        if (response.data.success) {
          console.log("Amostras carregadas:", response.data.data);
          // Se houver dados reais, substituir os dados de exemplo
          if (response.data.data.length > 0) {
            setSampleRequests(response.data.data);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar amostras:", error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível obter os dados das amostras. Serão exibidos dados de exemplo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Carregar amostras quando a aba histórico for selecionada
  useEffect(() => {
    loadSampleRequests();
  }, [currentTab]);

  // Inicializar formulário com react-hook-form e validação zod
  const form = useForm<SampleRequestValues>({
    resolver: zodResolver(sampleRequestSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      sampleType: '',
      quantity: '',
      analysisType: '',
      description: '',
      pickupNeeded: false,
      scheduledDate: '',
      termsAccepted: false,
    },
  });

  // Função para enviar o formulário
  const onSubmit = async (values: SampleRequestValues) => {
    setIsSubmitting(true);
    
    try {
      // Converter dados do formulário para o formato esperado pela API
      const requestData = {
        companyName: values.companyName,
        contactName: values.contactName,
        email: values.email,
        phone: values.phone,
        sampleType: values.sampleType,
        analysisType: values.analysisType,
        sampleQuantity: parseInt(values.quantity) || 1,
        samplePreservation: "",
        observations: values.description,
        priority: values.pickupNeeded ? "urgente" : "normal",
        needsCollection: values.pickupNeeded,
        address: {
          street: values.address,
          city: "",
          state: "",
          zipCode: ""
        }
      };
      
      // Enviar para a API
      const response = await axios.post('/api/laboratory/samples/request', requestData);
      
      console.log("Resposta da API:", response.data);
      
      if (response.data.success) {
        const { requestId } = response.data.data;
        
        toast({
          title: "Solicitação enviada com sucesso",
          description: `Sua solicitação #${requestId} foi registrada. Você receberá um email de confirmação em breve.`,
        });
        
        // Limpar formulário
        form.reset();
        
        // Mostrar mensagem de sucesso
        setSuccessMessage(
          `Sua solicitação de análise #${requestId} foi enviada com sucesso. Um email de confirmação foi enviado para ${values.email}. Você pode acompanhar o status da sua solicitação na aba 'Histórico'.`
        );
        
        // Redirecionar para a aba de histórico após 3 segundos
        setTimeout(() => {
          setCurrentTab('historico');
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error("Falha ao registrar solicitação");
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      
      let errorMessage = "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
      
      // Verificar se é um erro do axios com resposta do servidor
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        errorMessage = responseData.message || errorMessage;
        
        // Se houver erros de validação
        if (responseData.errors) {
          errorMessage = "Há erros de validação no formulário. Verifique os campos e tente novamente.";
        }
      }
      
      toast({
        title: "Erro ao enviar solicitação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar amostras baseado no status e termo de busca
  const filteredSamples = sampleRequests.filter(sample => {
    // Adaptar os campos para compatibilidade com os dados reais da API
    const id = sample.id || '';
    const company = sample.company || sample.companyName || '';
    const sampleType = sample.sampleType || '';
    const analysisType = sample.analysisType || '';
    const status = sample.status || '';
    
    const matchesStatus = statusFilter ? status === statusFilter : true;
    const matchesSearch = searchTerm
      ? id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sampleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysisType.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  // Função para lidar com upload de documentos (simulada)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Arquivo carregado",
        description: `${files.length} arquivo(s) selecionado(s) para upload.`,
      });
    }
  };
  
  // Função para atualizar o status da amostra
  const updateSampleStatus = async (id: string, status: string, trackingCode?: string) => {
    try {
      const response = await axios.post(`/api/laboratory/samples/${id}/update-status`, { 
        status,
        trackingCode
      });
      
      if (response.data.success) {
        toast({
          title: "Status atualizado",
          description: `O status da amostra ${id} foi atualizado com sucesso.`,
        });
        
        // Recarregar as amostras
        loadSampleRequests();
      } else {
        throw new Error(response.data.message || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o status da amostra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <LaboratoryLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">
              Portal de Amostras
            </h1>
            <p className="text-gray-600">
              Solicite análises laboratoriais e acompanhe suas amostras
            </p>
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="solicitar" className="text-base">
              Solicitar Análise
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-base">
              Histórico de Amostras
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="solicitar" className="space-y-6">
            {successMessage && (
              <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
                <MailCheck className="h-5 w-5 text-green-600 mr-2" />
                <AlertTitle>Solicitação enviada!</AlertTitle>
                <AlertDescription>
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Análise Laboratorial</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo para enviar uma solicitação de análise de amostras.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-blue-800">Informações do Solicitante</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa/Entidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Razão social ou nome fantasia" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Contato</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email para Contato</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@exemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, número, complemento, cidade, estado e CEP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-blue-800">Informações da Amostra</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sampleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Amostra</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de amostra" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="oleo">Óleo</SelectItem>
                                    <SelectItem value="tintura">Tintura</SelectItem>
                                    <SelectItem value="extrato">Extrato</SelectItem>
                                    <SelectItem value="capsulas">Cápsulas</SelectItem>
                                    <SelectItem value="canabidiol">Canabidiol</SelectItem>
                                    <SelectItem value="canhamo">Cânhamo</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 5 frascos de 30ml" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="analysisType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Análise</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de análise" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="potencia">Potência (CBD/THC)</SelectItem>
                                    <SelectItem value="terpenos">Perfil de Terpenos</SelectItem>
                                    <SelectItem value="solventes">Solventes Residuais</SelectItem>
                                    <SelectItem value="metais">Metais Pesados</SelectItem>
                                    <SelectItem value="microbiologica">Análise Microbiológica</SelectItem>
                                    <SelectItem value="pesticidas">Pesticidas</SelectItem>
                                    <SelectItem value="completa">Análise Completa</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                            <FormLabel>Descrição Detalhada</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Forneça detalhes sobre a amostra, incluindo lote, data de fabricação, condições especiais, etc." 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="py-2">
                        <FormField
                          control={form.control}
                          name="pickupNeeded"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Coleta no local</FormLabel>
                                <FormDescription>
                                  Marque esta opção se precisar que nosso serviço de coleta retire a amostra em seu endereço.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {form.watch('pickupNeeded') && (
                        <FormField
                          control={form.control}
                          name="scheduledDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Preferencial para Coleta</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Anexar Documentos</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Anexe quaisquer documentos relevantes para a análise (opcional).
                        </p>
                        <div className="flex items-center gap-2">
                          <label 
                            htmlFor="file-upload" 
                            className="cursor-pointer inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            <FileUp className="h-4 w-4 mr-2" />
                            Anexar Arquivos
                          </label>
                          <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            onChange={handleFileUpload}
                          />
                          <span className="text-sm text-gray-500">
                            Formatos aceitos: PDF, JPG, PNG, DOCX (máx. 10MB)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Termos e Condições</FormLabel>
                              <FormDescription>
                                Aceito os <a href="#" className="text-blue-600 hover:underline">termos e condições</a> para análise de amostras, incluindo as políticas de privacidade e proteção de dados.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <RotateCw className="animate-spin h-4 w-4 mr-2" />
                            Enviando...
                          </>
                        ) : "Enviar Solicitação"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Instruções para Envio</CardTitle>
                <CardDescription>
                  Após o envio da solicitação, siga estas instruções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Preencha o formulário acima com todos os detalhes necessários.</li>
                  <li>Após a aprovação da solicitação, você receberá um email com instruções e etiquetas para envio.</li>
                  <li>Embale as amostras de acordo com as diretrizes de segurança específicas para o tipo de material.</li>
                  <li>Inclua o código da solicitação em todos os pacotes e documentação.</li>
                  <li>Envie para o endereço fornecido usando o método de transporte recomendado.</li>
                </ol>
                
                <h4 className="mt-4">Recomendações para embalagem:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use recipientes à prova de vazamento e resistentes a impactos.</li>
                  <li>Embale cada amostra separadamente e identifique claramente.</li>
                  <li>Para amostras sensíveis à temperatura, use embalagem térmica apropriada.</li>
                  <li>Mantenha uma cópia de toda a documentação enviada.</li>
                </ul>
                
                <p className="text-sm text-gray-600 mt-4">
                  Para mais informações sobre o preparo adequado de amostras, consulte nosso <a href="#" className="text-blue-600 hover:underline">guia completo</a> ou entre em contato com nossa equipe técnica pelo email <a href="mailto:amostras@laboratorio.com" className="text-blue-600 hover:underline">amostras@laboratorio.com</a>.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Solicitações</CardTitle>
                <CardDescription>
                  Acompanhe o status das suas solicitações de análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID, tipo ou empresa..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filtrar por status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="solicitada">Solicitada</SelectItem>
                        <SelectItem value="em_transito">Em trânsito</SelectItem>
                        <SelectItem value="recebida">Recebida</SelectItem>
                        <SelectItem value="em_analise">Em análise</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="hidden md:table-cell">Tipo de Amostra</TableHead>
                        <TableHead className="hidden md:table-cell">Análise</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Rastreamento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSamples.length > 0 ? (
                        filteredSamples.map((sample) => (
                          <TableRow key={sample.id}>
                            <TableCell className="font-medium">{sample.id}</TableCell>
                            <TableCell>{formatDate(new Date(sample.date))}</TableCell>
                            <TableCell className="hidden md:table-cell">{sample.sampleType}</TableCell>
                            <TableCell className="hidden md:table-cell">{sample.analysisType}</TableCell>
                            <TableCell>
                              <StatusBadge status={sample.status} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {sample.trackingCode ? (
                                <a
                                  href={`https://www.correios.com.br/rastreamento/${sample.trackingCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center"
                                >
                                  {sample.trackingCode}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <span className="text-gray-500">Não disponível</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  toast({
                                    title: "Detalhes da amostra",
                                    description: `Detalhes da solicitação ${sample.id} serão disponibilizados em breve.`,
                                  });
                                }}
                              >
                                Ver detalhes
                              </Button>
                              
                              {/* Botões de atualização de status (apenas mostrar em modo demonstração) */}
                              {sample.status === 'solicitada' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-blue-600"
                                  onClick={() => {
                                    const trackingCode = prompt("Informe o código de rastreamento:");
                                    if (trackingCode) {
                                      updateSampleStatus(sample.id, 'em_transito', trackingCode);
                                    }
                                  }}
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Em trânsito
                                </Button>
                              )}
                              
                              {sample.status === 'em_transito' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-indigo-600"
                                  onClick={() => updateSampleStatus(sample.id, 'recebida')}
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  Recebida
                                </Button>
                              )}
                              
                              {sample.status === 'recebida' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-yellow-600"
                                  onClick={() => updateSampleStatus(sample.id, 'em_analise')}
                                >
                                  <FlaskConical className="h-4 w-4 mr-1" />
                                  Em análise
                                </Button>
                              )}
                              
                              {sample.status === 'em_analise' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-green-600"
                                  onClick={() => updateSampleStatus(sample.id, 'concluida')}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Concluída
                                </Button>
                              )}
                              
                              {sample.status === 'concluida' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-green-600"
                                  onClick={() => {
                                    toast({
                                      title: "Laudo disponível",
                                      description: "O download do laudo será iniciado em breve.",
                                    });
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Laudo
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Nenhuma solicitação encontrada com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Processo de Análise</CardTitle>
                <CardDescription>
                  Entenda cada etapa do processo de análise de amostras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-100"></div>
                  
                  <div className="space-y-8 relative">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 z-10">
                        1
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800">Solicitação</h4>
                        <p className="text-gray-600">
                          Preenchimento do formulário de solicitação com todos os detalhes necessários.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 z-10">
                        2
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800">Envio da Amostra</h4>
                        <p className="text-gray-600">
                          Envio da amostra conforme instruções fornecidas, com etiqueta de rastreamento.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 z-10">
                        3
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800">Recebimento e Inspeção</h4>
                        <p className="text-gray-600">
                          Confirmação do recebimento e verificação inicial da amostra.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 z-10">
                        4
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800">Análise Laboratorial</h4>
                        <p className="text-gray-600">
                          Execução dos testes conforme o tipo de análise solicitada.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 z-10">
                        5
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-blue-800">Geração e Envio do Laudo</h4>
                        <p className="text-gray-600">
                          Emissão do laudo técnico com os resultados completos das análises.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                O prazo médio para conclusão do processo completo é de 7 a 10 dias úteis, variando conforme o tipo e complexidade da análise.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LaboratoryLayout>
  );
}