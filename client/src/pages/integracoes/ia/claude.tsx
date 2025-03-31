import { useState } from "react";
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
  Database,
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
  model: z.enum(["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"], {
    required_error: "Modelo é obrigatório",
  }),
  temperature: z.coerce.number()
    .min(0, "Temperatura mínima é 0")
    .max(1, "Temperatura máxima é 1")
    .default(0.7),
  maxTokens: z.coerce.number()
    .min(100, "Mínimo de 100 tokens")
    .max(100000, "Máximo de 100000 tokens")
    .default(4096),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  completionEvents: z.boolean().default(true),
  errorEvents: z.boolean().default(true),
});

// Componente principal para a página de integração do Claude
export default function ClaudeIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      model: "claude-3-sonnet-20240229" as const,
      temperature: 0.7,
      maxTokens: 4096
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm<z.infer<typeof webhookConfigSchema>>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      completionEvents: true,
      errorEvents: true
    }
  });
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data: z.infer<typeof apiConfigSchema>): void => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API do Claude foram atualizadas com sucesso.",
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
              Integração Claude (Anthropic)
            </h1>
            <p className="text-gray-500 mt-1">
              Configure a integração com o Claude para análises complexas e automação avançada
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
            A integração com o Claude da Anthropic possibilita a utilização de modelos avançados de 
            IA para processamento de linguagem natural. O Claude destaca-se pela capacidade de 
            compreender e gerar textos complexos, respeitando rigorosamente diretrizes éticas 
            e oferecendo explicações detalhadas, o que o torna ideal para aplicações médicas e científicas.
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
              description="Serviços Anthropic funcionando normalmente"
            />
            <StatCard 
              title="Organizações Utilizando" 
              value="7" 
              icon={BarChart4}
              description="Organizações com a integração ativa"
            />
            <StatCard 
              title="Versão da API" 
              value="v1" 
              icon={Info}
              description="Última atualização: 15/03/2025"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis na integração com o Claude
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Assistente Médico Avançado</span>
                      <p className="text-sm text-gray-500">Oriente profissionais de saúde com informações médicas precisas e contextualizadas.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Processamento de Documentos Científicos</span>
                      <p className="text-sm text-gray-500">Analise e resuma artigos científicos e literatura médica com alta precisão.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Escrita Técnica Especializada</span>
                      <p className="text-sm text-gray-500">Gere relatórios técnicos, artigos científicos e documentação médica especializada.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Análise de Dados Complexos</span>
                      <p className="text-sm text-gray-500">Interprete conjuntos de dados médicos complexos e extraia insights significativos.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Educação Médica Personalizada</span>
                      <p className="text-sm text-gray-500">Crie materiais educativos avançados adaptados ao nível de conhecimento do paciente.</p>
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
                          Acesse a documentação técnica completa da API do Claude.
                        </p>
                      </div>
                      <a 
                        href="https://docs.anthropic.com/claude/reference/" 
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
                        href="https://console.anthropic.com/" 
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
                        <h4 className="font-medium">Guia de Prompts</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Aprenda as melhores práticas para interagir com o Claude de forma eficaz.
                        </p>
                      </div>
                      <a 
                        href="https://docs.anthropic.com/claude/docs/introduction-to-prompt-design" 
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
                  <CardTitle>Configurações da API Anthropic</CardTitle>
                  <CardDescription>
                    Configure suas credenciais para integrar com o Claude
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
                              <Input placeholder="sk-ant-..." {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Chave de API da Anthropic para autenticação (começa com "sk-ant-")
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
                                  <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Máxima capacidade)</SelectItem>
                                  <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet (Equilibrado)</SelectItem>
                                  <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Mais rápido)</SelectItem>
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
                      </div>
                      
                      <FormField
                        control={apiConfigForm.control}
                        name="maxTokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tokens Máximos</FormLabel>
                            <FormControl>
                              <Input type="number" min="100" max="100000" {...field} />
                            </FormControl>
                            <FormDescription>
                              Número máximo de tokens a serem gerados em cada resposta
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                    Configure notificações para eventos da Anthropic
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
                            Configure o seguinte URL no painel da Anthropic para receber notificações:
                          </p>
                          <code className="mt-2 block p-2 bg-amber-100 rounded text-amber-900 text-xs font-mono">
                            {`${window.location.origin}/api/integrations/ia/claude/webhook`}
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
                                Receba notificações sobre eventos da API Anthropic
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
                Guia completo para utilizar a integração com o Claude
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Visão Geral
                </h3>
                <p className="text-gray-600 mb-2">
                  A integração com o Claude da Anthropic oferece acesso a um dos mais avançados 
                  assistentes de IA disponíveis atualmente. O Claude se destaca pela capacidade 
                  de compreender contextos complexos, processar grandes volumes de texto e 
                  fornecer respostas detalhadas com alta precisão técnica e científica.
                </p>
                <p className="text-gray-600">
                  Os modelos disponíveis incluem o Claude 3 Opus (mais poderoso e preciso), 
                  o Claude 3 Sonnet (equilíbrio entre desempenho e velocidade) e o Claude 3 Haiku 
                  (mais rápido e econômico), permitindo escolher a melhor opção para cada caso de uso.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Casos de Uso
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Análise de Literatura Médica</span>
                      <p className="text-gray-600 text-sm">
                        Extraia, sintetize e interprete informações de artigos científicos e 
                        publicações médicas sobre cannabis para uso medicinal.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Elaboração de Protocolos Clínicos</span>
                      <p className="text-gray-600 text-sm">
                        Auxilie na criação de protocolos de tratamento detalhados com base em 
                        evidências científicas atualizadas.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Suporte Especializado</span>
                      <p className="text-gray-600 text-sm">
                        Forneça orientação detalhada para profissionais de saúde sobre tratamentos 
                        com cannabis medicinal, incluindo dosagens, interações e contraindicações.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Educação Médica Avançada</span>
                      <p className="text-gray-600 text-sm">
                        Desenvolva materiais educativos de alto nível para profissionais e pacientes, 
                        adaptados às necessidades específicas de cada público.
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
                      Exemplo: Assistente Médico Especializado
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código de exemplo para criar um assistente especializado usando a API Claude
const { response } = await fetch('/api/integrations/ia/claude/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'system',
        content: \`Você é um assistente médico especializado em cannabis medicinal.
          Forneça informações precisas baseadas em evidências científicas atualizadas.
          Ao responder sobre tratamentos, sempre mencione dosagens, possíveis efeitos
          colaterais e contraindicações importantes.\`
      },
      {
        role: 'user',
        content: 'Quais são as evidências atuais para o uso de CBD no tratamento de epilepsia refratária?'
      }
    ],
    model: 'claude-3-opus-20240229',
    temperature: 0.2,
    max_tokens: 2000
  }),
}).then(res => res.json());

// 'response' contém a resposta detalhada do Claude`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">
                      Exemplo: Análise de Literatura Científica
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código para analisar artigos científicos
const { analysis } = await fetch('/api/integrations/ia/claude/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document: "[Texto completo do artigo científico...]",
    analysisType: 'scientific_review',
    format: {
      methodology: true,
      findings: true,
      limitations: true,
      clinical_implications: true
    }
  }),
}).then(res => res.json());

// 'analysis' contém um objeto estruturado com a análise do artigo`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-base font-medium">
                      Exemplo: Geração de Protocolo Clínico
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <pre className="text-sm font-mono overflow-x-auto">
{`// Código para gerar protocolos clínicos detalhados
const { protocol } = await fetch('/api/integrations/ia/claude/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateType: 'clinical_protocol',
    condition: 'Dor neuropática crônica',
    treatment: 'Cannabis medicinal (formulações ricas em CBD)',
    patientProfile: {
      age_range: '40-65',
      contraindications: ['história de psicose', 'arritmias graves'],
      concomitant_medications: ['antidepressivos', 'anticonvulsivantes']
    },
    evidenceLevel: 'high'
  }),
}).then(res => res.json());

// 'protocol' contém o protocolo clínico estruturado`}
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
                    <span>Use o modelo Claude 3 Opus para tarefas que exigem máxima precisão e compreensão em contextos médicos complexos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Forneça instruções específicas no prompt do sistema para direcionar o modelo a seguir diretrizes médicas apropriadas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Ajuste a temperatura para valores baixos (0.1-0.3) quando precisar de respostas factuais e precisas em contextos clínicos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Utilize o Claude para processamento de artigos científicos completos, aproveitando sua capacidade de lidar com textos extensos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Implemente revisão humana para todas as saídas utilizadas em contextos clínicos ou decisões de tratamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mantenha um histórico completo das conversas para referência e para garantir a continuidade do contexto médico.</span>
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

