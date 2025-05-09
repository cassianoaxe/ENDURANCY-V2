import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  FileText,
  Plus,
  Send,
  CreditCard,
  CheckCircle,
  Download,
  Search,
  Eye,
  Receipt,
  BarChart,
  ArrowRight,
  FileCheck,
  DollarSign,
  Link as LinkIcon,
  TrendingUp,
  PieChart,
  ChevronRight,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Interface para resumo financeiro
interface FinancialSummary {
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  paidInvoices: number;
  invoicesThisMonth: number;
  revenueTrend: { month: string; revenue: number }[];
  clientRevenue: { clientName: string; revenue: number }[];
  testVolume: { month: string; count: number }[];
  paymentMethods: { method: string; percentage: number }[];
  recentInvoices: {
    id: number;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue';
  }[];
  recentPayments: {
    id: number;
    clientName: string;
    amount: number;
    date: string;
    method: string;
  }[];
}

// Dados de resumo financeiro simulados
const mockFinancialSummary: FinancialSummary = {
  totalRevenue: 39450.00,
  pendingPayments: 12350.00,
  overduePayments: 2890.00,
  paidInvoices: 12,
  invoicesThisMonth: 8,
  revenueTrend: [
    { month: 'Nov', revenue: 28500 },
    { month: 'Dez', revenue: 31200 },
    { month: 'Jan', revenue: 29850 },
    { month: 'Fev', revenue: 35400 },
    { month: 'Mar', revenue: 33950 },
    { month: 'Abr', revenue: 39450 }
  ],
  clientRevenue: [
    { clientName: 'CannaPharma Brasil', revenue: 15850 },
    { clientName: 'Laboratório MedCanna', revenue: 9250 },
    { clientName: 'Associação Esperança', revenue: 7890 },
    { clientName: 'HempMed Brasil', revenue: 5360 },
    { clientName: 'Farmácia de Manipulação Vida', revenue: 1100 }
  ],
  testVolume: [
    { month: 'Nov', count: 45 },
    { month: 'Dez', count: 52 },
    { month: 'Jan', count: 48 },
    { month: 'Fev', count: 63 },
    { month: 'Mar', count: 57 },
    { month: 'Abr', count: 68 }
  ],
  paymentMethods: [
    { method: 'Pix', percentage: 45 },
    { method: 'Cartão de Crédito', percentage: 20 },
    { method: 'Transferência', percentage: 30 },
    { method: 'Outros', percentage: 5 }
  ],
  recentInvoices: [
    { id: 1, invoiceNumber: 'INV-2025-021', clientName: 'CannaPharma Brasil', amount: 4200, date: '2025-04-18', status: 'pending' },
    { id: 2, invoiceNumber: 'INV-2025-020', clientName: 'Laboratório MedCanna', amount: 2850, date: '2025-04-15', status: 'paid' },
    { id: 3, invoiceNumber: 'INV-2025-019', clientName: 'HempMed Brasil', amount: 3450, date: '2025-04-10', status: 'paid' },
    { id: 4, invoiceNumber: 'INV-2025-018', clientName: 'Associação Esperança', amount: 1890, date: '2025-04-05', status: 'overdue' },
    { id: 5, invoiceNumber: 'INV-2025-017', clientName: 'Universidade Federal', amount: 1200, date: '2025-04-01', status: 'paid' }
  ],
  recentPayments: [
    { id: 1, clientName: 'Laboratório MedCanna', amount: 2850, date: '2025-04-15', method: 'Pix' },
    { id: 2, clientName: 'HempMed Brasil', amount: 3450, date: '2025-04-12', method: 'Transferência' },
    { id: 3, clientName: 'Universidade Federal', amount: 1200, date: '2025-04-05', method: 'Cartão de Crédito' },
    { id: 4, clientName: 'CannaPharma Brasil', amount: 3800, date: '2025-03-28', method: 'Transferência' },
    { id: 5, clientName: 'Centro de Pesquisa', amount: 4500, date: '2025-03-23', method: 'Pix' }
  ]
};

export default function LaboratoryFinanceiro() {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    // Carregar dados do resumo financeiro
    setFinancialSummary(mockFinancialSummary);
  }, []);

  if (!financialSummary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-gray-500">Acompanhe o desempenho financeiro do seu laboratório</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/laboratory/financeiro/relatorios'}>
            <BarChart className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button onClick={() => window.location.href = '/laboratory/financeiro/faturas'}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  R$ {financialSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{financialSummary.paidInvoices} faturas pagas</div>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-blue-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  R$ {financialSummary.pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{financialSummary.invoicesThisMonth} faturas este mês</div>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ClipboardList className="text-orange-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Pagamentos em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  R$ {financialSummary.overduePayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">
                  {financialSummary.recentInvoices.filter(inv => inv.status === 'overdue').length} faturas em atraso
                </div>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="text-red-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Links de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  3 ativos
                </div>
                <div className="text-xs text-gray-500">
                  Total: R$ 6.200,00
                </div>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <LinkIcon className="text-purple-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Tendência de Faturamento</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                Ver relatório completo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              {/* Simulação de gráfico com barras */}
              <div className="flex h-[180px] items-end space-x-4 px-4">
                {financialSummary.revenueTrend.map((item, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <div 
                      className="bg-blue-500 w-full rounded-t-md" 
                      style={{ 
                        height: `${(item.revenue / Math.max(...financialSummary.revenueTrend.map(i => i.revenue))) * 160}px` 
                      }}
                    ></div>
                    <div className="text-xs mt-2">{item.month}</div>
                    <div className="text-xs text-gray-500">
                      {(item.revenue / 1000).toFixed(1)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Volume de Testes</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                Ver análise
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              {/* Simulação de gráfico com barras */}
              <div className="flex h-[180px] items-end space-x-4 px-4">
                {financialSummary.testVolume.map((item, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <div 
                      className="bg-green-500 w-full rounded-t-md" 
                      style={{ 
                        height: `${(item.count / Math.max(...financialSummary.testVolume.map(i => i.count))) * 160}px` 
                      }}
                    ></div>
                    <div className="text-xs mt-2">{item.month}</div>
                    <div className="text-xs text-gray-500">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas faturas e pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Faturas Recentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => window.location.href = '/laboratory/financeiro/faturas'}
              >
                Ver todas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummary.recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell className="text-right">
                      R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          invoice.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                          invoice.status === 'pending' && "bg-blue-50 text-blue-700 border-blue-200",
                          invoice.status === 'overdue' && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {
                          invoice.status === 'paid' ? 'Paga' :
                          invoice.status === 'pending' ? 'Pendente' :
                          'Atrasada'
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Pagamentos Recentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => window.location.href = '/laboratory/financeiro/pagamentos'}
              >
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummary.recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.clientName}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {payment.method === 'Pix' ? (
                          <div className="mr-2 h-4 w-4 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 4C18.8 4 16.9 5.6 16.9 5.6L11.9 10.7L7.1 5.9C7.1 5.9 5.8 4 3 4C0.2 4 0 6.3 0 6.3C0 8.8 2.1 10.8 2.1 10.8L11.8 20.3L21.6 10.7C21.6 10.7 24 8.6 24 6.1C24 6.1 23.2 4 21 4Z" fill="currentColor" />
                            </svg>
                          </div>
                        ) : payment.method === 'Cartão de Crédito' ? (
                          <CreditCard className="mr-2 h-4 w-4" />
                        ) : (
                          <DollarSign className="mr-2 h-4 w-4" />
                        )}
                        {payment.method}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Top e Distribuição de Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Top Clientes</CardTitle>
            <CardDescription>Por volume de faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialSummary.clientRevenue.map((client, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {client.clientName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium">{client.clientName}</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-blue-100">
                      <div 
                        className="h-full rounded-full bg-blue-500" 
                        style={{ 
                          width: `${(client.revenue / Math.max(...financialSummary.clientRevenue.map(c => c.revenue))) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                  <div className="ml-auto text-sm font-medium">
                    R$ {client.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
            <CardDescription>Distribuição por método</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialSummary.paymentMethods.map((method, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{method.method}</div>
                    <div className="text-sm font-medium">{method.percentage}%</div>
                  </div>
                  <Progress value={method.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de atalho para páginas financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card 
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => window.location.href = '/laboratory/financeiro/faturas'}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg font-medium">Faturas</span>
                <span className="text-sm text-gray-500">Gerenciar faturas</span>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="text-blue-600 h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>Ver faturas</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => window.location.href = '/laboratory/financeiro/pagamentos'}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg font-medium">Pagamentos</span>
                <span className="text-sm text-gray-500">Registro e histórico</span>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="text-green-600 h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>Ver pagamentos</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => window.location.href = '/laboratory/financeiro/links'}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg font-medium">Links de Pagamento</span>
                <span className="text-sm text-gray-500">Criar e gerenciar links</span>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <LinkIcon className="text-purple-600 h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>Ver links</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => window.location.href = '/laboratory/financeiro/relatorios'}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg font-medium">Relatórios</span>
                <span className="text-sm text-gray-500">Análise financeira</span>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart className="text-amber-600 h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>Ver relatórios</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}