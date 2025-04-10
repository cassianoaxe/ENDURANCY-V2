import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { apiRequest } from '@lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Printer, FileText, Settings, Send, Database } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Schema para formulário de configuração fiscal
const fiscalConfigSchema = z.object({
  legalName: z.string().min(1, 'Razão social é obrigatória'),
  tradeName: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  address: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  district: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  fiscalRegime: z.string().min(1, 'Regime fiscal é obrigatório'),
  cnae: z.string().min(1, 'CNAE é obrigatório'),
  defaultSeries: z.string().default('1'),
  nextInvoiceNumber: z.number().int().min(1).default(1),
  printerModel: z.string().optional(),
  printerPort: z.string().optional(),
  isTestEnvironment: z.boolean().default(true),
});

type FiscalConfigFormValues = z.infer<typeof fiscalConfigSchema>;

const ModuloFiscal = () => {
  const [activeTab, setActiveTab] = useState('configuracoes');
  const { organizationId } = useParams<{ organizationId: string }>();
  const queryClient = useQueryClient();

  // Obtém as configurações fiscais da organização
  const { data: fiscalConfig, isLoading } = useQuery({
    queryKey: ['/api/fiscal/config', organizationId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/fiscal/config/${organizationId}`, {
          method: 'GET',
        });
        return response;
      } catch (error) {
        console.error('Erro ao buscar configurações fiscais:', error);
        return null;
      }
    },
    enabled: !!organizationId,
  });

  // Formulário de configurações fiscais
  const form = useForm<FiscalConfigFormValues>({
    resolver: zodResolver(fiscalConfigSchema),
    defaultValues: {
      legalName: fiscalConfig?.legalName || '',
      tradeName: fiscalConfig?.tradeName || '',
      cnpj: fiscalConfig?.cnpj || '',
      stateRegistration: fiscalConfig?.stateRegistration || '',
      municipalRegistration: fiscalConfig?.municipalRegistration || '',
      address: fiscalConfig?.address || '',
      number: fiscalConfig?.number || '',
      complement: fiscalConfig?.complement || '',
      district: fiscalConfig?.district || '',
      city: fiscalConfig?.city || '',
      state: fiscalConfig?.state || '',
      zipCode: fiscalConfig?.zipCode || '',
      fiscalRegime: fiscalConfig?.fiscalRegime || 'simples_nacional',
      cnae: fiscalConfig?.cnae || '',
      defaultSeries: fiscalConfig?.defaultSeries || '1',
      nextInvoiceNumber: fiscalConfig?.nextInvoiceNumber || 1,
      printerModel: fiscalConfig?.printerModel || 'bematech',
      printerPort: fiscalConfig?.printerPort || 'COM1',
      isTestEnvironment: fiscalConfig?.isTestEnvironment !== false,
    },
  });

  // Efeito para atualizar o formulário quando os dados são carregados
  React.useEffect(() => {
    if (fiscalConfig) {
      form.reset({
        legalName: fiscalConfig.legalName || '',
        tradeName: fiscalConfig.tradeName || '',
        cnpj: fiscalConfig.cnpj || '',
        stateRegistration: fiscalConfig.stateRegistration || '',
        municipalRegistration: fiscalConfig.municipalRegistration || '',
        address: fiscalConfig.address || '',
        number: fiscalConfig.number || '',
        complement: fiscalConfig.complement || '',
        district: fiscalConfig.district || '',
        city: fiscalConfig.city || '',
        state: fiscalConfig.state || '',
        zipCode: fiscalConfig.zipCode || '',
        fiscalRegime: fiscalConfig.fiscalRegime || 'simples_nacional',
        cnae: fiscalConfig.cnae || '',
        defaultSeries: fiscalConfig.defaultSeries || '1',
        nextInvoiceNumber: fiscalConfig.nextInvoiceNumber || 1,
        printerModel: fiscalConfig.printerModel || 'bematech',
        printerPort: fiscalConfig.printerPort || 'COM1',
        isTestEnvironment: fiscalConfig.isTestEnvironment !== false,
      });
    }
  }, [fiscalConfig, form]);

  // Mutação para salvar configurações fiscais
  const saveFiscalConfigMutation = useMutation({
    mutationFn: async (data: FiscalConfigFormValues) => {
      return apiRequest(`/api/fiscal/config/${organizationId}`, {
        method: fiscalConfig ? 'PUT' : 'POST',
        data: {
          ...data,
          organizationId: parseInt(organizationId || '0'),
        },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Configurações fiscais salvas',
        description: 'As configurações fiscais foram salvas com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fiscal/config', organizationId] });
    },
    onError: (error) => {
      console.error('Erro ao salvar configurações fiscais:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: 'Ocorreu um erro ao salvar as configurações fiscais. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Função para enviar o formulário
  const onSubmit = (data: FiscalConfigFormValues) => {
    saveFiscalConfigMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Módulo Fiscal</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ambiente:</span>
            <div className="flex items-center space-x-2">
              <Switch 
                id="environment-mode" 
                checked={!form.watch('isTestEnvironment')}
                onCheckedChange={(checked) => form.setValue('isTestEnvironment', !checked)}
              />
              <Label htmlFor="environment-mode" className={form.watch('isTestEnvironment') ? 'text-amber-500' : 'text-green-500'}>
                {form.watch('isTestEnvironment') ? 'Teste' : 'Produção'}
              </Label>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Configurações
              </TabsTrigger>
              <TabsTrigger value="impressoras" className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Impressoras
              </TabsTrigger>
              <TabsTrigger value="documentos" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos
              </TabsTrigger>
              <TabsTrigger value="integracoes" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Integrações
              </TabsTrigger>
            </TabsList>

            {/* Aba de Configurações */}
            <TabsContent value="configuracoes">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Fiscais</CardTitle>
                  <CardDescription>
                    Configure os dados fiscais da sua organização para emissão de notas fiscais e documentos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados da Empresa</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="legalName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Razão Social</FormLabel>
                                <FormControl>
                                  <Input placeholder="Razão Social" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="tradeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Fantasia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome Fantasia" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CNPJ</FormLabel>
                                <FormControl>
                                  <Input placeholder="CNPJ" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="stateRegistration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inscrição Estadual</FormLabel>
                                <FormControl>
                                  <Input placeholder="Inscrição Estadual" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="municipalRegistration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inscrição Municipal</FormLabel>
                                <FormControl>
                                  <Input placeholder="Inscrição Municipal" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="text-lg font-medium">Endereço</h3>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Endereço</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Logradouro" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="complement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Complemento" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bairro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input placeholder="CEP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Cidade" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AC">Acre</SelectItem>
                                      <SelectItem value="AL">Alagoas</SelectItem>
                                      <SelectItem value="AP">Amapá</SelectItem>
                                      <SelectItem value="AM">Amazonas</SelectItem>
                                      <SelectItem value="BA">Bahia</SelectItem>
                                      <SelectItem value="CE">Ceará</SelectItem>
                                      <SelectItem value="DF">Distrito Federal</SelectItem>
                                      <SelectItem value="ES">Espírito Santo</SelectItem>
                                      <SelectItem value="GO">Goiás</SelectItem>
                                      <SelectItem value="MA">Maranhão</SelectItem>
                                      <SelectItem value="MT">Mato Grosso</SelectItem>
                                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                      <SelectItem value="MG">Minas Gerais</SelectItem>
                                      <SelectItem value="PA">Pará</SelectItem>
                                      <SelectItem value="PB">Paraíba</SelectItem>
                                      <SelectItem value="PR">Paraná</SelectItem>
                                      <SelectItem value="PE">Pernambuco</SelectItem>
                                      <SelectItem value="PI">Piauí</SelectItem>
                                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                      <SelectItem value="RO">Rondônia</SelectItem>
                                      <SelectItem value="RR">Roraima</SelectItem>
                                      <SelectItem value="SC">Santa Catarina</SelectItem>
                                      <SelectItem value="SP">São Paulo</SelectItem>
                                      <SelectItem value="SE">Sergipe</SelectItem>
                                      <SelectItem value="TO">Tocantins</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="text-lg font-medium">Informações Fiscais</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fiscalRegime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Regime Fiscal</FormLabel>
                                <FormControl>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o regime fiscal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                                      <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                                      <SelectItem value="lucro_real">Lucro Real</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cnae"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CNAE Principal</FormLabel>
                                <FormControl>
                                  <Input placeholder="CNAE" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="defaultSeries"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Série Padrão</FormLabel>
                                <FormControl>
                                  <Input placeholder="Série" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nextInvoiceNumber"
                            render={({ field: { onChange, ...field } }) => (
                              <FormItem>
                                <FormLabel>Próximo Número de NF</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Próximo número" 
                                    min={1}
                                    onChange={(e) => onChange(parseInt(e.target.value))}
                                    {...field} 
                                    value={field.value?.toString() || '1'}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div></div>
                        </div>

                        <Separator className="my-4" />
                        <h3 className="text-lg font-medium">Integração com Impressora</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="printerModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Modelo da Impressora</FormLabel>
                                <FormControl>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o modelo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bematech">Bematech</SelectItem>
                                      <SelectItem value="epson">Epson</SelectItem>
                                      <SelectItem value="daruma">Daruma</SelectItem>
                                      <SelectItem value="elgin">Elgin</SelectItem>
                                      <SelectItem value="sweda">Sweda</SelectItem>
                                      <SelectItem value="tanca">Tanca</SelectItem>
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
                            name="printerPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Porta da Impressora</FormLabel>
                                <FormControl>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a porta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="COM1">COM1</SelectItem>
                                      <SelectItem value="COM2">COM2</SelectItem>
                                      <SelectItem value="COM3">COM3</SelectItem>
                                      <SelectItem value="COM4">COM4</SelectItem>
                                      <SelectItem value="LPT1">LPT1</SelectItem>
                                      <SelectItem value="USB">USB</SelectItem>
                                      <SelectItem value="TCP/IP">TCP/IP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={saveFiscalConfigMutation.isPending}
                      >
                        {saveFiscalConfigMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Impressoras */}
            <TabsContent value="impressoras">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Impressoras</CardTitle>
                  <CardDescription>
                    Cadastre e gerencie suas impressoras fiscais e não fiscais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <div className="flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      <AlertTitle>Impressora padrão configurada</AlertTitle>
                    </div>
                    <AlertDescription>
                      Sua impressora principal está configurada como {form.watch('printerModel')} na porta {form.watch('printerPort')}.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Impressoras Cadastradas</h3>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" /> Adicionar Impressora
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Nome</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Modelo</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Porta</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle">Impressora Principal</td>
                              <td className="p-4 align-middle capitalize">{form.watch('printerModel') || 'Bematech'}</td>
                              <td className="p-4 align-middle">{form.watch('printerPort') || 'COM1'}</td>
                              <td className="p-4 align-middle">
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Ativa
                                </span>
                              </td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Testar Impressora</Button>
                  <Button variant="outline">Imprimir Página de Teste</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Aba de Documentos */}
            <TabsContent value="documentos">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Fiscais</CardTitle>
                  <CardDescription>
                    Gerencie e visualize seus documentos fiscais emitidos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Histórico de Documentos</h3>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" /> Emitir Documento
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Número</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Tipo</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Cliente</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Data</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Valor</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle">000001</td>
                              <td className="p-4 align-middle">Cupom Fiscal</td>
                              <td className="p-4 align-middle">Cliente 1</td>
                              <td className="p-4 align-middle">10/04/2025</td>
                              <td className="p-4 align-middle">R$ 150,00</td>
                              <td className="p-4 align-middle">
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Emitida
                                </span>
                              </td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Integrações */}
            <TabsContent value="integracoes">
              <Card>
                <CardHeader>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Configure integrações com serviços de emissão de notas fiscais e outros sistemas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle>Ambiente de {form.watch('isTestEnvironment') ? 'Testes' : 'Produção'}</AlertTitle>
                    <AlertDescription>
                      Você está operando no ambiente de {form.watch('isTestEnvironment') ? 'testes' : 'produção'}. 
                      {form.watch('isTestEnvironment') 
                        ? ' Documentos emitidos não terão validade fiscal.' 
                        : ' Documentos emitidos terão validade fiscal.'}
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Certificado Digital</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>Certificado A1</Label>
                          <div className="flex mt-2">
                            <Input type="file" disabled />
                            <Button variant="outline" className="ml-2" disabled>Upload</Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload do certificado digital A1 (formato .pfx)
                          </p>
                        </div>
                        
                        <div>
                          <Label>Senha do Certificado</Label>
                          <Input type="password" placeholder="Senha do certificado" disabled />
                        </div>
                        
                        <div>
                          <Label>Validade</Label>
                          <Input type="text" placeholder="DD/MM/AAAA" disabled />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button variant="outline" disabled>
                          <Send className="h-4 w-4 mr-2" /> Configurar Certificado
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Provedores de Serviços</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">API de Emissão de NF-e/NFC-e</h4>
                            <p className="text-sm text-muted-foreground">
                              Integração com serviço de emissão de notas fiscais
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Integração com SAT</h4>
                            <p className="text-sm text-muted-foreground">
                              Conectar com equipamento SAT para emissão de Cupom Fiscal
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Integração com Secretaria da Fazenda</h4>
                            <p className="text-sm text-muted-foreground">
                              Envio automático de arquivos SPED
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    As integrações fiscais estarão disponíveis em breve. Entre em contato com o suporte para mais informações.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModuloFiscal;