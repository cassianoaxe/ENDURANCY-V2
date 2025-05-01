import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Upload, CreditCard, QrCode, Lock, Sparkles, Printer, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Define o esquema de validação do formulário
const formSchema = z.object({
  organizationId: z.number(),
  cardDesign: z.enum(['standard', 'premium', 'custom']),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Formato de cor inválido. Use formato hexadecimal (ex: #FF5733)',
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Formato de cor inválido. Use formato hexadecimal (ex: #3383FF)',
  }),
  showLogo: z.boolean(),
  showQRCode: z.boolean(),
  showPhoto: z.boolean(),
  validityPeriod: z.number().min(1).max(10),
  physicalCardPrice: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    {
      message: 'O valor deve ser um número positivo',
    }
  ),
  physicalCardEnabled: z.boolean(),
  pinDigits: z.number().min(4).max(8),
  requirePin: z.boolean(),
  cardNumberPrefix: z.string().max(5),
  termsAndConditions: z.string().optional(),
  customMessage: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MembershipCardSettingsProps {
  organizationId?: number;
  onSuccess?: () => void;
}

export function MembershipCardSettings({ organizationId, onSuccess }: MembershipCardSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('general');

  // Buscar configurações atuais
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/settings/current'],
    queryFn: async () => {
      try {
        // Mockup de configurações enquanto não temos a API real
        const mockSettings = {
          id: 1,
          organizationId: organizationId || 1,
          cardDesign: 'standard',
          primaryColor: '#4f46e5',
          secondaryColor: '#818cf8',
          showLogo: true,
          showQRCode: true,
          showPhoto: true,
          validityPeriod: 12,
          physicalCardPrice: '25.00',
          physicalCardEnabled: true,
          pinDigits: 6,
          requirePin: true,
          cardNumberPrefix: 'MEM',
          termsAndConditions: 'Termos e condições para uso das carteirinhas de associado...',
          customMessage: 'Seja bem-vindo ao nosso Clube de Benefícios!',
          createdAt: '2023-10-01T12:00:00Z',
          updatedAt: '2023-10-15T14:30:00Z'
        };
        
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockSettings;
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        throw new Error('Falha ao carregar configurações da carteirinha');
      }
    }
  });

  // Configurar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: organizationId || 1,
      cardDesign: 'standard',
      primaryColor: '#4f46e5',
      secondaryColor: '#818cf8',
      showLogo: true,
      showQRCode: true,
      showPhoto: true,
      validityPeriod: 12,
      physicalCardPrice: '25.00',
      physicalCardEnabled: true,
      pinDigits: 6,
      requirePin: true,
      cardNumberPrefix: 'MEM',
      termsAndConditions: '',
      customMessage: '',
    }
  });

  // Preencher o formulário quando as configurações estiverem carregadas
  React.useEffect(() => {
    if (currentSettings) {
      form.reset({
        organizationId: currentSettings.organizationId,
        cardDesign: currentSettings.cardDesign,
        primaryColor: currentSettings.primaryColor,
        secondaryColor: currentSettings.secondaryColor,
        showLogo: currentSettings.showLogo,
        showQRCode: currentSettings.showQRCode,
        showPhoto: currentSettings.showPhoto,
        validityPeriod: currentSettings.validityPeriod,
        physicalCardPrice: currentSettings.physicalCardPrice,
        physicalCardEnabled: currentSettings.physicalCardEnabled,
        pinDigits: currentSettings.pinDigits,
        requirePin: currentSettings.requirePin,
        cardNumberPrefix: currentSettings.cardNumberPrefix,
        termsAndConditions: currentSettings.termsAndConditions,
        customMessage: currentSettings.customMessage,
      });
    }
  }, [currentSettings, form]);

  // Mutation para salvar configurações
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Simular envio para API
      const response = await fetch('/api/carteirinha/membership-cards/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar configurações');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações das carteirinhas foram atualizadas com sucesso.',
      });
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/membership-cards/settings/current'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar as configurações',
        variant: 'destructive',
      });
    }
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (values: FormValues) => {
    console.log('Valores do formulário:', values);
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Configurações de Carteirinha</h2>
        <p className="text-muted-foreground">
          Personalize as configurações das carteirinhas de associado
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="physical">Cartão Físico</TabsTrigger>
              <TabsTrigger value="terms">Termos</TabsTrigger>
            </TabsList>
            
            {/* Configurações Gerais */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>
                    Configure opções básicas para as carteirinhas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="validityPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período de Validade (meses)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Slider
                              min={1}
                              max={60}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-1"
                            />
                            <div className="w-16">
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min={1}
                                max={60}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Quantos meses a carteirinha ficará válida após a emissão
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardNumberPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefixo do Número da Carteirinha</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MEM"
                            {...field}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Um prefixo curto para identificar suas carteirinhas (ex: MEM, ABC)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem Personalizada</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Seja bem-vindo ao nosso Clube de Benefícios!"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Uma mensagem de boas-vindas a ser exibida para associados (máx. 200 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Configurações de Aparência */}
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência da Carteirinha</CardTitle>
                  <CardDescription>
                    Personalize a aparência visual das carteirinhas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardDesign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Design da Carteirinha</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um design" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Padrão</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Escolha um dos designs pré-definidos ou personalize
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input {...field} />
                              <div
                                className="h-10 w-10 rounded border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Cor principal da carteirinha (formato hex)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input {...field} />
                              <div
                                className="h-10 w-10 rounded border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Cor secundária e de destaque (formato hex)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="showLogo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Exibir Logo</FormLabel>
                            <FormDescription>
                              Mostrar logo da organização
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showQRCode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Exibir QR Code</FormLabel>
                            <FormDescription>
                              Incluir QR Code na carteirinha
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showPhoto"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Exibir Foto</FormLabel>
                            <FormDescription>
                              Incluir foto do associado
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pré-visualização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border w-full max-w-md mx-auto shadow-md">
                    <div 
                      className="p-4 text-white"
                      style={{ 
                        backgroundColor: form.getValues('primaryColor'),
                        background: `linear-gradient(135deg, ${form.getValues('primaryColor')}, ${form.getValues('secondaryColor')})` 
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold">Carteira de Associado</h3>
                          <p className="text-xs opacity-90">Válida até: 01/01/2026</p>
                        </div>
                        {form.getValues('showLogo') && (
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                            <Sparkles className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-white flex">
                      {form.getValues('showPhoto') && (
                        <div className="mr-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="font-bold">Nome do Associado</h4>
                        <p className="text-sm text-muted-foreground">
                          Nº Associado: {form.getValues('cardNumberPrefix')}12345
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CPF: 123.456.789-00
                        </p>
                        
                        {form.getValues('showQRCode') && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                            <QrCode className="h-4 w-4" />
                            <span>QR Code disponível na carteirinha</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Configurações de Segurança */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Configure opções de segurança para as carteirinhas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="requirePin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Exigir PIN</FormLabel>
                          <FormDescription>
                            Solicitar código PIN ao verificar a carteirinha
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('requirePin') && (
                    <FormField
                      control={form.control}
                      name="pinDigits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Dígitos do PIN</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Slider
                                min={4}
                                max={8}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="flex-1"
                              />
                              <div className="w-16">
                                <Input
                                  type="number"
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  min={4}
                                  max={8}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Quantos dígitos terá o PIN de segurança (4-8)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="mt-4 p-4 border rounded-md bg-gray-50">
                    <div className="flex items-start mb-2">
                      <Lock className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="text-sm font-semibold">Verificação de Carteirinhas</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ao escanear o QR Code, o verificador será direcionado para uma página segura que exibirá:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                        Status de validade da carteirinha
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                        Informações básicas do associado
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                        {form.watch('requirePin') 
                          ? `Solicitar PIN de ${form.watch('pinDigits')} dígitos` 
                          : 'Verificação sem PIN (recomendamos ativar o PIN)'}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                        Log de verificações para auditoria
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Configurações de Cartão Físico */}
            <TabsContent value="physical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Carteirinhas Físicas</CardTitle>
                  <CardDescription>
                    Configure opções para carteirinhas físicas impressas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalCardEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ativar Carteirinhas Físicas</FormLabel>
                          <FormDescription>
                            Permitir que associados solicitem carteirinhas físicas
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('physicalCardEnabled') && (
                    <FormField
                      control={form.control}
                      name="physicalCardPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço da Carteirinha Física (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="25.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Valor cobrado para emissão e envio da carteirinha física
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="mt-4 p-4 border rounded-md bg-gray-50">
                    <div className="flex items-start mb-2">
                      <Printer className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="text-sm font-semibold">Processo de Emissão Física</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quando um associado solicita uma carteirinha física:
                    </p>
                    <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-5">
                      <li>Associado solicita e efetua o pagamento da taxa</li>
                      <li>Administrador recebe notificação de nova solicitação</li>
                      <li>Carteirinha é aprovada e enviada para impressão</li>
                      <li>Após impressão, administrador marca como "Impressa"</li>
                      <li>Após entrega, administrador marca como "Entregue"</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Configurações de Termos */}
            <TabsContent value="terms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Termos e Condições</CardTitle>
                  <CardDescription>
                    Configure os termos e condições para uso das carteirinhas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termos e Condições</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione os termos e condições para uso das carteirinhas..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Estes termos serão exibidos durante a emissão de carteirinhas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentSettings) {
                  form.reset({
                    organizationId: currentSettings.organizationId,
                    cardDesign: currentSettings.cardDesign,
                    primaryColor: currentSettings.primaryColor,
                    secondaryColor: currentSettings.secondaryColor,
                    showLogo: currentSettings.showLogo,
                    showQRCode: currentSettings.showQRCode,
                    showPhoto: currentSettings.showPhoto,
                    validityPeriod: currentSettings.validityPeriod,
                    physicalCardPrice: currentSettings.physicalCardPrice,
                    physicalCardEnabled: currentSettings.physicalCardEnabled,
                    pinDigits: currentSettings.pinDigits,
                    requirePin: currentSettings.requirePin,
                    cardNumberPrefix: currentSettings.cardNumberPrefix,
                    termsAndConditions: currentSettings.termsAndConditions,
                    customMessage: currentSettings.customMessage,
                  });
                }
              }}
            >
              Restaurar Padrões
            </Button>
            
            <Button 
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}