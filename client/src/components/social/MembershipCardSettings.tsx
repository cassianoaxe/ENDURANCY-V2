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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CreditCard, 
  Save, 
  Settings, 
  QrCode, 
  Image, 
  Lock, 
  Calendar 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Definir o esquema de validação
const formSchema = z.object({
  // Campos de texto na carteirinha
  cardTitleText: z.string().min(1, { message: 'O título é obrigatório' }),
  cardSubtitleText: z.string().min(1, { message: 'O subtítulo é obrigatório' }),
  termsText: z.string().optional(),
  
  // Estilização da carteirinha
  cardBackgroundColor: z.string().refine(value => /^#[0-9A-F]{6}$/i.test(value), { 
    message: 'Cor inválida, deve estar no formato hexadecimal #RRGGBB' 
  }),
  cardTextColor: z.string().refine(value => /^#[0-9A-F]{6}$/i.test(value), { 
    message: 'Cor inválida, deve estar no formato hexadecimal #RRGGBB' 
  }),
  cardHighlightColor: z.string().refine(value => /^#[0-9A-F]{6}$/i.test(value), { 
    message: 'Cor inválida, deve estar no formato hexadecimal #RRGGBB' 
  }),
  cardTemplate: z.enum(['default', 'premium', 'simple']),
  
  // Opções de elementos
  includeQrCode: z.boolean().default(true),
  includePhoto: z.boolean().default(true),
  includeLogo: z.boolean().default(true),
  includeValidityDate: z.boolean().default(true),
  
  // Validade e opções físicas
  validityPeriodMonths: z.coerce.number().int().min(1).max(60),
  physicalCardPrice: z.coerce.number().min(0),
  physicalCardEnabled: z.boolean().default(true),
  
  // Configurações de PIN
  pinEnabled: z.boolean().default(true),
  pinDigits: z.coerce.number().int().min(4).max(10),
  pinRequireLetters: z.boolean().default(false),
  pinRequireSpecialChars: z.boolean().default(false),
  
  // Campos personalizados (opcional)
  customCss: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MembershipCardSettingsProps {
  organizationId: number;
  onSuccess?: () => void;
}

export function MembershipCardSettings({ organizationId, onSuccess }: MembershipCardSettingsProps) {
  const { toast } = useToast();

  // Buscar configurações atuais
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/social/membership-cards/settings/current'],
    refetchOnWindowFocus: false,
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Valores padrão serão definidos após o carregamento dos settings
    defaultValues: {
      cardTitleText: 'Carteirinha de Associado',
      cardSubtitleText: 'Associação de Pacientes',
      cardBackgroundColor: '#FFFFFF',
      cardTextColor: '#000000',
      cardHighlightColor: '#22C55E',
      cardTemplate: 'default',
      includeQrCode: true,
      includePhoto: true,
      includeLogo: true,
      includeValidityDate: true,
      validityPeriodMonths: 12,
      physicalCardPrice: 25,
      physicalCardEnabled: true,
      pinEnabled: true,
      pinDigits: 6,
      pinRequireLetters: false,
      pinRequireSpecialChars: false,
      termsText: 'Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.',
      customCss: '',
    },
  });

  // Atualizar valores do formulário quando os settings forem carregados
  React.useEffect(() => {
    if (settings) {
      form.reset({
        cardTitleText: settings.cardTitleText || 'Carteirinha de Associado',
        cardSubtitleText: settings.cardSubtitleText || 'Associação de Pacientes',
        cardBackgroundColor: settings.cardBackgroundColor || '#FFFFFF',
        cardTextColor: settings.cardTextColor || '#000000',
        cardHighlightColor: settings.cardHighlightColor || '#22C55E',
        cardTemplate: settings.cardTemplate || 'default',
        includeQrCode: settings.includeQrCode ?? true,
        includePhoto: settings.includePhoto ?? true,
        includeLogo: settings.includeLogo ?? true,
        includeValidityDate: settings.includeValidityDate ?? true,
        validityPeriodMonths: settings.validityPeriodMonths || 12,
        physicalCardPrice: settings.physicalCardPrice || 25,
        physicalCardEnabled: settings.physicalCardEnabled ?? true,
        pinEnabled: settings.pinEnabled ?? true,
        pinDigits: settings.pinDigits || 6,
        pinRequireLetters: settings.pinRequireLetters ?? false,
        pinRequireSpecialChars: settings.pinRequireSpecialChars ?? false,
        termsText: settings.termsText || 'Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.',
        customCss: settings.customCss || '',
      });
    }
  }, [settings, form]);

  // Mutação para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch('/api/social/membership-cards/settings/update', {
        method: 'PUT',
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
        description: 'As configurações de carteirinha foram atualizadas com sucesso.',
      });
      
      // Invalidar queries para forçar a atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/membership-cards/settings/current'] });
      
      // Executar callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Enviar formulário
  const onSubmit = (values: FormValues) => {
    saveSettingsMutation.mutate(values);
  };

  // Verificar se está carregando
  if (isLoadingSettings) {
    return <div className="flex items-center justify-center p-8">Carregando configurações...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Configurações de Carteirinha</CardTitle>
                <CardDescription>
                  Personalize a aparência e o comportamento das carteirinhas de associado
                </CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appearance">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Aparência
                </TabsTrigger>
                <TabsTrigger value="elements" className="flex items-center">
                  <QrCode className="w-4 h-4 mr-2" />
                  Elementos
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Física
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              {/* Aba de Aparência */}
              <TabsContent value="appearance" className="space-y-4 mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Textos da Carteirinha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título da carteirinha */}
                  <FormField
                    control={form.control}
                    name="cardTitleText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Texto principal exibido na carteirinha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subtítulo da carteirinha */}
                  <FormField
                    control={form.control}
                    name="cardSubtitleText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Texto secundário exibido na carteirinha (geralmente nome da associação)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="termsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de Termos</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormDescription>
                        Texto de observações e termos que aparece na parte inferior da carteirinha
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <h3 className="text-lg font-semibold mb-2">Cores e Estilo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cor de fundo */}
                  <FormField
                    control={form.control}
                    name="cardBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor de Fundo</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-8 w-8 rounded-full border"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Cor de fundo da carteirinha (em formato hex #RRGGBB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cor do texto */}
                  <FormField
                    control={form.control}
                    name="cardTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Texto</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-8 w-8 rounded-full border"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Cor principal dos textos (em formato hex #RRGGBB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cor de destaque */}
                  <FormField
                    control={form.control}
                    name="cardHighlightColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor de Destaque</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-8 w-8 rounded-full border"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Cor usada para bordas e destaques (em formato hex #RRGGBB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Template da carteirinha */}
                <FormField
                  control={form.control}
                  name="cardTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template da Carteirinha</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="simple">Simples</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Estilo visual base para as carteirinhas geradas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CSS personalizado */}
                <FormField
                  control={form.control}
                  name="customCss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSS Personalizado (Avançado)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormDescription>
                        CSS personalizado para customização avançada (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Aba de Elementos */}
              <TabsContent value="elements" className="space-y-4 mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Elementos da Carteirinha</h3>
                
                {/* QR Code */}
                <FormField
                  control={form.control}
                  name="includeQrCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">QR Code</FormLabel>
                        </div>
                        <FormDescription>
                          Incluir QR Code para verificação digital da carteirinha
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

                {/* Foto */}
                <FormField
                  control={form.control}
                  name="includePhoto"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Image className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">Foto do Associado</FormLabel>
                        </div>
                        <FormDescription>
                          Incluir a foto do associado na carteirinha
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

                {/* Logo */}
                <FormField
                  control={form.control}
                  name="includeLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Image className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">Logo da Associação</FormLabel>
                        </div>
                        <FormDescription>
                          Incluir o logo da associação na carteirinha
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

                {/* Data de validade */}
                <FormField
                  control={form.control}
                  name="includeValidityDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">Data de Validade</FormLabel>
                        </div>
                        <FormDescription>
                          Incluir data de validade na carteirinha
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

                {/* Período de validade */}
                <FormField
                  control={form.control}
                  name="validityPeriodMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período de Validade (meses)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="60" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de meses que a carteirinha permanecerá válida após a emissão
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Aba Física */}
              <TabsContent value="physical" className="space-y-4 mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Carteirinha Física</h3>
                
                {/* Habilitar carteirinha física */}
                <FormField
                  control={form.control}
                  name="physicalCardEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">Habilitar Carteirinha Física</FormLabel>
                        </div>
                        <FormDescription>
                          Permitir que os associados solicitem carteirinhas físicas
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

                {/* Preço da carteirinha física */}
                <FormField
                  control={form.control}
                  name="physicalCardPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço da Carteirinha Física (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Valor cobrado para emissão e envio da carteirinha física
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security" className="space-y-4 mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Configurações de Segurança</h3>
                
                {/* Habilitar PIN */}
                <FormField
                  control={form.control}
                  name="pinEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-2" />
                          <FormLabel className="text-base">Habilitar PIN</FormLabel>
                        </div>
                        <FormDescription>
                          Exigir PIN para acesso aos dados completos da carteirinha
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

                {form.watch('pinEnabled') && (
                  <>
                    {/* Número de dígitos do PIN */}
                    <FormField
                      control={form.control}
                      name="pinDigits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Dígitos do PIN</FormLabel>
                          <FormControl>
                            <Input type="number" min="4" max="10" {...field} />
                          </FormControl>
                          <FormDescription>
                            Número de caracteres exigidos no PIN (4-10)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Exigir letras no PIN */}
                    <FormField
                      control={form.control}
                      name="pinRequireLetters"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exigir Letras no PIN</FormLabel>
                            <FormDescription>
                              O PIN deve conter pelo menos uma letra
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

                    {/* Exigir caracteres especiais no PIN */}
                    <FormField
                      control={form.control}
                      name="pinRequireSpecialChars"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exigir Caracteres Especiais no PIN</FormLabel>
                            <FormDescription>
                              O PIN deve conter pelo menos um caractere especial (ex: !@#$%^&*)
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
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 rounded-full border-2 border-primary border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}