import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Truck,
  Loader2,
  BarChart4,
  FileText,
  Settings,
  Building2,
  Coins
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Esquema de configuração da API
const apiConfigSchema = z.object({
  clientId: z.string().min(1, "O Client ID é obrigatório"),
  clientSecret: z.string().min(1, "O Client Secret é obrigatório"),
  email: z.string().email("Email inválido").min(1, "O email é obrigatório"),
  senha: z.string().min(1, "A senha é obrigatória"),
  environment: z.enum(["sandbox", "production"]),
  callbackUrl: z.string()
});

// Esquema de configuração de webhooks
const webhookConfigSchema = z.object({
  enabled: z.boolean(),
  trackingUpdated: z.boolean(),
  invoiceGenerated: z.boolean(),
  orderCreated: z.boolean(),
  orderDelivered: z.boolean(),
  orderCanceled: z.boolean()
});

// Componente principal
export default function AzulCargo() {
  // Estados
  const [activeTab, setActiveTab] = useState("overview");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'success' | 'error'>('none');

  // Formulários
  const apiConfigForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      email: "",
      senha: "",
      environment: "sandbox",
      callbackUrl: `${window.location.origin}/api/integracoes/logistica/azul-cargo/webhook`
    }
  });

  const webhookConfigForm = useForm<z.infer<typeof webhookConfigSchema>>({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: false,
      trackingUpdated: true,
      invoiceGenerated: true,
      orderCreated: true,
      orderDelivered: true,
      orderCanceled: true
    }
  });

  // Funções de submissão
  const onSubmitApiConfig = (data: z.infer<typeof apiConfigSchema>) => {
    toast({
      title: "Configurações da API salvas",
      description: "As configurações da API da Azul Cargo foram salvas com sucesso."
    });
    testConnection(data);
  };

  const onSubmitWebhookConfig = (data: z.infer<typeof webhookConfigSchema>) => {
    toast({
      title: "Configurações de Webhook salvas",
      description: "As configurações de webhook da Azul Cargo foram salvas com sucesso."
    });
  };

  // Teste de conexão com a API
  const testConnection = async (data: z.infer<typeof apiConfigSchema>) => {
    setIsTestingConnection(true);
    setConnectionStatus('none');
    
    try {
      // Simule uma chamada à API para autenticação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular sucesso
      setConnectionStatus('success');
      toast({
        title: "Conexão estabelecida",
        description: "Conexão com a API da Azul Cargo realizada com sucesso."
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar à API da Azul Cargo.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-500 p-2 rounded-lg mr-4">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Azul Cargo</h1>
            <p className="text-gray-500">Integração com serviços de carga aérea da Azul</p>
          </div>
        </div>
        
        <Badge variant={connectionStatus === 'success' ? "default" : connectionStatus === 'error' ? "destructive" : "outline"}>
          {connectionStatus === 'success' ? "Conectado" : connectionStatus === 'error' ? "Desconectado" : "Status da conexão"}
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" /> 
                  Configuração da Integração
                </CardTitle>
                <CardDescription>
                  Gerencie a integração com a Azul Cargo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Configure as credenciais e webhooks necessários para que as organizações possam utilizar os serviços da Azul Cargo.
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("settings")}>
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" /> 
                  Documentação Técnica
                </CardTitle>
                <CardDescription>
                  Acesse recursos para integração
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Consulte a documentação e recursos técnicos para auxiliar as organizações na utilização da integração.
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("docs")}>
                    Ver Documentação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre a integração Azul Cargo</CardTitle>
                <CardDescription>
                  Papel do administrador na integração com a Azul Cargo Express
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Papel do Administrador</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Como administrador do Endurancy, seu papel é configurar a integração para que as organizações possam utilizar os serviços da Azul Cargo com suas próprias credenciais.
                    </p>
                    <p className="text-sm text-blue-700">
                      Você é responsável por <strong>configurar</strong> e <strong>manter</strong> a integração, não por <strong>operar</strong> as funcionalidades (como cotação de fretes ou rastreamento).
                    </p>
                  </div>
                  
                  <p>
                    A integração com a Azul Cargo Express permite às organizações realizar cotações, rastreamentos, localizar filiais e emitir documentos de transporte a partir de seus ambientes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-blue-500" /> Recursos disponíveis para organizações
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Cotação de fretes
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Rastreamento de encomendas
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Localização de filiais
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Emissão de etiquetas e AWBs
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Webhooks para notificações
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-blue-500" /> Responsabilidades do administrador
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Configuração da API
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Configuração de webhooks
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Manutenção da integração
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Monitoramento da saúde da conexão
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full p-1 mr-2">✓</span>
                          Disponibilização de documentação técnica
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mt-6">
                    <p className="text-sm">
                      <strong>Nota:</strong> As organizações precisam possuir suas próprias contas na Azul Cargo Express e solicitar suas credenciais de API. Sua responsabilidade é garantir que a integração esteja configurada e disponível para uso.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Configurações */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração da API</CardTitle>
                <CardDescription>
                  Configure as credenciais de acesso à API da Azul Cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...apiConfigForm}>
                  <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-4">
                    <FormField
                      control={apiConfigForm.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Client ID fornecido pela Azul Cargo" {...field} />
                          </FormControl>
                          <FormDescription>
                            ID do cliente fornecido pela Azul Cargo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="clientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Client Secret fornecido pela Azul Cargo" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Chave secreta fornecida pela Azul Cargo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Email da conta Azul Cargo" 
                              {...field} 
                            />
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
                            <Input 
                              type="password" 
                              placeholder="Senha da conta Azul Cargo" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                              <SelectItem value="production">Produção</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Ambiente de execução da API
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="callbackUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Callback</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormDescription>
                            URL para receber webhooks da Azul Cargo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isTestingConnection}>
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testando conexão...
                        </>
                      ) : (
                        "Salvar configurações"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de Webhooks</CardTitle>
                  <CardDescription>
                    Configure os eventos que serão recebidos via webhook
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookConfigForm}>
                    <form onSubmit={webhookConfigForm.handleSubmit(onSubmitWebhookConfig)} className="space-y-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Ativar Webhooks</FormLabel>
                              <FormDescription>
                                Receba notificações em tempo real
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
                      
                      <div className="border rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-medium">Eventos para receber notificações</h3>
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="trackingUpdated"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Atualização de rastreio</FormLabel>
                                <FormDescription>
                                  Notificar quando houver alteração no status de rastreio
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="invoiceGenerated"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Geração de fatura</FormLabel>
                                <FormDescription>
                                  Notificar quando uma nova fatura for gerada
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="orderCreated"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Criação de pedido</FormLabel>
                                <FormDescription>
                                  Notificar quando um novo pedido for criado
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="orderDelivered"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Entrega de pedido</FormLabel>
                                <FormDescription>
                                  Notificar quando um pedido for entregue
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={webhookConfigForm.control}
                          name="orderCanceled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Cancelamento de pedido</FormLabel>
                                <FormDescription>
                                  Notificar quando um pedido for cancelado
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Salvar configurações de webhook
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status da Integração</CardTitle>
                  <CardDescription>
                    Informações sobre o estado atual da integração
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Status da API:</span>
                      <Badge variant={connectionStatus === 'success' ? "default" : connectionStatus === 'error' ? "destructive" : "outline"}>
                        {connectionStatus === 'success' ? "Conectado" : connectionStatus === 'error' ? "Desconectado" : "Não verificado"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Webhooks:</span>
                      <Badge variant={webhookConfigForm.watch("enabled") ? "default" : "outline"}>
                        {webhookConfigForm.watch("enabled") ? "Ativados" : "Desativados"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">Ambiente:</span>
                      <Badge variant={apiConfigForm.watch("environment") === "production" ? "default" : "secondary"}>
                        {apiConfigForm.watch("environment") === "production" ? "Produção" : "Sandbox"}
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => testConnection(apiConfigForm.getValues())}
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          "Testar Conexão"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Documentação */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API Azul Cargo</CardTitle>
              <CardDescription>
                Referência técnica para a integração com a Azul Cargo Express
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-3">Visão Geral</h3>
                <p className="text-sm text-gray-500 mb-4">
                  A API da Azul Cargo Express permite a integração com os serviços de logística da Azul Linhas Aéreas, oferecendo funcionalidades como cotação de fretes, rastreamento de encomendas, busca de filiais e emissão de documentos.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm flex items-start">
                    <Building2 className="h-5 w-5 mr-2 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Documentação oficial:</strong>{" "}
                      <a 
                        href="https://hmg.onlineapp.com.br/EDIv2_API_INTEGRACAO_Toolkit/Home/English" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        https://hmg.onlineapp.com.br/EDIv2_API_INTEGRACAO_Toolkit/Home/English
                      </a>
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-3">Endpoints Principais</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="pb-2 border-b">
                      <span className="font-medium">Autenticação</span>
                      <p className="text-gray-500 mt-1">Endpoint para obtenção de token de autenticação para acessar a API.</p>
                    </li>
                    <li className="pb-2 border-b">
                      <span className="font-medium">Cotação</span>
                      <p className="text-gray-500 mt-1">Consulta de preços e prazos para envios entre CEPs.</p>
                    </li>
                    <li className="pb-2 border-b">
                      <span className="font-medium">Rastreamento</span>
                      <p className="text-gray-500 mt-1">Consulta do status atual e histórico de entrega de uma encomenda.</p>
                    </li>
                    <li className="pb-2 border-b">
                      <span className="font-medium">Filiais</span>
                      <p className="text-gray-500 mt-1">Localização de pontos de atendimento da Azul Cargo.</p>
                    </li>
                    <li>
                      <span className="font-medium">Webhooks</span>
                      <p className="text-gray-500 mt-1">Configuração para receber notificações de eventos via callback.</p>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-3">Ambiente de Testes</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    O ambiente de sandbox permite testar a integração sem realizar transações reais. Todas as funcionalidades estão disponíveis, mas os fretes não são efetivamente processados.
                  </p>
                  <h4 className="font-medium mb-2">URLs de API</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-mono bg-gray-100 p-1 rounded">Sandbox: https://hmg.onlineapp.com.br/api/v2/</span>
                    </li>
                    <li>
                      <span className="font-mono bg-gray-100 p-1 rounded">Produção: https://onlineapp.com.br/api/v2/</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-3">Guia para Organizações</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Como administrador do Endurancy, você pode orientar as organizações sobre como obter acesso à API da Azul Cargo:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                  <li>Entrar em contato com a equipe da Azul Cargo para solicitar credenciais de acesso à API.</li>
                  <li>Após receber as credenciais, configurar no ambiente da organização dentro do Endurancy.</li>
                  <li>Realizar testes no ambiente de sandbox.</li>
                  <li>Configurar os webhooks para receber atualizações em tempo real.</li>
                  <li>Migrar para o ambiente de produção quando os testes forem satisfatórios.</li>
                </ol>
                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Cada organização deve possuir suas próprias credenciais de acesso à API da Azul Cargo. O Endurancy apenas fornece a infraestrutura para a integração, mas não compartilha credenciais entre organizações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}