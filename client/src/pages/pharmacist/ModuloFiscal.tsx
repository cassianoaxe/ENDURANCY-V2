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
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';
import { Printer, Receipt, FileText, CreditCard, Settings } from 'lucide-react';
import DocumentosFiscais from '@/components/fiscal/DocumentosFiscais';

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

// Esquema de validação para emissão de documento
const documentEmissionSchema = z.object({
  type: z.enum(['cupom_fiscal', 'nfce', 'nfe', 'nfse']),
  customerName: z.string().optional(),
  customerDocument: z.string().optional(),
  paymentMethod: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro']),
  items: z.array(
    z.object({
      description: z.string().min(1, 'A descrição é obrigatória'),
      quantity: z.number().min(1, 'A quantidade deve ser maior que zero'),
      unitPrice: z.number().min(0.01, 'O preço unitário deve ser maior que zero'),
      code: z.string().optional(),
    })
  ).min(1, 'Adicione pelo menos um item'),
});

type FiscalConfigFormValues = z.infer<typeof fiscalConfigSchema>;
type DocumentEmissionValues = z.infer<typeof documentEmissionSchema>;

export default function ModuloFiscal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('configuracao');
  const [testingPrinter, setTestingPrinter] = useState(false);
  const [drawerOpening, setDrawerOpening] = useState(false);
  
  // Buscar configuração fiscal atual
  const configQuery = useQuery({
    queryKey: ['/api/fiscal/config'],
    queryFn: async () => {
      // Usar o ID da organização logada
      const userResponse = await apiRequest('/api/auth/me', 'GET');
      if (!userResponse || !userResponse.organizationId) {
        throw new Error('Usuário não está vinculado a uma organização');
      }
      
      try {
        const configResponse = await apiRequest(`/api/fiscal/config/${userResponse.organizationId}`, 'GET');
        return configResponse;
      } catch (error: any) {
        // Se não encontrou configuração, retorna um objeto vazio
        if (error.status === 404) {
          return {
            organizationId: userResponse.organizationId,
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
      
      queryClient.invalidateQueries({ queryKey: ['/api/fiscal/config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar configuração',
        description: error.message || 'Ocorreu um erro ao tentar salvar as configurações fiscais.',
        variant: 'destructive',
      });
    },
  });
  
  // Testar a impressora
  const testPrinterMutation = useMutation({
    mutationFn: async (data: { printerModel: string; printerPort: string }) => {
      return apiRequest('/api/fiscal/printer/test', 'POST', data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Teste de impressora concluído',
        description: data.message || 'Impressora conectada com sucesso.',
      });
      setTestingPrinter(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao testar impressora',
        description: error.message || 'Não foi possível conectar à impressora.',
        variant: 'destructive',
      });
      setTestingPrinter(false);
    },
  });
  
  // Abrir gaveta de dinheiro
  const openDrawerMutation = useMutation({
    mutationFn: async (organizationId: number) => {
      return apiRequest(`/api/fiscal/cash-drawer/${organizationId}/open`, 'POST');
    },
    onSuccess: (data) => {
      toast({
        title: 'Gaveta aberta',
        description: data.message || 'A gaveta de dinheiro foi aberta com sucesso.',
      });
      setDrawerOpening(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao abrir gaveta',
        description: error.message || 'Não foi possível abrir a gaveta de dinheiro.',
        variant: 'destructive',
      });
      setDrawerOpening(false);
    },
  });
  
  // Imprimir relatório diário
  const printReportMutation = useMutation({
    mutationFn: async (organizationId: number) => {
      return apiRequest(`/api/fiscal/reports/${organizationId}/daily`, 'POST');
    },
    onSuccess: (data) => {
      toast({
        title: 'Relatório impresso',
        description: 'O relatório diário foi enviado para impressão.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao imprimir relatório',
        description: error.message || 'Não foi possível imprimir o relatório diário.',
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
  
  // Manipulador para salvar configurações
  const onSaveConfig = (data: FiscalConfigFormValues) => {
    saveConfigMutation.mutate(data);
  };
  
  // Manipulador para testar impressora
  const onTestPrinter = () => {
    const { printerModel, printerPort } = configForm.getValues();
    
    if (!printerModel || !printerPort) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, informe o modelo e a porta da impressora.',
        variant: 'destructive',
      });
      return;
    }
    
    setTestingPrinter(true);
    testPrinterMutation.mutate({ printerModel, printerPort });
  };
  
  // Manipulador para abrir gaveta
  const onOpenDrawer = () => {
    const { organizationId } = configForm.getValues();
    
    if (!organizationId) {
      toast({
        title: 'Organização não identificada',
        description: 'Não foi possível identificar a organização.',
        variant: 'destructive',
      });
      return;
    }
    
    setDrawerOpening(true);
    openDrawerMutation.mutate(organizationId);
  };
  
  // Manipulador para imprimir relatório
  const onPrintReport = () => {
    const { organizationId } = configForm.getValues();
    
    if (!organizationId) {
      toast({
        title: 'Organização não identificada',
        description: 'Não foi possível identificar a organização.',
        variant: 'destructive',
      });
      return;
    }
    
    printReportMutation.mutate(organizationId);
  };
  
  // Renderização com base no estado da consulta
  if (configQuery.isLoading) {
    return (
      <PharmacistLayout>
        <div className="container mx-auto py-6">
          <div className="text-center p-8">
            <p>Carregando módulo fiscal...</p>
          </div>
        </div>
      </PharmacistLayout>
    );
  }
  
  if (configQuery.isError) {
    return (
      <PharmacistLayout>
        <div className="container mx-auto py-6">
          <div className="text-center p-8 text-red-500">
            <p>Erro ao carregar o módulo fiscal. Por favor, tente novamente.</p>
          </div>
        </div>
      </PharmacistLayout>
    );
  }
  
  return (
    <PharmacistLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Módulo Fiscal</h1>
            <p className="text-muted-foreground">
              Gerencie documentos fiscais, configure impressoras e emita relatórios
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onOpenDrawer}
              disabled={drawerOpening}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Abrir Gaveta
            </Button>
            
            <Button
              variant="outline"
              onClick={onPrintReport}
              disabled={printReportMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório Diário
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="configuracao">
              <Settings className="h-4 w-4 mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <Receipt className="h-4 w-4 mr-2" />
              Documentos Fiscais
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuracao">
            <Card>
              <CardHeader>
                <CardTitle>Configuração Fiscal</CardTitle>
                <CardDescription>
                  Configure os parâmetros para emissão de documentos fiscais e integração com impressoras fiscais.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
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
                      
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={onTestPrinter}
                          disabled={testingPrinter}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          {testingPrinter ? 'Testando...' : 'Testar Impressora'}
                        </Button>
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
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => configForm.reset()}>Cancelar</Button>
                <Button onClick={configForm.handleSubmit(onSaveConfig)} disabled={saveConfigMutation.isPending}>
                  {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentos">
            {configQuery.data && configQuery.data.organizationId && (
              <DocumentosFiscais organizationId={configQuery.data.organizationId} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PharmacistLayout>
  );
}