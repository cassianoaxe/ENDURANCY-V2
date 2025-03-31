import React, { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  BarChart4,
  Info,
  ExternalLink,
  Clock,
  Truck,
  Download,
  FileText,
  MapPin,
  Filter,
  ChevronLeft,
  Save,
  AlertCircle,
  Settings,
  RefreshCw,
  Copy,
  Activity
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
  cartaoPostagem: z.string().min(1, "Cartão de postagem é obrigatório"),
  codigoAdministrativo: z.string().min(1, "Código administrativo é obrigatório"),
  usuario: z.string().min(1, "Usuário é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
  environment: z.enum(["homologacao", "producao"], {
    required_error: "Ambiente é obrigatório",
  }),
  contrato: z.string().min(1, "Número do contrato é obrigatório"),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  orderCreated: z.boolean().default(true),
  orderTracking: z.boolean().default(true),
  orderDelivered: z.boolean().default(true),
  orderCanceled: z.boolean().default(true),
  statusChange: z.boolean().default(true),
});

// Componente principal para a página de integração dos Correios
export default function CorreiosIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      cartaoPostagem: "",
      codigoAdministrativo: "",
      usuario: "",
      senha: "",
      environment: "homologacao",
      contrato: ""
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      orderCreated: true,
      orderTracking: true,
      orderDelivered: true,
      orderCanceled: true,
      statusChange: true
    }
  });
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data: z.infer<typeof apiConfigSchema>): void => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API dos Correios foram atualizadas com sucesso.",
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
              <Truck className="mr-3 h-8 w-8 text-primary" />
              Integração Correios
            </h1>
            <p className="text-gray-500 mt-1">
              Configure a integração com os Correios para envio de encomendas
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
            A integração com os Correios permite calcular preços e prazos, gerar etiquetas de envio, 
            rastrear objetos e utilizar outros serviços oferecidos pelos Correios brasileiros. Esta 
            integração é baseada na API oficial dos Correios para uso das transportadoras e e-commerces.
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
              description="Serviços dos Correios funcionando normalmente"
            />
            <StatCard 
              title="Organizações Utilizando" 
              value="12" 
              icon={BarChart4}
              description="Organizações com a integração ativa"
            />
            <StatCard 
              title="Versão da API" 
              value="v3.2.4" 
              icon={Info}
              description="Última atualização: 22/02/2025"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis na integração com os Correios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Cálculo de Preços e Prazos</span>
                      <p className="text-sm text-gray-500">Obtenha estimativas de valores e prazos de entrega para todos os serviços dos Correios.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Geração de Etiquetas</span>
                      <p className="text-sm text-gray-500">Crie e imprima etiquetas para postagem de encomendas diretamente no sistema.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Rastreamento de Objetos</span>
                      <p className="text-sm text-gray-500">Monitore o status de entrega e a localização atual das encomendas em tempo real.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Consulta de CEP</span>
                      <p className="text-sm text-gray-500">Busque e valide endereços a partir do CEP para garantir a entrega correta.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Logística Reversa</span>
                      <p className="text-sm text-gray-500">Gestão de autorizações e solicitações de postagem reversa.</p>
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
                          Acesse a documentação técnica completa disponibilizada pelos Correios.
                        </p>
                      </div>
                      <a 
                        href="https://www.correios.com.br/atendimento/developers/" 
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
                          Crie credenciais e gerencie suas integrações no portal oficial.
                        </p>
                      </div>
                      <a 
                        href="https://mais.correios.com.br/app/index.php" 
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
                        href="https://www.correios.com.br/atendimento/ferramentas/sistemas/categoria" 
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
                  <CardTitle>Configurações da API dos Correios</CardTitle>
                  <CardDescription>
                    Configure suas credenciais para integrar com os Correios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiConfigForm}>
                    <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiConfigForm.control}
                          name="cartaoPostagem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cartão de Postagem</FormLabel>
                              <FormControl>
                                <Input placeholder="Número do cartão de postagem" {...field} />
                              </FormControl>
                              <FormDescription>
                                Número do cartão de postagem vinculado ao seu contrato
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiConfigForm.control}
                          name="codigoAdministrativo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Administrativo</FormLabel>
                              <FormControl>
                                <Input placeholder="Código administrativo" {...field} />
                              </FormControl>
                              <FormDescription>
                                Código administrativo disponibilizado pelos Correios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiConfigForm.control}
                          name="usuario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome de usuário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiConfigForm.control}
                          name="senha"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input placeholder="Senha" {...field} type="password" />
                              </FormControl>
                              <FormDescription>
                                Mantenha este valor seguro e não compartilhe com terceiros
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiConfigForm.control}
                          name="environment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ambiente</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ambiente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="homologacao">Homologação (Testes)</SelectItem>
                                  <SelectItem value="producao">Produção</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Use Homologação para testes e Produção para operação real
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiConfigForm.control}
                          name="contrato"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do Contrato</FormLabel>
                              <FormControl>
                                <Input placeholder="Número do contrato com os Correios" {...field} />
                              </FormControl>
                              <FormDescription>
                                Número do contrato comercial estabelecido com os Correios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit">
                          <Save className="h-4 w-4 mr-2" /> Salvar Configurações
                        </Button>
                      </div>
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
                    Configure quais eventos você deseja receber notificações dos Correios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookConfigForm}>
                    <form onSubmit={webhookConfigForm.handleSubmit(onSubmitWebhookConfig)} className="space-y-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Ativar Webhooks
                              </FormLabel>
                              <FormDescription>
                                Receba notificações sobre eventos dos Correios
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
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium mb-4">Eventos de Notificação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={webhookConfigForm.control}
                            name="orderCreated"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Pedido Criado</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="orderTracking"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Atualização de Rastreio</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="orderDelivered"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Pedido Entregue</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="orderCanceled"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Pedido Cancelado</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="statusChange"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Mudança de Status</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">URL de Callback</h3>
                        <div className="flex">
                          <Input
                            readOnly
                            value={`${window.location.origin}/api/integrations/logistica/correios/webhook`}
                            className="rounded-r-none"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-l-none"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/api/integrations/logistica/correios/webhook`);
                              toast({
                                title: "URL copiada",
                                description: "A URL de callback foi copiada para a área de transferência.",
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Configure esta URL no painel dos Correios para receber eventos de webhook
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit">
                          <Save className="h-4 w-4 mr-2" /> Salvar Configurações
                        </Button>
                      </div>
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
              <CardTitle>Documentação da API dos Correios</CardTitle>
              <CardDescription>
                Guia básico de utilização e referência dos principais endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Sobre a API dos Correios</h3>
                  <p className="mt-2 text-gray-700">
                    A API dos Correios oferece acesso a diversos serviços necessários para e-commerces
                    e empresas que necessitam gerenciar envios de mercadorias. A comunicação é feita
                    através de SOAP/XML ou REST/JSON, dependendo do serviço utilizado.
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Primeiros Passos</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Para começar a utilizar a API dos Correios, você precisa:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Possuir contrato com os Correios para pessoa jurídica</li>
                          <li>Solicitar credenciais de acesso no portal dos Correios</li>
                          <li>Configurar as credenciais no painel administrativo</li>
                          <li>Realizar testes no ambiente de homologação</li>
                        </ol>
                        <div className="bg-gray-50 p-4 rounded-lg mt-4 border-l-4 border-blue-500">
                          <p className="text-sm text-gray-700">
                            <strong>Importante:</strong> Para obter acesso à API em ambiente de produção,
                            você deve passar pelo processo de homologação dos Correios, que inclui
                            testes e validação da integração.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Principais Endpoints</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h4 className="font-medium">Cálculo de Preços e Prazos</h4>
                          </div>
                          <div className="p-3">
                            <p className="text-sm mb-2">Obtenha os preços e estimativas de prazo de entrega para diversos serviços.</p>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                              GET /calculador/CalcPrecoPrazo.aspx
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h4 className="font-medium">Rastreamento de Objetos</h4>
                          </div>
                          <div className="p-3">
                            <p className="text-sm mb-2">Consulte o status atual e histórico de movimentações de objetos.</p>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                              POST /rastro/rastro/Rastro.wsdl
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h4 className="font-medium">Geração de Etiquetas</h4>
                          </div>
                          <div className="p-3">
                            <p className="text-sm mb-2">Crie etiquetas para envio de mercadorias.</p>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                              POST /sigep/SigepServicePort
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h4 className="font-medium">Consulta de CEP</h4>
                          </div>
                          <div className="p-3">
                            <p className="text-sm mb-2">Busque informações de endereço a partir do CEP.</p>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                              GET /cep/consulta/endereco/{'{CEP}'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Fluxo de Integração</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>O fluxo básico de integração com os Correios consiste em:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li className="pb-2">
                            <strong>Consulta de Preços e Prazos:</strong><br/>
                            <span className="text-sm text-gray-700">Apresente as opções de envio disponíveis baseadas no CEP de origem e destino, dimensões e peso do pacote.</span>
                          </li>
                          <li className="pb-2">
                            <strong>Geração de Etiquetas:</strong><br/>
                            <span className="text-sm text-gray-700">Após a escolha do serviço pelo cliente, gere as etiquetas de envio com código de rastreio.</span>
                          </li>
                          <li className="pb-2">
                            <strong>Acompanhamento:</strong><br/>
                            <span className="text-sm text-gray-700">Monitore o status do envio através do número de rastreio e informe o cliente sobre atualizações.</span>
                          </li>
                          <li className="pb-2">
                            <strong>Fechamento de PLPJ:</strong><br/>
                            <span className="text-sm text-gray-700">Agrupe seus envios em uma pré-lista de postagem (PLP) para facilitar a entrega aos Correios.</span>
                          </li>
                        </ol>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Códigos de Serviço</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Os principais códigos de serviço dos Correios são:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border rounded p-3">
                            <span className="font-medium">04014</span>
                            <p className="text-sm text-gray-700">SEDEX à vista</p>
                          </div>
                          <div className="border rounded p-3">
                            <span className="font-medium">04065</span>
                            <p className="text-sm text-gray-700">SEDEX à vista pagamento na entrega</p>
                          </div>
                          <div className="border rounded p-3">
                            <span className="font-medium">04510</span>
                            <p className="text-sm text-gray-700">PAC à vista</p>
                          </div>
                          <div className="border rounded p-3">
                            <span className="font-medium">04707</span>
                            <p className="text-sm text-gray-700">PAC à vista pagamento na entrega</p>
                          </div>
                          <div className="border rounded p-3">
                            <span className="font-medium">40215</span>
                            <p className="text-sm text-gray-700">SEDEX 10 (à vista e a faturar)</p>
                          </div>
                          <div className="border rounded p-3">
                            <span className="font-medium">40290</span>
                            <p className="text-sm text-gray-700">SEDEX Hoje Varejo</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Tratamento de Erros</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>A API dos Correios retorna códigos de erro específicos que devem ser tratados na integração:</p>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solução</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            <tr>
                              <td className="px-3 py-2">-1</td>
                              <td className="px-3 py-2">Código de serviço inválido</td>
                              <td className="px-3 py-2">Verifique se o código do serviço está correto</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">-2</td>
                              <td className="px-3 py-2">CEP de origem inválido</td>
                              <td className="px-3 py-2">Verifique o formato do CEP de origem</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">-3</td>
                              <td className="px-3 py-2">CEP de destino inválido</td>
                              <td className="px-3 py-2">Verifique o formato do CEP de destino</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">-4</td>
                              <td className="px-3 py-2">Peso excedido</td>
                              <td className="px-3 py-2">O peso máximo permitido foi ultrapassado</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">-999</td>
                              <td className="px-3 py-2">Erro não catalogado</td>
                              <td className="px-3 py-2">Entre em contato com o suporte dos Correios</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Precisa de ajuda?</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Para informações mais detalhadas, consulte a documentação oficial dos Correios ou entre em contato com nossa equipe de suporte.
                    </p>
                    <div className="mt-3">
                      <a 
                        href="https://www.correios.com.br/atendimento/developers" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Documentação Completa
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}