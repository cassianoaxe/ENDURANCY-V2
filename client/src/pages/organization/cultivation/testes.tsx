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
  FlaskConical, Search, Plus, Filter, FileText, Calendar, 
  Clock, CheckCircle, XCircle, Loader2, AlertTriangle, 
  Activity, BarChart2, Beaker, Droplet, Thermometer, 
  Check, MoreVertical, Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TestesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Testes de Qualidade</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-1">
            <Plus className="h-4 w-4" />
            <span>Novo Teste</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Testes Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Loader2 className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-500">Em análise</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Testes Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-xs text-gray-500">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Testes Reprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-gray-500">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">90.3%</p>
                  <p className="text-xs text-green-600">+2.5% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar testes..."
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
                  <SelectItem value="thc">Teor de THC</SelectItem>
                  <SelectItem value="cbd">Teor de CBD</SelectItem>
                  <SelectItem value="microbiologico">Microbiológico</SelectItem>
                  <SelectItem value="metais">Metais Pesados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="pendentes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card de Teste 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Teste #T-0052</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Em análise</Badge>
                  </div>
                  <CardDescription>Lote CLT-004 - Cannabis Sativa</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center">
                        <FlaskConical className="h-7 w-7 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Análise de Canabinoides</p>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-1" />
                          <span className="text-xs text-amber-600">Processando (2/4 etapas)</span>
                        </div>
                        <div className="mt-1">
                          <Progress value={50} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Data de envio</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>05/05/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Previsão</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>08/05/2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="flex items-center text-xs text-gray-500">
                    <Beaker className="h-4 w-4 mr-1" />
                    Laboratório: Lab A
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card de Teste 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Teste #T-0051</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Em análise</Badge>
                  </div>
                  <CardDescription>Lote CLT-003 - Cannabis Ruderalis</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                        <Droplet className="h-7 w-7 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Análise Microbiológica</p>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-1" />
                          <span className="text-xs text-amber-600">Processando (1/3 etapas)</span>
                        </div>
                        <div className="mt-1">
                          <Progress value={33} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Data de envio</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>04/05/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Previsão</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>07/05/2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="flex items-center text-xs text-gray-500">
                    <Beaker className="h-4 w-4 mr-1" />
                    Laboratório: Lab B
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card de Teste 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Teste #T-0050</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Em análise</Badge>
                  </div>
                  <CardDescription>Lote CLT-002 - Cannabis Indica</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                        <Thermometer className="h-7 w-7 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Teste de Metais Pesados</p>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-1" />
                          <span className="text-xs text-amber-600">Processando (3/5 etapas)</span>
                        </div>
                        <div className="mt-1">
                          <Progress value={60} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Data de envio</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span>03/05/2025</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Previsão</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>09/05/2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="flex items-center text-xs text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Alta prioridade
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="concluidos">
            <Card>
              <CardHeader>
                <CardTitle>Testes Concluídos</CardTitle>
                <CardDescription>Histórico de testes realizados com resultados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">ID</th>
                        <th scope="col" className="px-4 py-3">Lote</th>
                        <th scope="col" className="px-4 py-3">Tipo de Teste</th>
                        <th scope="col" className="px-4 py-3">Data</th>
                        <th scope="col" className="px-4 py-3">Laboratório</th>
                        <th scope="col" className="px-4 py-3">Resultado</th>
                        <th scope="col" className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">T-0049</th>
                        <td className="px-4 py-3">CLT-001</td>
                        <td className="px-4 py-3">Análise de Canabinoides</td>
                        <td className="px-4 py-3">02/05/2025</td>
                        <td className="px-4 py-3">Lab A</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar laudo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">T-0048</th>
                        <td className="px-4 py-3">CLT-001</td>
                        <td className="px-4 py-3">Análise Microbiológica</td>
                        <td className="px-4 py-3">01/05/2025</td>
                        <td className="px-4 py-3">Lab B</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar laudo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">T-0047</th>
                        <td className="px-4 py-3">CLT-001</td>
                        <td className="px-4 py-3">Teste de Metais Pesados</td>
                        <td className="px-4 py-3">30/04/2025</td>
                        <td className="px-4 py-3">Lab C</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-red-100 text-red-800">Reprovado</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar laudo
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Solicitar reteste
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>

                      <tr className="bg-white">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">T-0046</th>
                        <td className="px-4 py-3">CLT-000</td>
                        <td className="px-4 py-3">Análise de Canabinoides</td>
                        <td className="px-4 py-3">28/04/2025</td>
                        <td className="px-4 py-3">Lab A</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar laudo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Exibindo 4 de 28 testes</div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendario">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O calendário de testes estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados por Tipo de Teste</CardTitle>
                  <CardDescription>Aprovações e reprovações por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Canabinoides</span>
                        <div className="text-sm">
                          <span className="text-green-600 mr-2">✓ 8</span>
                          <span className="text-red-600">✗ 1</span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden bg-gray-100 rounded">
                        <div className="bg-green-500" style={{ width: '89%' }}></div>
                        <div className="bg-red-500" style={{ width: '11%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Taxa de aprovação: 89%</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Microbiológico</span>
                        <div className="text-sm">
                          <span className="text-green-600 mr-2">✓ 10</span>
                          <span className="text-red-600">✗ 0</span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden bg-gray-100 rounded">
                        <div className="bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Taxa de aprovação: 100%</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Metais Pesados</span>
                        <div className="text-sm">
                          <span className="text-green-600 mr-2">✓ 7</span>
                          <span className="text-red-600">✗ 2</span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden bg-gray-100 rounded">
                        <div className="bg-green-500" style={{ width: '78%' }}></div>
                        <div className="bg-red-500" style={{ width: '22%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Taxa de aprovação: 78%</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Pesticidas</span>
                        <div className="text-sm">
                          <span className="text-green-600 mr-2">✓ 3</span>
                          <span className="text-red-600">✗ 0</span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden bg-gray-100 rounded">
                        <div className="bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Taxa de aprovação: 100%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Laboratórios e Desempenho</CardTitle>
                  <CardDescription>Desempenho de laboratórios parceiros</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <Beaker className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">Laboratório A</p>
                          <p className="text-xs text-gray-500">12 testes realizados</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">92% taxa de aprovação</span>
                        </div>
                        <span className="text-xs text-gray-500">Tempo médio: 2.1 dias</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Beaker className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Laboratório B</p>
                          <p className="text-xs text-gray-500">10 testes realizados</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">90% taxa de aprovação</span>
                        </div>
                        <span className="text-xs text-gray-500">Tempo médio: 2.4 dias</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Beaker className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Laboratório C</p>
                          <p className="text-xs text-gray-500">8 testes realizados</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">88% taxa de aprovação</span>
                        </div>
                        <span className="text-xs text-gray-500">Tempo médio: 3.2 dias</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Relatório Completo de Desempenho</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(TestesPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});