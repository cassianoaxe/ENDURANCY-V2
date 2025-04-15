import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  ArrowDown,
  ArrowUp,
  BarChart,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  Clock,
  DollarSign,
  ArrowRight,
  FileText,
  FileWarning,
  CheckCircle,
  AlertCircle,
  Ban,
  Calendar,
  CalendarDays,
  Circle
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Dados fictícios para o gráfico
const monthlySummary = [
  { month: 'Jan', revenue: 25600, expenses: 18200 },
  { month: 'Fev', revenue: 29800, expenses: 16500 },
  { month: 'Mar', revenue: 27300, expenses: 15800 },
  { month: 'Abr', revenue: 32100, expenses: 17300 },
  { month: 'Mai', revenue: 38500, expenses: 19500 },
  { month: 'Jun', revenue: 42100, expenses: 21000 },
  { month: 'Jul', revenue: 45800, expenses: 22500 },
  { month: 'Ago', revenue: 48900, expenses: 23000 },
  { month: 'Set', revenue: 51200, expenses: 24600 },
  { month: 'Out', revenue: 54500, expenses: 25800 },
  { month: 'Nov', revenue: 57800, expenses: 26900 },
  { month: 'Dez', revenue: 62300, expenses: 29500 },
];

// Dados para o gráfico de transações recentes
const recentTransactions = [
  { 
    id: 'tx001', 
    date: subDays(new Date(), 1), 
    description: 'Pagamento de fatura #INV-789', 
    amount: 1250.00, 
    type: 'entrada',
    status: 'completed',
    customer: 'Empresa ABC Ltda'
  },
  { 
    id: 'tx002', 
    date: subDays(new Date(), 2), 
    description: 'Pagamento de assinatura - Plano Premium', 
    amount: 299.90, 
    type: 'entrada',
    status: 'completed',
    customer: 'Tech Solutions'
  },
  { 
    id: 'tx003', 
    date: subDays(new Date(), 3), 
    description: 'Taxa de processamento - Stripe', 
    amount: 45.60, 
    type: 'saida',
    status: 'completed',
    customer: 'Sistema'
  },
  { 
    id: 'tx004', 
    date: subDays(new Date(), 4), 
    description: 'Pagamento de fatura #INV-780', 
    amount: 780.00, 
    type: 'entrada',
    status: 'pending',
    customer: 'XYZ Comércio S.A.'
  },
  { 
    id: 'tx005', 
    date: subDays(new Date(), 5), 
    description: 'Estorno de cobrança duplicada', 
    amount: 150.00, 
    type: 'saida',
    status: 'completed',
    customer: 'Maria Oliveira'
  },
];

// Dados para a lista de próximas faturas
const upcomingInvoices = [
  {
    id: 'inv001',
    customer: 'Empresa XYZ Ltda',
    dueDate: addDays(new Date(), 2),
    amount: 1780.00,
    status: 'pendente'
  },
  {
    id: 'inv002',
    customer: 'Tech Solutions Informática',
    dueDate: addDays(new Date(), 5),
    amount: 1290.00,
    status: 'pendente'
  },
  {
    id: 'inv003',
    customer: 'João Silva (Pessoa Física)',
    dueDate: addDays(new Date(), 7),
    amount: 750.00,
    status: 'pendente'
  },
  {
    id: 'inv004',
    customer: 'Global Trading Ltda',
    dueDate: subDays(new Date(), 3),
    amount: 4200.00,
    status: 'vencida'
  },
  {
    id: 'inv005',
    customer: 'Distribuidora Norte EIRELI',
    dueDate: subDays(new Date(), 10),
    amount: 7500.00,
    status: 'vencida'
  }
];

// Dados para assinaturas ativas
const activeSubscriptions = [
  {
    id: 'sub001',
    customer: 'Empresa ABC Ltda',
    plan: 'Plano Premium Anual',
    amount: 299.90,
    nextBilling: addDays(new Date(), 180),
    status: 'ativa'
  },
  {
    id: 'sub002',
    customer: 'João Silva',
    plan: 'Plano Básico Mensal',
    amount: 49.90,
    nextBilling: addDays(new Date(), 20),
    status: 'ativa'
  },
  {
    id: 'sub003',
    customer: 'Global Trading Ltda',
    plan: 'Plano Premium + API Mensal',
    amount: 349.90,
    nextBilling: addDays(new Date(), 5),
    status: 'ativa'
  },
  {
    id: 'sub004',
    customer: 'Startup Inovadora LTDA',
    plan: 'Plano Teste 14 dias',
    amount: 149.90,
    nextBilling: addDays(new Date(), 4),
    status: 'trial'
  },
  {
    id: 'sub005',
    customer: 'Tech Solutions Informática',
    plan: 'Plano Business Trimestral',
    amount: 199.90,
    nextBilling: addDays(new Date(), 85),
    status: 'pendente'
  }
];

export default function ComplyPay() {
  const [, navigate] = useLocation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Cálculos para o resumo do período selecionado
  const currentPeriodSummary = {
    revenue: 98750.00,
    expenses: 12650.00,
    netProfit: 86100.00,
    transactions: 154,
    averageTicket: 641.23,
    pendingInvoices: 36500.00,
    overdueInvoices: 12700.00
  };

  // Cálculos para comparação com o período anterior
  const previousPeriodComparison = {
    revenue: 8.5,
    expenses: -3.2,
    netProfit: 10.7,
    transactions: 12.3,
    averageTicket: -2.1
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard ComplyPay</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho financeiro da sua empresa</p>
        </div>
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange}
          className="w-[300px]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Receita Bruta</span>
              <span className="text-2xl font-bold">{formatCurrency(currentPeriodSummary.revenue)}</span>
              <div className="flex items-center mt-2">
                {previousPeriodComparison.revenue >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${previousPeriodComparison.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {previousPeriodComparison.revenue >= 0 ? '+' : ''}{previousPeriodComparison.revenue}% em relação ao período anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Despesas</span>
              <span className="text-2xl font-bold">{formatCurrency(currentPeriodSummary.expenses)}</span>
              <div className="flex items-center mt-2">
                {previousPeriodComparison.expenses <= 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${previousPeriodComparison.expenses <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {previousPeriodComparison.expenses >= 0 ? '+' : ''}{previousPeriodComparison.expenses}% em relação ao período anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(currentPeriodSummary.netProfit)}</span>
              <div className="flex items-center mt-2">
                {previousPeriodComparison.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${previousPeriodComparison.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {previousPeriodComparison.netProfit >= 0 ? '+' : ''}{previousPeriodComparison.netProfit}% em relação ao período anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Transações</span>
              <span className="text-2xl font-bold">{currentPeriodSummary.transactions}</span>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  Ticket médio: {formatCurrency(currentPeriodSummary.averageTicket)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-8">
        {/* Gráfico principal - ocupa 5 colunas */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Análise de Receitas x Despesas</CardTitle>
            <CardDescription>Evolução anual em {new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aqui normalmente iria um componente de gráfico como Recharts */}
            <div className="h-80 flex flex-col justify-between">
              <div className="space-y-8">
                {monthlySummary.map((month, index) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(month.revenue)}</span>
                    </div>
                    <div className="relative pt-1">
                      <Progress value={(month.revenue / 70000) * 100} className="h-2 bg-gray-100" />
                    </div>
                  </div>
                )).slice(-4)} {/* Exibe apenas os últimos 4 meses */}
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                  <span className="text-sm">Receitas</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                  <span className="text-sm">Despesas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lado direito - Resumo de faturas e cobranças - ocupa 3 colunas */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Status de Cobranças</CardTitle>
            <CardDescription>Resumo das faturas pendentes e vencidas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Faturas pendentes</span>
                <span className="text-sm font-medium">{formatCurrency(currentPeriodSummary.pendingInvoices)}</span>
              </div>
              <Progress value={(currentPeriodSummary.pendingInvoices / (currentPeriodSummary.pendingInvoices + currentPeriodSummary.overdueInvoices)) * 100} className="h-2 bg-gray-100" />
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm font-medium">Faturas vencidas</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(currentPeriodSummary.overdueInvoices)}</span>
              </div>
              <Progress value={(currentPeriodSummary.overdueInvoices / (currentPeriodSummary.pendingInvoices + currentPeriodSummary.overdueInvoices)) * 100} className="h-2 bg-red-100" />
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assinaturas ativas</span>
                <Badge className="bg-green-100 text-green-800">32</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Receita recorrente mensal</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(15425.70)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de retenção</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">96.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/organization/complypay/faturas')}>
              Ver todas as faturas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transações Recentes</TabsTrigger>
          <TabsTrigger value="invoices">Próximas Faturas</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas Ativas</TabsTrigger>
        </TabsList>

        {/* Conteúdo da tab de transações recentes */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Movimentações financeiras dos últimos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${transaction.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'} rounded-full p-2`}>
                        {transaction.type === 'entrada' ? (
                          <ArrowDown className={`h-4 w-4 text-green-600`} />
                        ) : (
                          <ArrowUp className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(transaction.date)} • {transaction.customer}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        {transaction.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Concluída</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendente</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/organization/complypay/transacoes')}>
                Ver todas as transações
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Conteúdo da tab de próximas faturas */}
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Faturas</CardTitle>
              <CardDescription>Faturas pendentes a vencer nos próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 rounded-full p-2 ${
                        invoice.status === 'pendente' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {invoice.status === 'pendente' ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <FileWarning className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{invoice.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.status === 'pendente' ? 'Vence em ' : 'Vencida há '}
                          {Math.abs(Math.round((invoice.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} 
                          {' '}
                          dias • {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      <div className="flex items-center justify-end mt-1">
                        {invoice.status === 'pendente' ? (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendente</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 text-xs">Vencida</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/organization/complypay/faturas')}>
                Ver todas as faturas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Conteúdo da tab de assinaturas ativas */}
        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas Ativas</CardTitle>
              <CardDescription>Receitas recorrentes atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 rounded-full p-2 
                        ${subscription.status === 'ativa' ? 'bg-green-100' : 
                          subscription.status === 'trial' ? 'bg-purple-100' : 'bg-yellow-100'}`}>
                        {subscription.status === 'ativa' ? (
                          <RefreshCw className="h-4 w-4 text-green-600" />
                        ) : subscription.status === 'trial' ? (
                          <CalendarDays className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{subscription.customer}</div>
                        <div className="text-sm text-muted-foreground">{subscription.plan}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(subscription.amount)}<span className="text-xs text-muted-foreground">/mês</span></div>
                      <div className="flex items-center justify-end mt-1">
                        <Badge className={`text-xs 
                          ${subscription.status === 'ativa' ? 'bg-green-100 text-green-800' : 
                            subscription.status === 'trial' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {subscription.status === 'ativa' ? 'Ativa' : 
                           subscription.status === 'trial' ? 'Período de Teste' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/organization/complypay/assinaturas')}>
                Ver todas as assinaturas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}