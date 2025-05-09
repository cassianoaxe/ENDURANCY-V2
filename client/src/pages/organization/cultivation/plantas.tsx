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
import { 
  Leaf, Search, Plus, Filter, ArrowRight,
  Calendar, Scissors, FlaskConical, Tag, 
  RefreshCw, CheckCircle2, AlertTriangle
} from 'lucide-react';

const PlantasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Plantas</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation/plantio">
                <Leaf className="h-4 w-4" />
                <span>Ir para Plantio</span>
              </a>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1" asChild>
              <a href="/organization/cultivation/mudanca-fase">
                <RefreshCw className="h-4 w-4" />
                <span>Mudança de Fase</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Plantas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-xs text-gray-500">Em 3 estufas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Vegetativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-emerald-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-xs text-gray-500">32% do total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Floração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">20</p>
                  <p className="text-xs text-gray-500">42% do total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximas à Colheita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Scissors className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-500">26% do total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visaogeral" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="visaogeral">Visão Geral</TabsTrigger>
            <TabsTrigger value="lotes">Lotes</TabsTrigger>
            <TabsTrigger value="fases">Fases de Crescimento</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantas..."
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
                  <SelectItem value="sativa">Cannabis Sativa</SelectItem>
                  <SelectItem value="indica">Cannabis Indica</SelectItem>
                  <SelectItem value="ruderalis">Cannabis Ruderalis</SelectItem>
                  <SelectItem value="hibrido">Híbridos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="visaogeral">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fases de Cultivo</CardTitle>
                  <CardDescription>Distribuição atual das plantas</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mt-4 space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Vegetativo</span>
                        </div>
                        <span>15 plantas</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estufa #1</span>
                        <span>32%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="font-medium">Floração</span>
                        </div>
                        <span>20 plantas</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estufa #2</span>
                        <span>42%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="font-medium">Maturação</span>
                        </div>
                        <span>12 plantas</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '26%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estufa #3</span>
                        <span>26%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline" className="w-full gap-1" asChild>
                    <a href="/organization/cultivation/mudanca-fase">
                      <RefreshCw className="h-4 w-4" />
                      <span>Gerenciar Fases</span>
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Variedade</CardTitle>
                  <CardDescription>Tipos de cannabis em cultivo</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-700 font-bold">S</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Cannabis Sativa</span>
                          <span>15 plantas</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>32%</span>
                          <span>Lote CLT-001</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-700 font-bold">I</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Cannabis Indica</span>
                          <span>20 plantas</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>42%</span>
                          <span>Lote CLT-002</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-700 font-bold">R</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Cannabis Ruderalis</span>
                          <span>12 plantas</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '26%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>26%</span>
                          <span>Lote CLT-003</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline" className="w-full gap-1" asChild>
                    <a href="/organization/cultivation/configuracao/tipos">
                      <Tag className="h-4 w-4" />
                      <span>Gerenciar Variedades</span>
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximas Atividades</CardTitle>
                  <CardDescription>Tarefas agendadas para os próximos dias</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Mudança para Floração</h4>
                        <p className="text-sm text-gray-500">Lote CLT-002 • 08/05/2025</p>
                        <Badge className="mt-1 bg-green-100 text-green-800">Programado</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-amber-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Scissors className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Colheita</h4>
                        <p className="text-sm text-gray-500">Lote CLT-003 • 10/05/2025</p>
                        <Badge className="mt-1 bg-amber-100 text-amber-800">Alta Prioridade</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Testes de Qualidade</h4>
                        <p className="text-sm text-gray-500">Lote CLT-004 • 12/05/2025</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Agendado</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" asChild>
                    <a href="/organization/cultivation/calendario">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Ver Calendário</span>
                    </a>
                  </Button>
                  <Button asChild>
                    <a href="/organization/cultivation/colheita">
                      <Scissors className="h-4 w-4 mr-2" />
                      <span>Colheita</span>
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="lotes">
            <Card>
              <CardHeader>
                <CardTitle>Lotes Ativos</CardTitle>
                <CardDescription>Grupos de plantas em cultivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">Lote</th>
                        <th scope="col" className="px-4 py-3">Variedade</th>
                        <th scope="col" className="px-4 py-3">Plantas</th>
                        <th scope="col" className="px-4 py-3">Fase Atual</th>
                        <th scope="col" className="px-4 py-3">Data Plantio</th>
                        <th scope="col" className="px-4 py-3">Previsão Colheita</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">CLT-001</th>
                        <td className="px-4 py-3">Cannabis Sativa</td>
                        <td className="px-4 py-3">15</td>
                        <td className="px-4 py-3">Vegetativo</td>
                        <td className="px-4 py-3">15/03/2025</td>
                        <td className="px-4 py-3">25/06/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Saudável</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">CLT-002</th>
                        <td className="px-4 py-3">Cannabis Indica</td>
                        <td className="px-4 py-3">20</td>
                        <td className="px-4 py-3">Floração</td>
                        <td className="px-4 py-3">02/03/2025</td>
                        <td className="px-4 py-3">05/06/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Saudável</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">CLT-003</th>
                        <td className="px-4 py-3">Cannabis Ruderalis</td>
                        <td className="px-4 py-3">12</td>
                        <td className="px-4 py-3">Maturação</td>
                        <td className="px-4 py-3">20/02/2025</td>
                        <td className="px-4 py-3">10/05/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-amber-100 text-amber-800">Atenção</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>

                      <tr className="bg-white">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">CLT-004</th>
                        <td className="px-4 py-3">Híbrido (Charlotte's Angel)</td>
                        <td className="px-4 py-3">5</td>
                        <td className="px-4 py-3">Germinação</td>
                        <td className="px-4 py-3">20/04/2025</td>
                        <td className="px-4 py-3">20/07/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Saudável</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">Exibindo 4 lotes ativos</div>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href="/organization/cultivation/plantio">
                    <Plus className="h-4 w-4" />
                    <span>Novo Lote</span>
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="fases">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ciclo de Vida das Plantas</CardTitle>
                  <CardDescription>Fases de crescimento no cultivo de cannabis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gray-200"></div>
                    <div className="space-y-8 relative">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 relative z-10">
                          <span className="text-blue-700 font-bold">1</span>
                        </div>
                        <div className="pb-2">
                          <h3 className="text-lg font-medium">Germinação</h3>
                          <p className="text-gray-600 mt-1">Período inicial onde a semente brota e desenvolve as primeiras folhas (cotilédones).</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Duração média:</span>
                              <p className="text-gray-600">5-10 dias</p>
                            </div>
                            <div>
                              <span className="font-medium">Condições ideais:</span>
                              <p className="text-gray-600">Umidade 70-90%, Temperatura 20-25°C</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 relative z-10">
                          <span className="text-green-700 font-bold">2</span>
                        </div>
                        <div className="pb-2">
                          <h3 className="text-lg font-medium">Estágio Vegetativo</h3>
                          <p className="text-gray-600 mt-1">Fase de crescimento estrutural da planta, com desenvolvimento de folhas e caule.</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Duração média:</span>
                              <p className="text-gray-600">3-16 semanas (dependendo da variedade)</p>
                            </div>
                            <div>
                              <span className="font-medium">Condições ideais:</span>
                              <p className="text-gray-600">Umidade 40-70%, Temperatura 20-28°C, 18h luz/6h escuro</p>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <Badge className="bg-green-100 text-green-800 mr-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              15 plantas
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-800">Estufa #1</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 relative z-10">
                          <span className="text-purple-700 font-bold">3</span>
                        </div>
                        <div className="pb-2">
                          <h3 className="text-lg font-medium">Floração</h3>
                          <p className="text-gray-600 mt-1">Período em que a planta desenvolve flores (botões) onde se concentram os canabinóides.</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Duração média:</span>
                              <p className="text-gray-600">7-12 semanas (dependendo da variedade)</p>
                            </div>
                            <div>
                              <span className="font-medium">Condições ideais:</span>
                              <p className="text-gray-600">Umidade 40-50%, Temperatura 20-26°C, 12h luz/12h escuro</p>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <Badge className="bg-purple-100 text-purple-800 mr-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              20 plantas
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-800">Estufa #2</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 relative z-10">
                          <span className="text-amber-700 font-bold">4</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Maturação</h3>
                          <p className="text-gray-600 mt-1">Estágio final onde as flores amadurecem e os tricomas desenvolvem sua potência máxima.</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Duração média:</span>
                              <p className="text-gray-600">1-4 semanas</p>
                            </div>
                            <div>
                              <span className="font-medium">Condições ideais:</span>
                              <p className="text-gray-600">Umidade 30-40%, Temperatura 18-24°C, 12h luz/12h escuro</p>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <Badge className="bg-amber-100 text-amber-800 mr-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              12 plantas
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-800">Estufa #3</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(PlantasPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});