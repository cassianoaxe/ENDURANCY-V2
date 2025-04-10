import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { apiRequest } from '../../lib/queryClient';
import { queryClient } from '../../lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Settings, Receipt, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Esquema de validação para configuração fiscal
const fiscalConfigSchema = z.object({
  organizationId: z.number(),
  printerModel: z.string().min(2, 'O modelo da impressora é obrigatório'),
  printerPort: z.string().min(1, 'A porta da impressora é obrigatória'),
  defaultDocumentType: z.enum(['cupom_fiscal', 'nfce', 'nfe', 'nfse']),
  emitterName: z.string().min(2, 'O nome do emitente é obrigatório'),
  emitterDocument: z.string().min(4, 'O CNPJ/CPF do emitente é obrigatório'),
  emitterAddress: z.string().optional(),
  fiscalKey: z.string().optional(),
  nextInvoiceNumber: z.number().min(1, 'O número inicial deve ser maior que zero'),
  enableAutoprint: z.boolean().default(true),
});

type FiscalConfigFormValues = z.infer<typeof fiscalConfigSchema>;

export default function AdminModuloFiscal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('config');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  
  // Buscar organizações
  const organizationsQuery = useQuery({
    queryKey: ['/api/organizations'],
    queryFn: () => apiRequest('/api/organizations', 'GET'),
  });
  
  // Buscar configuração fiscal de uma organização específica
  const configQuery = useQuery({
    queryKey: ['/api/fiscal/config', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        throw new Error('Nenhuma organização selecionada');
      }
      
      try {
        const configResponse = await apiRequest(`/api/fiscal/config/${selectedOrganizationId}`, 'GET');
        return configResponse;
      } catch (error: any) {
        // Se não encontrou configuração, retorna um objeto vazio
        if (error.status === 404) {
          return {
            organizationId: selectedOrganizationId,
            printerModel: '',
            printerPort: 'COM1',
            defaultDocumentType: 'cupom_fiscal',
            emitterName: '',
            emitterDocument: '',
            emitterAddress: '',
            fiscalKey: '',
            nextInvoiceNumber: 1,
            enableAutoprint: true,
          };
        }
        throw error;
      }
    },
    enabled: !!selectedOrganizationId,
  });
  
  // Buscar documentos fiscais de uma organização específica
  const documentsQuery = useQuery({
    queryKey: ['/api/fiscal/documents', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        throw new Error('Nenhuma organização selecionada');
      }
      
      return apiRequest(`/api/fiscal/documents/${selectedOrganizationId}`, 'GET');
    },
    enabled: !!selectedOrganizationId && activeTab === 'documents',
  });
  
  // Salvar configuração fiscal
  const saveConfigMutation = useMutation({
    mutationFn: async (data: FiscalConfigFormValues) => {
      const { organizationId } = data;
      
      try {
        // Verifica se já existe uma configuração
        await apiRequest(`/api/fiscal/config/${organizationId}`, 'GET');
        
        // Se existir, atualiza
        return apiRequest(`/api/fiscal/config/${organizationId}`, 'PUT', data);
      } catch (error: any) {
        // Se não existir (404), cria uma nova
        if (error.status === 404) {
          return apiRequest(`/api/fiscal/config/${organizationId}`, 'POST', data);
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Configuração salva com sucesso',
        description: 'As configurações fiscais foram atualizadas.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/fiscal/config', selectedOrganizationId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar configuração',
        description: error.message || 'Ocorreu um erro ao tentar salvar as configurações fiscais.',
        variant: 'destructive',
      });
    },
  });
  
  // Formulário para configuração fiscal
  const configForm = useForm<FiscalConfigFormValues>({
    resolver: zodResolver(fiscalConfigSchema),
    defaultValues: {
      organizationId: 0,
      printerModel: '',
      printerPort: 'COM1',
      defaultDocumentType: 'cupom_fiscal',
      emitterName: '',
      emitterDocument: '',
      emitterAddress: '',
      fiscalKey: '',
      nextInvoiceNumber: 1,
      enableAutoprint: true,
    },
  });
  
  // Configurar os valores do formulário quando os dados são carregados
  React.useEffect(() => {
    if (configQuery.data && !configQuery.isPending) {
      configForm.reset(configQuery.data);
    }
  }, [configQuery.data, configQuery.isPending, configForm]);
  
  // Manipulador para selecionar organização
  const handleSelectOrganization = (organizationId: number) => {
    setSelectedOrganizationId(organizationId);
  };
  
  // Manipulador para salvar configurações
  const onSaveConfig = (data: FiscalConfigFormValues) => {
    saveConfigMutation.mutate(data);
  };
  
  // Função auxiliar para formatar o tipo do documento
  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'cupom_fiscal': return 'Cupom Fiscal';
      case 'nfce': return 'NFC-e';
      case 'nfe': return 'NF-e';
      case 'nfse': return 'NFS-e';
      default: return type;
    }
  };
  
  // Função auxiliar para formatar uma data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Módulo Fiscal</h1>
            <p className="text-muted-foreground">
              Gerenciamento centralizado de configurações fiscais e documentos para todas as organizações
            </p>
          </div>
          
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-between">
                  {selectedOrganizationId ? (
                    organizationsQuery.data?.find(
                      (org: any) => org.id === selectedOrganizationId
                    )?.name || 'Selecione uma organização'
                  ) : (
                    'Selecione uma organização'
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel>Organizações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizationsQuery.isLoading ? (
                  <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
                ) : organizationsQuery.isError ? (
                  <DropdownMenuItem disabled>Erro ao carregar</DropdownMenuItem>
                ) : organizationsQuery.data?.length ? (
                  organizationsQuery.data.map((org: any) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleSelectOrganization(org.id)}
                    >
                      {org.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Nenhuma organização encontrada</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {!selectedOrganizationId ? (
          <Card>
            <CardHeader>
              <CardTitle>Selecione uma organização</CardTitle>
              <CardDescription>
                Selecione uma organização para visualizar e gerenciar suas configurações fiscais.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="config">
                <Settings className="h-4 w-4 mr-2" />
                Configuração Fiscal
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Receipt className="h-4 w-4 mr-2" />
                Documentos Fiscais
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração Fiscal</CardTitle>
                  <CardDescription>
                    Configure os parâmetros para emissão de documentos fiscais e integração com impressoras para a organização selecionada.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {configQuery.isLoading ? (
                    <div className="text-center py-4">Carregando configurações...</div>
                  ) : configQuery.isError ? (
                    <div className="text-center py-4 text-red-500">
                      Erro ao carregar configurações.
                    </div>
                  ) : (
                    <Form {...configForm}>
                      <form className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">Impressora Fiscal</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure a impressora fiscal para emissão de documentos
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={configForm.control}
                              name="printerModel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Modelo da Impressora</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o modelo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Bematech MP-4200 TH">Bematech MP-4200 TH</SelectItem>
                                      <SelectItem value="Bematech MP-2800 TH">Bematech MP-2800 TH</SelectItem>
                                      <SelectItem value="Bematech MP-100S TH">Bematech MP-100S TH</SelectItem>
                                      <SelectItem value="Epson TM-T20">Epson TM-T20</SelectItem>
                                      <SelectItem value="Epson TM-T88">Epson TM-T88</SelectItem>
                                      <SelectItem value="Daruma DR800">Daruma DR800</SelectItem>
                                      <SelectItem value="Elgin i9">Elgin i9</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={configForm.control}
                              name="printerPort"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Porta da Impressora</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione a porta" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="COM1">COM1</SelectItem>
                                      <SelectItem value="COM2">COM2</SelectItem>
                                      <SelectItem value="COM3">COM3</SelectItem>
                                      <SelectItem value="COM4">COM4</SelectItem>
                                      <SelectItem value="LPT1">LPT1</SelectItem>
                                      <SelectItem value="USB">USB</SelectItem>
                                      <SelectItem value="/dev/usb/lp0">/dev/usb/lp0 (Linux)</SelectItem>
                                      <SelectItem value="TCPIP">TCP/IP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium">Dados do Emissor</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Informações que serão incluídas nos documentos fiscais
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={configForm.control}
                              name="emitterName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Emissor</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome da empresa" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={configForm.control}
                              name="emitterDocument"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CNPJ/CPF</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CNPJ ou CPF do emissor" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={configForm.control}
                              name="emitterAddress"
                              render={({ field }) => (
                                <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Endereço</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Endereço completo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium">Configurações de Documentos</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Parâmetros para emissão de documentos fiscais
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={configForm.control}
                              name="defaultDocumentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Documento Padrão</FormLabel>
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
                                      <SelectItem value="cupom_fiscal">Cupom Fiscal</SelectItem>
                                      <SelectItem value="nfce">NFC-e (Nota Fiscal de Consumidor Eletrônica)</SelectItem>
                                      <SelectItem value="nfe">NF-e (Nota Fiscal Eletrônica)</SelectItem>
                                      <SelectItem value="nfse">NFS-e (Nota Fiscal de Serviço Eletrônica)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={configForm.control}
                              name="nextInvoiceNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Próximo Número de Documento</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Número que será usado no próximo documento emitido
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={configForm.control}
                              name="fiscalKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chave de Acesso SEFAZ (Opcional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Chave de acesso para a SEFAZ" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Utilizada para comunicação com a SEFAZ em ambiente de produção
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => configForm.reset()}>Cancelar</Button>
                  <Button onClick={configForm.handleSubmit(onSaveConfig)} disabled={saveConfigMutation.isPending || configQuery.isLoading}>
                    {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Fiscais</CardTitle>
                  <CardDescription>
                    Histórico de documentos fiscais emitidos pela organização selecionada
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {documentsQuery.isLoading ? (
                    <div className="text-center py-4">Carregando documentos...</div>
                  ) : documentsQuery.isError ? (
                    <div className="text-center py-4 text-red-500">
                      Erro ao carregar documentos.
                    </div>
                  ) : documentsQuery.data?.length === 0 ? (
                    <div className="text-center py-4">
                      Nenhum documento fiscal emitido por esta organização.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-sm text-muted-foreground">
                        Total de documentos: {documentsQuery.data?.length}
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {documentsQuery.data?.map((doc: any) => (
                          <AccordionItem value={`doc-${doc.id}`} key={doc.id}>
                            <AccordionTrigger className="grid grid-cols-5 gap-4 text-left">
                              <div className="col-span-1">{doc.documentNumber}</div>
                              <div className="col-span-1">{formatDocumentType(doc.type)}</div>
                              <div className="col-span-1">R$ {Number(doc.totalAmount).toFixed(2)}</div>
                              <div className="col-span-1">{formatDate(doc.issuedAt)}</div>
                              <div className="col-span-1">
                                <span className={`px-2 py-1 rounded-md text-xs ${
                                  doc.status === 'emitida' ? 'bg-green-100 text-green-800' : 
                                  doc.status === 'cancelada' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.status === 'emitida' ? 'Emitida' : 
                                   doc.status === 'cancelada' ? 'Cancelada' : 
                                   doc.status === 'pendente' ? 'Pendente' : doc.status}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                <div>
                                  <h4 className="font-medium">Cliente</h4>
                                  <p>{doc.customerName || 'Consumidor Final'}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">CPF/CNPJ</h4>
                                  <p>{doc.customerDocument || 'Não informado'}</p>
                                </div>
                                
                                {doc.status === 'cancelada' && (
                                  <div className="col-span-1 md:col-span-2">
                                    <h4 className="font-medium">Motivo do Cancelamento</h4>
                                    <p>{doc.cancelReason}</p>
                                    <p className="text-sm text-gray-500">
                                      Cancelado em: {formatDate(doc.canceledAt)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-medium mt-4 mb-2">Informações do Documento</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Chave de Acesso</p>
                                  <p className="font-mono text-xs break-all">{doc.accessKey}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-500">Protocolo</p>
                                  <p className="font-mono text-xs">{doc.authorizationProtocol}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-500">Forma de Pagamento</p>
                                  <p>{doc.paymentMethod || 'Não informado'}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}