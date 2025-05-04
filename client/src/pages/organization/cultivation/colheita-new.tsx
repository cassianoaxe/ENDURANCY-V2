import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scissors, Search, Plus, Filter, BarChart2, Calendar, ChevronRight,
  Clock, CheckCircle2, AlertTriangle, Users, Scale, Archive, FileText
} from 'lucide-react';

const ColheitaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Colheita</h1>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Registrar Colheita
          </Button>
        </div>

        <Tabs defaultValue="programadas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="programadas">Colheitas Programadas</TabsTrigger>
            <TabsTrigger value="realizadas">Colheitas Realizadas</TabsTrigger>
            <TabsTrigger value="processamento">Processamento</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colheitas..."
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
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="esta-semana">Esta semana</SelectItem>
                  <SelectItem value="proximo-mes">Próximo mês</SelectItem>
                  <SelectItem value="atrasadas">Atrasadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="programadas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card de Colheita Programada 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-003</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Em 7 dias</Badge>
                  </div>
                  <CardDescription>Cannabis Ruderalis - 12 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Data prevista: 10/05/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Equipe: A</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Maturação</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">Estimativa:</span>
                        <div className="flex gap-1 items-center">
                          <Scale className="h-4 w-4 text-gray-500" />
                          <span>Aprox. 2.5kg</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">THC/CBD:</span>
                        <div className="flex gap-1 items-center">
                          <BarChart2 className="h-4 w-4 text-gray-500" />
                          <span>Médio/Alto</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <span className="text-xs text-gray-500">Last check: Hoje às 08:30</span>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <span>Detalhes</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Card de Colheita Programada 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-002</CardTitle>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Em 30 dias</Badge>
                  </div>
                  <CardDescription>Cannabis Indica - 20 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Data prevista: 05/06/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Equipe: B</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Maturação</span>
                        <span>48%</span>
                      </div>
                      <Progress value={48} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">Estimativa:</span>
                        <div className="flex gap-1 items-center">
                          <Scale className="h-4 w-4 text-gray-500" />
                          <span>Aprox. 3.2kg</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">THC/CBD:</span>
                        <div className="flex gap-1 items-center">
                          <BarChart2 className="h-4 w-4 text-gray-500" />
                          <span>Alto/Baixo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <span className="text-xs text-gray-500">Last check: Hoje às 09:15</span>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <span>Detalhes</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Card de Colheita Programada 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-001</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Em 50 dias</Badge>
                  </div>
                  <CardDescription>Cannabis Sativa - 15 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Data prevista: 25/06/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Equipe: A</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Maturação</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">Estimativa:</span>
                        <div className="flex gap-1 items-center">
                          <Scale className="h-4 w-4 text-gray-500" />
                          <span>Aprox. 2.8kg</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">THC/CBD:</span>
                        <div className="flex gap-1 items-center">
                          <BarChart2 className="h-4 w-4 text-gray-500" />
                          <span>Médio/Médio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <span className="text-xs text-gray-500">Last check: Ontem às 16:45</span>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <span>Detalhes</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="realizadas">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Colheitas</CardTitle>
                <CardDescription>Registro de todas as colheitas concluídas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Espécie</th>
                        <th scope="col" className="px-6 py-3">Data Colheita</th>
                        <th scope="col" className="px-6 py-3">Rendimento</th>
                        <th scope="col" className="px-6 py-3">Equipe</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-0095</th>
                        <td className="px-6 py-4">Cannabis Indica</td>
                        <td className="px-6 py-4">10/04/2025</td>
                        <td className="px-6 py-4">2.7kg</td>
                        <td className="px-6 py-4">Equipe B</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Processado</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-0094</th>
                        <td className="px-6 py-4">Cannabis Sativa</td>
                        <td className="px-6 py-4">28/03/2025</td>
                        <td className="px-6 py-4">3.1kg</td>
                        <td className="px-6 py-4">Equipe A</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Processado</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-0093</th>
                        <td className="px-6 py-4">Cannabis Ruderalis</td>
                        <td className="px-6 py-4">15/03/2025</td>
                        <td className="px-6 py-4">1.9kg</td>
                        <td className="px-6 py-4">Equipe C</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Processado</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Archive className="h-4 w-4" />
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
          
          <TabsContent value="processamento">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O módulo de processamento estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              Os relatórios de colheita estarão disponíveis em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

// Temporariamente usando o bypass para testes
export default bypassModuleAccess(ColheitaPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});