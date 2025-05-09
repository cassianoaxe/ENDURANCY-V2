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
  Building2, Search, Plus, Filter, Thermometer, Droplet, 
  Leaf, AlertCircle, Settings, RefreshCw, Power, 
  BarChart2, ArrowUp, ArrowDown, Wifi, WifiOff, Info,
  FileText, MoreVertical, CheckCircle, Save
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EstufasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Estufas e Ambientes</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-1">
            <Plus className="h-4 w-4" />
            <span>Nova Estufa</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Estufas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-gray-500">Em operação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-gray-500">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eficiência Energética</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Power className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 inline" /> 3% vs mês anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-gray-500">Requer atenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visaogeral" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="visaogeral">Visão Geral</TabsTrigger>
            <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estufas..."
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
                  <SelectItem value="vegetativo">Vegetativo</SelectItem>
                  <SelectItem value="floracao">Floração</SelectItem>
                  <SelectItem value="maturacao">Maturação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="visaogeral">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card da Estufa 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Estufa #1</CardTitle>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegetativo</Badge>
                  </div>
                  <CardDescription>Capacidade: 30 plantas • Área: 35m²</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span className="text-sm font-medium">24°C</span>
                        <span className="text-xs text-gray-500">Temperatura</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Droplet className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-sm font-medium">65%</span>
                        <span className="text-xs text-gray-500">Umidade</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Leaf className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-sm font-medium">15</span>
                        <span className="text-xs text-gray-500">Plantas</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Status do Sistema</span>
                        <span className="text-xs text-green-600 flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          Online
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-gray-100" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Última atualização: 10 min atrás</span>
                        <span>Tudo normal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Ajustes</span>
                    </Button>
                    <Button variant="default" size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
                      <BarChart2 className="h-4 w-4" />
                      <span>Monitorar</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Card da Estufa 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Estufa #2</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Floração</Badge>
                  </div>
                  <CardDescription>Capacidade: 25 plantas • Área: 30m²</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span className="text-sm font-medium">23°C</span>
                        <span className="text-xs text-gray-500">Temperatura</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Droplet className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-sm font-medium">70%</span>
                        <span className="text-xs text-gray-500">Umidade</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Leaf className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-sm font-medium">20</span>
                        <span className="text-xs text-gray-500">Plantas</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Status do Sistema</span>
                        <span className="text-xs text-green-600 flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          Online
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-gray-100" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Última atualização: 5 min atrás</span>
                        <span>Tudo normal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Ajustes</span>
                    </Button>
                    <Button variant="default" size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
                      <BarChart2 className="h-4 w-4" />
                      <span>Monitorar</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Card da Estufa 3 */}
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Estufa #3</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Maturação</Badge>
                  </div>
                  <CardDescription>Capacidade: 20 plantas • Área: 25m²</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span className="text-sm font-medium">25°C</span>
                        <span className="text-xs text-gray-500">Temperatura</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-red-50 rounded">
                        <Droplet className="h-4 w-4 text-red-500 mb-1" />
                        <span className="text-sm font-medium">40%</span>
                        <span className="text-xs text-red-600">Baixa</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Leaf className="h-4 w-4 text-green-500 mb-1" />
                        <span className="text-sm font-medium">12</span>
                        <span className="text-xs text-gray-500">Plantas</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Status do Sistema</span>
                        <span className="text-xs text-amber-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Alerta
                        </span>
                      </div>
                      <Progress value={70} className="h-2 bg-gray-100" />
                      <div className="flex justify-between text-xs text-red-600 mt-1">
                        <span>Problema de irrigação detectado</span>
                        <span>Requer verificação</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    <span>Detalhes</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Ajustes</span>
                    </Button>
                    <Button variant="default" size="sm" className="gap-1 bg-red-600 hover:bg-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span>Resolver</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="monitoramento">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Monitoramento em Tempo Real</CardTitle>
                  <CardDescription>Dados das últimas 24 horas de todas as estufas</CardDescription>
                </div>
                <Select defaultValue="estufa1">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecionar estufa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as estufas</SelectItem>
                    <SelectItem value="estufa1">Estufa #1 - Vegetativo</SelectItem>
                    <SelectItem value="estufa2">Estufa #2 - Floração</SelectItem>
                    <SelectItem value="estufa3">Estufa #3 - Maturação</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm flex items-center">
                          <Thermometer className="h-4 w-4 text-red-500 mr-1" />
                          Temperatura (°C)
                        </h3>
                        <Badge variant="outline">Últimas 24h</Badge>
                      </div>
                      <div className="h-36 bg-gray-50 rounded-md flex items-center justify-center">
                        <p className="text-sm text-gray-500">Gráfico de temperatura estará disponível em breve</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: 21°C</span>
                        <span>Média: 23.5°C</span>
                        <span>Max: 26°C</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm flex items-center">
                          <Droplet className="h-4 w-4 text-blue-500 mr-1" />
                          Umidade (%)
                        </h3>
                        <Badge variant="outline">Últimas 24h</Badge>
                      </div>
                      <div className="h-36 bg-gray-50 rounded-md flex items-center justify-center">
                        <p className="text-sm text-gray-500">Gráfico de umidade estará disponível em breve</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: 60%</span>
                        <span>Média: 67%</span>
                        <span>Max: 75%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Alertas Recentes</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">Umidade baixa na Estufa #3</p>
                            <p className="text-xs text-gray-600">05/05/2025 - 09:15</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Verificar</Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">Oscilação de temperatura na Estufa #2</p>
                            <p className="text-xs text-gray-600">04/05/2025 - 18:32</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <WifiOff className="h-5 w-5 text-amber-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">Falha de comunicação temporária</p>
                            <p className="text-xs text-gray-600">03/05/2025 - 14:05</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Ações do Sistema</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                          <RefreshCw className="h-4 w-4" />
                          <span>Atualizar leituras de sensores</span>
                        </Button>
                        
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Gerar relatório de monitoramento</span>
                        </Button>
                        
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                          <Save className="h-4 w-4" />
                          <span>Exportar dados para análise</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuracao">
            <Card>
              <CardHeader>
                <CardTitle>Configurações das Estufas</CardTitle>
                <CardDescription>Ajustes e parâmetros de operação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">Estufa</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                        <th scope="col" className="px-4 py-3">Temp. Alvo</th>
                        <th scope="col" className="px-4 py-3">Umidade Alvo</th>
                        <th scope="col" className="px-4 py-3">Ciclo de Luz</th>
                        <th scope="col" className="px-4 py-3">Freq. Irrigação</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">Estufa #1</th>
                        <td className="px-4 py-3">Vegetativo</td>
                        <td className="px-4 py-3">24°C</td>
                        <td className="px-4 py-3">65%</td>
                        <td className="px-4 py-3">18/6</td>
                        <td className="px-4 py-3">4x ao dia</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
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
                                <Settings className="h-4 w-4 mr-2" />
                                Editar configurações
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Power className="h-4 w-4 mr-2" />
                                Reiniciar sistema
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Modo de manutenção
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">Estufa #2</th>
                        <td className="px-4 py-3">Floração</td>
                        <td className="px-4 py-3">23°C</td>
                        <td className="px-4 py-3">70%</td>
                        <td className="px-4 py-3">12/12</td>
                        <td className="px-4 py-3">3x ao dia</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
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
                                <Settings className="h-4 w-4 mr-2" />
                                Editar configurações
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Power className="h-4 w-4 mr-2" />
                                Reiniciar sistema
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Modo de manutenção
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>

                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">Estufa #3</th>
                        <td className="px-4 py-3">Maturação</td>
                        <td className="px-4 py-3">25°C</td>
                        <td className="px-4 py-3">60%</td>
                        <td className="px-4 py-3">12/12</td>
                        <td className="px-4 py-3">2x ao dia</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-amber-100 text-amber-800">Alerta</Badge>
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
                                <Settings className="h-4 w-4 mr-2" />
                                Editar configurações
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Power className="h-4 w-4 mr-2" />
                                Reiniciar sistema
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Modo de manutenção
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
                <div className="text-sm text-gray-500">Última atualização: Hoje às 09:30</div>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>Atualizar Configurações</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="manutencao">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cronograma de Manutenção</CardTitle>
                  <CardDescription>Atividades programadas de manutenção preventiva</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Calibração de Sensores</p>
                          <p className="text-xs text-gray-600">Estufa #1 e #2 • 10/05/2025</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Programado</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                          <RefreshCw className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Substituição de Filtros</p>
                          <p className="text-xs text-gray-600">Todas as estufas • 15/05/2025</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Programado</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center mr-3">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Reparo do Sistema de Irrigação</p>
                          <p className="text-xs text-gray-600">Estufa #3 • Urgente</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Pendente</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Manutenção do Sistema Elétrico</p>
                          <p className="text-xs text-gray-600">Todas as estufas • 01/05/2025</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Agendar Nova Manutenção</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance e Eficiência</CardTitle>
                  <CardDescription>Métricas de desempenho e consumo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Consumo Energético</span>
                        <span className="text-sm text-green-600">
                          <ArrowDown className="h-3 w-3 inline" /> 12% vs mês anterior
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Média diária: 42 kWh • Previsão mensal: 1260 kWh
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Consumo de Água</span>
                        <span className="text-sm text-green-600">
                          <ArrowDown className="h-3 w-3 inline" /> 8% vs mês anterior
                        </span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Média diária: 250L • Previsão mensal: 7500L
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Estabilidade de Temperatura</span>
                        <span className="text-sm text-green-600">
                          <ArrowUp className="h-3 w-3 inline" /> 5% vs mês anterior
                        </span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Variação média: ±0.8°C • Meta: ±1.0°C
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Estabilidade de Umidade</span>
                        <span className="text-sm text-amber-600">
                          <ArrowDown className="h-3 w-3 inline" /> 3% vs mês anterior
                        </span>
                      </div>
                      <Progress value={78} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Variação média: ±5% • Meta: ±3%
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Relatório Completo</span>
                  </Button>
                  <Button variant="outline" className="gap-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>Análises Avançadas</span>
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

export default bypassModuleAccess(EstufasPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});