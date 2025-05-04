import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRightLeft, Search, Plus, Filter, Calendar, 
  FlaskConical, ArrowRight, Package, Factory, FileText,
  Clock, CheckCircle2, AlertTriangle, Ban, Truck 
} from 'lucide-react';

const TransferenciasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Transferências</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Transferência
          </Button>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="rejeitadas">Rejeitadas</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transferências..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter" className="whitespace-nowrap">Filtrar por:</Label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger id="filter" className="w-[160px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="extracao">Para Extração</SelectItem>
                  <SelectItem value="laboratorio">Para Laboratório</SelectItem>
                  <SelectItem value="estoque">Para Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="pendentes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card de Transferência 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">TR-0025</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pendente</Badge>
                  </div>
                  <CardDescription>Transferência para Extração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Lote CLT-003</span>
                        </div>
                        <span className="text-sm">2.5kg</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="rounded-full bg-amber-100 p-1 mr-2">
                          <ArrowRight className="h-3 w-3 text-amber-600" />
                        </div>
                        <div className="flex items-center">
                          <Factory className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Setor de Extração</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Data solicitada</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                            <span>10/05/2025</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Solicitante</span>
                          <span>Carlos Mendes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Etapas da aprovação</span>
                        <span className="text-xs text-amber-600">2/3</span>
                      </div>
                      <Progress value={66} className="h-2 mt-1" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Cultivo ✓</span>
                        <span>Extração ✓</span>
                        <span>Qualidade ⏳</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Detalhes</span>
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" className="gap-1">
                          <Ban className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                        <Button variant="default" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Transferência 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">TR-0024</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pendente</Badge>
                  </div>
                  <CardDescription>Transferência para Laboratório</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Lote CLT-004</span>
                        </div>
                        <span className="text-sm">100g (amostra)</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="rounded-full bg-amber-100 p-1 mr-2">
                          <ArrowRight className="h-3 w-3 text-amber-600" />
                        </div>
                        <div className="flex items-center">
                          <FlaskConical className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Laboratório de Análises</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Data solicitada</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                            <span>08/05/2025</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Solicitante</span>
                          <span>Ana Silva</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Etapas da aprovação</span>
                        <span className="text-xs text-amber-600">1/2</span>
                      </div>
                      <Progress value={50} className="h-2 mt-1" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Cultivo ✓</span>
                        <span>Laboratório ⏳</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center text-xs text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Urgente: Análises necessárias
                      </div>
                      <Button variant="default" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Detalhes</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Transferência 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">TR-0023</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pendente</Badge>
                  </div>
                  <CardDescription>Transferência para Estoque</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Lote CLT-001</span>
                        </div>
                        <span className="text-sm">1.8kg</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="rounded-full bg-amber-100 p-1 mr-2">
                          <ArrowRight className="h-3 w-3 text-amber-600" />
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">Estoque Principal</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Data solicitada</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                            <span>05/05/2025</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-gray-500">Solicitante</span>
                          <span>Renata Oliveira</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Etapas da aprovação</span>
                        <span className="text-xs text-amber-600">2/3</span>
                      </div>
                      <Progress value={66} className="h-2 mt-1" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Cultivo ✓</span>
                        <span>Estoque ✓</span>
                        <span>Qualidade ⏳</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Detalhes</span>
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" className="gap-1">
                          <Ban className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                        <Button variant="default" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="aprovadas">
            <Card>
              <CardHeader>
                <CardTitle>Transferências Aprovadas</CardTitle>
                <CardDescription>Transferências aprovadas aguardando concretização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Origem</th>
                        <th scope="col" className="px-6 py-3">Destino</th>
                        <th scope="col" className="px-6 py-3">Quantidade</th>
                        <th scope="col" className="px-6 py-3">Data de Aprovação</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0022</th>
                        <td className="px-6 py-4">CLT-0095</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Extração</td>
                        <td className="px-6 py-4">3.2kg</td>
                        <td className="px-6 py-4">01/05/2025</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-blue-100 text-blue-800">Aprovada</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button variant="default" size="sm" className="h-8 gap-1 bg-blue-600 hover:bg-blue-700">
                              <Truck className="h-4 w-4" />
                              <span>Transferir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0021</th>
                        <td className="px-6 py-4">CLT-0094</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Laboratório</td>
                        <td className="px-6 py-4">200g (amostra)</td>
                        <td className="px-6 py-4">30/04/2025</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-blue-100 text-blue-800">Aprovada</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button variant="default" size="sm" className="h-8 gap-1 bg-blue-600 hover:bg-blue-700">
                              <Truck className="h-4 w-4" />
                              <span>Transferir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="concluidas">
            <Card>
              <CardHeader>
                <CardTitle>Transferências Concluídas</CardTitle>
                <CardDescription>Transferências finalizadas com sucesso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Origem</th>
                        <th scope="col" className="px-6 py-3">Destino</th>
                        <th scope="col" className="px-6 py-3">Quantidade</th>
                        <th scope="col" className="px-6 py-3">Data de Conclusão</th>
                        <th scope="col" className="px-6 py-3">Responsável</th>
                        <th scope="col" className="px-6 py-3">Relatório</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0020</th>
                        <td className="px-6 py-4">CLT-0092</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Extração</td>
                        <td className="px-6 py-4">2.8kg</td>
                        <td className="px-6 py-4">28/04/2025</td>
                        <td className="px-6 py-4">Carlos Mendes</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0019</th>
                        <td className="px-6 py-4">CLT-0091</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Estoque</td>
                        <td className="px-6 py-4">1.5kg</td>
                        <td className="px-6 py-4">25/04/2025</td>
                        <td className="px-6 py-4">Ana Silva</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0018</th>
                        <td className="px-6 py-4">CLT-0090</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Laboratório</td>
                        <td className="px-6 py-4">150g (amostra)</td>
                        <td className="px-6 py-4">22/04/2025</td>
                        <td className="px-6 py-4">Renata Oliveira</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejeitadas">
            <Card>
              <CardHeader>
                <CardTitle>Transferências Rejeitadas</CardTitle>
                <CardDescription>Transferências que não foram aprovadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Origem</th>
                        <th scope="col" className="px-6 py-3">Destino</th>
                        <th scope="col" className="px-6 py-3">Data de Rejeição</th>
                        <th scope="col" className="px-6 py-3">Motivo</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0017</th>
                        <td className="px-6 py-4">CLT-0089</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Extração</td>
                        <td className="px-6 py-4">20/04/2025</td>
                        <td className="px-6 py-4">Documentação incompleta</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <ArrowRightLeft className="h-4 w-4" />
                              <span>Reenviar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">TR-0016</th>
                        <td className="px-6 py-4">CLT-0088</td>
                        <td className="px-6 py-4">Cultivo</td>
                        <td className="px-6 py-4">Estoque</td>
                        <td className="px-6 py-4">18/04/2025</td>
                        <td className="px-6 py-4">Análises pendentes</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <ArrowRightLeft className="h-4 w-4" />
                              <span>Reenviar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(TransferenciasPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});