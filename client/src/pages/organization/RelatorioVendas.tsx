import React, { useState } from "react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  FileText, Download, Filter, Calendar, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  LineChart as LineChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

// Dados simulados
const vendasUltimos12Meses = [
  { name: 'Abr', vendas: 42000, meta: 45000 },
  { name: 'Mai', vendas: 38900, meta: 45000 },
  { name: 'Jun', vendas: 42500, meta: 45000 },
  { name: 'Jul', vendas: 49800, meta: 45000 },
  { name: 'Ago', vendas: 52000, meta: 45000 },
  { name: 'Set', vendas: 47500, meta: 45000 },
  { name: 'Out', vendas: 58200, meta: 45000 },
  { name: 'Nov', vendas: 54800, meta: 45000 },
  { name: 'Dez', vendas: 62000, meta: 45000 },
  { name: 'Jan', vendas: 49000, meta: 45000 },
  { name: 'Fev', vendas: 38500, meta: 45000 },
  { name: 'Mar', vendas: 42300, meta: 45000 },
];

const canalVendas = [
  { name: 'Site Próprio', value: 55 },
  { name: 'Marketplace', value: 25 },
  { name: 'Loja Física', value: 15 },
  { name: 'Vendedores', value: 5 },
];

const vendasDiarias = [
  { name: '01/04', vendas: 4200 },
  { name: '02/04', vendas: 3800 },
  { name: '03/04', vendas: 4500 },
  { name: '04/04', vendas: 5200 },
  { name: '05/04', vendas: 4800 },
  { name: '06/04', vendas: 3200 },
  { name: '07/04', vendas: 3900 },
];

const produtosMaisVendidos = [
  { name: 'Óleo CBD 500mg', vendas: 245, porcentagem: 22, crescimento: 8.5 },
  { name: 'Creme Terapêutico', vendas: 187, porcentagem: 16, crescimento: 12.3 },
  { name: 'Cápsulas CBD 300mg', vendas: 165, porcentagem: 14, crescimento: -3.2 },
  { name: 'Spray Oral CBD', vendas: 132, porcentagem: 12, crescimento: 5.7 },
  { name: 'Kit Bem-estar', vendas: 98, porcentagem: 9, crescimento: 15.4 },
];

const metricas = [
  { id: 1, nome: 'Número de Pedidos', valor: 587, crescimento: 12.4, periodo: 'vs mês anterior' },
  { id: 2, nome: 'Valor Médio de Pedido', valor: 'R$ 243,50', crescimento: 5.2, periodo: 'vs mês anterior' },
  { id: 3, nome: 'Taxa de Conversão', valor: '4.2%', crescimento: -0.8, periodo: 'vs mês anterior' },
  { id: 4, nome: 'Clientes Novos', valor: 112, crescimento: 18.7, periodo: 'vs mês anterior' },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RelatorioVendas() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mensal");
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date(2025, 2, 1)); // 1 de Março de 2025
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date(2025, 2, 31)); // 31 de Março de 2025

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Relatório de Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Análise detalhada do desempenho de vendas e métricas de negócio
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-r-none border-r-0 flex items-center gap-2 pl-3 pr-2.5">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center px-2 bg-muted">a</div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-l-none border-l-0 flex items-center gap-2 pl-2.5 pr-3">
                    <span className="text-sm">
                      {dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                    </span>
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Selecione período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-10">
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button className="h-10 bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {metricas.map((metrica) => (
            <Card key={metrica.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metrica.nome}</p>
                    <h3 className="text-2xl font-bold mt-1">{metrica.valor}</h3>
                    <p className={`text-xs flex items-center gap-1 ${metrica.crescimento >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                      {metrica.crescimento >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(metrica.crescimento)}% {metrica.periodo}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    metrica.id === 1 ? 'bg-green-100 dark:bg-green-900/30' :
                    metrica.id === 2 ? 'bg-blue-100 dark:bg-blue-900/30' :
                    metrica.id === 3 ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {metrica.id === 1 ? (
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : metrica.id === 2 ? (
                      <LineChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : metrica.id === 3 ? (
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" transform="rotate(45)" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList className="w-fit">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="channels">Canais</TabsTrigger>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Desempenho de Vendas</CardTitle>
                  <CardDescription>Vendas dos últimos 12 meses com meta mensal</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vendasUltimos12Meses}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                        <Legend />
                        <Bar dataKey="vendas" name="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meta" name="Meta" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="meta"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Vendas Por Canal</CardTitle>
                  <CardDescription>Distribuição de vendas por canal de distribuição</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={canalVendas}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {canalVendas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Vendas Diárias</CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={vendasDiarias}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                        <Area 
                          type="monotone" 
                          dataKey="vendas" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#colorVendas)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
                <CardDescription>Top 5 produtos com maior volume de vendas</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium">Produto</th>
                        <th className="text-center py-3 px-4 text-sm font-medium">Unidades Vendidas</th>
                        <th className="text-center py-3 px-4 text-sm font-medium">% do Total</th>
                        <th className="text-right py-3 px-4 text-sm font-medium">Crescimento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosMaisVendidos.map((produto, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{produto.name}</td>
                          <td className="py-3 px-4 text-center">{produto.vendas}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${produto.porcentagem}%` }}
                                ></div>
                              </div>
                              <span>{produto.porcentagem}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`flex items-center justify-end gap-1 ${produto.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {produto.crescimento >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {Math.abs(produto.crescimento)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Desempenho por Categoria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Óleos CBD</h4>
                          <p className="text-sm text-muted-foreground">32% do total</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400">
                          +14.2%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Tópicos</h4>
                          <p className="text-sm text-muted-foreground">28% do total</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400">
                          +8.7%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Cápsulas</h4>
                          <p className="text-sm text-muted-foreground">24% do total</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/30 dark:text-red-400">
                          -3.1%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="channels" className="mt-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Desempenho por Canal</CardTitle>
                  <CardDescription>Análise detalhada por canal de vendas</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium">Canal</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">Vendas (R$)</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">% do Total</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">Crescimento</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Site Próprio</td>
                          <td className="py-3 px-4 text-right">R$ 278.450,00</td>
                          <td className="py-3 px-4 text-right">55%</td>
                          <td className="py-3 px-4 text-right">
                            <span className="flex items-center justify-end gap-1 text-green-600">
                              <ArrowUpRight className="h-3 w-3" />
                              16.8%
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Marketplace</td>
                          <td className="py-3 px-4 text-right">R$ 126.750,00</td>
                          <td className="py-3 px-4 text-right">25%</td>
                          <td className="py-3 px-4 text-right">
                            <span className="flex items-center justify-end gap-1 text-green-600">
                              <ArrowUpRight className="h-3 w-3" />
                              9.2%
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Loja Física</td>
                          <td className="py-3 px-4 text-right">R$ 76.050,00</td>
                          <td className="py-3 px-4 text-right">15%</td>
                          <td className="py-3 px-4 text-right">
                            <span className="flex items-center justify-end gap-1 text-red-600">
                              <ArrowDownRight className="h-3 w-3" />
                              5.7%
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Vendedores</td>
                          <td className="py-3 px-4 text-right">R$ 25.350,00</td>
                          <td className="py-3 px-4 text-right">5%</td>
                          <td className="py-3 px-4 text-right">
                            <span className="flex items-center justify-end gap-1 text-green-600">
                              <ArrowUpRight className="h-3 w-3" />
                              2.1%
                            </span>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-medium">
                          <td className="py-3 px-4">Total</td>
                          <td className="py-3 px-4 text-right">R$ 506.600,00</td>
                          <td className="py-3 px-4 text-right">100%</td>
                          <td className="py-3 px-4 text-right">
                            <span className="flex items-center justify-end gap-1 text-green-600">
                              <ArrowUpRight className="h-3 w-3" />
                              12.3%
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tendência por Canal</CardTitle>
                  <CardDescription>Evolução de vendas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          dataKey="valor" 
                          data={[
                            { name: 'Out', valor: 150000 },
                            { name: 'Nov', valor: 170000 },
                            { name: 'Dez', valor: 200000 },
                            { name: 'Jan', valor: 190000 },
                            { name: 'Fev', valor: 160000 },
                            { name: 'Mar', valor: 180000 }
                          ]} 
                          name="Site Próprio" 
                          stroke="#10b981" 
                          strokeWidth={2}
                        />
                        <Line 
                          dataKey="valor" 
                          data={[
                            { name: 'Out', valor: 80000 },
                            { name: 'Nov', valor: 90000 },
                            { name: 'Dez', valor: 110000 },
                            { name: 'Jan', valor: 100000 },
                            { name: 'Fev', valor: 85000 },
                            { name: 'Mar', valor: 95000 }
                          ]} 
                          name="Marketplace" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                        />
                        <Line 
                          dataKey="valor" 
                          data={[
                            { name: 'Out', valor: 60000 },
                            { name: 'Nov', valor: 65000 },
                            { name: 'Dez', valor: 70000 },
                            { name: 'Jan', valor: 60000 },
                            { name: 'Fev', valor: 50000 },
                            { name: 'Mar', valor: 55000 }
                          ]} 
                          name="Loja Física" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Segmentação de Clientes</CardTitle>
                <CardDescription>Análise por perfil de compra e comportamento</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Segmentação por Recência</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Ativos (últimos 30 dias)', value: 42 },
                              { name: 'Recentes (30-90 dias)', value: 28 },
                              { name: 'Em risco (90-180 dias)', value: 15 },
                              { name: 'Inativos (>180 dias)', value: 15 }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {canalVendas.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Métricas de Clientes</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Custo de Aquisição (CAC)</h4>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400">
                            -8.4%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">R$ 78,50</p>
                        <p className="text-sm text-muted-foreground mt-1">Redução no último trimestre</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Valor do Tempo de Vida (LTV)</h4>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400">
                            +12.7%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">R$ 587,00</p>
                        <p className="text-sm text-muted-foreground mt-1">Aumento no último trimestre</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Taxa de Recompra</h4>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400">
                            +5.2%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">42%</p>
                        <p className="text-sm text-muted-foreground mt-1">Clientes que compram novamente em 90 dias</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Top Clientes por Valor</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium">Cliente</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                          <th className="text-center py-3 px-4 text-sm font-medium">Compras</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">Gasto Total</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">Última Compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Marina Silva</td>
                          <td className="py-3 px-4">marina.silva@email.com</td>
                          <td className="py-3 px-4 text-center">18</td>
                          <td className="py-3 px-4 text-right">R$ 5.245,00</td>
                          <td className="py-3 px-4 text-right">07/04/2025</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Carlos Mendes</td>
                          <td className="py-3 px-4">carlos.mendes@email.com</td>
                          <td className="py-3 px-4 text-center">12</td>
                          <td className="py-3 px-4 text-right">R$ 4.780,00</td>
                          <td className="py-3 px-4 text-right">05/04/2025</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Ana Paula Santos</td>
                          <td className="py-3 px-4">ana.santos@email.com</td>
                          <td className="py-3 px-4 text-center">15</td>
                          <td className="py-3 px-4 text-right">R$ 4.120,00</td>
                          <td className="py-3 px-4 text-right">02/04/2025</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Roberto Alves</td>
                          <td className="py-3 px-4">roberto.alves@email.com</td>
                          <td className="py-3 px-4 text-center">10</td>
                          <td className="py-3 px-4 text-right">R$ 3.950,00</td>
                          <td className="py-3 px-4 text-right">01/04/2025</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">Lucia Ferreira</td>
                          <td className="py-3 px-4">lucia.ferreira@email.com</td>
                          <td className="py-3 px-4 text-center">9</td>
                          <td className="py-3 px-4 text-right">R$ 3.685,00</td>
                          <td className="py-3 px-4 text-right">06/04/2025</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}