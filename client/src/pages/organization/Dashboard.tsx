import React, { useEffect, useState } from 'react';
// Removendo import do OrganizationLayout para evitar a renderização duplicada
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, FileText, Package, FileCheck, 
  ChevronUp, ArrowUpRight, Wallet, LineChart, Leaf, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Organization } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function OrganizationDashboard() {
  console.log("Iniciando renderização do dashboard");
  const [activeTab, setActiveTab] = React.useState('visao-geral');
  const { user } = useAuth();
  console.log("useAuth retornou user:", user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Verificação simplificada para evitar problemas de redirecionamento
  useEffect(() => {
    // Verificar se este é o redirecionamento de uma empresa importadora
    const checkOrgType = localStorage.getItem('check_org_type');
    
    if (checkOrgType === 'true' && user?.organizationId) {
      console.log("Dashboard: Verificando se esta organização é uma importadora...");
      
      fetch(`/api/organizations/${user.organizationId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(orgData => {
        console.log("Dashboard: Tipo de organização detectado:", orgData.type);
        
        // Se é uma importadora, redirecionar imediatamente
        if (orgData.type === 'import_company') {
          console.log("Dashboard: REDIRECIONANDO para dashboard de importadora");
          localStorage.removeItem('check_org_type');
          window.location.href = '/organization/import-company/dashboard';
          return;
        } else {
          // Limpar o flag se não é importadora
          localStorage.removeItem('check_org_type');
        }
      })
      .catch(error => {
        console.error("Dashboard: Erro ao verificar tipo de organização:", error);
        localStorage.removeItem('check_org_type');
      });
    }
    
    // Simplesmente marcar que a verificação de autenticação está concluída
    // Não precisamos mais verificar a autenticação aqui porque o AuthProvider já faz isso
    setIsCheckingAuth(false);
  }, [user]);
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations', user?.organizationId],
    enabled: !!user?.organizationId,
  });

  // Mostrar um indicador de carregamento enquanto verificamos a autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  return (
      <div className="container px-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isOrgLoading ? (
              <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : organization?.logo ? (
              <Avatar className="h-6 w-6 rounded-md">
                <AvatarImage src={organization.logo} alt={organization.name || "Organização"} />
                <AvatarFallback className="rounded-md bg-[#e6f7e6]">
                  <Leaf className="h-4 w-4 text-green-600" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Leaf className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-500 text-sm">Visão geral da organização, pacientes e produtos na plataforma Endurancy</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 bg-white border-gray-200"
            >
              <Users className="h-4 w-4 text-green-600" />
              <span>Gerenciar Pacientes</span>
            </Button>
            <Button 
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <Package className="h-4 w-4" />
              <span>Gerenciar Produtos</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-200 bg-transparent p-0 mb-4">
            <TabsTrigger 
              value="visao-geral" 
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="novos-pacientes" 
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Novos Pacientes
            </TabsTrigger>
            <TabsTrigger 
              value="novos-pedidos" 
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Novos Pedidos
            </TabsTrigger>
            <TabsTrigger 
              value="financeiro" 
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger 
              value="producao" 
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Expedição
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visao-geral" className="space-y-6 dashboard-stats">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border rounded-lg shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Pacientes</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">128</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                    <ChevronUp className="h-3 w-3" />
                    <span>+8 novos pacientes este mês</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border rounded-lg shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Produtos Ativos</CardTitle>
                  <Package className="h-5 w-5 text-emerald-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">24</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                    <ChevronUp className="h-3 w-3" />
                    <span>+3 novos produtos adicionados</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border rounded-lg shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Prescrições Pendentes</CardTitle>
                  <FileCheck className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">12</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>5 novas nas últimas 24h</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border rounded-lg shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Faturamento Mensal</CardTitle>
                  <Wallet className="h-5 w-5 text-violet-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">R$ 42.580,00</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                    <ChevronUp className="h-3 w-3" />
                    <span>+12% comparado ao mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle>
                <Button variant="link" className="text-green-600 p-0 h-auto text-sm">
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {i % 2 === 0 ? (
                          <FileText size={14} />
                        ) : (
                          <Users size={14} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {i % 2 === 0 
                            ? 'Nova prescrição criada para Paciente ' + i
                            : 'Novo paciente registrado: João Silva ' + i
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {30-i} minutos atrás
                        </p>
                      </div>
                      <Badge className={i % 2 === 0 ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                        {i % 2 === 0 ? 'Prescrição' : 'Paciente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="novos-pacientes" className="space-y-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="p-4">
                <CardTitle>Novos Pacientes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500">
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Contato</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Data de Cadastro</th>
                        <th className="text-right p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                              {String.fromCharCode(64 + i)}
                            </div>
                            <div>
                              <p className="font-medium">Paciente {i}</p>
                              <p className="text-xs text-gray-500">paciente{i}@email.com</p>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600">#{1000 + i}</td>
                          <td className="p-3 text-gray-600">(11) 9{i}876-543{i}</td>
                          <td className="p-3">
                            <Badge className="bg-blue-50 text-blue-700">
                              Novo
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-600">{new Date().getDate()-i}/{new Date().getMonth()+1}/2025</td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-gray-900">
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="novos-pedidos" className="space-y-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="p-4">
                <CardTitle>Novos Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500">
                        <th className="text-left p-3 font-medium">Nº Pedido</th>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Produtos</th>
                        <th className="text-left p-3 font-medium">Valor</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="p-3 text-gray-600">#{2000 + i}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">Cliente {i}</p>
                              <p className="text-xs text-gray-500">cliente{i}@email.com</p>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date().getDate()-i}/{new Date().getMonth()+1}/2025
                          </td>
                          <td className="p-3 text-gray-600">
                            {i % 2 === 0 ? "3 produtos" : "2 produtos"}
                          </td>
                          <td className="p-3 font-medium">
                            R$ {(i * 120) + 99},00
                          </td>
                          <td className="p-3">
                            <Badge className="bg-blue-50 text-blue-700">
                              Novo
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-gray-900">
                              Processar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financeiro" className="space-y-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="p-4">
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <Card className="border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold mb-2">R$ 42.580,00</div>
                      <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded">
                        <LineChart className="h-full w-full text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold mb-2">R$ 28.450,00</div>
                      <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded">
                        <LineChart className="h-full w-full text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium">Transações Recentes</h3>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">#{10000 + i}</td>
                          <td className="p-3">{30-i}/03/2025</td>
                          <td className="p-3">
                            {i % 2 === 0 ? 'Venda de produtos' : 'Pagamento de serviços'}
                          </td>
                          <td className="p-3">
                            <Badge className={
                              i % 2 === 0 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                            }>
                              {i % 2 === 0 ? "Concluído" : "Processando"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {i % 3 === 0 ? '-' : '+'} R$ {(i * 500) + 150},00
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="producao" className="space-y-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="p-4">
                <CardTitle>Controle de Expedição</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <Card className="border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Status de Expedição</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Pedidos em Fila</span>
                            <span>8/20</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Em Expedição</span>
                            <span>12/20</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Concluídos Hoje</span>
                            <span>16/40</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Eficiência de Expedição</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded">
                        <LineChart className="h-full w-full text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium">Lotes em Expedição</h3>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left p-3 font-medium">Lote</th>
                        <th className="text-left p-3 font-medium">Produto</th>
                        <th className="text-left p-3 font-medium">Início</th>
                        <th className="text-left p-3 font-medium">Previsão</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">#{1000 + i}</td>
                          <td className="p-3">Produto {i}</td>
                          <td className="p-3">{25-i}/03/2025</td>
                          <td className="p-3">{35-i}/03/2025</td>
                          <td className="p-3">
                            <Badge className={
                              i % 3 === 0 ? "bg-green-50 text-green-700" : 
                              i % 3 === 1 ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            }>
                              {i % 3 === 0 ? "Concluído" : i % 3 === 1 ? "Em andamento" : "Planejado"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              Ver detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}