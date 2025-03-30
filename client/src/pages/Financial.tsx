"use client";
import { useState } from "react";
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
import FinancialCalendarPage from './FinancialCalendar';

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

// Funções utilitárias

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Função para retornar o badge de status
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

// Componente para o Calendário Financeiro
const FinancialCalendar = () => {
  return <FinancialCalendarPage />;
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
              {mockPayroll.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{formatCurrency(item.baseSalary)}</TableCell>
                  <TableCell>{formatCurrency(item.benefits)}</TableCell>
                  <TableCell>{formatCurrency(item.bonuses)}</TableCell>
                  <TableCell>{formatCurrency(item.deductions)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(item.netSalary)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Buscar férias..." className="pl-8" />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="negada">Negada</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluída">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Férias e Licenças</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Dias</TableHead>
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
                  <TableCell>{vacation.totalDays} dias</TableCell>
                  <TableCell>{getStatusBadge(vacation.status)}</TableCell>
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

const FinancialAnalysis = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise de IA</CardTitle>
          <CardDescription>Insights e recomendações baseadas em IA para otimizar suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Assistente de Inteligência Financeira</h3>
                <p className="text-sm text-gray-500">Análise de dados financeiros com IA</p>
              </div>
              <Button variant="outline" className="ml-auto">
                <Brain className="h-4 w-4 mr-2" />
                Gerar nova análise
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-blue-700 mb-2">Tendências de Receita</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Suas receitas aumentaram 12% em comparação com o mesmo período do ano passado. 
                  Isso indica um crescimento saudável do negócio.
                </p>
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400">Gráfico de tendências de receita</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-purple-700 mb-2">Oportunidades de Economia</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Identificamos potenciais economias de R$ 4.250 mensais em despesas operacionais 
                  com base na análise de seus padrões de gastos.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Assinaturas de software</span>
                    <span className="text-sm font-semibold">R$ 1.800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Serviços terceirizados</span>
                    <span className="text-sm font-semibold">R$ 2.450</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-amber-700 mb-2">Previsão de Fluxo de Caixa</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Com base nos seus dados históricos, projetamos um fluxo de caixa positivo 
                  nos próximos 3 meses, com um aumento estimado de 8% na liquidez.
                </p>
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400">Gráfico de previsão de fluxo de caixa</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Análise por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <PieChart className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Gráfico de distribuição de despesas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Receitas</CardTitle>
            <CardDescription>Análise mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <BarChart className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Gráfico comparativo de receitas</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FinancialSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
          <CardDescription>Gerencie as configurações relacionadas ao módulo financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Permissões e Acesso</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="permission-all">Acesso completo ao módulo financeiro</Label>
                    <p className="text-sm text-gray-500">Permitir que administradores vejam todas as informações financeiras</p>
                  </div>
                  <Switch id="permission-all" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="permission-reports">Geração de relatórios</Label>
                    <p className="text-sm text-gray-500">Permitir que gerentes gerem relatórios financeiros</p>
                  </div>
                  <Switch id="permission-reports" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="permission-edit">Edição de transações</Label>
                    <p className="text-sm text-gray-500">Permitir que gerentes editem transações financeiras</p>
                  </div>
                  <Switch id="permission-edit" />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Notificações</h3>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Alertas de pagamento</Label>
                    <Select defaultValue="7">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 dia antes</SelectItem>
                        <SelectItem value="3">3 dias antes</SelectItem>
                        <SelectItem value="5">5 dias antes</SelectItem>
                        <SelectItem value="7">7 dias antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Relatórios automáticos</Label>
                    <Select defaultValue="month">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Diários</SelectItem>
                        <SelectItem value="week">Semanais</SelectItem>
                        <SelectItem value="month">Mensais</SelectItem>
                        <SelectItem value="quarter">Trimestrais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-payment">Notificações de pagamentos</Label>
                    <p className="text-sm text-gray-500">Receber e-mails sobre pagamentos recebidos ou efetuados</p>
                  </div>
                  <Switch id="notify-payment" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-overdue">Alertas de atraso</Label>
                    <p className="text-sm text-gray-500">Receber alertas diários sobre contas em atraso</p>
                  </div>
                  <Switch id="notify-overdue" defaultChecked />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Integração com outros módulos</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="integration-sales">Integração com Vendas</Label>
                    <p className="text-sm text-gray-500">Sincronizar dados de vendas com o módulo financeiro</p>
                  </div>
                  <Switch id="integration-sales" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="integration-purchases">Integração com Compras</Label>
                    <p className="text-sm text-gray-500">Sincronizar dados de compras com o módulo financeiro</p>
                  </div>
                  <Switch id="integration-purchases" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar configurações</Button>
      </div>
    </div>
  );
};

interface FinancialMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function Financial() {
  const [activeSection, setActiveSection] = useState("overview");
  
  const sections: Record<string, FinancialMenuItem> = {
    "overview": {
      id: "overview",
      label: "Visão Geral",
      icon: <PieChart className="h-4 w-4" />,
      component: <FinancialOverview />
    },
    "cashflow": {
      id: "cashflow",
      label: "Contas a Pagar e Receber",
      icon: <Wallet className="h-4 w-4" />,
      component: <FinancialCashflow />
    },
    "calendar": {
      id: "calendar",
      label: "Calendário Financeiro",
      icon: <Calendar className="h-4 w-4" />,
      component: <FinancialCalendar />
    },
    "employees": {
      id: "employees",
      label: "Colaboradores",
      icon: <Users className="h-4 w-4" />,
      component: <FinancialEmployees />
    },
    "payroll": {
      id: "payroll",
      label: "Folha de Pagamento",
      icon: <CreditCard className="h-4 w-4" />,
      component: <FinancialPayroll />
    },
    "vacations": {
      id: "vacations",
      label: "Férias e Licenças",
      icon: <Briefcase className="h-4 w-4" />,
      component: <FinancialVacations />
    },
    "analysis": {
      id: "analysis",
      label: "Análise de IA",
      icon: <Brain className="h-4 w-4" />,
      component: <FinancialAnalysis />
    },
    "settings": {
      id: "settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" />,
      component: <FinancialSettings />
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financeiro</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {Object.values(sections).map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
        
        <div className="md:col-span-9">
          {sections[activeSection].component}
        </div>
      </div>
    </div>
  );
}