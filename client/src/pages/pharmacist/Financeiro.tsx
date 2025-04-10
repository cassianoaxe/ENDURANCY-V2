import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, ChevronDown, ArrowUpDown, Download, FileText, CircleDollarSign, CreditCard, LineChart, Banknote, Wallet, Coins, AlertTriangle, PiggyBank, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line, AreaChart, Area } from "recharts";

// Tipos de dados
interface Transaction {
  id: number;
  date: string;
  description: string;
  type: "entrada" | "saida";
  amount: number;
  category: string;
  paymentMethod: string;
  status: "completado" | "pendente" | "cancelado";
}

interface ExpenseCategory {
  name: string;
  value: number;
  percentage: number;
}

interface IncomeCategory {
  name: string;
  value: number;
  percentage: number;
}

interface PaymentMethod {
  name: string;
  value: number;
  transactions: number;
}

interface MonthlyFinance {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

// Dados fictícios para demonstração
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const mockTransactions: Transaction[] = [
  { id: 1, date: '2025-04-10', description: 'Venda balcão #25689', type: 'entrada', amount: 189.90, category: 'Vendas', paymentMethod: 'Cartão de Crédito', status: 'completado' },
  { id: 2, date: '2025-04-10', description: 'Compra de estoque - Lab. Medley', type: 'saida', amount: 1450.00, category: 'Estoque', paymentMethod: 'Transferência', status: 'completado' },
  { id: 3, date: '2025-04-09', description: 'Venda balcão #25688', type: 'entrada', amount: 76.50, category: 'Vendas', paymentMethod: 'Dinheiro', status: 'completado' },
  { id: 4, date: '2025-04-09', description: 'Pagamento fornecedor - Lab. EMS', type: 'saida', amount: 2100.00, category: 'Estoque', paymentMethod: 'Pix', status: 'completado' },
  { id: 5, date: '2025-04-08', description: 'Venda balcão #25687', type: 'entrada', amount: 135.20, category: 'Vendas', paymentMethod: 'Cartão de Débito', status: 'completado' },
  { id: 6, date: '2025-04-08', description: 'Conta de energia', type: 'saida', amount: 580.35, category: 'Custos fixos', paymentMethod: 'Débito automático', status: 'completado' },
  { id: 7, date: '2025-04-07', description: 'Venda balcão #25686', type: 'entrada', amount: 92.75, category: 'Vendas', paymentMethod: 'Pix', status: 'completado' },
  { id: 8, date: '2025-04-07', description: 'Pagamento de aluguel', type: 'saida', amount: 3500.00, category: 'Custos fixos', paymentMethod: 'Transferência', status: 'completado' },
  { id: 9, date: '2025-04-06', description: 'Venda balcão #25685', type: 'entrada', amount: 425.90, category: 'Vendas', paymentMethod: 'Cartão de Crédito', status: 'completado' },
  { id: 10, date: '2025-04-06', description: 'Pagamento fornecedor - Lab. Teuto', type: 'saida', amount: 1850.00, category: 'Estoque', paymentMethod: 'Pix', status: 'completado' },
];

const mockExpenseCategories: ExpenseCategory[] = [
  { name: 'Estoque', value: 15000, percentage: 55 },
  { name: 'Folha de Pagamento', value: 7000, percentage: 25 },
  { name: 'Custos Fixos', value: 4000, percentage: 15 },
  { name: 'Marketing', value: 800, percentage: 3 },
  { name: 'Outros', value: 500, percentage: 2 },
];

const mockIncomeCategories: IncomeCategory[] = [
  { name: 'Medicamentos', value: 25000, percentage: 65 },
  { name: 'Cosméticos', value: 5800, percentage: 15 },
  { name: 'Itens de Higiene', value: 3800, percentage: 10 },
  { name: 'Vitaminas', value: 3100, percentage: 8 },
  { name: 'Outros', value: 800, percentage: 2 },
];

const mockPaymentMethods: PaymentMethod[] = [
  { name: 'Dinheiro', value: 30, transactions: 452 },
  { name: 'Cartão de Crédito', value: 42, transactions: 631 },
  { name: 'Cartão de Débito', value: 15, transactions: 225 },
  { name: 'Pix', value: 10, transactions: 150 },
  { name: 'Transferência', value: 3, transactions: 45 },
];

const mockMonthlyFinances: MonthlyFinance[] = [
  { month: 'Jan', income: 32000, expenses: 25000, profit: 7000 },
  { month: 'Fev', income: 34500, expenses: 26300, profit: 8200 },
  { month: 'Mar', income: 37600, expenses: 28500, profit: 9100 },
  { month: 'Abr', income: 42000, expenses: 31500, profit: 10500 },
  { month: 'Mai', income: 40800, expenses: 31000, profit: 9800 },
  { month: 'Jun', income: 43200, expenses: 33000, profit: 10200 },
  { month: 'Jul', income: 47500, expenses: 36000, profit: 11500 },
  { month: 'Ago', income: 49300, expenses: 37300, profit: 12000 },
  { month: 'Set', income: 47000, expenses: 36000, profit: 11000 },
  { month: 'Out', income: 52500, expenses: 40000, profit: 12500 },
  { month: 'Nov', income: 54200, expenses: 41000, profit: 13200 },
  { month: 'Dez', income: 62000, expenses: 47000, profit: 15000 },
];

const totalIncomes = mockMonthlyFinances.reduce((sum, item) => sum + item.income, 0);
const totalExpenses = mockMonthlyFinances.reduce((sum, item) => sum + item.expenses, 0);
const totalProfit = mockMonthlyFinances.reduce((sum, item) => sum + item.profit, 0);

export default function PharmacistFinanceiro() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [transactionFilter, setTransactionFilter] = useState<string>('todos');
  const [financeTab, setFinanceTab] = useState<string>('visao-geral');
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'todos') return true;
    if (transactionFilter === 'entradas') return transaction.type === 'entrada';
    if (transactionFilter === 'saidas') return transaction.type === 'saida';
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-gray-500">Gerenciamento financeiro • Farmácia {organizationName}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    "Selecione período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range) {
                      setDateRange({
                        from: range.from,
                        to: range.to
                      });
                    }
                  }}
                  locale={ptBR}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalIncomes)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span> vs. ano anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+8.3%</span> vs. ano anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+15.8%</span> vs. ano anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((totalProfit / totalIncomes) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+2.5%</span> vs. ano anterior
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="visao-geral" onValueChange={setFinanceTab}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="visao-geral" className="gap-2">
                <LineChart className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="fluxo-caixa" className="gap-2">
                <CircleDollarSign className="h-4 w-4" />
                Fluxo de Caixa
              </TabsTrigger>
              <TabsTrigger value="receitas" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Receitas
              </TabsTrigger>
              <TabsTrigger value="despesas" className="gap-2">
                <ChevronDown className="h-4 w-4" />
                Despesas
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Visão Geral */}
          <TabsContent value="visao-geral">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Análise Financeira Mensal</CardTitle>
                  <CardDescription>
                    Comparativo entre receitas, despesas e lucro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockMonthlyFinances}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => 
                            new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(value)
                          }
                        />
                        <Tooltip 
                          formatter={(value) => [
                            formatCurrency(value as number), 
                            ""
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="income" name="Receitas" fill="#00C49F" />
                        <Bar dataKey="expenses" name="Despesas" fill="#FF8042" />
                        <Bar dataKey="profit" name="Lucro" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Receitas</CardTitle>
                  <CardDescription>
                    Análise por categoria de produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockIncomeCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {mockIncomeCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>
                    Análise por categoria de despesa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockExpenseCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {mockExpenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Fluxo de Caixa */}
          <TabsContent value="fluxo-caixa">
            <div className="grid grid-cols-1 gap-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transações Recentes</CardTitle>
                    <CardDescription>
                      Registro de entradas e saídas financeiras
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={transactionFilter} 
                      onValueChange={setTransactionFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as Transações</SelectItem>
                        <SelectItem value="entradas">Apenas Entradas</SelectItem>
                        <SelectItem value="saidas">Apenas Saídas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Forma de Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description}
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === 'completado'
                                  ? 'default'
                                  : transaction.status === 'pendente'
                                  ? 'outline'
                                  : 'destructive'
                              }
                            >
                              {transaction.status === 'completado'
                                ? 'Completado'
                                : transaction.status === 'pendente'
                                ? 'Pendente'
                                : 'Cancelado'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filteredTransactions.length} de {transactions.length} transações
                  </div>
                  <Button variant="outline">Ver Todas as Transações</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>
                    Distribuição por forma de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockPaymentMethods}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {mockPaymentMethods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Método</TableHead>
                            <TableHead className="text-right">%</TableHead>
                            <TableHead className="text-right">Transações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockPaymentMethods.map((method, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{method.name}</TableCell>
                              <TableCell className="text-right">{method.value}%</TableCell>
                              <TableCell className="text-right">{method.transactions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell className="text-right">100%</TableCell>
                            <TableCell className="text-right">
                              {mockPaymentMethods.reduce((sum, item) => sum + item.transactions, 0)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Receitas */}
          <TabsContent value="receitas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Receitas Mensais</CardTitle>
                  <CardDescription>
                    Evolução das receitas ao longo do ano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={mockMonthlyFinances}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => 
                            new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(value)
                          }
                        />
                        <Tooltip 
                          formatter={(value) => [
                            formatCurrency(value as number), 
                            "Receita"
                          ]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="income" name="Receitas" fill="#00C49F" stroke="#00C49F" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Receitas</CardTitle>
                  <CardDescription>
                    Distribuição por categoria de produtos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Porcentagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockIncomeCategories.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.value)}</TableCell>
                          <TableCell className="text-right">{category.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(mockIncomeCategories.reduce((sum, item) => sum + item.value, 0))}
                        </TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Metas de Faturamento</CardTitle>
                  <CardDescription>
                    Progresso em relação às metas de faturamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          <p className="text-sm font-medium">Meta Mensal</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(45000)}</p>
                          <p className="text-xs text-gray-500">93% alcançado</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '93%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-blue-500" />
                          <p className="text-sm font-medium">Meta Trimestral</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(130000)}</p>
                          <p className="text-xs text-gray-500">87% alcançado</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <PiggyBank className="h-4 w-4 text-purple-500" />
                          <p className="text-sm font-medium">Meta Anual</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(550000)}</p>
                          <p className="text-xs text-gray-500">75% alcançado</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Despesas */}
          <TabsContent value="despesas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Despesas Mensais</CardTitle>
                  <CardDescription>
                    Evolução das despesas ao longo do ano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={mockMonthlyFinances}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => 
                            new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(value)
                          }
                        />
                        <Tooltip 
                          formatter={(value) => [
                            formatCurrency(value as number), 
                            "Despesa"
                          ]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="expenses" name="Despesas" fill="#FF8042" stroke="#FF8042" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Despesas</CardTitle>
                  <CardDescription>
                    Distribuição por categoria de despesas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Porcentagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockExpenseCategories.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.value)}</TableCell>
                          <TableCell className="text-right">{category.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(mockExpenseCategories.reduce((sum, item) => sum + item.value, 0))}
                        </TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Despesas</CardTitle>
                  <CardDescription>
                    Categorias com gastos acima do orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-red-900">Estoque e Produtos</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Gastos estão 15% acima do orçamento para esta categoria.
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-red-700">Orçado: {formatCurrency(13000)}</span>
                            <span className="text-xs text-red-700">Atual: {formatCurrency(15000)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-amber-900">Marketing</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Gastos estão 5% acima do orçamento para esta categoria.
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-amber-700">Orçado: {formatCurrency(760)}</span>
                            <span className="text-xs text-amber-700">Atual: {formatCurrency(800)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}