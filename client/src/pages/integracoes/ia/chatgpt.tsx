import { forwardRef, ElementRef, ComponentPropsWithoutRef, useState } from "react";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  BarChart4,
  Info,
  ExternalLink,
  Brain,
  ChevronLeft,
  Settings,
  MessageSquare,
  User,
  BookOpen,
  Save,
  AlertCircle,
  Lightbulb,
  Code,
  Layers,
  Zap,
  FileText
} from "lucide-react";
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

// Componente de estatísticas para métricas
const StatCard = ({ title, value, icon, description }: {
  title: string;
  value: string | { positive: boolean; value: string };
  icon: React.ElementType;
  description?: string;
}) => {
  const Icon = icon;
  let valueColor = "text-gray-900";
  let bgColor = "bg-gray-100";
  let iconColor = "text-gray-500";
  
  if (typeof value === 'object' && value?.positive) {
    valueColor = "text-green-600";
    bgColor = "bg-green-100";
    iconColor = "text-green-500";
  } else if (typeof value === 'object' && value?.positive === false) {
    valueColor = "text-red-600";
    bgColor = "bg-red-100";
    iconColor = "text-red-500";
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h4 className={`text-2xl font-bold mt-1 ${valueColor}`}>
              {typeof value === 'object' ? value.value : value}
            </h4>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`${bgColor} p-2 rounded-md`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Schema para validação dos formulários
const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key é obrigatória"),
  model: z.enum(["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"], {
    required_error: "Modelo é obrigatório",
  }),
  organization: z.string().optional(),
  temperature: z.coerce.number()
    .min(0, "Temperatura mínima é 0")
    .max(1, "Temperatura máxima é 1")
    .default(0.7),
  maxTokens: z.coerce.number()
    .min(100, "Mínimo de 100 tokens")
    .max(4096, "Máximo de 4096 tokens")
    .default(2048),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  completionEvents: z.boolean().default(true),
  errorEvents: z.boolean().default(true),
  moderationEvents: z.boolean().default(true),
});

// Componente principal para a página de integração do ChatGPT
export default function ChatGPTIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      model: "gpt-3.5-turbo" as const,
      organization: "",
      temperature: 0.7,
      maxTokens: 2048
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm<z.infer<typeof webhookConfigSchema>>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      completionEvents: true,
      errorEvents: true,
      moderationEvents: true
    }
  });
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data: z.infer<typeof apiConfigSchema>): void => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API do ChatGPT foram atualizadas com sucesso.",
    });
  };
  
  // Função para salvar configurações de webhook
  const onSubmitWebhookConfig = (data: z.infer<typeof webhookConfigSchema>): void => {
    toast({
      title: "Configurações de webhook salvas",
      description: "As configurações de webhook foram atualizadas com sucesso.",
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Link href="/integracoes" className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Integrações
        </Link>
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="mr-3 h-8 w-8 text-primary" />
              Integração ChatGPT
            </h1>
            <p className="text-gray-500 mt-1">
              Configure a integração com o ChatGPT para automação de atendimento e análise de dados
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <span className="mr-3 text-sm font-medium">
              {isIntegrationEnabled ? "Integração Ativa" : "Integração Inativa"}
            </span>
            <Switch
              checked={isIntegrationEnabled}
              onCheckedChange={setIsIntegrationEnabled}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-8 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-800">Sobre esta integração</h3>
          <p className="text-blue-700 text-sm mt-1">
            A integração com o ChatGPT permite utilizar as capacidades de processamento de linguagem 
            natural da OpenAI para automação de atendimento ao cliente, análise de textos, geração 
            de conteúdo e muito mais. É possível configurar diferentes modelos e ajustar parâmetros 
            conforme as necessidades de cada organização.
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Status da API" 
              value={{ positive: true, value: "Operacional" }} 
              icon={CheckCircle2}
              description="Serviços OpenAI funcionando normalmente"
            />
            <StatCard 
              title="Organizações Utilizando" 
              value="15" 
              icon={BarChart4}
              description="Organizações com a integração ativa"
            />
            <StatCard 
              title="Versão da API" 
              value="v1" 
              icon={Info}
              description="Última atualização: 05/03/2025"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis na integração com o ChatGPT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Atendimento ao Cliente Automatizado</span>
                      <p className="text-sm text-gray-500">Crie assistentes virtuais que respondem perguntas, solucionam problemas e direcionam clientes.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Análise de Sentimento</span>
                      <p className="text-sm text-gray-500">Analise feedback e mensagens para entender o sentimento e as emoções dos clientes.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Geração de Conteúdo</span>
                      <p className="text-sm text-gray-500">Crie textos, descrições e comunicações personalizadas automaticamente.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Sumarização de Documentos</span>
                      <p className="text-sm text-gray-500">Obtenha resumos automatizados de documentos longos, relatórios e textos complexos.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Auxílio em Pesquisas</span>
                      <p className="text-sm text-gray-500">Utilize modelos avançados para auxiliar na análise de dados e pesquisas médicas.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
                <CardDescription>
                  Recursos e documentação para auxiliar na configuração e utilização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Documentação Oficial</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Acesse a documentação técnica completa da API do ChatGPT.
                        </p>
                      </div>
                      <a 
                        href="https://platform.openai.com/docs/api-reference" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Portal do Desenvolvedor</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Gerencie suas chaves API e monitore o uso dos serviços.
                        </p>
                      </div>
                      <a 
                        href="https://platform.openai.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Status dos Serviços</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Verifique o status atual da API e a disponibilidade dos serviços.
                        </p>
                      </div>
                      <a 
                        href="https://status.openai.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Configurações */}
        <TabsContent value="settings">
          <Tabs defaultValue="api" className="space-y-4">
            <TabsList>
              <TabsTrigger value="api">Configuração da API</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da API OpenAI</CardTitle>
                  <CardDescription>
                    Configure suas credenciais para integrar com o ChatGPT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiConfigForm}>
                    <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-4">
                      <FormField
                        control={apiConfigForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="sk-..." {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Chave de API da OpenAI para autenticação (começa com "sk-")
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiConfigForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modelo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o modelo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Modelo de IA a ser utilizado nas requisições
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiConfigForm.control}
                          name="organization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID da Organização (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="org-..." {...field} />
                              </FormControl>
                              <FormDescription>
                                ID da organização na OpenAI (deixe em branco para conta pessoal)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiConfigForm.control}
                          name="temperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Temperatura (0 a 1)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="1" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>
                                Controla a aleatoriedade das respostas (0 = mais determinístico, 1 = mais criativo)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiConfigForm.control}
                          name="maxTokens"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tokens Máximos</FormLabel>
                              <FormControl>
                                <Input type="number" min="100" max="4096" {...field} />
                              </FormControl>
                              <FormDescription>
                                Número máximo de tokens a serem gerados em cada resposta
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="mt-2">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </Button>
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
                    Configure notificações para eventos da OpenAI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookConfigForm}>
                    <form onSubmit={webhookConfigForm.handleSubmit(onSubmitWebhookConfig)} className="space-y-4">
                      <div className="bg-amber-50 p-4 rounded-lg mb-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-amber-800">URL do Webhook</h3>
                          <p className="text-amber-700 text-sm mt-1">
                            Configure o seguinte URL no painel da OpenAI para receber notificações:
                          </p>
                          <code className="mt-2 block p-2 bg-amber-100 rounded text-amber-900 text-xs font-mono">
                            {`${window.location.origin}/api/integrations/ia/chatgpt/webhook`}
                          </code>
                        </div>
                      </div>
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Ativar Webhooks</FormLabel>
                              <FormDescription>
                                Receba notificações sobre eventos da API OpenAI
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
                      
                      <div className="space-y-3">
                        <FormField
                          control={webhookConfigForm.control}
                          name="completionEvents"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Eventos de Completion</FormLabel>
                                <FormDescription>
                                  Notificações quando respostas são geradas com sucesso
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="errorEvents"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Eventos de Erro</FormLabel>
                                <FormDescription>
                                  Notificações quando ocorrem erros nas requisições
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="moderationEvents"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Eventos de Moderação</FormLabel>
                                <FormDescription>
                                  Notificações quando o conteúdo é moderado ou bloqueado
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="mt-2">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Documentação */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação da Integração</CardTitle>
              <CardDescription>
                Guia completo para utilizar a integração com o ChatGPT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Visão Geral
                </h3>
                <p className="text-gray-600 mb-2">
                  A integração com o ChatGPT permite utilizar a API da OpenAI para automatizar conversas, 
                  analisar textos e gerar conteúdo utilizando modelos avançados de IA. Esta integração 
                  é particularmente útil para melhorar o atendimento ao cliente, automatizar tarefas 
                  repetitivas de escrita e extrair insights de dados textuais.
                </p>
                <p className="text-gray-600">
                  Os modelos disponíveis incluem o GPT-3.5 Turbo (mais rápido e econômico) e o GPT-4 
                  (mais avançado e preciso), permitindo escolher a melhor opção para cada caso de uso.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Casos de Uso
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Assistentes Virtuais</span>
                      <p className="text-gray-600 text-sm">
                        Crie chatbots inteligentes que respondem perguntas, explicam conceitos médicos 
                        complexos e direcionam os pacientes para os recursos corretos.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Geração de Relatórios</span>
                      <p className="text-gray-600 text-sm">
                        Automatize a criação de relatórios, resumos e documentos a partir de dados 
                        brutos ou notas clínicas.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Personalização de Comunicações</span>
                      <p className="text-gray-600 text-sm">
                        Crie e-mails, mensagens e material educativo personalizado para cada paciente 
                        ou grupo específico.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Processamento de Feedback</span>
                      <p className="text-gray-600 text-sm">
                        Analise avaliações, pesquisas e mensagens dos pacientes para identificar tendências 
                        e áreas de melhoria.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-primary" />
                  Exemplos de Implementação
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">
                      Exemplo: Chatbot para Atendimento
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código de exemplo para criar um chatbot usando a API OpenAI
const { answer } = await fetch('/api/integrations/ia/chatgpt/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'Você é um assistente médico para uma clínica de cannabis medicinal.' },
      { role: 'user', content: 'Quais são os requisitos para obter prescrição de cannabis medicinal?' }
    ],
    temperature: 0.7,
    model: 'gpt-4'
  }),
}).then(res => res.json());

// 'answer' contém a resposta do modelo`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">
                      Exemplo: Análise de Sentimento
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código para analisar sentimento em feedbacks de pacientes
const { analysis } = await fetch('/api/integrations/ia/chatgpt/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: "O atendimento foi rápido e a equipe foi atenciosa, mas não recebi todas as informações que precisava sobre o tratamento.",
    analysisType: 'sentiment'
  }),
}).then(res => res.json());

// 'analysis' contém um objeto com classificação, polaridade e justificativa`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-base font-medium">
                      Exemplo: Sumarização de Documento
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código para resumir documentos médicos ou artigos científicos
const { summary } = await fetch('/api/integrations/ia/chatgpt/summarize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document: "[Texto longo do documento ou artigo científico]",
    maxLength: 250,  // Comprimento máximo do resumo em palavras
    focusOn: "clinical_implications" // Opcional: foco específico do resumo
  }),
}).then(res => res.json());

// 'summary' contém o texto do resumo gerado`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-primary" />
                  Melhores Práticas
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Forneça instruções claras e específicas ao modelo para obter melhores resultados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Utilize o parâmetro de temperatura para controlar a criatividade das respostas (0.0-1.0).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mantenha um histórico de conversa para melhorar a qualidade das interações contínuas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Implemente revisão humana para respostas críticas, especialmente em contextos médicos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Utilize o modelo GPT-4 para tarefas que exigem maior precisão e compreensão contextual.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Considere o uso de funções de moderação para filtrar conteúdo inapropriado.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Antigo comentário sobre o Checkbox (removido pois agora está importado no início do arquivo)
