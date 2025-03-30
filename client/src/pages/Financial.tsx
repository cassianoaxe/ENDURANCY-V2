"use client";
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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
  ArrowUp,
  Settings,
  CreditCard,
  Brain
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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

// Componentes para cada módulo do financeiro
const FinancialOverview = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

const FinancialCashflow = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const syncPaymentsWithFinancial = async () => {
    try {
      setIsSyncing(true);
      const response = await apiRequest("POST", "/api/payments/sync-with-financial");
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Sincronização concluída",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Erro na sincronização",
          description: data.message || "Não foi possível sincronizar os pagamentos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao sincronizar pagamentos:", error);
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro ao sincronizar pagamentos com o financeiro",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="space-y-4">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => syncPaymentsWithFinancial()}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Sincronizando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Sincronizar Pagamentos
              </>
            )}
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
                {/* Outros campos do formulário... */}
              </div>
              <DialogFooter>
                <Button type="submit">Salvar transação</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar e Receber</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="mr-2">Todas</Button>
            <Button variant="ghost" size="sm" className="mr-2">Receitas</Button>
            <Button variant="ghost" size="sm">Despesas</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className={`w-2 h-5 rounded-full mr-2 ${transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {transaction.description}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Visualizar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const FinancialEmployees = () => {
  return (
    <div className="space-y-4">
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
        <div>
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
              {/* Formulário... */}
              <DialogFooter>
                <Button type="submit">Salvar colaborador</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data de Contratação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(employee.hireDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Gerenciar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const FinancialPayroll = () => {
  // Implementação do componente folha de pagamento
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Folha
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Folha de Pagamento - Março 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Benefícios</TableHead>
                <TableHead>Bônus</TableHead>
                <TableHead>Descontos</TableHead>
                <TableHead>Salário Líquido</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayroll.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                  <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
                  <TableCell>{formatCurrency(payroll.benefits)}</TableCell>
                  <TableCell>{formatCurrency(payroll.bonuses)}</TableCell>
                  <TableCell className="text-red-600">{formatCurrency(payroll.deductions)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(payroll.netSalary)}</TableCell>
                  <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const FinancialVacations = () => {
  // Implementação do componente férias
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Controle de Férias</h2>
          <p className="text-sm text-gray-600">Gerenciamento de solicitações e cronograma de férias da equipe</p>
        </div>
        <div>
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
                  Preencha os dados para solicitar um período de férias.
                </DialogDescription>
              </DialogHeader>
              {/* Formulário... */}
              <DialogFooter>
                <Button type="submit">Enviar solicitação</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Férias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVacations.map((vacation) => (
                <TableRow key={vacation.id}>
                  <TableCell className="font-medium">{vacation.employeeName}</TableCell>
                  <TableCell>{new Date(vacation.startDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{new Date(vacation.endDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{vacation.totalDays} dias</TableCell>
                  <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const FinancialReports = () => {
  // Implementação do componente DRE
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Demonstrativo de Resultados</h2>
          <p className="text-sm text-gray-600">Visão geral financeira da empresa em diferentes períodos</p>
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-12">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Relatório Financeiro - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
              <BarChart className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Gráfico DRE</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Receita Bruta</span>
                <span className="font-semibold text-green-600">R$ 587.450,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Impostos</span>
                <span className="font-semibold text-red-600">R$ 82.243,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Receita Líquida</span>
                <span className="font-semibold">R$ 505.207,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Custos Operacionais</span>
                <span className="font-semibold text-red-600">R$ 193.950,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Despesas Administrativas</span>
                <span className="font-semibold text-red-600">R$ 147.320,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Lucro Operacional</span>
                <span className="font-semibold">R$ 163.937,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 pt-2">
                <span className="text-base font-bold">Lucro Líquido</span>
                <span className="font-bold text-green-600">R$ 122.953,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente de Calendário Financeiro
const FinancialCalendar = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário Financeiro</CardTitle>
          <CardDescription>Visualize todos os eventos financeiros importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Calendário Financeiro</h3>
              <p className="text-gray-500 mt-1">O calendário financeiro será implementado em breve.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Conciliação Bancária
const BankReconciliation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conciliação Bancária</CardTitle>
          <CardDescription>Reconcilie transações bancárias com registros financeiros internos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Conciliação Bancária</h3>
              <p className="text-gray-500 mt-1">O sistema de conciliação bancária será implementado em breve.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Análise com IA
const AIAnalysis = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira com IA</CardTitle>
          <CardDescription>Obtenha insights inteligentes sobre seus dados financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center h-80">
            <div className="text-center">
              <Brain className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Análise com IA</h3>
              <p className="text-gray-500 mt-1">O sistema de análise com IA será implementado em breve.</p>
              <Button variant="outline" className="mt-4">
                <Brain className="h-4 w-4 mr-2" />
                Solicitar Análise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Configurações Financeiras
const FinancialSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
          <CardDescription>Configure opções e preferências do módulo financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Categorias Financeiras</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Categorias de Receitas</h4>
                  <p className="text-sm text-gray-500">Gerencie as categorias para contas a receber</p>
                  <Button variant="link" size="sm" className="px-0">
                    Gerenciar
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Categorias de Despesas</h4>
                  <p className="text-sm text-gray-500">Gerencie as categorias para contas a pagar</p>
                  <Button variant="link" size="sm" className="px-0">
                    Gerenciar
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Integrações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Integração Bancária</h4>
                  <p className="text-sm text-gray-500">Conecte sua conta bancária para sincronização automática</p>
                  <Button variant="link" size="sm" className="px-0">
                    Configurar
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium">Contabilidade</h4>
                  <p className="text-sm text-gray-500">Integre com sistema contábil externo</p>
                  <Button variant="link" size="sm" className="px-0">
                    Configurar
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preferências</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Financeiras</h4>
                    <p className="text-sm text-gray-500">Receba alertas sobre contas e transações</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Automáticos</h4>
                    <p className="text-sm text-gray-500">Gere relatórios mensais automaticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Visão em Dólares</h4>
                    <p className="text-sm text-gray-500">Exibir valores também em dólares (USD)</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Interface para os itens de menu
interface FinancialMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

// Componente de item de menu
const SidebarMenuItem = ({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: FinancialMenuItem; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 rounded-md transition-colors text-left ${
        isActive 
          ? 'bg-gray-100 text-primary font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="mr-3 text-lg">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
};

export default function Financial() {
  // Usa o pathname para determinar qual componente exibir
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Define o menu financeiro
  const financialMenu: FinancialMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Financeiro',
      icon: <DollarSign />,
      path: '/financial'
    },
    {
      id: 'payables',
      label: 'Contas a Pagar',
      icon: <ArrowUp />,
      path: '/financial/payables'
    },
    {
      id: 'receivables',
      label: 'Contas a Receber',
      icon: <ArrowDown />,
      path: '/financial/receivables'
    },
    {
      id: 'dre',
      label: 'DRE',
      icon: <BarChart />,
      path: '/financial/reports'
    },
    {
      id: 'cashflow',
      label: 'Fluxo de Caixa',
      icon: <Calendar />,
      path: '/financial/cashflow'
    },
    {
      id: 'calendar',
      label: 'Calendário Financeiro',
      icon: <Calendar />,
      path: '/financial/calendar'
    },
    {
      id: 'bankreconciliation',
      label: 'Conciliação Bancária',
      icon: <CreditCard />,
      path: '/financial/bankreconciliation'
    },
    {
      id: 'aianalysis',
      label: 'Análise com IA',
      icon: <Brain />,
      path: '/financial/aianalysis'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings />,
      path: '/financial/settings'
    }
  ];
  
  // Atualiza o path quando a URL muda
  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);
  
  // Função para navegar para uma rota dentro do módulo financeiro
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('popstate'));
  };
  
  // Determina qual título mostrar baseado na rota atual
  const getPageTitle = () => {
    const currentItem = financialMenu.find(item => item.path === currentPath);
    if (currentItem) return currentItem.label;
    
    switch (currentPath) {
      case '/financial/employees': return 'Gerenciamento de Colaboradores';
      case '/financial/payroll': return 'Folha de Pagamento';
      case '/financial/vacations': return 'Controle de Férias';
      default: return 'Dashboard Financeiro';
    }
  };
  
  // Determina qual componente renderizar baseado na rota atual
  const renderContent = () => {
    switch (currentPath) {
      case '/financial/payables': 
      case '/financial/receivables': 
      case '/financial/cashflow': 
        return <FinancialCashflow />;
      case '/financial/employees': 
        return <FinancialEmployees />;
      case '/financial/payroll': 
        return <FinancialPayroll />;
      case '/financial/vacations': 
        return <FinancialVacations />;
      case '/financial/reports': 
      case '/financial/dre': 
        return <FinancialReports />;
      case '/financial/calendar':
        return <FinancialCalendar />;
      case '/financial/bankreconciliation':
        return <BankReconciliation />;
      case '/financial/aianalysis':
        return <AIAnalysis />;
      case '/financial/settings':
        return <FinancialSettings />;
      default: 
        return <FinancialOverview />;
    }
  };
  
  return (
    <div className="flex">
      {/* Sidebar financeira */}
      <div className="w-64 p-4 border-r min-h-[calc(100vh-4rem)] bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase text-gray-700">FINANCEIRO</h2>
        </div>
        
        <div className="space-y-1">
          {financialMenu.map(item => (
            <SidebarMenuItem
              key={item.id}
              item={item}
              isActive={currentPath === item.path}
              onClick={() => navigateTo(item.path)}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-gray-600">Gerenciamento financeiro completo para empresas de tecnologia</p>
          </div>
          <div className="space-x-2 mt-4 md:mt-0">
            {currentPath === '/financial' && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Conteúdo dinâmico baseado na rota */}
        {renderContent()}
      </div>
    </div>
  );
}