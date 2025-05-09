import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { 
  CreditCard, 
  CrownIcon, 
  EyeIcon, 
  FileImage, 
  HelpCircle, 
  Image, 
  ImageUp, 
  Palette, 
  Printer, 
  QrCode, 
  Save, 
  Settings2, 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Esquema de validação para o formulário
const formSchema = z.object({
  template: z.enum(['standard', 'premium', 'custom']).default('standard'),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor primária deve ser um código hexadecimal válido',
  }).default('#1E40AF'),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor secundária deve ser um código hexadecimal válido',
  }).default('#60A5FA'),
  organizationLogoUrl: z.string().url({
    message: 'URL da logo deve ser um endereço válido',
  }).optional().or(z.literal('')),
  validityPeriod: z.number().int().min(1, {
    message: 'Período de validade deve ser pelo menos 1 mês',
  }).max(60, {
    message: 'Período de validade não pode exceder 60 meses',
  }).default(12),
  physicalCardsEnabled: z.boolean().default(true),
  physicalCardPrice: z.number().min(0, {
    message: 'Preço deve ser maior ou igual a zero',
  }).default(25.00),
  useCustomQrDesign: z.boolean().default(false),
  showQrBorder: z.boolean().default(true),
  showLogoInQr: z.boolean().default(true),
  showBeneficiaryPhoto: z.boolean().default(true),
  enableBarcodeAltDisplay: z.boolean().default(false),
  requirePhotoForCards: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function MembershipCardSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [previewTemplate, setPreviewTemplate] = useState('standard');
  const [previewColors, setPreviewColors] = useState({
    primary: '#1E40AF',
    secondary: '#60A5FA',
  });
  
  // Buscar configurações atuais
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/settings/current'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/membership-cards/settings/current');
        if (!response.ok) throw new Error('Falha ao carregar configurações');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return {
          template: 'standard',
          primaryColor: '#1E40AF',
          secondaryColor: '#60A5FA',
          organizationLogoUrl: '',
          validityPeriod: 12,
          physicalCardsEnabled: true,
          physicalCardPrice: 25.00,
          useCustomQrDesign: false,
          showQrBorder: true,
          showLogoInQr: true,
          showBeneficiaryPhoto: true,
          enableBarcodeAltDisplay: false,
          requirePhotoForCards: false,
        };
      }
    }
  });
  
  // Buscar estatísticas de carteirinhas
  const { data: stats } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/membership-cards/stats');
        if (!response.ok) throw new Error('Falha ao carregar estatísticas');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          totalCards: 0,
          activeCards: 0,
          expiredCards: 0,
          physicalCards: 0,
          pendingApproval: 0,
        };
      }
    }
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template: 'standard',
      primaryColor: '#1E40AF',
      secondaryColor: '#60A5FA',
      organizationLogoUrl: '',
      validityPeriod: 12,
      physicalCardsEnabled: true,
      physicalCardPrice: 25.00,
      useCustomQrDesign: false,
      showQrBorder: true,
      showLogoInQr: true,
      showBeneficiaryPhoto: true,
      enableBarcodeAltDisplay: false,
      requirePhotoForCards: false,
    }
  });
  
  // Preencher o formulário quando as configurações forem carregadas
  React.useEffect(() => {
    if (settings) {
      form.reset({
        template: settings.template || 'standard',
        primaryColor: settings.primaryColor || '#1E40AF',
        secondaryColor: settings.secondaryColor || '#60A5FA',
        organizationLogoUrl: settings.organizationLogoUrl || '',
        validityPeriod: settings.validityPeriod || 12,
        physicalCardsEnabled: settings.physicalCardsEnabled !== undefined ? settings.physicalCardsEnabled : true,
        physicalCardPrice: settings.physicalCardPrice || 25.00,
        useCustomQrDesign: settings.useCustomQrDesign || false,
        showQrBorder: settings.showQrBorder !== undefined ? settings.showQrBorder : true,
        showLogoInQr: settings.showLogoInQr !== undefined ? settings.showLogoInQr : true,
        showBeneficiaryPhoto: settings.showBeneficiaryPhoto !== undefined ? settings.showBeneficiaryPhoto : true,
        enableBarcodeAltDisplay: settings.enableBarcodeAltDisplay || false,
        requirePhotoForCards: settings.requirePhotoForCards || false,
      });
      
      setPreviewTemplate(settings.template || 'standard');
      setPreviewColors({
        primary: settings.primaryColor || '#1E40AF',
        secondary: settings.secondaryColor || '#60A5FA',
      });
    }
  }, [settings, form]);
  
  // Atualizar a prévia quando as cores mudarem no formulário
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'primaryColor' || name === 'secondaryColor') {
        setPreviewColors({
          primary: value.primaryColor || '#1E40AF',
          secondary: value.secondaryColor || '#60A5FA',
        });
      }
      if (name === 'template') {
        setPreviewTemplate(value.template as string || 'standard');
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Mutation para salvar as configurações
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch('/api/carteirinha/membership-cards/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar configurações');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram atualizadas com sucesso',
      });
      
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/membership-cards/settings/current'] });
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
    mutation.mutate(values);
  };
  
  // Função para renderizar a prévia do modelo de carteirinha
  const renderCardPreview = () => {
    const currentColors = previewColors;
    const logoUrl = form.watch('organizationLogoUrl');
    const showPhoto = form.watch('showBeneficiaryPhoto');
    
    const templates = {
      standard: (
        <div 
          className="relative w-full h-56 rounded-lg overflow-hidden shadow-lg"
          style={{ background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.secondary})` }}
        >
          <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo da Organização"
                  className="h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x40?text=Logo';
                  }}
                />
              ) : (
                <div className="text-white font-bold">ASSOCIAÇÃO</div>
              )}
              <div className="bg-white/90 p-1 rounded text-blue-800 text-xs font-bold">
                ASC123456789
              </div>
            </div>
            
            <div className="flex">
              {showPhoto && (
                <div className="mr-3">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              <div className="text-white">
                <h3 className="font-bold text-base">Nome do Associado</h3>
                <p className="text-xs opacity-90">CPF: 000.000.000-00</p>
                <div className="text-xs mt-1 opacity-80">
                  Validade: 31/12/2025
                </div>
                <div className="mt-2">
                  <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-white border border-white/30">
                    Associado
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="bg-white p-2 rounded-md">
                <QrCode className="h-7 w-7 text-blue-800" />
              </div>
            </div>
          </div>
        </div>
      ),
      premium: (
        <div 
          className="relative w-full h-56 rounded-lg overflow-hidden shadow-lg"
          style={{ background: currentColors.primary }}
        >
          <div 
            className="absolute top-0 right-0 w-1/2 h-full"
            style={{ 
              background: currentColors.secondary,
              clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)'
            }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo da Organização"
                  className="h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x40?text=Logo';
                  }}
                />
              ) : (
                <div className="text-white font-bold flex items-center">
                  <CrownIcon className="mr-1 h-5 w-5" />
                  <span>PREMIUM</span>
                </div>
              )}
              <div className="bg-black/20 backdrop-blur-sm p-1.5 rounded-lg text-white text-xs font-bold">
                ASC123456789
              </div>
            </div>
            
            <div className="flex items-center">
              {showPhoto && (
                <div className="mr-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              <div className="text-white">
                <h3 className="font-bold text-lg">Nome do Associado</h3>
                <p className="text-sm opacity-90">CPF: 000.000.000-00</p>
                <div className="text-sm mt-1 opacity-80">
                  Validade: 31/12/2025
                </div>
              </div>
            </div>
            
            <div className="flex justify-end items-center">
              <div className="backdrop-blur-md bg-white/10 p-3 rounded-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      ),
      custom: (
        <div 
          className="relative w-full h-56 rounded-lg overflow-hidden shadow-lg border-8"
          style={{ 
            borderColor: currentColors.secondary,
            background: 'white',
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-12"
            style={{ background: currentColors.primary }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-full h-12"
            style={{ background: currentColors.primary }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {logoUrl ? (
                <div className="bg-white p-1 rounded-md shadow-md">
                  <img
                    src={logoUrl}
                    alt="Logo da Organização"
                    className="h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x40?text=Logo';
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="font-bold p-1 px-2 rounded"
                  style={{ color: currentColors.primary }}
                >
                  CARTEIRINHA
                </div>
              )}
              <div 
                className="p-1 px-2 rounded text-xs font-bold"
                style={{ 
                  background: currentColors.secondary,
                  color: 'white'
                }}
              >
                ASC123456789
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-2">
              {showPhoto && (
                <div className="mr-3">
                  <div 
                    className="w-20 h-20 rounded-md flex items-center justify-center shadow-md"
                    style={{ 
                      border: `2px solid ${currentColors.secondary}`,
                      background: '#f8f9fa'
                    }}
                  >
                    <CreditCard 
                      className="h-10 w-10" 
                      style={{ color: currentColors.primary }}
                    />
                  </div>
                </div>
              )}
              <div style={{ color: '#333' }}>
                <h3 className="font-bold text-base">Nome do Associado</h3>
                <p className="text-xs">CPF: 000.000.000-00</p>
                <div className="text-xs mt-1">
                  Validade: 31/12/2025
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center mb-2">
              <div 
                className="p-2 rounded-md shadow-md"
                style={{ 
                  border: `2px solid ${currentColors.secondary}`,
                  background: 'white'
                }}
              >
                <QrCode 
                  className="h-8 w-8" 
                  style={{ color: currentColors.primary }}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    };
    
    return templates[previewTemplate] || templates.standard;
  };

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="appearence" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="appearence" className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Aparência</span>
                </TabsTrigger>
                <TabsTrigger value="rules" className="flex items-center">
                  <Settings2 className="mr-2 h-4 w-4" />
                  <span>Regras</span>
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex items-center">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Carteirinhas Físicas</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearence" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência da Carteirinha</CardTitle>
                    <CardDescription>
                      Personalize a aparência das carteirinhas digitais
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="template"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modelo da Carteirinha</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um modelo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="standard">Padrão</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Escolha o layout base da carteirinha
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Primária</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <div 
                                      className="w-10 h-10 rounded border cursor-pointer"
                                      style={{ backgroundColor: field.value }}
                                      onClick={() => {
                                        const input = document.getElementById('primaryColorInput');
                                        if (input) input.click();
                                      }}
                                    />
                                    <Input
                                      id="primaryColorInput"
                                      type="color"
                                      {...field}
                                      className="w-full"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Cor principal da carteirinha
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
                                  <div className="flex gap-2">
                                    <div 
                                      className="w-10 h-10 rounded border cursor-pointer"
                                      style={{ backgroundColor: field.value }}
                                      onClick={() => {
                                        const input = document.getElementById('secondaryColorInput');
                                        if (input) input.click();
                                      }}
                                    />
                                    <Input
                                      id="secondaryColorInput"
                                      type="color"
                                      {...field}
                                      className="w-full"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Cor complementar da carteirinha
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="organizationLogoUrl"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>URL da Logo da Organização</FormLabel>
                              <FormControl>
                                <div className="flex flex-col gap-2">
                                  <Input
                                    placeholder="https://exemplo.com/logo.png"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                  {field.value && (
                                    <div className="p-2 border rounded flex justify-center">
                                      <img
                                        src={field.value}
                                        alt="Prévia da logo"
                                        className="max-h-12 object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://placehold.co/200x80?text=Logo+Inválida';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                URL da imagem do logo da organização (opcional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="showBeneficiaryPhoto"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Mostrar Foto do Associado</FormLabel>
                                  <FormDescription>
                                    Exibir a foto do associado na carteirinha
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
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Prévia da Carteirinha</Label>
                        {renderCardPreview()}
                        <p className="text-xs text-muted-foreground mt-2">
                          Esta é uma prévia ilustrativa. A aparência final pode variar dependendo dos dados do associado.
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Configurações do QR Code</h3>
                      
                      <div className="space-y-3 mt-4">
                        <FormField
                          control={form.control}
                          name="useCustomQrDesign"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Personalizar QR Code</FormLabel>
                                <FormDescription>
                                  Ativar personalização avançada do QR Code
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
                        
                        {form.watch('useCustomQrDesign') && (
                          <>
                            <FormField
                              control={form.control}
                              name="showQrBorder"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Mostrar Borda no QR Code</FormLabel>
                                    <FormDescription>
                                      Exibir uma borda ao redor do QR Code
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
                              name="showLogoInQr"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Mostrar Logo no QR Code</FormLabel>
                                    <FormDescription>
                                      Exibir a logo da organização no centro do QR Code
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
                              name="enableBarcodeAltDisplay"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Exibir Código de Barras Alternativo</FormLabel>
                                    <FormDescription>
                                      Incluir um código de barras linear além do QR Code
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Regras e Políticas</CardTitle>
                    <CardDescription>
                      Configure as regras para emissão e validade das carteirinhas
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="validityPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período de Validade (meses)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <Slider
                                  value={[field.value]}
                                  min={1}
                                  max={60}
                                  step={1}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  className="w-20"
                                  value={field.value}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value >= 1 && value <= 60) {
                                      field.onChange(value);
                                    }
                                  }}
                                  min={1}
                                  max={60}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1 mês</span>
                                <span>1 ano</span>
                                <span>2 anos</span>
                                <span>5 anos</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Período de validade padrão das carteirinhas (em meses)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="requirePhotoForCards"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Exigir Foto para Emissão</FormLabel>
                            <FormDescription>
                              Tornar obrigatório o upload de foto para emitir carteirinhas
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
                    
                    <div className="rounded-md border p-4 bg-blue-50 border-blue-200">
                      <div className="flex gap-2 items-start">
                        <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-700">Informações sobre regras</h4>
                          <p className="text-sm text-blue-600 mt-0.5">
                            Estas regras serão aplicadas a todas as novas carteirinhas emitidas.
                            Carteirinhas já existentes não serão afetadas pelas mudanças.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="physical" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Carteirinhas Físicas</CardTitle>
                    <CardDescription>
                      Configure as opções para carteirinhas físicas impressas
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="physicalCardsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Habilitar Carteirinhas Físicas</FormLabel>
                            <FormDescription>
                              Permitir que associados solicitem carteirinhas físicas impressas
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
                    
                    {form.watch('physicalCardsEnabled') && (
                      <FormField
                        control={form.control}
                        name="physicalCardPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço da Carteirinha Física (R$)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Valor cobrado por carteirinha física solicitada
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="rounded-md border p-4 bg-amber-50 border-amber-200">
                      <div className="flex gap-2 items-start">
                        <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-700">Processo de carteirinhas físicas</h4>
                          <p className="text-sm text-amber-600 mt-0.5">
                            Ao solicitar carteirinhas físicas, os associados pagarão o valor definido.
                            Você precisará aprovar cada solicitação antes que sejam enviadas para impressão.
                          </p>
                          <Accordion type="single" collapsible className="mt-2">
                            <AccordionItem value="workflow">
                              <AccordionTrigger className="text-sm text-amber-700 py-1">
                                Ver fluxo de aprovação
                              </AccordionTrigger>
                              <AccordionContent className="text-xs text-amber-600">
                                <ol className="list-decimal list-inside space-y-1 pl-1">
                                  <li>Associado solicita carteirinha física</li>
                                  <li>Associado paga a taxa definida</li>
                                  <li>Administrador aprova a solicitação</li>
                                  <li>Carteirinha é enviada para impressão</li>
                                  <li>Carteirinha é entregue ao associado</li>
                                </ol>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    </div>
                    
                    {stats && (
                      <div className="rounded-md border p-4 mt-4">
                        <h4 className="font-medium text-sm mb-2">Estatísticas de Carteirinhas Físicas</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-muted-foreground">Total Solicitadas:</span>
                            <span className="ml-1 font-medium">{stats.physicalCards || 0}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-muted-foreground">Aguardando Aprovação:</span>
                            <span className="ml-1 font-medium">{stats.pendingApproval || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    template: settings?.template || 'standard',
                    primaryColor: settings?.primaryColor || '#1E40AF',
                    secondaryColor: settings?.secondaryColor || '#60A5FA',
                    organizationLogoUrl: settings?.organizationLogoUrl || '',
                    validityPeriod: settings?.validityPeriod || 12,
                    physicalCardsEnabled: settings?.physicalCardsEnabled !== undefined ? settings.physicalCardsEnabled : true,
                    physicalCardPrice: settings?.physicalCardPrice || 25.00,
                    useCustomQrDesign: settings?.useCustomQrDesign || false,
                    showQrBorder: settings?.showQrBorder !== undefined ? settings.showQrBorder : true,
                    showLogoInQr: settings?.showLogoInQr !== undefined ? settings.showLogoInQr : true,
                    showBeneficiaryPhoto: settings?.showBeneficiaryPhoto !== undefined ? settings.showBeneficiaryPhoto : true,
                    enableBarcodeAltDisplay: settings?.enableBarcodeAltDisplay || false,
                    requirePhotoForCards: settings?.requirePhotoForCards || false,
                  });
                  
                  setPreviewTemplate(settings?.template || 'standard');
                  setPreviewColors({
                    primary: settings?.primaryColor || '#1E40AF',
                    secondary: settings?.secondaryColor || '#60A5FA',
                  });
                }}
              >
                Reverter Alterações
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
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>
              Resumo das carteirinhas emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-sm font-medium">Total de Carteirinhas:</span>
                    <span className="font-bold">{stats.totalCards || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded">
                    <span className="text-sm">Carteirinhas Ativas:</span>
                    <span className="font-medium text-green-600">{stats.activeCards || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded">
                    <span className="text-sm">Carteirinhas Expiradas:</span>
                    <span className="font-medium text-red-600">{stats.expiredCards || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded">
                    <span className="text-sm">Carteirinhas Físicas:</span>
                    <span className="font-medium">{stats.physicalCards || 0}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Dicas Rápidas</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <EyeIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Personalize a aparência usando cores e logo da sua organização</span>
                    </li>
                    <li className="flex gap-2">
                      <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Configure o período de validade conforme o ciclo de filiação</span>
                    </li>
                    <li className="flex gap-2">
                      <Printer className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Ative carteirinhas físicas para oferecer um diferencial aos associados</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Carregando estatísticas...
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ajuda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <Accordion type="single" collapsible>
                <AccordionItem value="templates">
                  <AccordionTrigger>Quais são os modelos disponíveis?</AccordionTrigger>
                  <AccordionContent>
                    <p>Existem três modelos de carteirinha:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li><strong>Padrão:</strong> Design simples com gradiente de cores</li>
                      <li><strong>Premium:</strong> Design elegante com efeitos visuais</li>
                      <li><strong>Personalizado:</strong> Design com bordas e cores customizadas</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="validity">
                  <AccordionTrigger>Como funciona o período de validade?</AccordionTrigger>
                  <AccordionContent>
                    O período de validade define por quanto tempo as carteirinhas serão válidas após a emissão. Ao definir, por exemplo, 12 meses, todas as novas carteirinhas terão validade de um ano a partir da data de emissão. Carteirinhas existentes não serão afetadas por mudanças nessa configuração.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="physical">
                  <AccordionTrigger>Como funcionam as carteirinhas físicas?</AccordionTrigger>
                  <AccordionContent>
                    Quando ativadas, os associados poderão solicitar versões físicas impressas de suas carteirinhas mediante pagamento da taxa configurada. O administrador precisará aprovar cada solicitação antes que sejam enviadas para impressão. O processo completo inclui solicitação, pagamento, aprovação, impressão e entrega.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}