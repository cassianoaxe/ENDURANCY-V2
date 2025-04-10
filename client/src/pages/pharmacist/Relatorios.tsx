import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar as CalendarIcon, FileText, Download, ArrowUpDown, Filter, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tipos para os gráficos
interface SalesData {
  name: string;
  value: number;
}

interface ProductData {
  name: string;
  sales: number;
  revenue: number;
}

interface DailySales {
  date: string;
  sales: number;
  transactions: number;
}

// Dados fictícios para demonstração
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const mockMonthlySales: SalesData[] = [
  { name: 'Jan', value: 7500 },
  { name: 'Fev', value: 8200 },
  { name: 'Mar', value: 9100 },
  { name: 'Abr', value: 10500 },
  { name: 'Mai', value: 9800 },
  { name: 'Jun', value: 10200 },
  { name: 'Jul', value: 11500 },
  { name: 'Ago', value: 12000 },
  { name: 'Set', value: 11000 },
  { name: 'Out', value: 12500 },
  { name: 'Nov', value: 13200 },
  { name: 'Dez', value: 15000 },
];

const mockCategorySales: SalesData[] = [
  { name: 'Medicamentos', value: 65 },
  { name: 'Cosméticos', value: 15 },
  { name: 'Higiene', value: 10 },
  { name: 'Vitaminas', value: 8 },
  { name: 'Outros', value: 2 },
];

const mockDailySales: DailySales[] = [
  { date: '2025-04-01', sales: 1250, transactions: 42 },
  { date: '2025-04-02', sales: 1340, transactions: 45 },
  { date: '2025-04-03', sales: 1200, transactions: 40 },
  { date: '2025-04-04', sales: 1500, transactions: 50 },
  { date: '2025-04-05', sales: 1800, transactions: 55 },
  { date: '2025-04-06', sales: 1100, transactions: 35 },
  { date: '2025-04-07', sales: 900, transactions: 30 },
  { date: '2025-04-08', sales: 1300, transactions: 43 },
  { date: '2025-04-09', sales: 1450, transactions: 48 },
  { date: '2025-04-10', sales: 1600, transactions: 52 },
];

const mockTopProducts: ProductData[] = [
  { name: 'Dipirona 500mg - 20 comprimidos', sales: 138, revenue: 1725 },
  { name: 'Paracetamol 750mg - 20 comprimidos', sales: 125, revenue: 1987.50 },
  { name: 'Protetor Solar FPS 60 - 120ml', sales: 87, revenue: 6081.30 },
  { name: 'Losartana 50mg - 30 comprimidos', sales: 76, revenue: 1742.40 },
  { name: 'Vitamina C 1g - 30 comprimidos', sales: 65, revenue: 2307.50 },
  { name: 'Metformina 850mg - 30 comprimidos', sales: 54, revenue: 1020.60 },
  { name: 'Ibuprofeno 600mg - 20 comprimidos', sales: 48, revenue: 960 },
  { name: 'Sabonete Facial Neutro - 80g', sales: 42, revenue: 1637.40 },
  { name: 'Ácido Hialurônico - 30ml', sales: 35, revenue: 4197.50 },
  { name: 'Creme Hidratante Corporal - 400ml', sales: 32, revenue: 2556.80 },
];

const totalSales = mockMonthlySales.reduce((sum, item) => sum + item.value, 0);
const totalTransactions = mockDailySales.reduce((sum, item) => sum + item.transactions, 0);
const averageTicket = totalSales / totalTransactions;
const totalRevenue = mockTopProducts.reduce((sum, item) => sum + item.revenue, 0);

export default function PharmacistRelatorios() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState<string>('month');
  const [reportType, setReportType] = useState<string>('sales');
  
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

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-gray-500">Análise de vendas e desempenho • Farmácia {organizationName}</p>
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
                  selected={dateRange}
                  onSelect={setDateRange}
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
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSales)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+8.3%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averageTicket)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+3.8%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTopProducts.reduce((sum, product) => sum + product.sales, 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+5.2%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Reports Area */}
        <Tabs defaultValue="sales" onValueChange={setReportType}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="sales" className="gap-2">
                <BarChartIcon className="h-4 w-4" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <PieChartIcon className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Filter className="h-4 w-4" />
                Categorias
              </TabsTrigger>
            </TabsList>
            
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Diário</SelectItem>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sales Charts */}
          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Vendas Mensais</CardTitle>
                  <CardDescription>
                    Análise de vendas ao longo do ano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockMonthlySales}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
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
                            "Vendas"
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Vendas" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição de vendas por categoria de produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockCategorySales}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockCategorySales.map((entry, index) => (
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
                  <CardTitle>Vendas Diárias</CardTitle>
                  <CardDescription>
                    Evolução das vendas nos últimos 10 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockDailySales}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
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
                          formatter={(value, name) => [
                            name === "sales" 
                              ? formatCurrency(value as number)
                              : value,
                            name === "sales" ? "Vendas" : "Transações"
                          ]}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
                          }}
                        />
                        <Legend />
                        <Bar dataKey="sales" name="Vendas" fill="#00C49F" />
                        <Bar dataKey="transactions" name="Transações" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Products performance */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>
                  Desempenho dos 10 produtos com maior volume de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer">
                          Produto <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1 cursor-pointer">
                          Quantidade <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1 cursor-pointer">
                          Receita <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTopProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-right">{product.sales}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {((product.revenue / totalRevenue) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Lista Completa
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Categories Analysis */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>
                    Análise de vendas por categoria de produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockCategorySales}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockCategorySales.map((entry, index) => (
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
                  <CardTitle>Desempenho por Categoria</CardTitle>
                  <CardDescription>
                    Comparativo de vendas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Vendas (%)</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Itens Vendidos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Medicamentos</TableCell>
                        <TableCell className="text-right">65%</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue * 0.65)}</TableCell>
                        <TableCell className="text-right">523</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cosméticos</TableCell>
                        <TableCell className="text-right">15%</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue * 0.15)}</TableCell>
                        <TableCell className="text-right">134</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Higiene</TableCell>
                        <TableCell className="text-right">10%</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue * 0.10)}</TableCell>
                        <TableCell className="text-right">98</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Vitaminas</TableCell>
                        <TableCell className="text-right">8%</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue * 0.08)}</TableCell>
                        <TableCell className="text-right">76</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Outros</TableCell>
                        <TableCell className="text-right">2%</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalRevenue * 0.02)}</TableCell>
                        <TableCell className="text-right">28</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}