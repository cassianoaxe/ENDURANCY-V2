import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
// Tour Guide removido pois ficou tecnologicamente defasado
import { 
  Users, FileText, Package, FileCheck, ShoppingBag, BarChart, 
  ChevronUp, ArrowUpRight, CirclePlus, Wallet, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrgAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('visao-geral');

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">Gerencie sua organização, pacientes e produtos na plataforma Endurancy</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1 bg-white border-gray-200"
            onClick={() => window.location.href="/organization/patients/new"}
          >
            <CirclePlus className="h-4 w-4 text-green-600" />
            <span>Novo Paciente</span>
          </Button>
          <Button 
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            onClick={() => window.location.href="/organization/products/new"}
          >
            <CirclePlus className="h-4 w-4" />
            <span>Novo Produto</span>
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
            value="pacientes" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Pacientes
          </TabsTrigger>
          <TabsTrigger 
            value="produtos" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Produtos
          </TabsTrigger>
          <TabsTrigger 
            value="prescricoes" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Prescrições
          </TabsTrigger>
          <TabsTrigger 
            value="pedidos" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Pedidos
          </TabsTrigger>
          <TabsTrigger 
            value="producao" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Produção
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border rounded-lg shadow-sm bg-white overview-patients">
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
            
            <Card className="border rounded-lg shadow-sm bg-white overview-products">
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
            
            <Card className="border rounded-lg shadow-sm bg-white overview-prescriptions">
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
            
            <Card className="border rounded-lg shadow-sm bg-white overview-sales">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border rounded-lg shadow-sm bg-white overview-sales-chart">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-semibold">Vendas Mensais</CardTitle>
                <div className="text-xs text-gray-500">Jan - Jul</div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[240px] relative">
                  {/* Simulando barras do gráfico */}
                  <div className="flex items-end justify-between h-[200px] pt-6 pb-2 px-2">
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[40px] rounded-t"></div>
                      <div className="text-xs">Jan</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[70px] rounded-t"></div>
                      <div className="text-xs">Fev</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[55px] rounded-t"></div>
                      <div className="text-xs">Mar</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[85px] rounded-t"></div>
                      <div className="text-xs">Abr</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[115px] rounded-t"></div>
                      <div className="text-xs">Mai</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[130px] rounded-t"></div>
                      <div className="text-xs">Jun</div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="bg-green-500 w-full h-[170px] rounded-t"></div>
                      <div className="text-xs">Jul</div>
                    </div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500">
                    Vendas (R$)
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border rounded-lg shadow-sm bg-white overview-product-dist">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-semibold">Distribuição de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[240px] flex items-center justify-center">
                  {/* Simulando gráfico de pizza */}
                  <div className="relative w-[200px] h-[200px] rounded-full border-8 border-transparent flex items-center justify-center overflow-hidden" style={{ background: 'conic-gradient(#3b82f6 0% 45%, #10b981 45% 70%, #f59e0b 70% 85%, #ef4444 85% 95%, #8b5cf6 95% 100%)' }}>
                    <div className="bg-white w-[120px] h-[120px] rounded-full"></div>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Óleo: 45%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm">Cápsula: 25%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm">Flor: 15%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Extrato: 10%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Tópico: 5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-semibold">Pedidos Recentes</CardTitle>
                <Button variant="link" className="text-green-600 p-0 h-auto text-sm">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="text-left py-2 font-medium">Pedido</th>
                        <th className="text-left py-2 font-medium">Paciente</th>
                        <th className="text-left py-2 font-medium">Data</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-right py-2 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2.5">#8734</td>
                        <td className="py-2.5">Maria Silva</td>
                        <td className="py-2.5">29/03/2025</td>
                        <td className="py-2.5">
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                            Concluído
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">R$ 420,00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5">#8733</td>
                        <td className="py-2.5">João Santos</td>
                        <td className="py-2.5">28/03/2025</td>
                        <td className="py-2.5">
                          <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                            Em processamento
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">R$ 650,00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5">#8732</td>
                        <td className="py-2.5">Ana Oliveira</td>
                        <td className="py-2.5">27/03/2025</td>
                        <td className="py-2.5">
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                            Concluído
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">R$ 320,00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5">#8731</td>
                        <td className="py-2.5">Pedro Almeida</td>
                        <td className="py-2.5">26/03/2025</td>
                        <td className="py-2.5">
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            Enviado
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">R$ 580,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Card className="border rounded-lg shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-semibold">Prescrições para Aprovação</CardTitle>
                <Button variant="link" className="text-green-600 p-0 h-auto text-sm">
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="text-left py-2 font-medium">Prescrição</th>
                        <th className="text-left py-2 font-medium">Paciente</th>
                        <th className="text-left py-2 font-medium">Médico</th>
                        <th className="text-left py-2 font-medium">Data</th>
                        <th className="text-right py-2 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2.5">#PR-1021</td>
                        <td className="py-2.5">Lucia Ferreira</td>
                        <td className="py-2.5">Dr. Roberto Santos</td>
                        <td className="py-2.5">29/03/2025</td>
                        <td className="py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              Ver
                            </Button>
                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs">
                              Aprovar
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5">#PR-1020</td>
                        <td className="py-2.5">Miguel Costa</td>
                        <td className="py-2.5">Dra. Carla Mendes</td>
                        <td className="py-2.5">28/03/2025</td>
                        <td className="py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              Ver
                            </Button>
                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs">
                              Aprovar
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5">#PR-1019</td>
                        <td className="py-2.5">Fernanda Lima</td>
                        <td className="py-2.5">Dr. Marcelo Alves</td>
                        <td className="py-2.5">28/03/2025</td>
                        <td className="py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              Ver
                            </Button>
                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs">
                              Aprovar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pacientes" className="space-y-4">
          <Card className="border rounded-lg shadow-sm bg-white">
            <CardHeader className="p-4">
              <CardTitle>Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="rounded border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500">
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Telefone</th>
                      <th className="text-left p-3 font-medium">Consultas</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">Paciente {i}</td>
                        <td className="p-3">paciente{i}@email.com</td>
                        <td className="p-3">(11) 9999-888{i}</td>
                        <td className="p-3">{Math.floor(Math.random() * 10) + 1}</td>
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
        
        <TabsContent value="produtos" className="space-y-4">
          <Card className="border rounded-lg shadow-sm bg-white">
            <CardHeader className="p-4">
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="font-medium">Produto {i}</h3>
                      <p className="text-sm text-gray-500 mt-1">Categoria {i % 3 + 1}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold">R$ {(Math.random() * 1000).toFixed(2)}</span>
                        <Badge className={`${i % 2 === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {i % 2 === 0 ? 'Ativo' : 'Em análise'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescricoes" className="space-y-4">
          <Card className="border rounded-lg shadow-sm bg-white">
            <CardHeader className="p-4">
              <CardTitle>Prescrições</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="rounded border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Paciente</th>
                      <th className="text-left p-3 font-medium">Médico</th>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">#PR-10{i}</td>
                        <td className="p-3">Paciente {i}</td>
                        <td className="p-3">Dr. Médico {i}</td>
                        <td className="p-3">{30-i}/03/2025</td>
                        <td className="p-3">
                          <Badge className={`
                            ${i === 1 ? 'bg-blue-50 text-blue-700' : 
                              i === 2 ? 'bg-emerald-50 text-emerald-700' :
                              i === 3 ? 'bg-amber-50 text-amber-700' :
                              'bg-gray-50 text-gray-700'
                            }
                          `}>
                            {i === 1 ? 'Pendente' : 
                             i === 2 ? 'Aprovada' :
                             i === 3 ? 'Em análise' :
                             'Finalizada'}
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
        
        <TabsContent value="pedidos" className="space-y-4">
          <Card className="border rounded-lg shadow-sm bg-white">
            <CardHeader className="p-4">
              <CardTitle>Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="rounded border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500">
                      <th className="text-left p-3 font-medium">Pedido</th>
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Valor</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">#87{30+i}</td>
                        <td className="p-3">Cliente {i}</td>
                        <td className="p-3">{30-i}/03/2025</td>
                        <td className="p-3">
                          <Badge className={`
                            ${i === 1 ? 'bg-emerald-50 text-emerald-700' : 
                              i === 2 ? 'bg-yellow-50 text-yellow-700' :
                              i === 3 ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-50 text-gray-700'
                            }
                          `}>
                            {i === 1 ? 'Concluído' : 
                             i === 2 ? 'Em processamento' :
                             i === 3 ? 'Enviado' :
                             'Cancelado'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">R$ {(Math.random() * 1000).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" className="h-8 text-xs">
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
        
        <TabsContent value="producao" className="space-y-4">
          <Card className="border rounded-lg shadow-sm bg-white">
            <CardHeader className="p-4">
              <CardTitle>Produção</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card className="border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Produção Mensal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="h-[200px] relative">
                      <LineChart className="h-full w-full text-gray-300" />
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                        Gráfico de Produção
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Status da Produção</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Pedidos Pendentes</span>
                          <span>8/20</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Em Produção</span>
                          <span>12/20</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completos</span>
                          <span>16/40</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="rounded border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500">
                      <th className="text-left p-3 font-medium">Lote</th>
                      <th className="text-left p-3 font-medium">Produto</th>
                      <th className="text-left p-3 font-medium">Início</th>
                      <th className="text-left p-3 font-medium">Término Est.</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">#L-20{i}</td>
                        <td className="p-3">Produto {i}</td>
                        <td className="p-3">{20+i}/03/2025</td>
                        <td className="p-3">{30+i}/03/2025</td>
                        <td className="p-3">
                          <Badge className={`
                            ${i === 1 ? 'bg-emerald-50 text-emerald-700' : 
                              i === 2 ? 'bg-yellow-50 text-yellow-700' :
                              i === 3 ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-50 text-gray-700'
                            }
                          `}>
                            {i === 1 ? 'Concluído' : 
                             i === 2 ? 'Em progresso' :
                             i === 3 ? 'Iniciado' :
                             'Planejado'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            Gerenciar
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
      {/* Tour Guide removido pois ficou tecnologicamente defasado */}
    </div>
  );
}