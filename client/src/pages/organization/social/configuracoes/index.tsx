import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, Settings, Edit, Check, AlertCircle, Upload, 
  Globe, LogOut, Lock, Mail, Pencil, RefreshCw, Save, User, Shield
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Schema for portal settings form
const portalSettingsSchema = z.object({
  portalName: z.string().min(3, { message: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' }),
  portalDescription: z.string().optional(),
  portalBannerImage: z.string().optional(),
  portalLogoImage: z.string().optional(),
  portalPrimaryColor: z.string().optional(),
  portalSecondaryColor: z.string().optional(),
  enablePublicPortal: z.boolean().default(false),
  publicPortalUrl: z.string().optional(),
  enableDonationPage: z.boolean().default(false),
  allowAnonymousDonations: z.boolean().default(true),
  showDonorsNames: z.boolean().default(true),
  showDonationAmounts: z.boolean().default(true),
  portalFooterText: z.string().optional(),
  portalContactEmail: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  portalContactPhone: z.string().optional().or(z.literal('')),
  metaDescription: z.string().max(160, { message: 'Descrição meta deve ter no máximo 160 caracteres' }).optional().or(z.literal('')),
  googleAnalyticsId: z.string().optional().or(z.literal('')),
});

// Schema for email notification settings
const emailSettingsSchema = z.object({
  enableEmailNotifications: z.boolean().default(true),
  notifyOnNewDonations: z.boolean().default(true),
  notifyOnNewBeneficiaries: z.boolean().default(true),
  notifyOnCampaignUpdates: z.boolean().default(true),
  notifyOnLowFunds: z.boolean().default(true),
  notificationEmailFrequency: z.enum(['immediate', 'daily', 'weekly']).default('daily'),
  adminEmailAddresses: z.string().optional(),
  emailSenderName: z.string().optional(),
  emailFooterText: z.string().optional(),
  useSMTP: z.boolean().default(false),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
});

// Schema for document settings
const documentSettingsSchema = z.object({
  enableDocumentManagement: z.boolean().default(true),
  defaultDocumentRetentionDays: z.string().optional(),
  requireApprovalForDocuments: z.boolean().default(false),
  documentApprovers: z.string().optional(),
  allowedFileTypes: z.string().optional(),
  maxFileSize: z.string().optional(),
  enableFileEncryption: z.boolean().default(false),
  enableAuditTrail: z.boolean().default(true),
});

// Form types
type PortalSettingsFormValues = z.infer<typeof portalSettingsSchema>;
type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;
type DocumentSettingsFormValues = z.infer<typeof documentSettingsSchema>;

export default function SocialModuleSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch settings data
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['/api/social/settings'],
    retry: false,
    enabled: true,
  });

  // Initialize portal settings form
  const portalForm = useForm<PortalSettingsFormValues>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      portalName: 'Portal Social',
      portalDescription: '',
      portalBannerImage: '',
      portalLogoImage: '',
      portalPrimaryColor: '#E53935',
      portalSecondaryColor: '#FFF9C4',
      enablePublicPortal: true,
      publicPortalUrl: '',
      enableDonationPage: true,
      allowAnonymousDonations: true,
      showDonorsNames: true,
      showDonationAmounts: true,
      portalFooterText: '',
      portalContactEmail: '',
      portalContactPhone: '',
      metaDescription: '',
      googleAnalyticsId: '',
    },
  });

  // Initialize email settings form
  const emailForm = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      enableEmailNotifications: true,
      notifyOnNewDonations: true,
      notifyOnNewBeneficiaries: true,
      notifyOnCampaignUpdates: true,
      notifyOnLowFunds: true,
      notificationEmailFrequency: 'daily',
      adminEmailAddresses: '',
      emailSenderName: '',
      emailFooterText: '',
      useSMTP: false,
      smtpHost: '',
      smtpPort: '',
      smtpUsername: '',
      smtpPassword: '',
      smtpFromEmail: '',
    },
  });

  // Initialize document settings form
  const documentForm = useForm<DocumentSettingsFormValues>({
    resolver: zodResolver(documentSettingsSchema),
    defaultValues: {
      enableDocumentManagement: true,
      defaultDocumentRetentionDays: '365',
      requireApprovalForDocuments: false,
      documentApprovers: '',
      allowedFileTypes: 'pdf,doc,docx,jpg,png',
      maxFileSize: '10',
      enableFileEncryption: false,
      enableAuditTrail: true,
    },
  });

  // Update forms when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      portalForm.reset({
        portalName: settings.portalName || 'Portal Social',
        portalDescription: settings.portalDescription || '',
        portalBannerImage: settings.portalBannerImage || '',
        portalLogoImage: settings.portalLogoImage || '',
        portalPrimaryColor: settings.portalPrimaryColor || '#E53935',
        portalSecondaryColor: settings.portalSecondaryColor || '#FFF9C4',
        enablePublicPortal: settings.enablePublicPortal !== undefined ? settings.enablePublicPortal : true,
        publicPortalUrl: settings.publicPortalUrl || '',
        enableDonationPage: settings.enableDonationPage !== undefined ? settings.enableDonationPage : true,
        allowAnonymousDonations: settings.allowAnonymousDonations !== undefined ? settings.allowAnonymousDonations : true,
        showDonorsNames: settings.showDonorsNames !== undefined ? settings.showDonorsNames : true,
        showDonationAmounts: settings.showDonationAmounts !== undefined ? settings.showDonationAmounts : true,
        portalFooterText: settings.portalFooterText || '',
        portalContactEmail: settings.portalContactEmail || '',
        portalContactPhone: settings.portalContactPhone || '',
        metaDescription: settings.metaDescription || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
      });

      emailForm.reset({
        enableEmailNotifications: settings.enableEmailNotifications !== undefined ? settings.enableEmailNotifications : true,
        notifyOnNewDonations: settings.notifyOnNewDonations !== undefined ? settings.notifyOnNewDonations : true,
        notifyOnNewBeneficiaries: settings.notifyOnNewBeneficiaries !== undefined ? settings.notifyOnNewBeneficiaries : true,
        notifyOnCampaignUpdates: settings.notifyOnCampaignUpdates !== undefined ? settings.notifyOnCampaignUpdates : true,
        notifyOnLowFunds: settings.notifyOnLowFunds !== undefined ? settings.notifyOnLowFunds : true,
        notificationEmailFrequency: settings.notificationEmailFrequency || 'daily',
        adminEmailAddresses: settings.adminEmailAddresses || '',
        emailSenderName: settings.emailSenderName || '',
        emailFooterText: settings.emailFooterText || '',
        useSMTP: settings.useSMTP !== undefined ? settings.useSMTP : false,
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || '',
        smtpUsername: settings.smtpUsername || '',
        smtpPassword: settings.smtpPassword || '',
        smtpFromEmail: settings.smtpFromEmail || '',
      });

      documentForm.reset({
        enableDocumentManagement: settings.enableDocumentManagement !== undefined ? settings.enableDocumentManagement : true,
        defaultDocumentRetentionDays: settings.defaultDocumentRetentionDays || '365',
        requireApprovalForDocuments: settings.requireApprovalForDocuments !== undefined ? settings.requireApprovalForDocuments : false,
        documentApprovers: settings.documentApprovers || '',
        allowedFileTypes: settings.allowedFileTypes || 'pdf,doc,docx,jpg,png',
        maxFileSize: settings.maxFileSize || '10',
        enableFileEncryption: settings.enableFileEncryption !== undefined ? settings.enableFileEncryption : false,
        enableAuditTrail: settings.enableAuditTrail !== undefined ? settings.enableAuditTrail : true,
      });
    }
  }, [settings, portalForm, emailForm, documentForm]);

  // Create mutation for settings update
  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/social/settings', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar configurações');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram atualizadas com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handlers
  const onPortalSubmit = (data: PortalSettingsFormValues) => {
    updateSettings.mutate({
      type: 'portal',
      ...data,
    });
  };

  const onEmailSubmit = (data: EmailSettingsFormValues) => {
    updateSettings.mutate({
      type: 'email',
      ...data,
    });
  };

  const onDocumentSubmit = (data: DocumentSettingsFormValues) => {
    updateSettings.mutate({
      type: 'document',
      ...data,
    });
  };

  // Helper for file input handling
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = (fieldName: string) => {
    // In a real implementation, this would trigger a file upload dialog
    // and handle the file upload to a server, then update the form with the URL
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Upload simulado",
        description: "Em uma implementação real, este seria um upload de arquivo.",
      });
    }, 1500);
  };

  return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações do Módulo Social</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações para o módulo social da associação
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 h-auto">
            <TabsTrigger value="general" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-950/20">
              <Settings className="mr-2 h-4 w-4" />
              Portal Social
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-950/20">
              <Mail className="mr-2 h-4 w-4" />
              Notificações por Email
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-950/20">
              <Shield className="mr-2 h-4 w-4" />
              Gestão de Documentos
            </TabsTrigger>
          </TabsList>
          
          {/* Portal Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Portal Social</CardTitle>
                <CardDescription>
                  Configure as informações básicas do portal social da associação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...portalForm}>
                  <form onSubmit={portalForm.handleSubmit(onPortalSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informações Básicas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={portalForm.control}
                          name="portalName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Portal*</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do portal social" {...field} />
                              </FormControl>
                              <FormDescription>
                                Este nome será exibido no portal público
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={portalForm.control}
                          name="portalContactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Contato</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contato@seuportal.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Email para contato exibido no portal
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={portalForm.control}
                        name="portalDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva o propósito do portal social da associação" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Uma breve descrição que será exibida no portal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={portalForm.control}
                          name="portalLogoImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleFileUpload('portalLogoImage')}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormDescription>
                                URL da imagem de logo ou clique para fazer upload
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={portalForm.control}
                          name="portalBannerImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banner</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleFileUpload('portalBannerImage')}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormDescription>
                                URL da imagem de banner ou clique para fazer upload
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={portalForm.control}
                          name="portalPrimaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor Primária</FormLabel>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormDescription>
                                Código de cor hexadecimal (ex: #E53935)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={portalForm.control}
                          name="portalSecondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor Secundária</FormLabel>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormDescription>
                                Código de cor hexadecimal (ex: #FFF9C4)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações do Portal Público</h3>
                      
                      <FormField
                        control={portalForm.control}
                        name="enablePublicPortal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Ativar Portal Público</FormLabel>
                              <FormDescription>
                                Ativa o portal público para sua associação
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
                        control={portalForm.control}
                        name="publicPortalUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Portal Público</FormLabel>
                            <div className="flex items-center gap-0">
                              <div className="flex items-center bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <FormControl>
                                <Input className="rounded-l-none" placeholder="sua-associacao.endurancy.org" {...field} />
                              </FormControl>
                            </div>
                            <FormDescription>
                              Subdomínio ou URL personalizada para seu portal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={portalForm.control}
                        name="enableDonationPage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Ativar Página de Doações</FormLabel>
                              <FormDescription>
                                Ativa a página de doações no portal público
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={portalForm.control}
                          name="allowAnonymousDonations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Doações Anônimas</FormLabel>
                                <FormDescription>
                                  Permitir doações anônimas
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!portalForm.watch('enableDonationPage')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={portalForm.control}
                          name="showDonorsNames"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Mostrar Nomes</FormLabel>
                                <FormDescription>
                                  Exibir nomes dos doadores
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!portalForm.watch('enableDonationPage')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={portalForm.control}
                          name="showDonationAmounts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Mostrar Valores</FormLabel>
                                <FormDescription>
                                  Exibir valores das doações
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!portalForm.watch('enableDonationPage')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">SEO e Analytics</h3>
                      
                      <FormField
                        control={portalForm.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Uma breve descrição para SEO" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Descrição para mecanismos de busca (máx. 160 caracteres)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={portalForm.control}
                        name="googleAnalyticsId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Google Analytics</FormLabel>
                            <FormControl>
                              <Input placeholder="G-XXXXXXXXXX ou UA-XXXXXXXX-X" {...field} />
                            </FormControl>
                            <FormDescription>
                              ID do Google Analytics para rastreamento de visitantes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={updateSettings.isPending || !portalForm.formState.isDirty}
                    >
                      {updateSettings.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações por Email</CardTitle>
                <CardDescription>
                  Configure as notificações por email para o módulo social
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                    <FormField
                      control={emailForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativar Notificações por Email</FormLabel>
                            <FormDescription>
                              Ativa o envio de notificações por email
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
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Eventos para Notificação</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="notifyOnNewDonations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Novas Doações</FormLabel>
                                <FormDescription>
                                  Notificar sobre novas doações recebidas
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="notifyOnNewBeneficiaries"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Novos Beneficiários</FormLabel>
                                <FormDescription>
                                  Notificar sobre novos beneficiários cadastrados
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="notifyOnCampaignUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Campanhas</FormLabel>
                                <FormDescription>
                                  Notificar sobre atualizações de campanhas
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="notifyOnLowFunds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Fundos Baixos</FormLabel>
                                <FormDescription>
                                  Alertar quando os fundos estiverem baixos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={emailForm.control}
                        name="notificationEmailFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência de Notificações</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!emailForm.watch('enableEmailNotifications')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a frequência" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Imediata</SelectItem>
                                <SelectItem value="daily">Diária (resumo)</SelectItem>
                                <SelectItem value="weekly">Semanal (resumo)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Define a frequência de envio das notificações por email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="adminEmailAddresses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emails dos Administradores</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="email1@exemplo.com, email2@exemplo.com" 
                                className="min-h-[80px]"
                                {...field}
                                disabled={!emailForm.watch('enableEmailNotifications')}
                              />
                            </FormControl>
                            <FormDescription>
                              Lista de endereços de email que receberão notificações (separados por vírgula)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações de SMTP</h3>
                      
                      <FormField
                        control={emailForm.control}
                        name="useSMTP"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Usar SMTP Próprio</FormLabel>
                              <FormDescription>
                                Use seu próprio servidor SMTP para envio de emails
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!emailForm.watch('enableEmailNotifications')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Servidor SMTP</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="smtp.exemplo.com" 
                                  {...field}
                                  disabled={!emailForm.watch('useSMTP') || !emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Porta SMTP</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="587" 
                                  {...field}
                                  disabled={!emailForm.watch('useSMTP') || !emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuário SMTP</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="seu_usuario" 
                                  {...field}
                                  disabled={!emailForm.watch('useSMTP') || !emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha SMTP</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field}
                                  disabled={!emailForm.watch('useSMTP') || !emailForm.watch('enableEmailNotifications')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpFromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Remetente</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="noreply@seudominio.com" 
                                {...field}
                                disabled={!emailForm.watch('useSMTP') || !emailForm.watch('enableEmailNotifications')}
                              />
                            </FormControl>
                            <FormDescription>
                              Endereço de email que será usado como remetente
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={updateSettings.isPending || !emailForm.formState.isDirty}
                    >
                      {updateSettings.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Document Settings Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Gestão de Documentos</CardTitle>
                <CardDescription>
                  Configure a gestão de documentos para o módulo social
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...documentForm}>
                  <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-6">
                    <FormField
                      control={documentForm.control}
                      name="enableDocumentManagement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativar Gestão de Documentos</FormLabel>
                            <FormDescription>
                              Ativa o sistema de gestão de documentos
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={documentForm.control}
                        name="defaultDocumentRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Retenção (dias)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="365" 
                                {...field}
                                disabled={!documentForm.watch('enableDocumentManagement')}
                              />
                            </FormControl>
                            <FormDescription>
                              Quantos dias os documentos serão mantidos por padrão
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={documentForm.control}
                        name="maxFileSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho Máximo de Arquivo (MB)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10" 
                                {...field}
                                disabled={!documentForm.watch('enableDocumentManagement')}
                              />
                            </FormControl>
                            <FormDescription>
                              Tamanho máximo permitido para upload de arquivos em MB
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={documentForm.control}
                      name="allowedFileTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipos de Arquivo Permitidos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="pdf,doc,docx,jpg,png" 
                              {...field}
                              disabled={!documentForm.watch('enableDocumentManagement')}
                            />
                          </FormControl>
                          <FormDescription>
                            Lista de extensões de arquivo permitidas (separadas por vírgula)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={documentForm.control}
                      name="requireApprovalForDocuments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aprovação de Documentos</FormLabel>
                            <FormDescription>
                              Exigir aprovação para novos documentos
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!documentForm.watch('enableDocumentManagement')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={documentForm.control}
                      name="documentApprovers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aprovadores de Documentos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="email1@exemplo.com, email2@exemplo.com" 
                              className="min-h-[80px]"
                              {...field}
                              disabled={!documentForm.watch('requireApprovalForDocuments') || !documentForm.watch('enableDocumentManagement')}
                            />
                          </FormControl>
                          <FormDescription>
                            Lista de pessoas que podem aprovar documentos (separados por vírgula)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={documentForm.control}
                        name="enableFileEncryption"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Criptografia</FormLabel>
                              <FormDescription>
                                Ativar criptografia para documentos armazenados
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!documentForm.watch('enableDocumentManagement')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={documentForm.control}
                        name="enableAuditTrail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Trilha de Auditoria</FormLabel>
                              <FormDescription>
                                Registrar todas as ações nos documentos
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!documentForm.watch('enableDocumentManagement')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={updateSettings.isPending || !documentForm.formState.isDirty}
                    >
                      {updateSettings.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}