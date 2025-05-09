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
  RefreshCw, Search, Plus, Filter, ArrowRight,
  Calendar, Droplet, ThermometerSun, Clock, Leaf, 
  CheckCircle2, AlertTriangle, FileText, ArrowUpRight 
} from 'lucide-react';

const MudancaFasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Mudança de Fase</h1>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Registrar Mudança
          </Button>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote..."
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
                  <SelectItem value="germinacao">Germinação → Vegetativo</SelectItem>
                  <SelectItem value="vegetativo">Vegetativo → Floração</SelectItem>
                  <SelectItem value="floracao">Floração → Maturação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="pendentes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card de Mudança 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-002</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Vegetativo → Floração</Badge>
                  </div>
                  <CardDescription>Cannabis Indica - 20 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                        <Leaf className="h-7 w-7 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium mr-2">Vegetativo</span>
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                          <span className="text-sm font-medium">Floração</span>
                        </div>
                        <div className="flex items-center">
                          <Progress value={95} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500 ml-2">95%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Prontidão para transição
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Início do ciclo atual</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>02/03/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Duração no estágio</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>28 dias</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Detalhes</span>
                      </Button>
                      <Button variant="default" size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
                        <RefreshCw className="h-4 w-4" />
                        <span>Mudar Fase</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Mudança 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-004</CardTitle>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Germinação → Vegetativo</Badge>
                  </div>
                  <CardDescription>Cannabis Sativa - 15 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                        <Droplet className="h-7 w-7 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium mr-2">Germinação</span>
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                          <span className="text-sm font-medium">Vegetativo</span>
                        </div>
                        <div className="flex items-center">
                          <Progress value={82} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500 ml-2">82%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Prontidão para transição
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Início do ciclo atual</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>15/04/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Duração no estágio</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>21 dias</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Detalhes</span>
                      </Button>
                      <Button variant="default" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                        <RefreshCw className="h-4 w-4" />
                        <span>Mudar Fase</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Mudança 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-003</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Floração → Maturação</Badge>
                  </div>
                  <CardDescription>Cannabis Ruderalis - 12 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
                        <ThermometerSun className="h-7 w-7 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium mr-2">Floração</span>
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                          <span className="text-sm font-medium">Maturação</span>
                        </div>
                        <div className="flex items-center">
                          <Progress value={70} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500 ml-2">70%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Prontidão para transição
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Início do ciclo atual</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>20/03/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Duração no estágio</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>35 dias</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center text-amber-600 text-xs">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Aguardando análises
                      </div>
                      <Button variant="default" size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700">
                        <RefreshCw className="h-4 w-4" />
                        <span>Mudar Fase</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Mudanças de Fase</CardTitle>
                <CardDescription>Registro de todas as transições realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Espécie</th>
                        <th scope="col" className="px-6 py-3">Transição</th>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Responsável</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Relatório</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-001</th>
                        <td className="px-6 py-4">Cannabis Sativa</td>
                        <td className="px-6 py-4">Germinação → Vegetativo</td>
                        <td className="px-6 py-4">15/04/2025</td>
                        <td className="px-6 py-4">Ana Silva</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-002</th>
                        <td className="px-6 py-4">Cannabis Indica</td>
                        <td className="px-6 py-4">Germinação → Vegetativo</td>
                        <td className="px-6 py-4">02/03/2025</td>
                        <td className="px-6 py-4">Carlos Mendes</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-003</th>
                        <td className="px-6 py-4">Cannabis Ruderalis</td>
                        <td className="px-6 py-4">Vegetativo → Floração</td>
                        <td className="px-6 py-4">20/03/2025</td>
                        <td className="px-6 py-4">Renata Oliveira</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                        </td>
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
          
          <TabsContent value="calendario">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O calendário de mudanças de fase estará disponível em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(MudancaFasePage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});