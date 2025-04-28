import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Search, 
  Download, 
  Printer, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  FileText, 
  Mail, 
  Share2
} from 'lucide-react';

// Tipos
interface MonthlySummary {
  month: string;
  revenue: number;
  tests: number;
  expenses: number;
  profit: number;
}

interface ClientRevenue {
  clientId: number;
  clientName: string;
  revenue: number;
  testsCount: number;
}

interface TestTypeRevenue {
  testType: string;
  revenue: number;
  count: number;
}

interface FinancialReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  invoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
  monthlyData: MonthlySummary[];
  topClients: ClientRevenue[];
  testTypeData: TestTypeRevenue[];
}

export default function FinanceiroRelatorios() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [reportType, setReportType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);

  useEffect(() => {
    // Carregar dados do relatório
    loadMockData();
  }, [reportType, selectedPeriod, customStartDate, customEndDate]);

  const loadMockData = () => {
    // Gerar dados de exemplo com base nos filtros
    let startDate = new Date();
    let endDate = new Date();
    
    if (selectedPeriod === 'current_month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    } else if (selectedPeriod === 'last_month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    } else if (selectedPeriod === 'last_quarter') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1);
    } else if (selectedPeriod === 'last_year') {
      startDate = new Date(startDate.getFullYear() - 1, startDate.getMonth(), 1);
    } else if (selectedPeriod === 'custom') {
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) endDate = new Date(customEndDate);
    }
    
    // Gerar dados fictícios com base no período
    const periodName = 
      selectedPeriod === 'current_month' ? 'Mês Atual' :
      selectedPeriod === 'last_month' ? 'Mês Anterior' :
      selectedPeriod === 'last_quarter' ? 'Último Trimestre' :
      selectedPeriod === 'last_year' ? 'Último Ano' :
      'Período Personalizado';
    
    // Gerar dados mensais com base no período
    const monthlyData: MonthlySummary[] = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Gerar 6 meses de dados ou o número apropriado para o período selecionado
    const monthCount = selectedPeriod === 'last_year' ? 12 : 
                      selectedPeriod === 'last_quarter' ? 3 : 6;
    
    for (let i = 0; i < monthCount; i++) {
      const monthIndex = (startDate.getMonth() - monthCount + 1 + i + 12) % 12;
      const revenue = Math.floor(Math.random() * 20000) + 10000;
      const expenses = Math.floor(Math.random() * 7000) + 5000;
      
      monthlyData.push({
        month: months[monthIndex],
        revenue: revenue,
        tests: Math.floor(Math.random() * 50) + 20,
        expenses: expenses,
        profit: revenue - expenses
      });
    }
    
    // Gerar dados de clientes
    const topClients: ClientRevenue[] = [
      { clientId: 1, clientName: 'Laboratório MedCanna', revenue: 11850, testsCount: 25 },
      { clientId: 2, clientName: 'CannaPharma Brasil', revenue: 9200, testsCount: 18 },
      { clientId: 3, clientName: 'Associação Esperança', revenue: 7890, testsCount: 15 },
      { clientId: 4, clientName: 'HempMed Brasil', revenue: 5450, testsCount: 12 },
      { clientId: 5, clientName: 'Farmácia de Manipulação Vida', revenue: 4750, testsCount: 8 }
    ];
    
    // Gerar dados de tipos de teste
    const testTypeData: TestTypeRevenue[] = [
      { testType: 'HPLC', revenue: 15750, count: 45 },
      { testType: 'GCMS', revenue: 9800, count: 21 },
      { testType: 'LCMS', revenue: 7200, count: 18 },
      { testType: 'Microbiologia', revenue: 5900, count: 15 },
      { testType: 'Metais Pesados', revenue: 4800, count: 8 }
    ];
    
    // Cálculos totais
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = (totalProfit / totalRevenue) * 100;
    
    const mockReportData: FinancialReportData = {
      period: periodName,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      totalRevenue,
      totalExpenses,
      totalProfit,
      profitMargin,
      invoicesCount: Math.floor(Math.random() * 50) + 30,
      paidInvoicesCount: Math.floor(Math.random() * 30) + 20,
      overdueInvoicesCount: Math.floor(Math.random() * 10) + 1,
      monthlyData,
      topClients,
      testTypeData
    };
    
    setReportData(mockReportData);
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: pt });
  };

  // Gerar relatório
  const generateReport = () => {
    loadMockData();
    toast({
      title: "Relatório gerado",
      description: "O relatório financeiro foi gerado com sucesso",
    });
  };

  // Exportar para PDF
  const exportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "O relatório está sendo preparado para download em PDF",
    });
  };

  // Exportar para Excel
  const exportExcel = () => {
    toast({
      title: "Exportando Excel",
      description: "O relatório está sendo preparado para download em Excel",
    });
  };

  // Enviar por e-mail
  const sendEmail = () => {
    toast({
      title: "Enviando por e-mail",
      description: "O relatório será enviado por e-mail",
    });
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-500">Analise o desempenho financeiro do laboratório</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportExcel}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={sendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar por Email
          </Button>
        </div>
      </div>

      {/* Filtros de relatório */}
      <Card className="mb-6">
        <CardHeader className="bg-blue-50 py-4">
          <CardTitle className="text-lg font-medium text-blue-800">Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Relatório Mensal</SelectItem>
                  <SelectItem value="quarterly">Relatório Trimestral</SelectItem>
                  <SelectItem value="annual">Relatório Anual</SelectItem>
                  <SelectItem value="client">Relatório por Cliente</SelectItem>
                  <SelectItem value="test">Relatório por Tipo de Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Mês Atual</SelectItem>
                  <SelectItem value="last_month">Mês Anterior</SelectItem>
                  <SelectItem value="last_quarter">Último Trimestre</SelectItem>
                  <SelectItem value="last_year">Último Ano</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPeriod === 'custom' && (
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                  <Popover open={showCalendarStart} onOpenChange={setShowCalendarStart}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={(date) => {
                          setCustomStartDate(date);
                          setShowCalendarStart(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                  <Popover open={showCalendarEnd} onOpenChange={setShowCalendarEnd}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={(date) => {
                          setCustomEndDate(date);
                          setShowCalendarEnd(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={generateReport}>
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatório financeiro */}
      {reportData && (
        <>
          {/* Cabeçalho do relatório */}
          <Card className="mb-6">
            <CardHeader className="bg-blue-50 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-blue-800">
                  Relatório Financeiro: {reportData.period}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {formatDate(reportData.startDate)} a {formatDate(reportData.endDate)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-800 text-sm font-medium mb-1">Receita Total</div>
                  <div className="text-xl font-bold">
                    R$ {reportData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-800 text-sm font-medium mb-1">Despesas</div>
                  <div className="text-xl font-bold">
                    R$ {reportData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-800 text-sm font-medium mb-1">Lucro</div>
                  <div className="text-xl font-bold">
                    R$ {reportData.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-indigo-800 text-sm font-medium mb-1">Margem de Lucro</div>
                  <div className="text-xl font-bold">
                    {reportData.profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-orange-800 text-sm font-medium mb-1">Total de Faturas</div>
                  <div className="text-xl font-bold">
                    {reportData.invoicesCount}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-800 text-sm font-medium mb-1">Faturas Pagas</div>
                  <div className="text-xl font-bold">
                    {reportData.paidInvoicesCount}
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-800 text-sm font-medium mb-1">Faturas em Atraso</div>
                  <div className="text-xl font-bold">
                    {reportData.overdueInvoicesCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos e dados detalhados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Receita mensal */}
            <Card>
              <CardHeader className="bg-gray-50 py-4">
                <CardTitle className="text-base font-medium text-gray-800">
                  <BarChart3 className="h-5 w-5 inline-block mr-2" />
                  Evolução da Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[250px] mt-4">
                  {/* Aqui seria um gráfico real, simulando com barras */}
                  <div className="flex h-[200px] items-end space-x-2">
                    {reportData.monthlyData.map((item, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center">
                        <div 
                          className="bg-blue-500 w-full rounded-t-md" 
                          style={{ 
                            height: `${(item.revenue / Math.max(...reportData.monthlyData.map(i => i.revenue))) * 170}px` 
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
            
            {/* Lucro x Despesa */}
            <Card>
              <CardHeader className="bg-gray-50 py-4">
                <CardTitle className="text-base font-medium text-gray-800">
                  <TrendingUp className="h-5 w-5 inline-block mr-2" />
                  Lucro vs. Despesas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[250px] mt-4">
                  {/* Aqui seria um gráfico real, simulando com barras duplas */}
                  <div className="flex h-[200px] items-end space-x-2">
                    {reportData.monthlyData.map((item, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center">
                        <div className="flex w-full space-x-1">
                          <div 
                            className="bg-green-500 w-1/2 rounded-t-md" 
                            style={{ 
                              height: `${(item.profit / Math.max(...reportData.monthlyData.map(i => i.profit))) * 170}px` 
                            }}
                          ></div>
                          <div 
                            className="bg-red-400 w-1/2 rounded-t-md" 
                            style={{ 
                              height: `${(item.expenses / Math.max(...reportData.monthlyData.map(i => i.expenses))) * 170}px` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs mt-2">{item.month}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-2 text-xs">
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Lucro</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                      <span>Despesas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabelas de dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top clientes */}
            <Card>
              <CardHeader className="bg-gray-50 py-4">
                <CardTitle className="text-base font-medium text-gray-800">
                  Top Clientes por Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Testes</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.topClients.map((client) => (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="text-right">{client.testsCount}</TableCell>
                        <TableCell className="text-right">
                          R$ {client.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Top tipos de teste */}
            <Card>
              <CardHeader className="bg-gray-50 py-4">
                <CardTitle className="text-base font-medium text-gray-800">
                  Receita por Tipo de Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Tipo de Teste</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.testTypeData.map((test, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{test.testType}</TableCell>
                        <TableCell className="text-right">{test.count}</TableCell>
                        <TableCell className="text-right">
                          R$ {test.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}