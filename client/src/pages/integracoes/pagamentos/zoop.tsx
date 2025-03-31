import { useState } from "react";
import { Link } from "wouter";
import {
  CreditCard,
  ChevronLeft,
  Save,
  Copy,
  Info,
  HelpCircle,
  ChevronDown,
  BarChart4,
  ListChecks,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  ToggleLeft,
  Download,
  RefreshCw,
  FileText,
  Wallet,
  Settings,
  Scissors
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  apiKey: z.string().min(1, "Chave da API é obrigatória"),
  marketplaceId: z.string().min(1, "ID do Marketplace é obrigatório"),
  sellerId: z.string().min(1, "ID do Vendedor é obrigatório"),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Ambiente é obrigatório",
  }),
  webhookToken: z.string().min(1, "Token do webhook é obrigatório"),
  notificationUrl: z.string().url("URL de notificação inválida"),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  transactionCreated: z.boolean().default(true),
  transactionPaid: z.boolean().default(true),
  transactionFailed: z.boolean().default(true),
  transactionCanceled: z.boolean().default(true),
  subscriptionCreated: z.boolean().default(true),
  subscriptionUpdated: z.boolean().default(true),
  subscriptionCanceled: z.boolean().default(true),
  splitCreated: z.boolean().default(false),
  splitSettled: z.boolean().default(false),
});

const splitConfigSchema = z.object({
  enabled: z.boolean().default(false),
  percentage: z.number().min(0).max(100).default(0),
  fixedAmount: z.number().min(0).default(0),
  recipientId: z.string().optional(),
});

// Componente para exibir o status do pagamento
const PaymentStatus = ({ status }: { status: string }) => {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Pago
        </Badge>
      );
    case "AUTHORIZED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Autorizado
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Pendente
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Expirado
        </Badge>
      );
    case "VOIDED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <RefreshCw className="mr-1 h-3 w-3" /> Cancelado
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Recusado
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

// Componente para exibir o tipo de pagamento
const PaymentMethod = ({ method }: { method: string }) => {
  switch (method) {
    case "CREDIT":
      return (
        <div className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
          <span>Cartão de Crédito</span>
        </div>
      );
    case "DEBIT":
      return (
        <div className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-green-500" />
          <span>Cartão de Débito</span>
        </div>
      );
    case "BOLETO":
      return (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-gray-500" />
          <span>Boleto</span>
        </div>
      );
    case "PIX":
      return (
        <div className="flex items-center">
          <div className="mr-2 flex-shrink-0 w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded-sm text-xs font-bold">
            X
          </div>
          <span>PIX</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Wallet className="mr-2 h-4 w-4 text-gray-500" />
          <span>{method}</span>
        </div>
      );
  }
};

// Componente principal para a página de integração da Zoop
export default function ZoopIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [detailedView, setDetailedView] = useState(false);
  
  // Dados simulados para o dashboard
  const dashboardData = {
    totalReceived: { positive: true, value: "R$ 9.845,20" },
    totalPending: { positive: false, value: "R$ 2.187,50" },
    successRate: { positive: true, value: "92,3%" },
    transactionCount: "128",
    splitAmount: { positive: true, value: "R$ 1.205,10" },
  };
  
  // Dados simulados para a lista de transações
  const transactions = [
    {
      id: "a57e1e7bb8d641a1af7d95d1103c5681",
      date: "2025-03-30",
      customer: "Pedro Almeida",
      amount: "R$ 299,90",
      method: "CREDIT",
      status: "PAID",
      dueDate: "2025-03-30",
      description: "Assinatura mensal - Plano Pro"
    },
    {
      id: "b8d64c5751a1af7d95d1103c56817e7b",
      date: "2025-03-29",
      customer: "Fernanda Lima",
      amount: "R$ 120,00",
      method: "PIX",
      status: "PAID",
      dueDate: "2025-03-29",
      description: "Consulta médica - Clínica Bem Estar"
    },
    {
      id: "7d95d1103c5681a57e1e7bb8d641a1af",
      date: "2025-03-28",
      customer: "Ricardo Souza",
      amount: "R$ 149,90",
      method: "BOLETO",
      status: "PENDING",
      dueDate: "2025-04-05",
      description: "Assinatura mensal - Plano Intermediário"
    },
    {
      id: "95d1103c5681a57e1e7bb8d641a1af7d",
      date: "2025-03-27",
      customer: "Juliana Neves",
      amount: "R$ 249,90",
      method: "CREDIT",
      status: "AUTHORIZED",
      dueDate: "2025-03-27",
      description: "Assinatura anual - Plano Básico"
    },
    {
      id: "1e7bb8d641a1af7d95d1103c5681a57e",
      date: "2025-03-26",
      customer: "Gabriel Costa",
      amount: "R$ 99,90",
      method: "BOLETO",
      status: "EXPIRED",
      dueDate: "2025-03-25",
      description: "Assinatura mensal - Plano Básico"
    },
    {
      id: "3c5681a57e1e7bb8d641a1af7d95d110",
      date: "2025-03-25",
      customer: "Amanda Vieira",
      amount: "R$ 199,90",
      method: "CREDIT",
      status: "VOIDED",
      dueDate: "2025-03-25",
      description: "Assinatura trimestral - Plano Básico (Cancelado)"
    },
    {
      id: "81a57e1e7bb8d641a1af7d95d1103c56",
      date: "2025-03-24",
      customer: "Thiago Moreira",
      amount: "R$ 149,90",
      method: "DEBIT",
      status: "DECLINED",
      dueDate: "2025-03-24",
      description: "Assinatura mensal - Plano Intermediário (Recusado)"
    }
  ];
  
  // Filtrar transações com base no filtro atual
  const filteredTransactions = transactions.filter(transaction => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "paid" && ["PAID", "AUTHORIZED"].includes(transaction.status)) return true;
    if (paymentFilter === "pending" && transaction.status === "PENDING") return true;
    if (paymentFilter === "expired" && transaction.status === "EXPIRED") return true;
    if (paymentFilter === "voided" && transaction.status === "VOIDED") return true;
    if (paymentFilter === "declined" && transaction.status === "DECLINED") return true;
    return false;
  });
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      marketplaceId: "",
      sellerId: "",
      environment: "sandbox",
      webhookToken: "",
      notificationUrl: `${window.location.origin}/api/webhooks/zoop`
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      transactionCreated: true,
      transactionPaid: true,
      transactionFailed: true,
      transactionCanceled: true,
      subscriptionCreated: true,
      subscriptionUpdated: true,
      subscriptionCanceled: true,
      splitCreated: false,
      splitSettled: false
    }
  });

  // Inicializar formulário para configuração de split
  const splitConfigForm = useForm({
    resolver: zodResolver(splitConfigSchema),
    defaultValues: {
      enabled: false,
      percentage: 10,
      fixedAmount: 0,
      recipientId: ""
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

  // Função para salvar configurações de split
  const onSubmitSplitConfig = (data: z.infer<typeof splitConfigSchema>): void => {
    toast({
      title: "Configurações de split salvas",
      description: "As configurações de divisão de pagamentos foram atualizadas com sucesso.",
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
              <CreditCard className="mr-3 h-8 w-8 text-primary" />
              Integração Zoop
            </h1>
            <p className="text-gray-500 mt-1">
              Processe pagamentos e gerencie transações via Zoop Payment Gateway
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
            A integração com a Zoop permite processar pagamentos via cartão de crédito/débito, boleto ou PIX, 
            gerenciar cobranças recorrentes e configurar splits de pagamento entre diferentes destinatários. 
            A Zoop é uma plataforma completa com taxas competitivas e processamento rápido.
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-6 md:w-[840px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="api">Configuração API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="split">Split de Pagamento</TabsTrigger>
        </TabsList>
        
        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Valor Recebido (Últimos 30 dias)" 
              value={dashboardData.totalReceived} 
              icon={BarChart4}
              description="Total de pagamentos confirmados"
            />
            <StatCard 
              title="Valor Pendente" 
              value={dashboardData.totalPending} 
              icon={Clock}
              description="Pagamentos aguardando confirmação"
            />
            <StatCard 
              title="Taxa de Sucesso" 
              value={dashboardData.successRate} 
              icon={CheckCircle2}
              description="Taxa de pagamentos bem-sucedidos"
            />
            <StatCard 
              title="Total de Transações" 
              value={dashboardData.transactionCount} 
              icon={ListChecks}
              description="Número de transações processadas"
            />
            <StatCard 
              title="Valor Split" 
              value={dashboardData.splitAmount} 
              icon={Scissors}
              description="Total dividido com parceiros"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Últimas transações</CardTitle>
              <CardDescription>
                As 5 transações mais recentes processadas via Zoop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>
                        <PaymentMethod method={transaction.method} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatus status={transaction.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setCurrentTab("transactions")}>
                  Ver todas as transações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transações */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>
                  Histórico de pagamentos processados através da Zoop
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setPaymentFilter("all")}>
                      Todos os pagamentos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPaymentFilter("paid")}>
                      Pagos/Autorizados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPaymentFilter("pending")}>
                      Pendentes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPaymentFilter("expired")}>
                      Expirados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPaymentFilter("voided")}>
                      Cancelados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPaymentFilter("declined")}>
                      Recusados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={() => setDetailedView(!detailedView)}>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  {detailedView ? "Visão simplificada" : "Visão detalhada"}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    {detailedView && (
                      <>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Descrição</TableHead>
                      </>
                    )}
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>
                        <PaymentMethod method={transaction.method} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatus status={transaction.status} />
                      </TableCell>
                      {detailedView && (
                        <>
                          <TableCell>{new Date(transaction.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Segunda via</DropdownMenuItem>
                            <DropdownMenuItem>Estornar</DropdownMenuItem>
                            <DropdownMenuItem>Registrar pagamento</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assinaturas */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas</CardTitle>
              <CardDescription>
                Gerencie assinaturas e cobranças recorrentes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Módulo de Assinaturas</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    O módulo de assinaturas permite criar e gerenciar cobranças recorrentes para seus clientes. 
                    Configure esta integração para começar a usar.
                  </p>
                  <Button className="mt-4">
                    Configurar Assinaturas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Configuração API */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da API</CardTitle>
              <CardDescription>
                Configure as credenciais de acesso à API da Zoop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiConfigForm}>
                <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Obtenha suas credenciais no painel administrativo da Zoop. Você precisará criar um marketplace
                          e obter o ID do marketplace, ID do vendedor e uma chave de API. Para mais informações, 
                          consulte a <a href="https://docs.zoop.co/docs/introducao-a-zoop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">documentação oficial</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiConfigForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chave da API (API Key)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="zpk_prod_xxxxxxxxxxxxxxxxxxxxxxxx"
                                className="flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(field.value);
                                  toast({
                                    title: "Copiado!",
                                    description: "Chave copiada para a área de transferência",
                                  });
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Chave de API para autenticação das requisições
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
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ambiente" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                                <SelectItem value="production">Produção</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Ambiente para processamento das transações
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="marketplaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Marketplace</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                          </FormControl>
                          <FormDescription>
                            Identificador único do seu marketplace na Zoop
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="sellerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Vendedor</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                          </FormControl>
                          <FormDescription>
                            Identificador único do vendedor (seller) associado ao marketplace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-6 space-y-6">
                    <h3 className="text-lg font-medium">Configuração de Webhook</h3>
                    <p className="text-sm text-gray-500">
                      Configure o webhook para receber notificações de eventos da Zoop.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={apiConfigForm.control}
                        name="notificationUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de Callback</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://seusite.com/webhook/zoop" />
                            </FormControl>
                            <FormDescription>
                              URL que receberá as notificações da Zoop
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiConfigForm.control}
                        name="webhookToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token de Verificação</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Token secreto para validação" />
                            </FormControl>
                            <FormDescription>
                              Token para validação de webhooks
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure quais eventos você deseja receber da Zoop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...webhookConfigForm}>
                <form onSubmit={webhookConfigForm.handleSubmit(onSubmitWebhookConfig)} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Sobre Webhooks</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Webhooks permitem que a Zoop envie notificações em tempo real para seu sistema quando eventos ocorrem. 
                          Selecione abaixo quais eventos você deseja receber.
                        </p>
                      </div>
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
                            Ative para receber notificações da Zoop
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
                    <h3 className="text-lg font-medium">Eventos de Transação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="transactionCreated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Transação Criada</FormLabel>
                              <FormDescription>
                                Notificar quando uma nova transação for criada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="transactionPaid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Transação Paga</FormLabel>
                              <FormDescription>
                                Notificar quando uma transação for paga ou autorizada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="transactionFailed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Transação Falhou</FormLabel>
                              <FormDescription>
                                Notificar quando uma transação falhar ou for recusada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="transactionCanceled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Transação Cancelada</FormLabel>
                              <FormDescription>
                                Notificar quando uma transação for cancelada ou estornada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium pt-4">Eventos de Assinatura</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionCreated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Assinatura Criada</FormLabel>
                              <FormDescription>
                                Notificar quando uma nova assinatura for criada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionUpdated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Assinatura Atualizada</FormLabel>
                              <FormDescription>
                                Notificar quando uma assinatura for atualizada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionCanceled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Assinatura Cancelada</FormLabel>
                              <FormDescription>
                                Notificar quando uma assinatura for cancelada
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium pt-4">Eventos de Split</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={webhookConfigForm.control}
                        name="splitCreated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Split Criado</FormLabel>
                              <FormDescription>
                                Notificar quando um split de pagamento for criado
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="splitSettled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Split Liquidado</FormLabel>
                              <FormDescription>
                                Notificar quando um split de pagamento for liquidado
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Split de Pagamento */}
        <TabsContent value="split">
          <Card>
            <CardHeader>
              <CardTitle>Divisão de Pagamentos (Split)</CardTitle>
              <CardDescription>
                Configure regras de divisão de pagamentos entre diferentes destinatários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...splitConfigForm}>
                <form onSubmit={splitConfigForm.handleSubmit(onSubmitSplitConfig)} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Sobre Split de Pagamentos</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          A funcionalidade de Split permite dividir automaticamente os valores recebidos entre diferentes 
                          contas (ou destinatários). Isso é útil para marketplaces, plataformas com múltiplos fornecedores 
                          ou para separar taxas e comissões.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={splitConfigForm.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativar Split de Pagamentos</FormLabel>
                          <FormDescription>
                            Ative para dividir valores recebidos com outros destinatários
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
                    <h3 className="text-lg font-medium">Regras de Divisão</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={splitConfigForm.control}
                        name="percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Porcentagem (%)</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  className="flex-1"
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                                <span className="ml-2 text-gray-500">%</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Percentual do valor a ser dividido
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={splitConfigForm.control}
                        name="fixedAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Fixo (R$)</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="mr-2 text-gray-500">R$</span>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  className="flex-1"
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Valor fixo a ser dividido (independente da porcentagem)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={splitConfigForm.control}
                      name="recipientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Destinatário</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="ID do destinatário no formato uuid"
                            />
                          </FormControl>
                          <FormDescription>
                            Identificador do destinatário que receberá os valores divididos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium">Exemplo de Split</h4>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Em uma transação de <strong>R$ 100,00</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>
                            {splitConfigForm.watch("percentage")}% será enviado para o destinatário: 
                            <strong> R$ {(splitConfigForm.watch("percentage") / 100 * 100).toFixed(2)}</strong>
                          </li>
                          <li>
                            Valor fixo adicional: <strong>R$ {splitConfigForm.watch("fixedAmount").toFixed(2)}</strong>
                          </li>
                          <li>
                            Total para o destinatário: <strong>R$ {((splitConfigForm.watch("percentage") / 100 * 100) + splitConfigForm.watch("fixedAmount")).toFixed(2)}</strong>
                          </li>
                          <li>
                            Você receberá: <strong>R$ {(100 - ((splitConfigForm.watch("percentage") / 100 * 100) + splitConfigForm.watch("fixedAmount"))).toFixed(2)}</strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}