import React, { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ShoppingCart, PackageOpen, TrendingUp, Wallet, Users, 
  ArrowUpRight, Download, FileText
} from "lucide-react";
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

const vendasPorCanal = [
  { name: 'Site Próprio', value: 58 },
  { name: 'Marketplaces', value: 22 },
  { name: 'Revendas', value: 14 },
  { name: 'Vendas Diretas', value: 6 },
];

const vendasDiarias = [
  { day: '01/04', vendas: 120 },
  { day: '02/04', vendas: 145 },
  { day: '03/04', vendas: 132 },
  { day: '04/04', vendas: 158 },
  { day: '05/04', vendas: 182 },
  { day: '06/04', vendas: 197 },
  { day: '07/04', vendas: 210 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Principais métricas
const metricas = [
  {
    title: "Vendas Hoje",
    value: "R$ 1.250,00",
    change: "+12.5%",
    changeType: "positive",
    icon: <ShoppingCart className="h-5 w-5" />,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-600 dark:text-green-400"
  },
  {
    title: "Pedidos Hoje",
    value: "12",
    change: "+8.3%",
    changeType: "positive",
    icon: <PackageOpen className="h-5 w-5" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400"
  },
  {
    title: "Ticket Médio",
    value: "R$ 104,17",
    change: "-3.2%",
    changeType: "negative",
    icon: <Wallet className="h-5 w-5" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400"
  },
  {
    title: "Clientes Novos",
    value: "5",
    change: "+25%",
    changeType: "positive",
    icon: <Users className="h-5 w-5" />,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400"
  },
];

export default function DashboardVendas() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Navegar para relatório de vendas
  const irParaRelatorioVendas = () => {
    window.history.pushState({}, '', '/organization/relatorio-vendas');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard de Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe os resultados de vendas e performance dos seus produtos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
            <Button 
              onClick={irParaRelatorioVendas} 
              className="h-9 bg-green-600 hover:bg-green-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Relatório Completo
            </Button>
          </div>
        </div>
        
        {/* Cards de Métricas */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {metricas.map((metrica, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metrica.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{metrica.value}</h3>
                    <p className={`text-xs flex items-center gap-1 ${metrica.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                      <ArrowUpRight className={`h-3 w-3 ${metrica.changeType === 'negative' ? 'transform rotate-90' : ''}`} />
                      {metrica.change} em relação a ontem
                    </p>
                  </div>
                  <div className={`${metrica.bgColor} p-3 rounded-full`}>
                    {React.cloneElement(metrica.icon, { className: metrica.textColor })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Gráficos */}
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
              <CardTitle className="text-lg">Vendas por Canal</CardTitle>
              <CardDescription>Distribuição percentual por canal de venda</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vendasPorCanal}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {vendasPorCanal.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vendas dos Últimos 7 Dias</CardTitle>
              <CardDescription>Evolução diária de vendas na última semana</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={vendasDiarias}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                    <Area 
                      type="monotone" 
                      dataKey="vendas" 
                      name="Vendas" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
}