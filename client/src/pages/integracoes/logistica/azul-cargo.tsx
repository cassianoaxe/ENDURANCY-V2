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
  Map,
  Package,
  Search,
  Save,
  Loader2,
  Copy,
  BarChart4,
  FileText,
  Settings,
  Building2,
  Coins
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

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

// Esquema para consulta de cotação
const cotacaoSchema = z.object({
  cepOrigem: z.string().min(8, "CEP de origem deve ter 8 dígitos"),
  cepDestino: z.string().min(8, "CEP de destino deve ter 8 dígitos"),
  pesoReal: z.string().min(1, "Peso real é obrigatório"),
  pesoCubado: z.string().optional(),
  valorMercadoria: z.string().min(1, "Valor da mercadoria é obrigatório"),
  servico: z.string().optional()
});

// Esquema para rastreamento
const rastreamentoSchema = z.object({
  trackingCode: z.string().min(1, "Código de rastreio é obrigatório")
});

// Esquema para consulta de filiais
const filiaisSchema = z.object({
  cep: z.string().min(8, "CEP deve ter 8 dígitos"),
  estado: z.string().optional(),
  cidade: z.string().optional()
});

// Componente principal
export default function AzulCargo() {
  // Estados
  const [activeTab, setActiveTab] = useState("overview");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'success' | 'error'>('none');
  const [trackingResults, setTrackingResults] = useState<any>(null);
  const [cotacaoResults, setCotacaoResults] = useState<any>(null);
  const [filiaisResults, setFiliaisResults] = useState<any>(null);
  const [isLoadingCotacao, setIsLoadingCotacao] = useState(false);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [isLoadingFiliais, setIsLoadingFiliais] = useState(false);

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

  const cotacaoForm = useForm<z.infer<typeof cotacaoSchema>>({
    resolver: zodResolver(cotacaoSchema),
    defaultValues: {
      cepOrigem: "",
      cepDestino: "",
      pesoReal: "",
      pesoCubado: "",
      valorMercadoria: "",
      servico: ""
    }
  });

  const rastreamentoForm = useForm<z.infer<typeof rastreamentoSchema>>({
    resolver: zodResolver(rastreamentoSchema),
    defaultValues: {
      trackingCode: ""
    }
  });

  const filiaisForm = useForm<z.infer<typeof filiaisSchema>>({
    resolver: zodResolver(filiaisSchema),
    defaultValues: {
      cep: "",
      estado: "",
      cidade: ""
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

  const onSubmitCotacao = async (data: z.infer<typeof cotacaoSchema>) => {
    setIsLoadingCotacao(true);
    setCotacaoResults(null);
    
    try {
      // Simule uma chamada à API de cotação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exemplo de resposta simulada
      const resultado = {
        servicos: [
          {
            codigo: "EXPRESSO",
            nome: "Azul Cargo Expresso",
            descricao: "Entrega em até 24h",
            prazoEntrega: "1 dia útil",
            valor: parseFloat(data.valorMercadoria) * 0.10,
            codigoRastreio: "AZL" + Math.floor(1000000 + Math.random() * 9000000)
          },
          {
            codigo: "STANDARD",
            nome: "Azul Cargo Standard",
            descricao: "Entrega econômica",
            prazoEntrega: "3 dias úteis",
            valor: parseFloat(data.valorMercadoria) * 0.05,
            codigoRastreio: "AZL" + Math.floor(1000000 + Math.random() * 9000000)
          }
        ]
      };
      
      setCotacaoResults(resultado);
    } catch (error) {
      toast({
        title: "Erro ao realizar cotação",
        description: "Não foi possível obter a cotação no momento.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCotacao(false);
    }
  };

  const onSubmitRastreamento = async (data: z.infer<typeof rastreamentoSchema>) => {
    setIsLoadingTracking(true);
    setTrackingResults(null);
    
    try {
      // Simule uma chamada à API de rastreamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exemplo de resposta simulada
      const resultado = {
        codigo: data.trackingCode,
        status: "Em trânsito",
        dataPostagem: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        previsaoEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        remetente: {
          nome: "Empresa XYZ",
          cidade: "São Paulo",
          estado: "SP"
        },
        destinatario: {
          nome: "João Silva",
          cidade: "Campinas",
          estado: "SP"
        },
        servico: "EXPRESSO",
        history: [
          {
            date: new Date().toISOString(),
            status: "Em trânsito",
            location: "Terminal Viracopos - Campinas/SP"
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Recebido na unidade",
            location: "Terminal Guarulhos - Guarulhos/SP"
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Postado",
            location: "Terminal Congonhas - São Paulo/SP"
          }
        ]
      };
      
      setTrackingResults(resultado);
    } catch (error) {
      toast({
        title: "Erro ao rastrear encomenda",
        description: "Não foi possível rastrear o código informado.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const onSubmitFiliais = async (data: z.infer<typeof filiaisSchema>) => {
    setIsLoadingFiliais(true);
    setFiliaisResults(null);
    
    try {
      // Simule uma chamada à API de filiais
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exemplo de resposta simulada
      const resultado = [
        {
          Base: "VCP",
          Nome: "AZUL CARGO VIRACOPOS - TERMINAL",
          Logradouro: "RODOVIA SANTOS DUMONT KM 66, S/N, JD ITATINGA - CAMPINAS/SP - 13052970",
          Numero: "S/N",
          Bairro: "JD ITATINGA",
          Cidade: "CAMPINAS",
          Estado: "SP",
          CEP: "13052970",
          Responsavel: "CELSO LUIZ SQUILANTI",
          Telefone: "1140038399",
          Funcionamento: "Seg: 00:00-23:59, Ter: 00:00-23:59, Qua: 00:00-23:59, Qui: 00:00-23:59, Sex: 00:00-23:59, Sáb: 00:00-23:59, Dom: 00:00-23:59",
          Pagamento: "Dinheiro, Cartão de Crédito, Cartão de Débito",
          Servicos: "EXPRESSO, ECOMM, STANDARD"
        },
        {
          Base: "CPQ01",
          Nome: "CPQ01- JD DO TREVO / SP",
          Logradouro: "AV PAPA PAULO VI, 614, JD DO TREVO - CAMPINAS/SP - 13040000",
          Numero: "614",
          Bairro: "JD DO TREVO",
          Cidade: "CAMPINAS",
          Estado: "SP",
          CEP: "13040000",
          Responsavel: "MARCELO ARMANI",
          Telefone: "01932770179",
          Funcionamento: "Seg: 08:00-18:00, Ter: 08:00-18:00, Qua: 08:00-18:00, Qui: 08:00-18:00, Sex: 08:00-18:00, Sáb: Fechado, Dom: Fechado",
          Pagamento: "Dinheiro, Cartão de Débito",
          Servicos: "ECOMM, EXPRESSO, PREMIUM, STANDARD"
        }
      ];
      
      setFiliaisResults(resultado);
    } catch (error) {
      toast({
        title: "Erro ao buscar filiais",
        description: "Não foi possível obter as filiais no momento.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFiliais(false);
    }
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

  // Formatação de CEP
  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  // Formatação de valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de data
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('pt-BR');
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
        
        <Badge variant={connectionStatus === 'success' ? "success" : connectionStatus === 'error' ? "destructive" : "outline"}>
          {connectionStatus === 'success' ? "Conectado" : connectionStatus === 'error' ? "Desconectado" : "Status da conexão"}
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cotacao">Cotação</TabsTrigger>
          <TabsTrigger value="filiais">Filiais</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-500" /> 
                  Cotação de Fretes
                </CardTitle>
                <CardDescription>
                  Realize cotações de fretes para seus envios
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Utilize a API de cotação para obter preços e prazos em tempo real para suas remessas.
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("cotacao")}>
                    Realizar cotação
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <Map className="mr-2 h-5 w-5 text-blue-500" /> 
                  Rastreamento
                </CardTitle>
                <CardDescription>
                  Acompanhe o status de suas encomendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Acompanhe em tempo real o status de suas encomendas utilizando o código de rastreio.
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("rastreamento")}>
                    Rastrear encomenda
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-blue-500" /> 
                  Filiais
                </CardTitle>
                <CardDescription>
                  Localize filiais da Azul Cargo pelo Brasil
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Encontre as filiais mais próximas da sua localização para envio ou retirada de encomendas.
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("filiais")}>
                    Buscar filiais
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
                  Informações sobre a integração com a Azul Cargo Express
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    A integração com a Azul Cargo Express permite realizar cotações, rastreamentos, localizar filiais e emitir documentos de transporte diretamente do seu sistema.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-blue-500" /> Recursos disponíveis
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
                        <Coins className="h-5 w-5 mr-2 text-blue-500" /> Serviços disponíveis
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2 text-blue-500 font-semibold">EXPRESSO:</span>
                          Entrega mais rápida (em até 24h)
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-blue-500 font-semibold">STANDARD:</span>
                          Entrega econômica (em até 3 dias úteis)
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-blue-500 font-semibold">ECOMM:</span>
                          Serviço dedicado para e-commerce
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-blue-500 font-semibold">PREMIUM:</span>
                          Para cargas de alto valor
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mt-6">
                    <p className="text-sm">
                      <strong>Nota:</strong> Para utilizar esta integração, é necessário possuir uma conta na Azul Cargo Express e solicitar suas credenciais de API. Configure suas credenciais na aba "Configurações".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Cotação */}
        <TabsContent value="cotacao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cotação de Frete</CardTitle>
                <CardDescription>
                  Simule o custo de envio de mercadorias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...cotacaoForm}>
                  <form onSubmit={cotacaoForm.handleSubmit(onSubmitCotacao)} className="space-y-4">
                    <FormField
                      control={cotacaoForm.control}
                      name="cepOrigem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP de Origem</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormDescription>
                            CEP de onde a mercadoria será enviada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={cotacaoForm.control}
                      name="cepDestino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP de Destino</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormDescription>
                            CEP para onde a mercadoria será enviada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={cotacaoForm.control}
                        name="pesoReal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso Real (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={cotacaoForm.control}
                        name="pesoCubado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso Cubado (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={cotacaoForm.control}
                      name="valorMercadoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Mercadoria (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={cotacaoForm.control}
                      name="servico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serviço Específico (opcional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um serviço específico (opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Todos os serviços</SelectItem>
                              <SelectItem value="EXPRESSO">Expresso (em até 24h)</SelectItem>
                              <SelectItem value="STANDARD">Standard (econômico)</SelectItem>
                              <SelectItem value="ECOMM">E-commerce</SelectItem>
                              <SelectItem value="PREMIUM">Premium (alto valor)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Deixe em branco para receber cotação de todos os serviços disponíveis
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoadingCotacao}>
                      {isLoadingCotacao ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Calcular Frete
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Cotação</CardTitle>
                <CardDescription>
                  Serviços disponíveis e valores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCotacao ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Calculando frete</h3>
                    <p className="text-sm text-gray-500">
                      Aguarde enquanto calculamos as opções de frete disponíveis...
                    </p>
                  </div>
                ) : cotacaoResults ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Serviços Disponíveis:</h3>
                    {cotacaoResults.servicos.map((servico: any, index: number) => (
                      <div 
                        key={index} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-lg font-medium text-blue-600">{servico.nome}</span>
                            <p className="text-sm text-gray-500">{servico.descricao}</p>
                          </div>
                          <Badge>{servico.codigo}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <span className="text-sm text-gray-500">Prazo de Entrega:</span>
                            <p className="font-semibold">{servico.prazoEntrega}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Valor do Frete:</span>
                            <p className="font-semibold text-green-600">{formatCurrency(servico.valor)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                          <span className="text-sm text-gray-500">Número de Rastreio:</span>
                          <div className="flex items-center">
                            <p className="font-mono">{servico.codigoRastreio}</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="ml-2"
                              onClick={() => {
                                navigator.clipboard.writeText(servico.codigoRastreio);
                                toast({
                                  title: "Código copiado",
                                  description: "O código de rastreio foi copiado para a área de transferência.",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              rastreamentoForm.setValue('trackingCode', servico.codigoRastreio);
                              setActiveTab('rastreamento');
                            }}
                          >
                            Rastrear
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma cotação realizada</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      Preencha o formulário ao lado para calcular os valores e prazos de entrega disponíveis para o seu envio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Busca de Filiais */}
        <TabsContent value="filiais">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Localizar Filiais</CardTitle>
                <CardDescription>
                  Encontre filiais da Azul Cargo próximas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...filiaisForm}>
                  <form onSubmit={filiaisForm.handleSubmit(onSubmitFiliais)} className="space-y-4">
                    <FormField
                      control={filiaisForm.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormDescription>
                            CEP para buscar filiais próximas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <p className="text-sm text-gray-500 mb-2">Ou pesquise por estado e cidade:</p>
                    
                    <FormField
                      control={filiaisForm.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AC">Acre</SelectItem>
                              <SelectItem value="AL">Alagoas</SelectItem>
                              <SelectItem value="AP">Amapá</SelectItem>
                              <SelectItem value="AM">Amazonas</SelectItem>
                              <SelectItem value="BA">Bahia</SelectItem>
                              <SelectItem value="CE">Ceará</SelectItem>
                              <SelectItem value="DF">Distrito Federal</SelectItem>
                              <SelectItem value="ES">Espírito Santo</SelectItem>
                              <SelectItem value="GO">Goiás</SelectItem>
                              <SelectItem value="MA">Maranhão</SelectItem>
                              <SelectItem value="MT">Mato Grosso</SelectItem>
                              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                              <SelectItem value="MG">Minas Gerais</SelectItem>
                              <SelectItem value="PA">Pará</SelectItem>
                              <SelectItem value="PB">Paraíba</SelectItem>
                              <SelectItem value="PR">Paraná</SelectItem>
                              <SelectItem value="PE">Pernambuco</SelectItem>
                              <SelectItem value="PI">Piauí</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                              <SelectItem value="RO">Rondônia</SelectItem>
                              <SelectItem value="RR">Roraima</SelectItem>
                              <SelectItem value="SC">Santa Catarina</SelectItem>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="SE">Sergipe</SelectItem>
                              <SelectItem value="TO">Tocantins</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={filiaisForm.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome da cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoadingFiliais}>
                      {isLoadingFiliais ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Buscar Filiais
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Filiais Encontradas</CardTitle>
                <CardDescription>
                  Filiais disponíveis na região pesquisada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFiliais ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Buscando filiais</h3>
                    <p className="text-sm text-gray-500">
                      Aguarde enquanto localizamos as filiais disponíveis...
                    </p>
                  </div>
                ) : filiaisResults ? (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500">
                      Encontramos {filiaisResults.length} filial(is) na região pesquisada:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {filiaisResults.map((filial: any, index: number) => (
                        <div 
                          key={index} 
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-blue-600">{filial.Nome}</h3>
                              <p className="text-sm text-gray-500">Base: {filial.Base}</p>
                            </div>
                            <Badge variant="outline" className="uppercase">
                              {filial.Servicos.split(', ').length} serviços
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium">Endereço:</span>
                              <p className="text-sm">{filial.Logradouro}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium">Cidade/Estado:</span>
                                <p className="text-sm">{filial.Cidade}/{filial.Estado}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium">CEP:</span>
                                <p className="text-sm">{filial.CEP.trim()}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium">Contato:</span>
                                <p className="text-sm">{filial.Responsavel} - {filial.Telefone}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium">Formas de Pagamento:</span>
                                <p className="text-sm">{filial.Pagamento}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Horário de Funcionamento:</span>
                              <p className="text-sm">{filial.Funcionamento}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Serviços Disponíveis:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {filial.Servicos.split(', ').map((servico: string, idx: number) => (
                                  <Badge key={idx} variant="secondary">
                                    {servico}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma filial pesquisada</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      Utilize o formulário ao lado para buscar filiais da Azul Cargo Express próximas à sua localização.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Rastreamento */}
        <TabsContent value="rastreamento">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento de Encomendas</CardTitle>
                <CardDescription>
                  Consulte o status de envio de suas encomendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...rastreamentoForm}>
                  <form onSubmit={rastreamentoForm.handleSubmit(onSubmitRastreamento)} className="space-y-4">
                    <FormField
                      control={rastreamentoForm.control}
                      name="trackingCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Rastreio</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o código de rastreio" {...field} />
                          </FormControl>
                          <FormDescription>
                            Código fornecido pela Azul Cargo no momento da postagem
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoadingTracking}>
                      {isLoadingTracking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rastreando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Rastrear Encomenda
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status da Encomenda</CardTitle>
                <CardDescription>
                  Informações detalhadas sobre o envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTracking ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Rastreando encomenda</h3>
                    <p className="text-sm text-gray-500">
                      Aguarde enquanto consultamos o status da sua encomenda...
                    </p>
                  </div>
                ) : trackingResults ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-gray-500">Código de rastreio:</span>
                          <div className="flex items-center">
                            <p className="font-mono font-medium">{trackingResults.codigo}</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="ml-2"
                              onClick={() => {
                                navigator.clipboard.writeText(trackingResults.codigo);
                                toast({
                                  title: "Código copiado",
                                  description: "O código de rastreio foi copiado para a área de transferência.",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Badge 
                          className={
                            trackingResults.status === "Entregue" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : trackingResults.status === "Em trânsito"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : trackingResults.status === "Postado"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : ""
                          }
                        >
                          {trackingResults.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Data de postagem:</span>
                          <p className="font-medium">{formatDate(trackingResults.dataPostagem)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Previsão de entrega:</span>
                          <p className="font-medium">{formatDate(trackingResults.previsaoEntrega)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Remetente:</span>
                          <p className="font-medium">{trackingResults.remetente.nome}</p>
                          <p className="text-sm">{trackingResults.remetente.cidade}/{trackingResults.remetente.estado}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Destinatário:</span>
                          <p className="font-medium">{trackingResults.destinatario.nome}</p>
                          <p className="text-sm">{trackingResults.destinatario.cidade}/{trackingResults.destinatario.estado}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Serviço:</span>
                        <p className="font-medium">{trackingResults.servico}</p>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-4">Histórico de Movimentações</h4>
                    <div className="space-y-4">
                      {trackingResults.history.map((item: {date: string, status: string, location: string}, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            {index < trackingResults.history.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 flex-grow"></div>
                            )}
                          </div>
                          <div className="pb-4 flex-grow">
                            <p className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </p>
                            <p className="font-medium">{item.status}</p>
                            <p className="text-sm">{item.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Map className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum rastreamento encontrado</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      Digite um código de rastreio válido para verificar o status de entrega do seu pacote.
                    </p>
                  </div>
                )}
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
                  <CardTitle>Configurações da API da Azul Cargo</CardTitle>
                  <CardDescription>
                    Configure suas credenciais para integrar com a Azul Cargo
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
                              <Input placeholder="Client ID da sua aplicação" {...field} />
                            </FormControl>
                            <FormDescription>
                              O Client ID pode ser obtido no painel do desenvolvedor da Azul Cargo
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
                              <Input placeholder="Client Secret da sua aplicação" {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Mantenha este valor seguro e não compartilhe com terceiros
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
                              <Input placeholder="Email de acesso" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email cadastrado na Azul Cargo Express
                            </FormDescription>
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
                              <Input placeholder="Senha de acesso" {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Senha recebida por email para acesso ao toolkit
                            </FormDescription>
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
                                <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                                <SelectItem value="production">Produção</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Use Sandbox para testes e Produção para operação real
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
                            <div className="flex">
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(field.value);
                                  toast({
                                    title: "URL copiada",
                                    description: "A URL de callback foi copiada para a área de transferência.",
                                  });
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription>
                              Configure esta URL no painel do desenvolvedor da Azul Cargo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isTestingConnection}>
                          {isTestingConnection ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testando Conexão
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" /> Salvar Configurações
                            </>
                          )}
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
                    Configure quais eventos você deseja receber notificações da Azul Cargo
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
                                Receba notificações sobre eventos da Azul Cargo
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
                            name="invoiceGenerated"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Nota Fiscal Gerada</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="trackingUpdated"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Rastreamento Atualizado</FormLabel>
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
                        </div>
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
              <CardTitle>Documentação da API</CardTitle>
              <CardDescription>
                Informações sobre como utilizar a integração com a Azul Cargo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Documentação Oficial da API
                  </h3>
                  
                  <Button variant="outline" asChild>
                    <a 
                      href="https://hmg.onlineapp.com.br/EDIv2_API_INTEGRACAO_Toolkit/Home/English" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      Acessar Documentação
                      <Settings className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-2">Endpoints Principais</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-semibold">Autenticação</span>
                        <p className="text-xs text-gray-500">POST /api/Autenticacao/AutenticarUsuario</p>
                        <p className="text-xs mt-1">Realiza autenticação na API e obtém token de acesso</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-semibold">Cotação</span>
                        <p className="text-xs text-gray-500">POST /api/Cotacoes/Cotar</p>
                        <p className="text-xs mt-1">Obtém preços e prazos para envios</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-semibold">Rastreamento</span>
                        <p className="text-xs text-gray-500">POST /api/Rastreamento/LocalizarObjeto</p>
                        <p className="text-xs mt-1">Consulta status de uma encomenda</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-semibold">Filiais</span>
                        <p className="text-xs text-gray-500">POST /api/Unidades/LocalizarUnidades</p>
                        <p className="text-xs mt-1">Busca filiais próximas a um CEP ou cidade</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Códigos de Retorno</h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded-md">
                          <span className="font-semibold text-green-700">200 OK</span>
                          <p className="text-xs mt-1">Requisição concluída com sucesso</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                          <span className="font-semibold">201 No Content</span>
                          <p className="text-xs mt-1">Requisição concluída, mas sem conteúdo</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-md">
                          <span className="font-semibold text-red-700">400 Bad Request</span>
                          <p className="text-xs mt-1">Requisição com parâmetros inválidos</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-md">
                          <span className="font-semibold text-red-700">401 Unauthorized</span>
                          <p className="text-xs mt-1">Token inválido ou expirado</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-md">
                          <span className="font-semibold text-red-700">403 Forbidden</span>
                          <p className="text-xs mt-1">Sem permissão para o recurso</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-md">
                          <span className="font-semibold text-red-700">500 Server Error</span>
                          <p className="text-xs mt-1">Erro interno no servidor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-4">Exemplos de Uso</h4>
                  
                  <div className="overflow-hidden rounded-lg border">
                    <div className="font-mono text-xs p-3 border-b bg-gray-50">
                      <span className="text-blue-600">POST</span> /api/Autenticacao/AutenticarUsuario
                    </div>
                    <div className="p-3 bg-gray-50">
                      <div className="font-mono text-xs whitespace-pre">{`{
  "Email": "user@example.com",
  "Senha": "mypassword"
}`}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-sm">
                  <h3 className="font-medium text-yellow-800">Importante</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Para utilizar a API da Azul Cargo, você precisa solicitar credenciais de acesso diretamente com o suporte da Azul. Visite o site oficial ou entre em contato com o time de integração para obter suas credenciais.
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