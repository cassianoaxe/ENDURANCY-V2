import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  BarChart4,
  Info,
  ExternalLink,
  ChevronLeft,
  Settings,
  Users,
  Briefcase,
  MessageSquare,
  Database,
  Layers,
  Activity,
  Zap,
  Check,
  AlertCircle,
  UserPlus,
  ListChecks,
  GitPullRequest
} from "lucide-react";
// import icon components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Componente de estatísticas para métricas
const StatCard = ({ title, value, icon, description }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Schema para validação do formulário de configuração
const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "Chave de API é obrigatória"),
  apiUrl: z.string().url("URL deve ser válida"),
  webhookUrl: z.string().url("URL de webhook deve ser válida").optional(),
  maxConnections: z.coerce.number().min(1).max(100),
  enableSync: z.boolean().default(true),
  syncInterval: z.coerce.number().min(5).max(1440),
  syncFields: z.array(z.string()).optional(),
  logging: z.boolean().default(true),
});

// Schema para validação do formulário de webhook
const webhookConfigSchema = z.object({
  webhookSecret: z.string().min(1, "Segredo do webhook é obrigatório"),
  contactEvents: z.boolean().default(true),
  dealEvents: z.boolean().default(true),
  companyEvents: z.boolean().default(true),
  taskEvents: z.boolean().default(false),
  errorEvents: z.boolean().default(true),
});

export default function KentroIntegration() {
  const { toast } = useToast();
  const [isActivated, setIsActivated] = useState(false);

  // Formulário de configuração da API
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiUrl: "https://api.kentrocloud.com/v1",
      webhookUrl: "https://app.endurancy.com/api/webhooks/kentro",
      maxConnections: 20,
      enableSync: true,
      syncInterval: 60,
      logging: true,
    },
  });

  // Formulário de configuração do webhook
  const webhookConfigForm = useForm<z.infer<typeof webhookConfigSchema>>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      webhookSecret: "",
      contactEvents: true,
      dealEvents: true,
      companyEvents: true,
      taskEvents: false,
      errorEvents: true,
    },
  });

  // Função para salvar configurações da API
  const onSaveApiConfig = (values: z.infer<typeof apiConfigSchema>) => {
    console.log("Configurações da API salvas:", values);
    
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da API foram salvas com sucesso.",
      });
    }, 1000);
  };

  // Função para salvar configurações do webhook
  const onSaveWebhookConfig = (values: z.infer<typeof webhookConfigSchema>) => {
    console.log("Configurações do webhook salvas:", values);
    
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "Configurações do webhook salvas",
        description: "As configurações do webhook foram salvas com sucesso.",
      });
    }, 1000);
  };

  // Função para ativar/desativar a integração
  const toggleActivation = () => {
    const newStatus = !isActivated;
    setIsActivated(newStatus);
    
    toast({
      title: newStatus ? "Integração ativada" : "Integração desativada",
      description: newStatus 
        ? "A integração com Kentro foi ativada com sucesso."
        : "A integração com Kentro foi desativada.",
    });
  };

  // Função para testar conexão com a API
  const testApiConnection = () => {
    // Simulação de teste de conexão
    setTimeout(() => {
      toast({
        title: "Conexão bem-sucedida",
        description: "A conexão com a API do Kentro foi estabelecida com sucesso.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/integracoes" className="mr-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integração com Kentro</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie a integração com a plataforma de CRM Kentro
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={testApiConnection}>
            Testar Conexão
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActivated}
              onCheckedChange={toggleActivation}
              id="activation-switch"
            />
            <label
              htmlFor="activation-switch"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {isActivated ? "Ativado" : "Desativado"}
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatCard
          title="Contatos Sincronizados"
          value="1,248"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Último sincronismo: hoje às 14:25"
        />
        <StatCard
          title="Empresas Integradas"
          value="256"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          description="Último sincronismo: hoje às 14:25"
        />
        <StatCard
          title="Negócios Ativos"
          value="128"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="Último sincronismo: hoje às 14:25"
        />
      </div>

      <Tabs defaultValue="configuration">
        <TabsList className="mb-4">
          <TabsTrigger value="configuration">Configuração</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="mapping">Mapeamento de Campos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da API</CardTitle>
              <CardDescription>
                Configure os parâmetros de conexão com a API do Kentro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiConfigForm}>
                <form onSubmit={apiConfigForm.handleSubmit(onSaveApiConfig)} className="space-y-4">
                  <FormField
                    control={apiConfigForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave da API</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          A chave da API pode ser obtida no painel administrativo do Kentro
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiConfigForm.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da API</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL base da API do Kentro
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={apiConfigForm.control}
                      name="maxConnections"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conexões Máximas</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={1} max={100} />
                          </FormControl>
                          <FormDescription>
                            Número máximo de conexões simultâneas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="syncInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intervalo de Sincronização (min)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={5} max={1440} />
                          </FormControl>
                          <FormDescription>
                            Intervalo entre sincronizações automáticas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={apiConfigForm.control}
                      name="enableSync"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Sincronização Automática</FormLabel>
                            <FormDescription>
                              Habilitar sincronização automática de dados
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="logging"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Registro de Logs</FormLabel>
                            <FormDescription>
                              Habilitar registro detalhado de logs
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="mt-4">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure os webhooks para receber notificações de eventos do Kentro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...webhookConfigForm}>
                <form onSubmit={webhookConfigForm.handleSubmit(onSaveWebhookConfig)} className="space-y-4">
                  <FormField
                    control={apiConfigForm.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL para onde o Kentro enviará as notificações de eventos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={webhookConfigForm.control}
                    name="webhookSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segredo do Webhook</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Chave secreta para verificar a autenticidade dos webhooks
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="contactEvents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Eventos de Contatos</FormLabel>
                              <FormDescription>
                                Notificações sobre criação e alteração de contatos
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="dealEvents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Eventos de Negócios</FormLabel>
                              <FormDescription>
                                Notificações sobre negócios e oportunidades
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="companyEvents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Eventos de Empresas</FormLabel>
                              <FormDescription>
                                Notificações sobre criação e alteração de empresas
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="taskEvents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Eventos de Tarefas</FormLabel>
                              <FormDescription>
                                Notificações sobre tarefas e lembretes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={webhookConfigForm.control}
                    name="errorEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Eventos de Erro</FormLabel>
                          <FormDescription>
                            Notificações quando ocorrem erros nas operações
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="mt-4">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Campos</CardTitle>
              <CardDescription>
                Configure como os campos entre o Kentro e o Endurancy são mapeados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="contacts">
                <TabsList className="mb-4">
                  <TabsTrigger value="contacts">Contatos</TabsTrigger>
                  <TabsTrigger value="companies">Empresas</TabsTrigger>
                  <TabsTrigger value="deals">Negócios</TabsTrigger>
                  <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contacts" className="space-y-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Mapeamento de Campos de Contatos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-72 rounded-md border">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-3 gap-4 mb-2 font-medium">
                            <div>Campo Endurancy</div>
                            <div>Campo Kentro</div>
                            <div>Sincronização</div>
                          </div>
                          
                          {[
                            { endurancy: "Nome", kentro: "first_name", direction: "Bidirecional" },
                            { endurancy: "Sobrenome", kentro: "last_name", direction: "Bidirecional" },
                            { endurancy: "Email", kentro: "email", direction: "Bidirecional" },
                            { endurancy: "Telefone", kentro: "phone", direction: "Bidirecional" },
                            { endurancy: "Endereço", kentro: "address", direction: "Somente Receber" },
                            { endurancy: "CPF", kentro: "custom.cpf", direction: "Somente Enviar" },
                            { endurancy: "Tipo de Cliente", kentro: "custom.client_type", direction: "Bidirecional" },
                            { endurancy: "Data de Registro", kentro: "created_at", direction: "Somente Receber" },
                            { endurancy: "Última Interação", kentro: "last_activity", direction: "Somente Receber" },
                            { endurancy: "Organização", kentro: "company_id", direction: "Bidirecional" },
                          ].map((item, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b">
                              <div>{item.endurancy}</div>
                              <div>{item.kentro}</div>
                              <div>
                                <Select defaultValue={item.direction.toLowerCase().replace(" ", "_")}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bidirecional">Bidirecional</SelectItem>
                                    <SelectItem value="somente_enviar">Somente Enviar</SelectItem>
                                    <SelectItem value="somente_receber">Somente Receber</SelectItem>
                                    <SelectItem value="desativado">Desativado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline">Adicionar Campo</Button>
                        <Button>Salvar Mapeamento</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="companies">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Mapeamento de Campos de Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">Mapeamento de Empresas</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Configure como os campos de empresas são mapeados entre as plataformas.
                          </p>
                          <Button className="mt-4" variant="outline">Configurar Mapeamento</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="deals">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Mapeamento de Campos de Negócios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                          <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">Mapeamento de Negócios</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Configure como os campos de negócios e oportunidades são mapeados.
                          </p>
                          <Button className="mt-4" variant="outline">Configurar Mapeamento</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Mapeamento de Campos de Tarefas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                          <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">Mapeamento de Tarefas</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Configure como os campos de tarefas e atividades são mapeados.
                          </p>
                          <Button className="mt-4" variant="outline">Configurar Mapeamento</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Integração</CardTitle>
              <CardDescription>
                Visualize os logs de atividades e erros da integração com Kentro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de Log" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Logs</SelectItem>
                      <SelectItem value="info">Informativos</SelectItem>
                      <SelectItem value="warning">Alertas</SelectItem>
                      <SelectItem value="error">Erros</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Info className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
                
                <Button variant="outline" size="sm">
                  Limpar Logs
                </Button>
              </div>
              
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 font-medium grid grid-cols-12 gap-4">
                  <div className="col-span-2">Timestamp</div>
                  <div className="col-span-1">Nível</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-7">Mensagem</div>
                </div>
                
                <ScrollArea className="h-[400px]">
                  {[
                    { timestamp: "2025-03-31 15:42:18", level: "info", category: "Sincronização", message: "Sincronização de contatos iniciada" },
                    { timestamp: "2025-03-31 15:42:20", level: "info", category: "API", message: "Requisição GET /contacts concluída com sucesso (200)" },
                    { timestamp: "2025-03-31 15:42:22", level: "info", category: "Sincronização", message: "48 contatos recebidos do Kentro" },
                    { timestamp: "2025-03-31 15:42:25", level: "warning", category: "Mapeamento", message: "Campo 'lead_source' não mapeado para 12 contatos" },
                    { timestamp: "2025-03-31 15:42:28", level: "error", category: "API", message: "Falha na requisição POST /deals - Erro 429: Too Many Requests" },
                    { timestamp: "2025-03-31 15:42:30", level: "info", category: "Webhook", message: "Evento 'contact.updated' recebido e processado" },
                    { timestamp: "2025-03-31 15:42:35", level: "info", category: "Sincronização", message: "Sincronização de empresas iniciada" },
                    { timestamp: "2025-03-31 15:42:38", level: "debug", category: "API", message: "Parâmetros de requisição: {limit: 100, page: 1, updated_since: '2025-03-30'}" },
                    { timestamp: "2025-03-31 15:42:40", level: "info", category: "API", message: "Requisição GET /companies concluída com sucesso (200)" },
                    { timestamp: "2025-03-31 15:42:42", level: "info", category: "Sincronização", message: "15 empresas recebidas do Kentro" },
                    { timestamp: "2025-03-31 15:42:45", level: "error", category: "Sincronização", message: "Falha na atualização da empresa ID: 2458 - Violação de chave única" },
                    { timestamp: "2025-03-31 15:42:50", level: "warning", category: "Webhook", message: "Assinatura de webhook inválida para evento 'deal.created'" },
                    { timestamp: "2025-03-31 15:42:55", level: "info", category: "Sincronização", message: "Sincronização de negócios iniciada" },
                    { timestamp: "2025-03-31 15:43:00", level: "info", category: "API", message: "Requisição GET /deals concluída com sucesso (200)" },
                    { timestamp: "2025-03-31 15:43:05", level: "info", category: "Sincronização", message: "32 negócios recebidos do Kentro" },
                  ].map((log, index) => (
                    <div 
                      key={index} 
                      className={`px-4 py-2 grid grid-cols-12 gap-4 border-t ${
                        log.level === "error" ? "bg-red-50" : 
                        log.level === "warning" ? "bg-amber-50" : ""
                      }`}
                    >
                      <div className="col-span-2 text-sm font-mono">{log.timestamp}</div>
                      <div className="col-span-1">
                        <Badge variant={
                          log.level === "error" ? "destructive" : 
                          log.level === "warning" ? "outline" :
                          log.level === "info" ? "default" : "secondary"
                        }>
                          {log.level}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-sm">{log.category}</div>
                      <div className="col-span-7 text-sm">{log.message}</div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
              <CardDescription>
                Guias e referências para utilizar a integração com Kentro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Guia de Início Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      Um guia passo a passo para configurar e começar a usar a integração com Kentro.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Acessar Guia
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Referência da API</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      Documentação completa da API do Kentro, endpoints e parâmetros.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Documentação
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Melhores Práticas</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      Recomendações para otimizar o uso da integração e evitar problemas comuns.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Práticas
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">FAQ</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      Respostas para perguntas frequentes sobre a integração com Kentro.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver FAQ
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Accordion type="single" collapsible className="mt-8">
                <AccordionItem value="setup">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Como configurar a integração
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Para configurar a integração com o Kentro, siga estes passos:</p>
                    <ol className="ml-6 list-decimal space-y-1">
                      <li>Acesse o painel administrativo do Kentro e crie uma nova chave de API</li>
                      <li>Insira a chave de API no campo correspondente na aba Configuração</li>
                      <li>Configure o URL de webhook no painel do Kentro</li>
                      <li>Configure os eventos que deseja receber na aba Webhooks</li>
                      <li>Configure o mapeamento de campos na aba Mapeamento</li>
                      <li>Ative a integração usando o switch no topo da página</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="contacts">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sincronização de contatos
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>A sincronização de contatos permite manter as informações de contatos atualizadas entre o Endurancy e o Kentro.</p>
                    <p>Pontos importantes:</p>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>A sincronização pode ser configurada como bidirecional ou unidirecional</li>
                      <li>Campos personalizados podem ser mapeados na aba Mapeamento</li>
                      <li>Conflitos são resolvidos de acordo com a política de sincronização configurada</li>
                      <li>A sincronização ocorre no intervalo configurado nas configurações da API</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="webhooks">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4" />
                      Configuração de webhooks
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Os webhooks permitem receber notificações em tempo real sobre eventos no Kentro.</p>
                    <p>Para configurar webhooks:</p>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>Defina um segredo de webhook para validar as requisições</li>
                      <li>Selecione os tipos de eventos que deseja receber</li>
                      <li>Configure o URL do webhook no painel do Kentro</li>
                      <li>Teste a configuração do webhook usando a ferramenta de teste no painel do Kentro</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="troubleshooting">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Solução de problemas
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Caso encontre problemas com a integração:</p>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>Verifique os logs na aba Logs para identificar erros</li>
                      <li>Certifique-se de que as credenciais da API estão corretas</li>
                      <li>Verifique se o webhook está configurado corretamente no Kentro</li>
                      <li>Confirme se o mapeamento de campos está configurado adequadamente</li>
                      <li>Verifique se há limitações de taxa (rate limits) na API do Kentro</li>
                      <li>Entre em contato com o suporte se o problema persistir</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}