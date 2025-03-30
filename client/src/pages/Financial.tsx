"use client";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  FilePlus, 
  FileText, 
  Users, 
  Calendar, 
  ChevronRight, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  PieChart,
  LineChart,
  BarChart,
  ArrowDown,
  ArrowUp
} from "lucide-react";

// Interface para contas a pagar/receber
interface Transaction {
  id: number;
  description: string;
  type: 'receita' | 'despesa';
  category: string;
  amount: number;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  dueDate: string;
  paymentDate?: string;
}

// Interface para colaboradores
interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'ativo' | 'férias' | 'licença' | 'desligado';
}

// Interface para férias
interface Vacation {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'pendente' | 'aprovada' | 'negada' | 'cancelada' | 'em_andamento' | 'concluída';
}

// Interface para folha de pagamento
interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  benefits: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'pendente' | 'pago';
}

// Dados simulados para contas a pagar e receber
const mockTransactions: Transaction[] = [
  { 
    id: 1, 
    description: 'Pagamento de clientes', 
    type: 'receita', 
    category: 'Vendas', 
    amount: 15000, 
    status: 'pago', 
    dueDate: '2025-03-15', 
    paymentDate: '2025-03-15' 
  },
  { 
    id: 2, 
    description: 'Assinatura de software', 
    type: 'despesa', 
    category: 'Ferramentas', 
    amount: 1200, 
    status: 'pendente', 
    dueDate: '2025-04-10' 
  },
  { 
    id: 3, 
    description: 'Aluguel do escritório', 
    type: 'despesa', 
    category: 'Instalações', 
    amount: 8000, 
    status: 'pendente', 
    dueDate: '2025-04-05' 
  },
  { 
    id: 4, 
    description: 'Serviços de consultoria', 
    type: 'receita', 
    category: 'Serviços', 
    amount: 9500, 
    status: 'atrasado', 
    dueDate: '2025-03-25' 
  }
];

// Dados simulados para colaboradores
const mockEmployees: Employee[] = [
  { 
    id: 1, 
    name: 'Ana Silva', 
    position: 'Desenvolvedora Sênior', 
    department: 'desenvolvimento', 
    hireDate: '2023-06-01', 
    status: 'ativo' 
  },
  { 
    id: 2, 
    name: 'Carlos Santos', 
    position: 'Designer UX', 
    department: 'design', 
    hireDate: '2023-08-15', 
    status: 'férias' 
  },
  { 
    id: 3, 
    name: 'Mariana Costa', 
    position: 'Gerente de Produto', 
    department: 'administrativo', 
    hireDate: '2022-04-10', 
    status: 'ativo' 
  },
  { 
    id: 4, 
    name: 'Pedro Dias', 
    position: 'Desenvolvedor Fullstack', 
    department: 'desenvolvimento', 
    hireDate: '2023-11-20', 
    status: 'ativo' 
  }
];

// Dados simulados para férias
const mockVacations: Vacation[] = [
  { 
    id: 1, 
    employeeId: 2, 
    employeeName: 'Carlos Santos', 
    startDate: '2025-04-01', 
    endDate: '2025-04-15', 
    totalDays: 15, 
    status: 'aprovada' 
  },
  { 
    id: 2, 
    employeeId: 1, 
    employeeName: 'Ana Silva', 
    startDate: '2025-05-10', 
    endDate: '2025-05-25', 
    totalDays: 15, 
    status: 'pendente' 
  }
];

// Dados simulados para folha de pagamento
const mockPayroll: Payroll[] = [
  { 
    id: 1, 
    employeeId: 1, 
    employeeName: 'Ana Silva', 
    month: 3, 
    year: 2025, 
    baseSalary: 9500, 
    benefits: 1200, 
    bonuses: 800, 
    deductions: 3400, 
    netSalary: 8100, 
    status: 'pago' 
  },
  { 
    id: 2, 
    employeeId: 2, 
    employeeName: 'Carlos Santos', 
    month: 3, 
    year: 2025, 
    baseSalary: 8500, 
    benefits: 1000, 
    bonuses: 0, 
    deductions: 2900, 
    netSalary: 6600, 
    status: 'pago' 
  },
  { 
    id: 3, 
    employeeId: 3, 
    employeeName: 'Mariana Costa', 
    month: 3, 
    year: 2025, 
    baseSalary: 12000, 
    benefits: 1500, 
    bonuses: 1000, 
    deductions: 4500, 
    netSalary: 10000, 
    status: 'pago' 
  },
  { 
    id: 4, 
    employeeId: 4, 
    employeeName: 'Pedro Dias', 
    month: 3, 
    year: 2025, 
    baseSalary: 7500, 
    benefits: 900, 
    bonuses: 500, 
    deductions: 2700, 
    netSalary: 6200, 
    status: 'pago' 
  }
];

// Funções utilitárias
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { color: string, label: string, icon: React.ReactNode }> = {
    'pendente': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
    'pago': { color: 'bg-green-100 text-green-800', label: 'Pago', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> },
    'atrasado': { color: 'bg-red-100 text-red-800', label: 'Atrasado', icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> },
    'cancelado': { color: 'bg-gray-100 text-gray-800', label: 'Cancelado', icon: null },
    'aprovada': { color: 'bg-green-100 text-green-800', label: 'Aprovada', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> },
    'negada': { color: 'bg-red-100 text-red-800', label: 'Negada', icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> },
    'em_andamento': { color: 'bg-blue-100 text-blue-800', label: 'Em andamento', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
    'concluída': { color: 'bg-green-100 text-green-800', label: 'Concluída', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> },
    'ativo': { color: 'bg-green-100 text-green-800', label: 'Ativo', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> },
    'férias': { color: 'bg-blue-100 text-blue-800', label: 'Férias', icon: <Calendar className="h-3.5 w-3.5 mr-1" /> },
    'licença': { color: 'bg-purple-100 text-purple-800', label: 'Licença', icon: null },
    'desligado': { color: 'bg-gray-100 text-gray-800', label: 'Desligado', icon: null },
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: null };
  
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </div>
  );
};

export default function Financial() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-gray-600">Gerenciamento financeiro completo para empresas de tecnologia</p>
        </div>
        <div className="space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Contas</TabsTrigger>
          <TabsTrigger value="employees">Colaboradores</TabsTrigger>
          <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
          <TabsTrigger value="vacations">Férias</TabsTrigger>
          <TabsTrigger value="reports">DRE</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 45.289</div>
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUp className="h-3.5 w-3.5 mr-1" />
                  <span>12% desde o último mês</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 32.750</div>
                <div className="flex items-center text-xs text-red-500">
                  <ArrowUp className="h-3.5 w-3.5 mr-1" />
                  <span>8% desde o último mês</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
                <Activity className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 18.400</div>
                <div className="flex items-center text-xs text-blue-500">
                  <ArrowDown className="h-3.5 w-3.5 mr-1" />
                  <span>3 transações pendentes</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
                <Wallet className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 9.200</div>
                <div className="flex items-center text-xs text-orange-500">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>2 faturas próximas</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>Receitas x Despesas (últimos 6 meses)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <LineChart className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-500">Gráfico de Fluxo de Caixa</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 rounded-full mr-3 ${transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-600">Vencimento: {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full flex justify-center items-center">
                    Ver todas as transações
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Contas a Pagar e Receber */}
        <TabsContent value="cashflow" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Buscar transações..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Transação</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da transação financeira abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="transaction-type" className="text-right">
                        Tipo
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Input id="description" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Categoria
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                          <SelectItem value="salarios">Salários</SelectItem>
                          <SelectItem value="instalacoes">Instalações</SelectItem>
                          <SelectItem value="impostos">Impostos</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="ferramentas">Ferramentas</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Valor (R$)
                      </Label>
                      <Input id="amount" type="number" step="0.01" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="due-date" className="text-right">
                        Vencimento
                      </Label>
                      <Input id="due-date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className={`w-2 h-6 rounded-full mr-3 ${transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="income" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions
                        .filter(transaction => transaction.type === 'receita')
                        .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-2 h-6 rounded-full mr-3 bg-green-500"></div>
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="expense" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions
                        .filter(transaction => transaction.type === 'despesa')
                        .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-2 h-6 rounded-full mr-3 bg-red-500"></div>
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-red-600">
                            -{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Colaboradores */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Buscar colaboradores..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Novo Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo colaborador abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nome
                      </Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cpf" className="text-right">
                        CPF
                      </Label>
                      <Input id="cpf" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position" className="text-right">
                        Cargo
                      </Label>
                      <Input id="position" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="department" className="text-right">
                        Departamento
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="suporte">Suporte</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                          <SelectItem value="rh">RH</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="diretoria">Diretoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="salary" className="text-right">
                        Salário Base
                      </Label>
                      <Input id="salary" type="number" step="0.01" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hire-date" className="text-right">
                        Data de Contratação
                      </Label>
                      <Input id="hire-date" type="date" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell className="capitalize">{employee.department}</TableCell>
                      <TableCell>{new Date(employee.hireDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Briefcase className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Folha de Pagamento */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Select defaultValue="3-2025">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-2025">Março/2025</SelectItem>
                  <SelectItem value="2-2025">Fevereiro/2025</SelectItem>
                  <SelectItem value="1-2025">Janeiro/2025</SelectItem>
                  <SelectItem value="12-2024">Dezembro/2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Button size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Processar Folha
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Folha de Pagamento - Março/2025</CardTitle>
              <CardDescription>Status: Processada em 25/03/2025</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Salário Base</TableHead>
                    <TableHead>Benefícios</TableHead>
                    <TableHead>Bônus</TableHead>
                    <TableHead>Descontos</TableHead>
                    <TableHead>Salário Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayroll.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{formatCurrency(item.baseSalary)}</TableCell>
                      <TableCell>{formatCurrency(item.benefits)}</TableCell>
                      <TableCell>{formatCurrency(item.bonuses)}</TableCell>
                      <TableCell>{formatCurrency(item.deductions)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(item.netSalary)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total de colaboradores: {mockPayroll.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Total da folha: {formatCurrency(mockPayroll.reduce((sum, item) => sum + item.netSalary, 0))}</p>
                  <p className="text-xs text-gray-500">Encargos não incluídos</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Férias */}
        <TabsContent value="vacations" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Buscar solicitações..." className="pl-8" />
              </div>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="aprovada">Aprovadas</SelectItem>
                  <SelectItem value="negada">Negadas</SelectItem>
                  <SelectItem value="concluida">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nova Solicitação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Solicitar Férias</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para solicitar férias.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="employee" className="text-right">
                        Colaborador
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o colaborador" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start-date" className="text-right">
                        Data de início
                      </Label>
                      <Input id="start-date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="end-date" className="text-right">
                        Data de fim
                      </Label>
                      <Input id="end-date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Observações
                      </Label>
                      <Input id="notes" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Solicitar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                      <TableCell className="font-medium">{vacation.employeeName}</TableCell>
                      <TableCell>
                        {new Date(vacation.startDate).toLocaleDateString('pt-BR')} a {new Date(vacation.endDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{vacation.totalDays}</TableCell>
                      <TableCell>{new Date().toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {vacation.status === 'pendente' && (
                            <>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-red-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Negar
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* DRE */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Select defaultValue="3-2025">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year-2025">Anual 2025</SelectItem>
                  <SelectItem value="q1-2025">1º Trimestre/2025</SelectItem>
                  <SelectItem value="3-2025">Março/2025</SelectItem>
                  <SelectItem value="2-2025">Fevereiro/2025</SelectItem>
                  <SelectItem value="1-2025">Janeiro/2025</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button size="sm">
                <BarChart className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Demonstração do Resultado do Exercício - Março/2025</CardTitle>
              <CardDescription>Valores em Reais (R$)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Receita Bruta</span>
                    <span>{formatCurrency(250000)}</span>
                  </div>
                  <div className="flex justify-between text-sm pl-4">
                    <span>Vendas de Produtos</span>
                    <span>{formatCurrency(180000)}</span>
                  </div>
                  <div className="flex justify-between text-sm pl-4">
                    <span>Prestação de Serviços</span>
                    <span>{formatCurrency(70000)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-red-600">
                    <span>(-) Deduções</span>
                    <span>-{formatCurrency(37500)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Impostos sobre vendas</span>
                    <span>-{formatCurrency(37500)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Receita Líquida</span>
                  <span>{formatCurrency(212500)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-red-600">
                    <span>(-) Custos Operacionais</span>
                    <span>-{formatCurrency(95000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Custo dos Serviços Prestados</span>
                    <span>-{formatCurrency(95000)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Lucro Bruto</span>
                  <span>{formatCurrency(117500)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-red-600">
                    <span>(-) Despesas Operacionais</span>
                    <span>-{formatCurrency(62000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Despesas Administrativas</span>
                    <span>-{formatCurrency(25000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Despesas com Pessoal</span>
                    <span>-{formatCurrency(30000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Despesas de Marketing</span>
                    <span>-{formatCurrency(7000)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>EBITDA</span>
                  <span>{formatCurrency(55500)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-red-600">
                    <span>(-) Depreciação e Amortização</span>
                    <span>-{formatCurrency(3500)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>EBIT</span>
                  <span>{formatCurrency(52000)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>(+/-) Resultado Financeiro</span>
                    <span className="text-red-600">-{formatCurrency(2000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 pl-4">
                    <span>Receitas Financeiras</span>
                    <span>+{formatCurrency(1200)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>Despesas Financeiras</span>
                    <span>-{formatCurrency(3200)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Lucro Antes dos Impostos</span>
                  <span>{formatCurrency(50000)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-red-600">
                    <span>(-) Impostos sobre o Lucro</span>
                    <span>-{formatCurrency(17000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>IRPJ</span>
                    <span>-{formatCurrency(12500)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 pl-4">
                    <span>CSLL</span>
                    <span>-{formatCurrency(4500)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-xl border-t border-b py-2">
                  <span>Lucro Líquido</span>
                  <span>{formatCurrency(33000)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Margem Líquida</span>
                  <span>13.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
