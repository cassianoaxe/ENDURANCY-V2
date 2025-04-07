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
  ShoppingCart, PackageOpen, TrendingUp, Wallet, Users, 
  ArrowUpRight, Search, PackagePlus, Filter, ShoppingBag,
  FileText, Download, Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Dados simulados para os gráficos
const vendasMensais = [
  { name: 'Jan', vendas: 4000, meta: 4500 },
  { name: 'Fev', vendas: 3000, meta: 4500 },
  { name: 'Mar', vendas: 2000, meta: 4500 },
  { name: 'Abr', vendas: 2780, meta: 4500 },
  { name: 'Mai', vendas: 1890, meta: 4500 },
  { name: 'Jun', vendas: 2390, meta: 4500 },
  { name: 'Jul', vendas: 3490, meta: 4500 },
  { name: 'Ago', vendas: 5000, meta: 4500 },
  { name: 'Set', vendas: 4500, meta: 4500 },
  { name: 'Out', vendas: 5200, meta: 4500 },
  { name: 'Nov', vendas: 4800, meta: 4500 },
  { name: 'Dez', vendas: 6000, meta: 4500 },
];

const categoriasVendas = [
  { name: 'Produtos Naturais', value: 400 },
  { name: 'Suplementos', value: 300 },
  { name: 'Terapêuticos', value: 300 },
  { name: 'Cosméticos', value: 200 },
  { name: 'Outros', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Produtos simulados
const produtosDestaque = [
  {
    id: 1,
    nome: "Óleo Essencial de Lavanda",
    preco: 89.90,
    estoque: 45,
    imagem: "https://placehold.co/100x100/49de80/white?text=Lavanda",
    vendas: 124,
    categoria: "Óleos Essenciais"
  },
  {
    id: 2,
    nome: "Crème de CBD 500mg",
    preco: 159.90,
    estoque: 32,
    imagem: "https://placehold.co/100x100/49de80/white?text=CBD",
    vendas: 98,
    categoria: "Terapêuticos"
  },
  {
    id: 3,
    nome: "Chá de Camomila Orgânico",
    preco: 28.50,
    estoque: 120,
    imagem: "https://placehold.co/100x100/49de80/white?text=Camomila",
    vendas: 87,
    categoria: "Chás"
  },
  {
    id: 4,
    nome: "Proteína Vegana",
    preco: 120.00,
    estoque: 65,
    imagem: "https://placehold.co/100x100/49de80/white?text=Proteína",
    vendas: 76,
    categoria: "Suplementos"
  },
  {
    id: 5,
    nome: "Ômega 3 1000mg",
    preco: 65.90,
    estoque: 85,
    imagem: "https://placehold.co/100x100/49de80/white?text=Ômega3",
    vendas: 62,
    categoria: "Suplementos"
  }
];

// Pedidos simulados
const pedidosRecentes = [
  {
    id: "PED-39845",
    cliente: "Marina Silva",
    data: "07/04/2025",
    valor: 289.80,
    status: "Concluído",
    produtos: 3
  },
  {
    id: "PED-39844",
    cliente: "Ricardo Santos",
    data: "07/04/2025",
    valor: 159.90,
    status: "Em processamento",
    produtos: 1
  },
  {
    id: "PED-39843",
    cliente: "Carla Mendes",
    data: "06/04/2025",
    valor: 198.50,
    status: "Enviado",
    produtos: 2
  },
  {
    id: "PED-39842",
    cliente: "Marcos Oliveira",
    data: "06/04/2025",
    valor: 345.70,
    status: "Concluído",
    produtos: 4
  },
  {
    id: "PED-39841",
    cliente: "Ana Pereira",
    data: "05/04/2025",
    valor: 87.90,
    status: "Cancelado",
    produtos: 1
  }
];

// Componente principal
export default function Vendas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("resumo");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'org_admin';

  // Navegar para gerenciar produtos
  const irParaGerenciarProdutos = () => {
    window.history.pushState({}, '', '/organization/gerenciar-produtos');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seu catálogo de produtos, vendas e estoque
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={irParaGerenciarProdutos} className="h-9 bg-green-600 hover:bg-green-700">
              <PackagePlus className="mr-2 h-4 w-4" />
              Gerenciar Produtos
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendas Hoje</p>
                  <h3 className="text-2xl font-bold mt-1">R$ 1.250,00</h3>
                  <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> +12.5% em relação a ontem
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pedidos Hoje</p>
                  <h3 className="text-2xl font-bold mt-1">12</h3>
                  <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> +8.3% em relação a ontem
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <PackageOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                  <h3 className="text-2xl font-bold mt-1">R$ 104,17</h3>
                  <p className="text-xs flex items-center gap-1 text-red-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 transform rotate-90" /> -3.2% em relação a ontem
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes Novos</p>
                  <h3 className="text-2xl font-bold mt-1">5</h3>
                  <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> +25% em relação a ontem
                  </p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                  <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          defaultValue="resumo" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList className="w-fit">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input 
                  placeholder={`Buscar ${activeTab === 'produtos' ? 'produtos' : activeTab === 'pedidos' ? 'pedidos' : activeTab === 'clientes' ? 'clientes' : '...'}`}
                  className="pl-9 h-9 w-[250px]" 
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
          
          <TabsContent value="resumo" className="mt-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Vendas Mensais</CardTitle>
                  <CardDescription>Comparativo com meta mensal</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vendasMensais}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                        <Legend />
                        <Bar dataKey="vendas" name="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meta" name="Meta" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Categorias de Produtos</CardTitle>
                  <CardDescription>Distribuição de vendas por categoria</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriasVendas}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoriasVendas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} vendas`, 'Quantidade']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Top 5 produtos com melhor desempenho de vendas</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium">Produto</th>
                          <th className="text-center py-3 px-2 text-sm font-medium">Categoria</th>
                          <th className="text-center py-3 px-2 text-sm font-medium">Preço</th>
                          <th className="text-center py-3 px-2 text-sm font-medium">Estoque</th>
                          <th className="text-right py-3 px-2 text-sm font-medium">Vendas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtosDestaque.map((produto) => (
                          <tr key={produto.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={produto.imagem} 
                                  alt={produto.nome}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                                <span className="font-medium">{produto.nome}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge variant="outline">{produto.categoria}</Badge>
                            </td>
                            <td className="py-3 px-2 text-center">R$ {produto.preco.toFixed(2)}</td>
                            <td className="py-3 px-2 text-center">{produto.estoque} unid.</td>
                            <td className="py-3 px-2 text-right font-medium">{produto.vendas} unid.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="produtos" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Catálogo de Produtos</CardTitle>
                    <CardDescription>Visualize e gerencie seu catálogo completo</CardDescription>
                  </div>
                  <Button onClick={irParaGerenciarProdutos} className="bg-green-600 hover:bg-green-700">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Gerenciar Produtos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-md border">
                  <div className="flex justify-between p-4 items-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">Total de produtos: 152</span>
                      <span className="text-sm text-muted-foreground">Ativos: 137 | Inativos: 15</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Categorias
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar Catálogo
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {produtosDestaque.map((produto) => (
                      <div key={produto.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={produto.imagem} 
                            alt={produto.nome}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{produto.nome}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline">{produto.categoria}</Badge>
                              <span className="font-semibold">R$ {produto.preco.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-sm">
                              <span className={`${produto.estoque > 20 ? 'text-green-600' : produto.estoque > 10 ? 'text-amber-600' : 'text-red-600'}`}>
                                Estoque: {produto.estoque}
                              </span>
                              <span className="text-muted-foreground">
                                Vendas: {produto.vendas}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-3 gap-2">
                          <Button variant="ghost" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Ver detalhes</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border-t">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <div className="text-sm text-muted-foreground">
                      Página 1 de 31
                    </div>
                    <Button variant="outline" size="sm">Próxima</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pedidos" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
                    <CardDescription>Acompanhe e gerencie os pedidos da sua loja</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar por Status
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Novo Pedido
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 text-sm font-medium">ID do Pedido</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Cliente</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Data</th>
                          <th className="text-center py-3 px-4 text-sm font-medium">Valor</th>
                          <th className="text-center py-3 px-4 text-sm font-medium">Itens</th>
                          <th className="text-center py-3 px-4 text-sm font-medium">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosRecentes.map((pedido) => (
                          <tr key={pedido.id} className="border-t hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{pedido.id}</td>
                            <td className="py-3 px-4">{pedido.cliente}</td>
                            <td className="py-3 px-4">{pedido.data}</td>
                            <td className="py-3 px-4 text-center">
                              R$ {pedido.valor.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">{pedido.produtos}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`
                                ${pedido.status === 'Concluído' ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-400' : 
                                  pedido.status === 'Em processamento' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/30 dark:text-blue-400' : 
                                  pedido.status === 'Enviado' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/30 dark:text-purple-400' : 
                                  'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/30 dark:text-red-400'}
                              `}>
                                {pedido.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm">Detalhes</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando 5 de 235 pedidos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>Anterior</Button>
                      <Button variant="outline" size="sm">Próxima</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clientes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Clientes</CardTitle>
                <CardDescription>
                  O módulo de análise detalhada de clientes estará disponível em breve no plano Pro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Recurso em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Estamos trabalhando para trazer análises avançadas de clientes, segmentação e 
                    ferramentas de marketing personalizadas para o seu negócio.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Saiba mais sobre o plano Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}