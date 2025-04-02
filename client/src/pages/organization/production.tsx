import React from 'react';
import { withModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, BarChart3, Layers, FileText, TrendingUp, Truck, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductionModule = () => {
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Produção</h1>
          <Button className="bg-green-600 hover:bg-green-700">
            <Package className="h-4 w-4 mr-2" />
            Novo Lote
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Ordens de Produção</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="quality">Controle de Qualidade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    Produção Mensal
                  </CardTitle>
                  <CardDescription>Total de unidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2.458</div>
                  <div className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% em relação ao mês anterior
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Layers className="h-5 w-5 text-orange-600" />
                    Ordens Ativas
                  </CardTitle>
                  <CardDescription>Em andamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">7</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-green-600" />
                    Valor da Produção
                  </CardTitle>
                  <CardDescription>Estimativa mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 368.750</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Envios Agendados
                  </CardTitle>
                  <CardDescription>Para os próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produção por Produto</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center">
                  <div className="p-6 text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Gráfico de produção por produto</p>
                    <p className="text-sm text-gray-400 mt-1">Dados de exemplo</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Produção Ativas</CardTitle>
                  <CardDescription>Status atual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3">Ordem #</th>
                          <th scope="col" className="px-4 py-3">Produto</th>
                          <th scope="col" className="px-4 py-3">Quantidade</th>
                          <th scope="col" className="px-4 py-3">Progresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b">
                          <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">OP-2025-042</th>
                          <td className="px-4 py-3">Óleo CBD 10%</td>
                          <td className="px-4 py-3">500 unid</td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">75%</span>
                          </td>
                        </tr>
                        <tr className="bg-white border-b">
                          <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">OP-2025-043</th>
                          <td className="px-4 py-3">Cápsulas 25mg</td>
                          <td className="px-4 py-3">1000 unid</td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '40%'}}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">40%</span>
                          </td>
                        </tr>
                        <tr className="bg-white border-b">
                          <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">OP-2025-044</th>
                          <td className="px-4 py-3">Tintura 30ml</td>
                          <td className="px-4 py-3">750 unid</td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">25%</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Ordens de Produção</CardTitle>
                <CardDescription>Gerenciamento de ordens de produção para todos os produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                  O conteúdo completo desta seção estará disponível em breve. 
                  Aqui você poderá criar, gerenciar e monitorar ordens de produção.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventário de Produção</CardTitle>
                <CardDescription>Controle de matérias-primas e produtos em processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                  O conteúdo completo desta seção estará disponível em breve.
                  Aqui você poderá gerenciar o inventário relacionado à produção.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Qualidade</CardTitle>
                <CardDescription>Gerenciamento de testes e garantia de qualidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                  O conteúdo completo desta seção estará disponível em breve.
                  Aqui você poderá realizar e documentar testes de controle de qualidade.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

// Exportar o componente envolto pelo HOC de verificação de acesso ao módulo
export default withModuleAccess(ProductionModule, {
  moduleType: "production",
  moduleName: "Produção",
  moduleDescription: "Gerencie todo o processo produtivo com eficiência. Crie e acompanhe ordens de produção, controle de qualidade, rastreabilidade de lotes, e maximização da eficiência operacional para todos os seus produtos.",
  modulePrice: 199.00
});