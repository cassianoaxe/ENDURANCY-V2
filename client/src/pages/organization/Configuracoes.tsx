import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da organização deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido",
  }),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
  city: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres",
  }),
  state: z.string().length(2, {
    message: "Digite a sigla do estado (2 letras)",
  }),
  postalCode: z.string().min(8, {
    message: "CEP inválido",
  }),
  logo: z.any().optional(),
  sendNotifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

type OrganizationSettings = z.infer<typeof formSchema>;

export default function Configuracoes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("geral");
  
  // Buscar dados da organização
  const { data: organizationData, isLoading } = useQuery({
    queryKey: ["/api/organization/settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/organization/settings");
      const data = await response.json();
      return data;
    },
  });
  
  const form = useForm<OrganizationSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organizationData?.name || "",
      email: organizationData?.email || "",
      phone: organizationData?.phone || "",
      address: organizationData?.address || "",
      city: organizationData?.city || "",
      state: organizationData?.state || "",
      postalCode: organizationData?.postalCode || "",
      sendNotifications: organizationData?.sendNotifications ?? true,
      theme: organizationData?.theme || "system",
    },
  });
  
  // Atualizar formulário quando os dados chegarem
  useState(() => {
    if (organizationData) {
      form.reset({
        name: organizationData.name,
        email: organizationData.email,
        phone: organizationData.phone,
        address: organizationData.address,
        city: organizationData.city,
        state: organizationData.state,
        postalCode: organizationData.postalCode,
        sendNotifications: organizationData.sendNotifications,
        theme: organizationData.theme,
      });
    }
  });
  
  // Mutação para atualizar configurações da organização
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: OrganizationSettings) => {
      const response = await apiRequest("PUT", "/api/organization/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações da sua organização foram atualizadas com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar configurações:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Manipular envio do formulário
  function onSubmit(data: OrganizationSettings) {
    updateSettingsMutation.mutate(data);
  }
  
  // Mutar envio de arquivo de logo
  const logoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      
      const response = await apiRequest("POST", "/api/organization/logo", formData, {
        headers: {
          // Não definir Content-Type aqui, o navegador definirá automaticamente com boundary para FormData
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/settings"] });
      toast({
        title: "Logo atualizada",
        description: "A logo da sua organização foi atualizada com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar logo:", error);
      toast({
        title: "Erro ao atualizar logo",
        description: "Ocorreu um erro ao atualizar a logo. Verifique o formato e tamanho do arquivo.",
        variant: "destructive",
      });
    },
  });
  
  // Manipular upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      logoUploadMutation.mutate(file);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Organização</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua organização
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="integracao">Integrações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>
                  Atualize as informações básicas da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Organização</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da organização" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@organizacao.com" {...field} />
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
                                <Input placeholder="(11) 98765-4321" {...field} />
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
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Endereço completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="UF" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input placeholder="00000-000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button type="submit" disabled={updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Logo da Organização</CardTitle>
                <CardDescription>
                  Carregue uma logo para sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted">
                    {organizationData?.logoUrl ? (
                      <img 
                        src={organizationData.logoUrl} 
                        alt="Logo da organização" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs text-center">
                        Sem logo
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo da organização</Label>
                    <Input 
                      id="logo" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      disabled={logoUploadMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="aparencia" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência da sua área de organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                        <div className="flex justify-between items-center mb-2">
                          <span>Claro</span>
                          <Badge variant="outline">Atual</Badge>
                        </div>
                        <div className="h-20 bg-white border border-gray-200 rounded"></div>
                      </div>
                      
                      <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                        <span className="block mb-2">Escuro</span>
                        <div className="h-20 bg-gray-900 border border-gray-700 rounded"></div>
                      </div>
                      
                      <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                        <span className="block mb-2">Sistema</span>
                        <div className="h-20 bg-gradient-to-r from-white to-gray-900 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cor primária</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                        <div className="h-8 bg-green-600 rounded mb-1"></div>
                        <span className="text-xs">Verde</span>
                      </div>
                      
                      <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                        <div className="h-8 bg-blue-600 rounded mb-1"></div>
                        <span className="text-xs">Azul</span>
                      </div>
                      
                      <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                        <div className="h-8 bg-purple-600 rounded mb-1"></div>
                        <span className="text-xs">Roxo</span>
                      </div>
                      
                      <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                        <div className="h-8 bg-red-600 rounded mb-1"></div>
                        <span className="text-xs">Vermelho</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button>Salvar aparência</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notificacoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie como e quando você recebe notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications-email">Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações por email
                        </p>
                      </div>
                      <Switch id="notifications-email" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications-system">Sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações no sistema
                        </p>
                      </div>
                      <Switch id="notifications-system" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications-whatsapp">WhatsApp</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações via WhatsApp
                        </p>
                      </div>
                      <Switch id="notifications-whatsapp" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tipos de notificação</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-updates">Atualizações do sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Novidades e melhorias na plataforma
                        </p>
                      </div>
                      <Switch id="notify-updates" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-limit">Limite de cadastros</Label>
                        <p className="text-sm text-muted-foreground">
                          Quando estiver próximo do limite do plano
                        </p>
                      </div>
                      <Switch id="notify-limit" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-billing">Cobrança</Label>
                        <p className="text-sm text-muted-foreground">
                          Faturas e cobranças do plano
                        </p>
                      </div>
                      <Switch id="notify-billing" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Salvar preferências</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integracao" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <div>
                          <h4 className="text-base font-medium">ERP Contábil</h4>
                          <p className="text-sm text-muted-foreground">
                            Integração com sistema contábil
                          </p>
                        </div>
                      </div>
                      <Badge>Configurado</Badge>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                        <div>
                          <h4 className="text-base font-medium">Gateway de Pagamento</h4>
                          <p className="text-sm text-muted-foreground">
                            Integração para processamento de pagamentos
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Não configurado</Badge>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
                        </div>
                        <div>
                          <h4 className="text-base font-medium">CRM</h4>
                          <p className="text-sm text-muted-foreground">
                            Integração com sistema de CRM
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Não configurado</Badge>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}