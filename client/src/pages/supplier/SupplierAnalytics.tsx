import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  ArrowUpRight, 
  Download, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  ArrowUp, 
  ArrowDown,
  Users,
  ShoppingBag,
  Star,
  Map,
  DollarSign,
  Zap,
  BarChart,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Layout do fornecedor
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";

export default function SupplierAnalytics() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  // Dados simulados para analytics
  const analyticsData = {
    totalSales: 45320.75,
    salesGrowth: 12.5,
    totalOrders: 38,
    ordersGrowth: 8.2,
    totalCustomers: 12,
    customersGrowth: 25.0,
    conversionRate: 4.2,
    averageOrderValue: 1192.65,
    aovGrowth: 3.8,
    // Vendas por categoria
    salesByCategory: [
      { category: "Extratos", sales: 18540.50, percentage: 40.9, growth: 15.2 },
      { category: "Óleos", sales: 12450.75, percentage: 27.5, growth: 10.8 },
      { category: "Cápsulas", sales: 5640.30, percentage: 12.4, growth: 5.3 },
      { category: "Cultivo", sales: 4320.00, percentage: 9.5, growth: 20.5 },
      { category: "Tópicos", sales: 2370.20, percentage: 5.2, growth: 8.7 },
      { category: "Outros", sales: 1999.00, percentage: 4.5, growth: -2.1 },
    ],
    // Vendas por região
    salesByRegion: [
      { region: "Sudeste", sales: 22660.40, percentage: 50.0, growth: 14.3 },
      { region: "Sul", sales: 9970.57, percentage: 22.0, growth: 9.5 },
      { region: "Nordeste", sales: 6798.11, percentage: 15.0, growth: 18.7 },
      { region: "Centro-Oeste", sales: 4532.08, percentage: 10.0, growth: 7.2 },
      { region: "Norte", sales: 1359.62, percentage: 3.0, growth: 5.1 },
    ],
    // Produtos mais vendidos
    topProducts: [
      { name: "Extrato CBD 10%", sales: 10500.00, units: 42, growth: 12.5 },
      { name: "Óleo Full Spectrum", sales: 6660.00, units: 37, growth: 8.3 },
      { name: "Kit Cultivo Indoor", sales: 5400.00, units: 15, growth: 25.0 },
      { name: "Semente Premium", sales: 2380.00, units: 28, growth: 15.2 },
      { name: "Vaporizador Portátil", sales: 6080.00, units: 19, growth: 3.8 },
    ],
    // Clientes mais frequentes
    topCustomers: [
      { name: "Hempmeds", orders: 12, sales: 15470.40, growth: 18.7 },
      { name: "CBD Life", sales: 9540.20, orders: 8, growth: 5.3 },
      { name: "GreenCare", sales: 8250.75, orders: 6, growth: 10.2 },
      { name: "Abrace", sales: 5350.25, orders: 4, growth: 7.8 },
      { name: "AnnaMed", sales: 3100.80, orders: 3, growth: 12.5 },
    ],
    // Dados de série temporal (últimos 6 meses)
    timeSeriesData: [
      { month: "Dez/24", sales: 35680.50, orders: 31 },
      { month: "Jan/25", sales: 38240.75, orders: 33 },
      { month: "Fev/25", sales: 36120.80, orders: 32 },
      { month: "Mar/25", sales: 40250.30, orders: 35 },
      { month: "Abr/25", sales: 42950.60, orders: 36 },
      { month: "Mai/25", sales: 45320.75, orders: 38 },
    ],
  };

  // Calculando métricas de desempenho
  const calculatePerformance = () => {
    // Comparando o mês atual com o mês anterior
    const currentMonth = analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 1];
    const previousMonth = analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 2];
    
    const salesGrowth = ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100;
    const ordersGrowth = ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100;
    
    return {
      salesGrowth: salesGrowth.toFixed(1),
      ordersGrowth: ordersGrowth.toFixed(1),
    };
  };

  const performance = calculatePerformance();

  // Função para baixar relatório
  const downloadReport = (reportType: string) => {
    toast({
      title: "Relatório baixado",
      description: `O relatório de ${reportType} foi baixado com sucesso.`,
    });
  };

  return (
    <SupplierLayout activeTab="analytics">
      <div className="pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Analytics</h1>
            <p className="text-muted-foreground">Análise de desempenho e insights sobre suas vendas.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Período</SelectLabel>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                  <SelectItem value="all">Todo o período</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => downloadReport("desempenho")}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Cards de métricas principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas Totais
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {analyticsData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-xs text-green-600">
                  +{performance.salesGrowth}% em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-xs text-green-600">
                  +{performance.ordersGrowth}% em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Médio do Pedido
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {analyticsData.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-xs text-green-600">
                  +{analyticsData.aovGrowth}% em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-xs text-green-600">
                  +{analyticsData.customersGrowth}% em relação ao mês anterior
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de análise */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>
          
          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Gráfico principal - Tendência de vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
                <CardDescription>
                  Evolução das vendas nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    O gráfico de linha mostraria a evolução de vendas ao longo do tempo.
                  </p>
                  <div className="mt-4 px-8">
                    <div className="bg-gray-100 h-8 rounded-lg overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: '80%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Dez/24</span>
                      <span>Jan/25</span>
                      <span>Fev/25</span>
                      <span>Mar/25</span>
                      <span>Abr/25</span>
                      <span>Mai/25</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Vendas por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição de vendas por categoria de produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <PieChart className="h-12 w-12 text-gray-300" />
                  </div>
                  <div className="space-y-4">
                    {analyticsData.salesByCategory.map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-gray-500">{category.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={`h-full ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}`} 
                            style={{ width: `${category.percentage}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Vendas por Região */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Região</CardTitle>
                  <CardDescription>
                    Distribuição geográfica das vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <Map className="h-12 w-12 text-gray-300" />
                  </div>
                  <div className="space-y-4">
                    {analyticsData.salesByRegion.map((region, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{region.region}</span>
                          <span className="text-sm text-gray-500">{region.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={`h-full ${index % 4 === 0 ? 'bg-red-500' : index % 4 === 1 ? 'bg-yellow-500' : index % 4 === 2 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${region.percentage}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Produtos Mais Vendidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>
                    Top 5 produtos por volume de vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Unidades</TableHead>
                        <TableHead className="text-right">Vendas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">{product.units}</TableCell>
                          <TableCell className="text-right">R$ {product.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Clientes Mais Frequentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Principais Clientes</CardTitle>
                  <CardDescription>
                    Top 5 clientes por volume de compras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Pedidos</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.topCustomers.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell className="text-right">{customer.orders}</TableCell>
                          <TableCell className="text-right">R$ {customer.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Vendas */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6">
              {/* Gráfico detalhado de vendas */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise Detalhada de Vendas</CardTitle>
                  <CardDescription>
                    Desempenho de vendas ao longo do tempo com análise de tendências
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      Este gráfico mostraria a análise detalhada de vendas ao longo do tempo.
                    </p>
                    <div className="mt-8 grid grid-cols-6 gap-2 px-4">
                      {analyticsData.timeSeriesData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="bg-blue-500 w-12 rounded-t-sm" style={{ height: `${(data.sales / 50000) * 200}px` }}></div>
                          <span className="text-xs text-gray-500 mt-1">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Comparação de desempenho */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativo de Vendas</CardTitle>
                    <CardDescription>
                      Comparação com períodos anteriores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Mês atual vs. Mês anterior</span>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+{performance.salesGrowth}%</Badge>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '75%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Mês atual vs. Mesmo mês do ano anterior</span>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+21.4%</Badge>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '90%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Acumulado do ano vs. Ano anterior</span>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+15.8%</Badge>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Projeção de Vendas</CardTitle>
                    <CardDescription>
                      Previsão para os próximos meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px] flex items-center justify-center mb-4">
                      <TrendingUp className="h-16 w-16 text-gray-300" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Jun/2025 (projeção)</span>
                        <span className="text-green-600 font-medium">R$ 48.750,20</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Jul/2025 (projeção)</span>
                        <span className="text-green-600 font-medium">R$ 52.340,80</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ago/2025 (projeção)</span>
                        <span className="text-green-600 font-medium">R$ 55.120,50</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab: Produtos */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>
                    Por unidades vendidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{product.name}</span>
                            <span className="text-xs text-gray-500">{product.units} un.</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${(product.units / analyticsData.topProducts[0].units) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Rentáveis</CardTitle>
                  <CardDescription>
                    Por valor de vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{product.name}</span>
                            <span className="text-xs text-gray-500">R$ {product.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${(product.sales / analyticsData.topProducts[0].sales) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Produtos em Crescimento</CardTitle>
                  <CardDescription>
                    Por taxa de crescimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topProducts
                      .slice()
                      .sort((a, b) => b.growth - a.growth)
                      .map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Zap className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{product.name}</span>
                            <span className="text-xs text-green-600">+{product.growth}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-purple-500" 
                              style={{ width: `${(product.growth / 25) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Análise de Produtos por Categoria</CardTitle>
                <CardDescription>
                  Desempenho de vendas por categoria de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                      <TableHead className="text-right">Crescimento</TableHead>
                      <TableHead className="text-right">Margem Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.salesByCategory.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-right">R$ {category.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">{category.percentage}%</TableCell>
                        <TableCell className="text-right">
                          <span className={category.growth >= 0 ? "text-green-600" : "text-red-600"}>
                            {category.growth >= 0 ? "+" : ""}{category.growth}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{35 + index}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Clientes */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes por Volume de Compras</CardTitle>
                  <CardDescription>
                    Top clientes por valor total de compras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topCustomers
                      .slice()
                      .sort((a, b) => b.sales - a.sales)
                      .map((customer, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{customer.name}</span>
                            <span className="text-xs text-gray-500">R$ {customer.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${(customer.sales / analyticsData.topCustomers[0].sales) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Clientes por Frequência</CardTitle>
                  <CardDescription>
                    Top clientes por número de pedidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topCustomers
                      .slice()
                      .sort((a, b) => b.orders - a.orders)
                      .map((customer, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <ShoppingBag className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{customer.name}</span>
                            <span className="text-xs text-gray-500">{customer.orders} pedidos</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${(customer.orders / analyticsData.topCustomers[0].orders) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Análise de Retenção de Clientes</CardTitle>
                <CardDescription>
                  Taxa de recompra e fidelização de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto w-40 h-40 rounded-full border-8 border-gray-100 relative mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">75%</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ddd" strokeWidth="2" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray="87.96 87.96" strokeDashoffset="22" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    Taxa de retenção de clientes
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Baseado em compras repetidas nos últimos 6 meses
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Clientes</CardTitle>
                <CardDescription>
                  Informações detalhadas sobre principais clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                      <TableHead className="text-right">Último Pedido</TableHead>
                      <TableHead className="text-right">Crescimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right">{customer.orders}</TableCell>
                        <TableCell className="text-right">R$ {customer.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">R$ {(customer.sales / customer.orders).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">{index === 0 ? "01/05/2025" : index === 1 ? "28/04/2025" : index === 2 ? "25/04/2025" : index === 3 ? "20/04/2025" : "15/04/2025"}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600">+{customer.growth}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => downloadReport("clientes")}
                  className="w-full text-red-800 border-red-200 hover:bg-red-50 hover:text-red-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório de Clientes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SupplierLayout>
  );
}