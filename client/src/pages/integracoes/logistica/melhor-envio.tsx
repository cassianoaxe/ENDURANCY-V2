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
  XCircle,
  Search,
  Ruler,
  Package,
  ChevronLeft,
  Save,
  AlertCircle,
  Settings,
  RefreshCw,
  Loader2,
  Activity,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";

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
  clientId: z.string().min(1, "Client ID é obrigatório"),
  clientSecret: z.string().min(1, "Client Secret é obrigatório"),
  accessToken: z.string().min(1, "Access Token é obrigatório"),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Ambiente é obrigatório",
  }),
  callbackUrl: z.string().url("URL de callback inválida"),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  orderCreated: z.boolean().default(true),
  orderPaid: z.boolean().default(true),
  tagGenerated: z.boolean().default(true),
  orderCanceled: z.boolean().default(true),
  trackingUpdated: z.boolean().default(true),
  orderDelivered: z.boolean().default(true),
});

const freteCalculationSchema = z.object({
  fromPostalCode: z.string().length(8, "CEP deve ter 8 dígitos").regex(/^\d+$/, "CEP deve conter apenas números"),
  toPostalCode: z.string().length(8, "CEP deve ter 8 dígitos").regex(/^\d+$/, "CEP deve conter apenas números"),
  height: z.coerce.number().min(1, "Altura é obrigatória"),
  width: z.coerce.number().min(1, "Largura é obrigatória"),
  length: z.coerce.number().min(1, "Comprimento é obrigatório"),
  weight: z.coerce.number().min(0.1, "Peso deve ser maior que 0.1 kg"),
  insuranceValue: z.coerce.number().min(0, "Valor do seguro deve ser maior ou igual a 0"),
});

// Componente para exibir o status do envio
const ShipmentStatus = ({ status }: { status: string }) => {
  switch (status) {
    case "posted":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> Postado
        </Badge>
      );
    case "in_transit":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Truck className="mr-1 h-3 w-3" /> Em Trânsito
        </Badge>
      );
    case "delivered":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Entregue
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Cancelado
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Pendente
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

// Componente principal para a página de integração do Melhor Envio
export default function MelhorEnvioIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [shipmentFilter, setShipmentFilter] = useState("all");
  const [freightQuotes, setFreightQuotes] = useState<any[]>([]);
  const [trackingResults, setTrackingResults] = useState<any | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  
  // Dados simulados para o dashboard
  const dashboardData = {
    totalShipments: "42",
    pendingShipments: "5",
    inTransitShipments: "12",
    deliveredShipments: "25",
    averageDeliveryTime: { positive: true, value: "3.2 dias" },
    shippingCosts: { positive: false, value: "R$ 1.847,30" },
  };
  
  // Dados simulados para a lista de envios
  const shipments = [
    {
      id: "ME123456789",
      trackingCode: "BR123456789ME",
      date: "2025-03-30",
      customer: "Pedro Almeida",
      from: "São Paulo, SP",
      to: "Rio de Janeiro, RJ",
      value: "R$ 45,90",
      company: "Correios",
      service: "PAC",
      status: "delivered",
    },
    {
      id: "ME234567890",
      trackingCode: "JD234567890BR",
      date: "2025-03-29",
      customer: "Fernanda Lima",
      from: "São Paulo, SP",
      to: "Belo Horizonte, MG",
      value: "R$ 38,70",
      company: "Jadlog",
      service: "Econômico",
      status: "in_transit",
    },
    {
      id: "ME345678901",
      trackingCode: "BR345678901ME",
      date: "2025-03-28",
      customer: "Ricardo Souza",
      from: "São Paulo, SP",
      to: "Curitiba, PR",
      value: "R$ 29,50",
      company: "Correios",
      service: "SEDEX",
      status: "posted",
    },
    {
      id: "ME456789012",
      trackingCode: "BR456789012ME",
      date: "2025-03-27",
      customer: "Juliana Neves",
      from: "São Paulo, SP",
      to: "Brasília, DF",
      value: "R$ 56,20",
      company: "Correios",
      service: "SEDEX",
      status: "in_transit",
    },
    {
      id: "ME567890123",
      trackingCode: "",
      date: "2025-03-26",
      customer: "Gabriel Costa",
      from: "São Paulo, SP",
      to: "Salvador, BA",
      value: "R$ 68,90",
      company: "Correios",
      service: "SEDEX",
      status: "pending",
    },
    {
      id: "ME678901234",
      trackingCode: "BR678901234ME",
      date: "2025-03-25",
      customer: "Amanda Vieira",
      from: "São Paulo, SP",
      to: "Recife, PE",
      value: "R$ 72,10",
      company: "Correios",
      service: "PAC",
      status: "canceled",
    }
  ];
  
  // Filtrar envios com base no filtro atual
  const filteredShipments = shipments.filter(shipment => {
    if (shipmentFilter === "all") return true;
    if (shipmentFilter === "pending" && shipment.status === "pending") return true;
    if (shipmentFilter === "posted" && shipment.status === "posted") return true;
    if (shipmentFilter === "in_transit" && shipment.status === "in_transit") return true;
    if (shipmentFilter === "delivered" && shipment.status === "delivered") return true;
    if (shipmentFilter === "canceled" && shipment.status === "canceled") return true;
    return false;
  });
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      accessToken: "",
      environment: "sandbox",
      callbackUrl: `${window.location.origin}/api/integrations/logistica/melhor-envio/webhook`
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      orderCreated: true,
      orderPaid: true,
      tagGenerated: true,
      orderCanceled: true,
      trackingUpdated: true,
      orderDelivered: true
    }
  });

  // Inicializar formulário para cálculo de frete
  const freteCalculationForm = useForm({
    resolver: zodResolver(freteCalculationSchema),
    defaultValues: {
      fromPostalCode: "01310200",
      toPostalCode: "22031001",
      height: 10,
      width: 15,
      length: 20,
      weight: 1,
      insuranceValue: 100
    }
  });
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data: z.infer<typeof apiConfigSchema>): void => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API foram atualizadas com sucesso.",
    });
  };
  
  // Função para salvar configurações de webhook
  const onSubmitWebhookConfig = (data: z.infer<typeof webhookConfigSchema>): void => {
    toast({
      title: "Configurações de webhook salvas",
      description: "As configurações de webhook foram atualizadas com sucesso.",
    });
  };

  // Função para calcular frete
  const onCalculateFrete = (data: z.infer<typeof freteCalculationSchema>): void => {
    // Aqui seria feita uma requisição para a API, mas vamos simular a resposta
    const mockQuotes = [
      {
        company: "Correios",
        service: "PAC",
        price: "31.50",
        delivery_time: 5,
        company_logo: "https://www.melhorenvio.com.br/images/shipping-companies/correios.png"
      },
      {
        company: "Correios",
        service: "SEDEX",
        price: "48.20",
        delivery_time: 2,
        company_logo: "https://www.melhorenvio.com.br/images/shipping-companies/correios.png"
      },
      {
        company: "Jadlog",
        service: "Econômico",
        price: "29.90",
        delivery_time: 6,
        company_logo: "https://www.melhorenvio.com.br/images/shipping-companies/jadlog.png"
      },
      {
        company: "Jadlog",
        service: "Expresso",
        price: "45.70",
        delivery_time: 3,
        company_logo: "https://www.melhorenvio.com.br/images/shipping-companies/jadlog.png"
      }
    ];
    
    setFreightQuotes(mockQuotes);
    toast({
      title: "Frete calculado",
      description: "Cálculo de frete realizado com sucesso.",
    });
  };

  // Função para rastrear um envio
  const handleTrackShipment = () => {
    if (!trackingCode) {
      toast({
        title: "Código de rastreio necessário",
        description: "Por favor, informe um código de rastreio válido.",
        variant: "destructive"
      });
      return;
    }

    // Simular resposta de rastreamento
    const mockTrackingData = {
      code: trackingCode,
      status: "in_transit",
      last_update: "2025-03-31T12:30:00",
      posted_at: "2025-03-29T15:20:00",
      company: "Correios",
      history: [
        {
          date: "2025-03-31T12:30:00",
          status: "Em trânsito para a cidade de destino",
          location: "São José dos Campos, SP"
        },
        {
          date: "2025-03-30T16:45:00",
          status: "Objeto em trânsito",
          location: "Cajamar, SP"
        },
        {
          date: "2025-03-29T15:20:00",
          status: "Objeto postado",
          location: "São Paulo, SP"
        }
      ]
    };

    setTrackingResults(mockTrackingData);
    toast({
      title: "Rastreamento realizado",
      description: "Rastreamento do envio realizado com sucesso.",
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
              Integração Melhor Envio
            </h1>
            <p className="text-gray-500 mt-1">
              Calcule fretes e gerencie envios com as principais transportadoras
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
            A integração com o Melhor Envio é baseada na API oficial que permite calcular fretes, 
            gerar etiquetas de envio e rastrear pacotes. Esta integração facilita a conexão com as 
            principais transportadoras brasileiras através de uma única API.
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
              description="Todos os serviços estão funcionando normalmente"
            />
            <StatCard 
              title="Organizações Utilizando" 
              value="8" 
              icon={BarChart4}
              description="Organizações com a integração ativa"
            />
            <StatCard 
              title="Versão da API" 
              value="v2.0.7" 
              icon={Info}
              description="Última atualização: 15/03/2025"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Integração</CardTitle>
                <CardDescription>
                  Informações sobre o Melhor Envio e suas funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">O que é o Melhor Envio?</h3>
                  <p className="text-gray-600 text-sm">
                    O Melhor Envio é uma plataforma que conecta empresas a diversas transportadoras, 
                    facilitando a cotação, contratação e gestão de fretes. 
                    A integração permite calcular fretes, gerar etiquetas, rastrear pacotes e 
                    automatizar o processo logístico.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Principais Benefícios</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Integração com múltiplas transportadoras (Correios, Jadlog, Azul Cargo, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Cálculo de frete em tempo real com base em dimensões e peso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Geração e impressão de etiquetas com código de rastreio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Rastreamento de pacotes com histórico de eventos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Automatização do processo de envio com webhooks</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="gap-1" asChild>
                    <a href="https://melhorenvio.com.br" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visitar site oficial
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Serviços</CardTitle>
                  <CardDescription>
                    Monitoramento do estado atual da API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">API de Cotação</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operacional</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">API de Etiquetas</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operacional</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">API de Rastreamento</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operacional</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Webhooks</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operacional</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Changelogs Recentes</CardTitle>
                  <CardDescription>
                    Últimas atualizações e melhorias na API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">Versão 2.0.7</h4>
                        <span className="text-xs text-gray-500">15/03/2025</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Melhorias no sistema de rastreamento e adição de novos webhooks 
                        para atualizações em tempo real.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">Versão 2.0.6</h4>
                        <span className="text-xs text-gray-500">28/02/2025</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Correção de bugs na API de cotação e adição de suporte para 
                        novos serviços da Jadlog.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">Versão 2.0.5</h4>
                        <span className="text-xs text-gray-500">15/01/2025</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Adição de novas transportadoras e atualização dos algoritmos 
                        de cálculo de frete para maior precisão.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Envios */}
        <TabsContent value="shipments">
          <Card>
            <CardHeader className="flex-row flex justify-between items-center">
              <div>
                <CardTitle>Envios</CardTitle>
                <CardDescription>
                  Gerencie todos os seus envios em um só lugar
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filtrar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Status do Envio</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShipmentFilter("all")}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFilter("pending")}>
                      Pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFilter("posted")}>
                      Postado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFilter("in_transit")}>
                      Em Trânsito
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFilter("delivered")}>
                      Entregue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFilter("canceled")}>
                      Cancelado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="h-8">
                  <Download className="h-3.5 w-3.5 mr-1" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID do Envio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Origem/Destino</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.id}
                        {shipment.trackingCode && (
                          <div className="text-xs text-gray-500 mt-1">
                            {shipment.trackingCode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 text-gray-500" />
                          <div>
                            <div className="text-xs">De: {shipment.from}</div>
                            <div className="text-xs">Para: {shipment.to}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{shipment.company}</div>
                        <div className="text-xs text-gray-500">{shipment.service}</div>
                      </TableCell>
                      <TableCell>{shipment.value}</TableCell>
                      <TableCell>
                        <ShipmentStatus status={shipment.status} />
                      </TableCell>
                      <TableCell>{shipment.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver Etiqueta</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Activity className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Rastrear</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancelar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredShipments.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum envio encontrado com os filtros selecionados.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Calcular Frete */}
        <TabsContent value="calculate">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Calcular Frete</CardTitle>
                  <CardDescription>
                    Simule o valor do frete para diferentes transportadoras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...freteCalculationForm}>
                    <form onSubmit={freteCalculationForm.handleSubmit(onCalculateFrete)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={freteCalculationForm.control}
                          name="fromPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP de Origem</FormLabel>
                              <FormControl>
                                <Input placeholder="00000000" {...field} maxLength={8} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={freteCalculationForm.control}
                          name="toPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP de Destino</FormLabel>
                              <FormControl>
                                <Input placeholder="00000000" {...field} maxLength={8} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={freteCalculationForm.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Altura (cm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={freteCalculationForm.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Largura (cm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={freteCalculationForm.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comprimento (cm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={freteCalculationForm.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Peso (kg)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={freteCalculationForm.control}
                          name="insuranceValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do Seguro (R$)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Calcular Frete
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cotações de Frete</CardTitle>
                  <CardDescription>
                    Selecione a melhor opção para seu envio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {freightQuotes.length > 0 ? (
                    <div className="space-y-4">
                      {freightQuotes.map((quote, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <Truck className="h-6 w-6 text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-medium">{quote.company}</h4>
                                <p className="text-sm text-gray-500">{quote.service}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">R$ {quote.price}</p>
                              <p className="text-sm text-gray-500">
                                Entrega em {quote.delivery_time} {quote.delivery_time === 1 ? 'dia' : 'dias'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" className="mr-2">
                              Ver Detalhes
                            </Button>
                            <Button size="sm">
                              Selecionar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Ruler className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma cotação calculada</h3>
                      <p className="text-sm text-gray-500 max-w-md mb-4">
                        Preencha os dados do pacote no formulário ao lado e clique em calcular frete para ver as opções disponíveis.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Rastreamento */}
        <TabsContent value="track">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Rastrear Envio</CardTitle>
                  <CardDescription>
                    Acompanhe o status de entrega do seu pacote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="tracking-code" className="text-sm font-medium">
                        Código de Rastreio
                      </label>
                      <div className="flex">
                        <Input 
                          id="tracking-code"
                          placeholder="Informe o código de rastreio" 
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button 
                          onClick={handleTrackShipment}
                          className="rounded-l-none"
                        >
                          <Search className="h-4 w-4 mr-1" /> Rastrear
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Códigos recentes</h4>
                      <div className="space-y-1">
                        {shipments.slice(0, 3).filter(s => s.trackingCode).map((s) => (
                          <div key={s.id} className="text-sm flex justify-between hover:bg-gray-100 p-1 rounded cursor-pointer" onClick={() => setTrackingCode(s.trackingCode)}>
                            <span className="text-blue-600">{s.trackingCode}</span>
                            <ShipmentStatus status={s.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Rastreamento</CardTitle>
                  <CardDescription>
                    Atualizações sobre a localização e estado do seu envio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trackingResults ? (
                    <div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Código de Rastreio</p>
                            <p className="font-medium">{trackingResults.code}</p>
                          </div>
                          <div>
                            <ShipmentStatus status={trackingResults.status} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Transportadora</p>
                            <p className="font-medium">{trackingResults.company}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Postado em</p>
                            <p className="font-medium">
                              {new Date(trackingResults.posted_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Última atualização</p>
                            <p className="font-medium">
                              {new Date(trackingResults.last_update).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
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
                                {new Date(item.date).toLocaleString('pt-BR')}
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
                      <Activity className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum rastreamento encontrado</h3>
                      <p className="text-sm text-gray-500 max-w-md mb-4">
                        Digite um código de rastreio válido para verificar o status de entrega do seu pacote.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                  <CardTitle>Configurações da API do Melhor Envio</CardTitle>
                  <CardDescription>
                    Configure suas credenciais para integrar com o Melhor Envio
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
                              O Client ID pode ser obtido no painel do desenvolvedor do Melhor Envio
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
                        name="accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Token</FormLabel>
                            <FormControl>
                              <Input placeholder="Token de acesso da API" {...field} type="password" />
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
                              Configure esta URL no painel do desenvolvedor do Melhor Envio
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                    Configure quais eventos você deseja receber notificações do Melhor Envio
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
                                Receba notificações sobre eventos do Melhor Envio
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
                            name="orderPaid"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Pedido Pago</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={webhookConfigForm.control}
                            name="tagGenerated"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Etiqueta Gerada</FormLabel>
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
      </Tabs>
    </div>
  );
}