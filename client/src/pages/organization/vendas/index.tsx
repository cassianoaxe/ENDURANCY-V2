import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Archive, Package, ShoppingCart, AlertTriangle, BarChart3, ChevronRight, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Dados de exemplo para o dashboard
const vendasMensais = [
  { mes: 'Jan', vendas: 12500 },
  { mes: 'Fev', vendas: 15000 },
  { mes: 'Mar', vendas: 18000 },
  { mes: 'Abr', vendas: 16000 },
  { mes: 'Mai', vendas: 19000 },
  { mes: 'Jun', vendas: 24000 },
  { mes: 'Jul', vendas: 27000 },
];

const statusPedidos = [
  { name: 'Entregue', value: 45, color: '#10b981' },
  { name: 'Em transporte', value: 23, color: '#8b5cf6' },
  { name: 'Aguardando pagamento', value: 15, color: '#f59e0b' },
  { name: 'Em preparação', value: 17, color: '#3b82f6' },
  { name: 'Cancelado', value: 5, color: '#ef4444' },
];

const pedidosRecentes = [
  {
    id: '#P12345',
    cliente: 'Maria Silva',
    data: '21/07/2023',
    valor: 'R$ 398,90',
    produtos: 'Óleo CBD 10%, Cápsulas CBD 20mg',
    status: 'Entregue'
  },
  {
    id: '#P12346',
    cliente: 'João Pereira',
    data: '22/07/2023',
    valor: 'R$ 124,90',
    produtos: 'Óleo CBD 5%',
    status: 'Em transporte'
  },
  {
    id: '#P12347',
    cliente: 'Ana Costa',
    data: '22/07/2023',
    valor: 'R$ 289,90',
    produtos: 'Extrato Full Spectrum, Creme Tópico CBD',
    status: 'Preparando'
  },
  {
    id: '#P12348',
    cliente: 'Carlos Santos',
    data: '23/07/2023',
    valor: 'R$ 432,15',
    produtos: 'Óleo CBD 10%, Spray Sublingual THC/CBD',
    status: 'Aguardando pagamento'
  },
  {
    id: '#P12349',
    cliente: 'Fernanda Lima',
    data: '23/07/2023',
    valor: 'R$ 178,90',
    produtos: 'Óleo CBD 10%',
    status: 'Cancelado'
  },
];

// Função para obter a cor do status do pedido
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Entregue':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Em transporte':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'Aguardando pagamento':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Preparando':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Cancelado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const alertas = [
  {
    tipo: 'Produtos com Estoque Baixo',
    descricao: '3 produtos estão com estoque crítico. Verifique o estoque.',
    icone: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    cor: 'bg-yellow-50 border-yellow-200'
  },
  {
    tipo: 'Pedidos Aguardando Processamento',
    descricao: '6 pedidos aguardam processamento há mais de 24h.',
    icone: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    cor: 'bg-blue-50 border-blue-200'
  },
  {
    tipo: 'Novos Pedidos Hoje',
    descricao: '12 novos pedidos foram recebidos hoje.',
    icone: <Package className="h-5 w-5 text-green-500" />,
    cor: 'bg-green-50 border-green-200'
  }
];

export default function DashboardVendas() {
  const [activeTab, setActiveTab] = useState('recentes');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Use React Query para buscar os dados do dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/vendas/dashboard'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const verPedidos = () => {
    navigate('/organization/vendas/pedidos');
  };

  const novoProduto = () => {
    navigate('/organization/vendas/produtos');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos, produtos e envios</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={verPedidos}>
            Ver Pedidos
          </Button>
          <Button onClick={novoProduto}>
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <h2 className="text-3xl font-bold mt-1">R$ 65.890,00</h2>
                <div className="flex items-center mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+12% em relação ao mês anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pedidos no Mês</p>
                <h2 className="text-3xl font-bold mt-1">324</h2>
                <div className="flex items-center mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+8% em relação ao mês anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <h2 className="text-3xl font-bold mt-1">R$ 203,36</h2>
                <div className="flex items-center mt-1 text-red-600">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">-5% em relação ao mês anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Entregas no Prazo</p>
                <h2 className="text-3xl font-bold mt-1">92%</h2>
                <div className="flex items-center mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+2% em relação ao mês anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendasMensais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                  <Bar dataKey="vendas" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPedidos}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusPedidos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="recentes" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <CardTitle>Pedidos Recentes</CardTitle>
              <TabsList>
                <TabsTrigger value="recentes">Pedidos Recentes</TabsTrigger>
                <TabsTrigger value="mais-vendidos">Produtos Mais Vendidos</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="recentes" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium">Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Produtos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosRecentes.map((pedido, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{pedido.id}</td>
                      <td className="py-3 px-4">{pedido.cliente}</td>
                      <td className="py-3 px-4">{pedido.data}</td>
                      <td className="py-3 px-4">{pedido.valor}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{pedido.produtos}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(pedido.status)}>
                          {pedido.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <Button variant="outline" className="flex items-center text-sm" onClick={verPedidos}>
                  Ver Todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="mais-vendidos" className="m-0">
            <div className="space-y-4">
              {/* Conteúdo para produtos mais vendidos será adicionado aqui */}
              <p className="text-center text-muted-foreground py-4">
                Carregando produtos mais vendidos...
              </p>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertas.map((alerta, index) => (
              <div key={index} className={`flex items-start p-4 border rounded-lg ${alerta.cor}`}>
                <div className="mr-4">
                  {alerta.icone}
                </div>
                <div>
                  <h3 className="font-medium">{alerta.tipo}</h3>
                  <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col items-center justify-center py-6 space-y-2" onClick={verPedidos}>
              <ShoppingCart className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Gerenciar Pedidos</div>
                <div className="text-xs text-muted-foreground">Ver e atualizar pedidos</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col items-center justify-center py-6 space-y-2" onClick={novoProduto}>
              <Archive className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Cadastrar Produtos</div>
                <div className="text-xs text-muted-foreground">Adicionar novos produtos</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col items-center justify-center py-6 space-y-2" onClick={() => navigate('/organization/vendas/promocoes')}>
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Criar Promoção</div>
                <div className="text-xs text-muted-foreground">Definir descontos e ofertas</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col items-center justify-center py-6 space-y-2" onClick={() => navigate('/organization/vendas/rastreamento')}>
              <BarChart3 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Ver Relatórios</div>
                <div className="text-xs text-muted-foreground">Acessar métricas de vendas</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}