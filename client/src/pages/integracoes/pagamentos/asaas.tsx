import React, { useState } from "react";
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
  Settings
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
const StatCard = ({ title, value, icon, description }) => {
  const Icon = icon;
  let valueColor = "text-gray-900";
  let bgColor = "bg-gray-100";
  let iconColor = "text-gray-500";
  
  if (value?.positive) {
    valueColor = "text-green-600";
    bgColor = "bg-green-100";
    iconColor = "text-green-500";
  } else if (value?.positive === false) {
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
  accountKey: z.string().min(1, "Chave da conta é obrigatória"),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Ambiente é obrigatório",
  }),
  walletId: z.string().optional(),
  webhookToken: z.string().min(1, "Token do webhook é obrigatório"),
  notificationUrl: z.string().url("URL de notificação inválida"),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  paymentReceived: z.boolean().default(true),
  paymentOverdue: z.boolean().default(true),
  paymentRefunded: z.boolean().default(true),
  subscriptionCreated: z.boolean().default(true),
  subscriptionUpdated: z.boolean().default(true),
  subscriptionCanceled: z.boolean().default(true),
  transferCreated: z.boolean().default(false),
  transferFailed: z.boolean().default(false),
});

// Componente para exibir o status do pagamento
const PaymentStatus = ({ status }) => {
  switch (status) {
    case "RECEIVED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Recebido
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmado
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Pendente
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Atrasado
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <RefreshCw className="mr-1 h-3 w-3" /> Estornado
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Falha
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
const PaymentMethod = ({ method }) => {
  switch (method) {
    case "CREDIT_CARD":
      return (
        <div className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
          <span>Cartão de Crédito</span>
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

// Componente principal para a página de integração do Asaas
export default function AsaasIntegration() {
  const { toast } = useToast();
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [detailedView, setDetailedView] = useState(false);
  
  // Dados simulados para o dashboard
  const dashboardData = {
    totalReceived: { positive: true, value: "R$ 12.458,90" },
    totalPending: { positive: false, value: "R$ 3.245,75" },
    successRate: { positive: true, value: "94,5%" },
    transactionCount: "156",
    refundAmount: { positive: false, value: "R$ 587,20" },
  };
  
  // Dados simulados para a lista de transações
  const transactions = [
    {
      id: "pay_5123987641",
      date: "2025-03-30",
      customer: "João Silva",
      amount: "R$ 249,90",
      method: "CREDIT_CARD",
      status: "CONFIRMED",
      dueDate: "2025-03-30",
      description: "Assinatura mensal - Plano Pro"
    },
    {
      id: "pay_5123987640",
      date: "2025-03-29",
      customer: "Maria Oliveira",
      amount: "R$ 99,90",
      method: "PIX",
      status: "RECEIVED",
      dueDate: "2025-03-29",
      description: "Assinatura mensal - Plano Básico"
    },
    {
      id: "pay_5123987639",
      date: "2025-03-28",
      customer: "Carlos Ferreira",
      amount: "R$ 149,90",
      method: "BOLETO",
      status: "PENDING",
      dueDate: "2025-04-05",
      description: "Assinatura mensal - Plano Intermediário"
    },
    {
      id: "pay_5123987638",
      date: "2025-03-27",
      customer: "Ana Santos",
      amount: "R$ 249,90",
      method: "CREDIT_CARD",
      status: "CONFIRMED",
      dueDate: "2025-03-27",
      description: "Assinatura mensal - Plano Pro"
    },
    {
      id: "pay_5123987637",
      date: "2025-03-26",
      customer: "Paulo Costa",
      amount: "R$ 99,90",
      method: "BOLETO",
      status: "OVERDUE",
      dueDate: "2025-03-25",
      description: "Assinatura mensal - Plano Básico"
    },
    {
      id: "pay_5123987636",
      date: "2025-03-25",
      customer: "Lucia Mendes",
      amount: "R$ 249,90",
      method: "CREDIT_CARD",
      status: "REFUNDED",
      dueDate: "2025-03-25",
      description: "Assinatura mensal - Plano Pro (Cancelado)"
    },
    {
      id: "pay_5123987635",
      date: "2025-03-24",
      customer: "Roberto Alves",
      amount: "R$ 149,90",
      method: "CREDIT_CARD",
      status: "FAILED",
      dueDate: "2025-03-24",
      description: "Assinatura mensal - Plano Intermediário (Falha no cartão)"
    }
  ];
  
  // Filtrar transações com base no filtro atual
  const filteredTransactions = transactions.filter(transaction => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "confirmed" && ["CONFIRMED", "RECEIVED"].includes(transaction.status)) return true;
    if (paymentFilter === "pending" && transaction.status === "PENDING") return true;
    if (paymentFilter === "overdue" && transaction.status === "OVERDUE") return true;
    if (paymentFilter === "refunded" && transaction.status === "REFUNDED") return true;
    if (paymentFilter === "failed" && transaction.status === "FAILED") return true;
    return false;
  });
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "b76195efbe9fce3ee67e2bd440be19ad9e3d4f4f",
      accountKey: "6ef41e4a-2c89-4b85-85c9-43fc0b85d8cb",
      environment: "sandbox",
      walletId: "wlt_293ej29jd8cjp28c",
      webhookToken: "asaas-webhook-verification-token",
      notificationUrl: "https://webhook.site/9dc16b0a-c5af-49f5-a9e3-4d7f0ec52f78"
    }
  });
  
  // Inicializar formulário para configuração de webhooks
  const webhookConfigForm = useForm({
    resolver: zodResolver(webhookConfigSchema),
    defaultValues: {
      enabled: true,
      paymentReceived: true,
      paymentOverdue: true,
      paymentRefunded: true,
      subscriptionCreated: true,
      subscriptionUpdated: true,
      subscriptionCanceled: true,
      transferCreated: false,
      transferFailed: false
    }
  });
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data) => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API foram atualizadas com sucesso.",
    });
  };
  
  // Função para salvar configurações de webhook
  const onSubmitWebhookConfig = (data) => {
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
              <CreditCard className="mr-3 h-8 w-8 text-primary" />
              Integração Asaas
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie pagamentos, recorrências e cobranças via Asaas Payment Gateway
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
            A integração com o Asaas permite processar pagamentos via cartão de crédito, boleto ou PIX, 
            gerenciar assinaturas recorrentes e acompanhar transações financeiras. Todas as transações são 
            sincronizadas automaticamente com seu sistema.
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-5 md:w-[700px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="api">Configuração API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
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
              title="Valor Estornado" 
              value={dashboardData.refundAmount} 
              icon={RefreshCw}
              description="Total de reembolsos processados"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Últimas transações</CardTitle>
              <CardDescription>
                As 5 transações mais recentes processadas via Asaas
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
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="ml-auto"
                onClick={() => setCurrentTab("transactions")}
              >
                Ver todas as transações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Transações */}
        <TabsContent value="transactions">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Histórico de Transações</h2>
              <p className="text-gray-500">Gerencie e monitore todas as transações</p>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPaymentFilter("all")}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("confirmed")}>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Confirmados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("pending")}>
                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                    Pendentes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("overdue")}>
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                    Atrasados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("refunded")}>
                    <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                    Estornados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("failed")}>
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Falhas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setDetailedView(!detailedView)}>
                      <ToggleLeft className={`h-4 w-4 ${detailedView ? 'text-primary' : 'text-gray-500'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Alternar visualização detalhada</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <TableRow className="group">
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
                        <TableCell>{new Date(transaction.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Enviar segunda via
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Baixar comprovante
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Estornar pagamento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {detailedView && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="text-sm">
                              <p><strong>Descrição:</strong> {transaction.description}</p>
                              <div className="grid grid-cols-3 gap-4 mt-2">
                                <div>
                                  <p className="text-gray-500">ID do Cliente</p>
                                  <p className="font-mono">cus_789432</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Última Atualização</p>
                                  <p>{new Date(transaction.date).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Taxa de Processamento</p>
                                  <p>R$ {(parseFloat(transaction.amount.replace('R$ ', '').replace(',', '.')) * 0.039).toFixed(2).replace('.', ',')}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assinaturas */}
        <TabsContent value="subscriptions">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Assinaturas</h2>
              <p className="text-gray-500">Gerencie pagamentos recorrentes e assinaturas</p>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar Assinaturas
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próximo Ciclo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">sub_123456</TableCell>
                    <TableCell>João Silva</TableCell>
                    <TableCell>Plano Pro</TableCell>
                    <TableCell>R$ 249,90 / mês</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Ativa
                      </Badge>
                    </TableCell>
                    <TableCell>30/04/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">sub_123457</TableCell>
                    <TableCell>Maria Oliveira</TableCell>
                    <TableCell>Plano Básico</TableCell>
                    <TableCell>R$ 99,90 / mês</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Ativa
                      </Badge>
                    </TableCell>
                    <TableCell>29/04/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">sub_123458</TableCell>
                    <TableCell>Carlos Ferreira</TableCell>
                    <TableCell>Plano Intermediário</TableCell>
                    <TableCell>R$ 149,90 / mês</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Ativa
                      </Badge>
                    </TableCell>
                    <TableCell>28/04/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">sub_123459</TableCell>
                    <TableCell>Lucia Mendes</TableCell>
                    <TableCell>Plano Pro</TableCell>
                    <TableCell>R$ 249,90 / mês</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-red-200 text-red-800">
                        Cancelada
                      </Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Estatísticas de Assinatura</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Assinaturas Ativas" 
                value="3"
                icon={CheckCircle2}
                description="Total de assinaturas em vigor"
              />
              <StatCard 
                title="Receita Mensal Recorrente (MRR)" 
                value={{ positive: true, value: "R$ 499,70" }}
                icon={BarChart4}
                description="Total de receita recorrente mensal"
              />
              <StatCard 
                title="Churn Rate" 
                value={{ positive: false, value: "5.2%" }}
                icon={XCircle}
                description="Taxa de cancelamento mensal"
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Configuração API */}
        <TabsContent value="api">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Configurações da API Asaas</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open("https://docs.asaas.com/", "_blank")}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Documentação oficial do Asaas: <a href="https://docs.asaas.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">docs.asaas.com</a></p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Form {...apiConfigForm}>
              <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Estas configurações são necessárias para a comunicação com a API do Asaas.
                        Você precisa ter uma conta no Asaas e obter suas credenciais de API no painel de desenvolvedor.
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={apiConfigForm.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambiente</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="sandbox"
                                value="sandbox"
                                checked={field.value === "sandbox"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="sandbox" className="text-sm font-medium">
                                Sandbox (Testes)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="production"
                                value="production"
                                checked={field.value === "production"}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="production" className="text-sm font-medium">
                                Produção
                              </label>
                            </div>
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>
                        Selecione o ambiente de produção somente quando estiver pronto para processar pagamentos reais.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                            placeholder="$$aact_YeJYFBLiTsWNm..."
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
                                description: "Chave da API copiada para a área de transferência",
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Chave de API encontrada no painel do Asaas em Configurações &gt; API.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={apiConfigForm.control}
                  name="accountKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave da Conta (Account Key)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="6ef41e4a-2c89-4b85-85c9-43fc0b85d8cb" />
                      </FormControl>
                      <FormDescription>
                        Identificador único da sua conta Asaas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={apiConfigForm.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID da Carteira (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="wlt_293ej29jd8cjp28c" />
                      </FormControl>
                      <FormDescription>
                        Se você usa múltiplas carteiras, especifique o ID da carteira para recebimentos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border border-gray-200 rounded-md p-6 space-y-6">
                  <h3 className="text-lg font-medium">Configuração de Webhook</h3>
                  <p className="text-sm text-gray-500">
                    Configure o webhook para receber notificações de eventos do Asaas.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiConfigForm.control}
                      name="notificationUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Notificação</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://seusite.com/webhook/asaas" />
                          </FormControl>
                          <FormDescription>
                            URL que receberá as notificações do Asaas
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
                          <FormLabel>Token do Webhook</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="seu-token-secreto" />
                          </FormControl>
                          <FormDescription>
                            Token para verificação do webhook
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>Configurações Avançadas</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">Modo de Sandbox</h4>
                            <p className="text-xs text-gray-500">Usar ambiente de testes com dados fictícios</p>
                          </div>
                          <Switch
                            checked={apiConfigForm.watch("environment") === "sandbox"}
                            onCheckedChange={(checked) => {
                              apiConfigForm.setValue("environment", checked ? "sandbox" : "production");
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">Permitir Pagamento Split</h4>
                            <p className="text-xs text-gray-500">Habilitar divisão de pagamentos entre contas</p>
                          </div>
                          <Switch
                            checked={false}
                            onCheckedChange={() => {}}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">Ativar Log Detalhado</h4>
                            <p className="text-xs text-gray-500">Registrar todas as interações com a API</p>
                          </div>
                          <Switch
                            checked={true}
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        {/* Webhooks */}
        <TabsContent value="webhooks">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Configurações de Webhook</h2>
                <p className="text-gray-500">Configure quais eventos serão notificados pelo Asaas</p>
              </div>
              <div>
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Webhook testado",
                    description: "Evento de teste enviado com sucesso.",
                  });
                }}>
                  Testar Webhook
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Notificação</CardTitle>
                <CardDescription>
                  Selecione os eventos para os quais você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...webhookConfigForm}>
                  <form onSubmit={webhookConfigForm.handleSubmit(onSubmitWebhookConfig)} className="space-y-6">
                    <FormField
                      control={webhookConfigForm.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Webhooks Ativos</FormLabel>
                            <FormDescription>
                              Ative ou desative todas as notificações de webhook
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
                      <h3 className="text-sm font-medium">Eventos de Pagamento</h3>
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="paymentReceived"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Pagamento Recebido</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="paymentOverdue"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Pagamento Atrasado</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="paymentRefunded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Pagamento Estornado</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Eventos de Assinatura</h3>
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionCreated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Assinatura Criada</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionUpdated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Assinatura Atualizada</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="subscriptionCanceled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Assinatura Cancelada</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Outros Eventos</h3>
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="transferCreated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Transferência Criada</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookConfigForm.control}
                        name="transferFailed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Transferência Falhou</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!webhookConfigForm.watch("enabled")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={!webhookConfigForm.watch("enabled")}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Histórico de Notificações</CardTitle>
                <CardDescription>
                  Últimas notificações de webhook recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ID do Recurso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>31/03/2025 15:30:22</TableCell>
                      <TableCell>payment.received</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Sucesso
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">pay_5123987641</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>31/03/2025 14:15:03</TableCell>
                      <TableCell>payment.pending</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Sucesso
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">pay_5123987639</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>31/03/2025 10:22:17</TableCell>
                      <TableCell>subscription.created</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Sucesso
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">sub_123456</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}