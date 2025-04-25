import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  Clock,
  FileCheck,
  FileSearch,
  FileUp,
  Globe,
  Loader2,
  Package,
  PlaneLanding,
  Plane,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados de exemplo para importação
const mockImportRequests = [
  { id: 1, patientName: 'João Silva', status: 'aprovado', product: 'CBD Oil 1000mg', date: new Date(2024, 3, 15), progress: 90 },
  { id: 2, patientName: 'Maria Oliveira', status: 'em_analise', product: 'CBD Capsules 25mg', date: new Date(2024, 3, 18), progress: 30 },
  { id: 3, patientName: 'Pedro Santos', status: 'enviado_anvisa', product: 'Full Spectrum Tincture', date: new Date(2024, 3, 10), progress: 45 },
  { id: 4, patientName: 'Ana Costa', status: 'rejeitado', product: 'CBD Isolate Powder', date: new Date(2024, 3, 5), progress: 0 },
  { id: 5, patientName: 'Carlos Pereira', status: 'em_transito', product: 'THC:CBD 1:1 Oil', date: new Date(2024, 3, 2), progress: 70 },
  { id: 6, patientName: 'Luana Ferreira', status: 'entregue', product: 'CBD Oil 500mg', date: new Date(2024, 2, 25), progress: 100 },
];

// Dados para os gráficos
const statusData = [
  { name: 'Em Análise', value: 12, color: '#3498db' },
  { name: 'Enviados ANVISA', value: 8, color: '#2980b9' },
  { name: 'Aprovados', value: 24, color: '#27ae60' },
  { name: 'Rejeitados', value: 3, color: '#e74c3c' },
  { name: 'Em Trânsito', value: 7, color: '#f39c12' },
  { name: 'Entregues', value: 36, color: '#8e44ad' },
];

const monthlyData = [
  { name: 'Jan', aprovados: 15, rejeitados: 2, emTransito: 3 },
  { name: 'Fev', aprovados: 18, rejeitados: 1, emTransito: 5 },
  { name: 'Mar', aprovados: 22, rejeitados: 2, emTransito: 8 },
  { name: 'Abr', aprovados: 24, rejeitados: 3, emTransito: 7 },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'em_analise':
      return <FileSearch className="h-4 w-4 text-blue-500" />;
    case 'enviado_anvisa':
      return <FileUp className="h-4 w-4 text-indigo-500" />;
    case 'aprovado':
      return <FileCheck className="h-4 w-4 text-green-500" />;
    case 'rejeitado':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'em_transito':
      return <Plane className="h-4 w-4 text-orange-500" />;
    case 'entregue':
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'Em Análise';
    case 'enviado_anvisa':
      return 'Enviado para ANVISA';
    case 'aprovado':
      return 'Aprovado';
    case 'rejeitado':
      return 'Rejeitado';
    case 'em_transito':
      return 'Em Trânsito';
    case 'entregue':
      return 'Entregue';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'enviado_anvisa':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'aprovado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejeitado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'em_transito':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'entregue':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function ImportCompanyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Garantir que tenhamos a classe de tema da importadora e limpar flags
  useEffect(() => {
    // Aplicar tema da importadora
    document.documentElement.classList.add('importadora-theme');
    // Limpar flags utilizados na navegação
    localStorage.removeItem('check_org_type');
    localStorage.removeItem('userType');
    
    console.log("Dashboard de importadora: tema aplicado e flags limpos");
    
    return () => {
      // Limpar a classe ao desmontar o componente
      document.documentElement.classList.remove('importadora-theme');
    };
  }, []);

  // Simulamos uma consulta de dados
  const { data: importRequests, isLoading } = useQuery({
    queryKey: ['/api/import-requests'],
    queryFn: async () => {
      // Em um cenário real, buscaríamos do backend
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(mockImportRequests);
        }, 500);
      });
    }
  });

  const handleNewRequest = () => {
    navigate('/organization/import-company/new-request');
  };

  const handleViewRequest = (id: number) => {
    navigate(`/organization/import-company/${id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Dashboard de Importação</h1>
          <p className="text-muted-foreground">
            Gerenciamento de importações RDC 660 para medicamentos à base de Cannabis
          </p>
        </div>
        <Button onClick={handleNewRequest} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Pedido de Importação
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pedidos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprovados ANVISA
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Taxa de aprovação: 80%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Trânsito
            </CardTitle>
            <Plane className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Previsão média de chegada: 7 dias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entregues ao Cliente
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pending">Pedidos Pendentes</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
                <CardDescription>
                  Distribuição dos pedidos por status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Mensais</CardTitle>
                <CardDescription>
                  Evolução mensal por status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="aprovados" fill="#27ae60" name="Aprovados" />
                    <Bar dataKey="rejeitados" fill="#e74c3c" name="Rejeitados" />
                    <Bar dataKey="emTransito" fill="#f39c12" name="Em Trânsito" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>
                Últimos 5 pedidos de importação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {importRequests && importRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div>
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{request.patientName}</h4>
                          <p className="text-sm text-muted-foreground">{request.product}</p>
                          <div className="flex items-center mt-1 gap-2">
                            <Badge className={getStatusColor(request.status)} variant="outline">
                              {getStatusText(request.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(request.date, "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={request.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground mt-1 block text-right">
                            {request.progress}% concluído
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request.id)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Pendentes</CardTitle>
              <CardDescription>
                Pedidos em análise e enviados para ANVISA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {importRequests && importRequests
                    .filter((r: any) => ['em_analise', 'enviado_anvisa'].includes(r.status))
                    .map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div>
                            {getStatusIcon(request.status)}
                          </div>
                          <div>
                            <h4 className="font-medium">{request.patientName}</h4>
                            <p className="text-sm text-muted-foreground">{request.product}</p>
                            <div className="flex items-center mt-1 gap-2">
                              <Badge className={getStatusColor(request.status)} variant="outline">
                                {getStatusText(request.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(request.date, "dd 'de' MMMM", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <Progress value={request.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground mt-1 block text-right">
                              {request.progress}% concluído
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Aprovação</CardTitle>
                <CardDescription>
                  Percentual de pedidos aprovados pela ANVISA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <div className="text-4xl font-bold text-green-600">80%</div>
                <p className="text-sm text-muted-foreground">24 de 30 pedidos aprovados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Aprovação</CardTitle>
                <CardDescription>
                  Tempo médio para aprovação pela ANVISA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <div className="text-4xl font-bold text-blue-600">15</div>
                <p className="text-sm text-muted-foreground">dias em média</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Entrega</CardTitle>
                <CardDescription>
                  Tempo desde a aprovação até a entrega
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <div className="text-4xl font-bold text-purple-600">21</div>
                <p className="text-sm text-muted-foreground">dias em média</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Solicitados</CardTitle>
              <CardDescription>
                Top 5 produtos mais importados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">CBD Oil 1000mg</p>
                    <Progress value={85} className="h-2 mt-2" />
                  </div>
                  <div className="ml-8 text-sm font-medium">32%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">CBD Isolate Powder</p>
                    <Progress value={65} className="h-2 mt-2" />
                  </div>
                  <div className="ml-8 text-sm font-medium">24%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">Full Spectrum Tincture</p>
                    <Progress value={50} className="h-2 mt-2" />
                  </div>
                  <div className="ml-8 text-sm font-medium">18%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">CBD Capsules 25mg</p>
                    <Progress value={40} className="h-2 mt-2" />
                  </div>
                  <div className="ml-8 text-sm font-medium">15%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">THC:CBD 1:1 Oil</p>
                    <Progress value={30} className="h-2 mt-2" />
                  </div>
                  <div className="ml-8 text-sm font-medium">11%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}