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
  Package, Search, Plus, Filter, FileText, Calendar, 
  ArrowDown, ArrowUp, Clock, RefreshCw, AlertTriangle, 
  BarChart2, Printer, QrCode, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EstoquePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Estoque de Cultivo</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <Printer className="h-4 w-4" />
              <span>Imprimir Relatório</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1">
              <Plus className="h-4 w-4" />
              <span>Registrar Entrada</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">8.5kg</p>
                  <p className="text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 inline" /> 5% desde o mês passado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Itens em Alerta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-gray-500">Validade próxima</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variedades Armazenadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart2 className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-gray-500">Tipos diferentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lotes em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-gray-500">Lotes rastreáveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="atual" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="atual">Estoque Atual</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no estoque..."
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
          
          <TabsContent value="atual">
            <Card>
              <CardHeader>
                <CardTitle>Inventário Atual</CardTitle>
                <CardDescription>Estoque de plantas medicinais disponível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">ID do Lote</th>
                        <th scope="col" className="px-4 py-3">Variedade</th>
                        <th scope="col" className="px-4 py-3">Quantidade</th>
                        <th scope="col" className="px-4 py-3">Data de Entrada</th>
                        <th scope="col" className="px-4 py-3">Validade</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Localização</th>
                        <th scope="col" className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">EST-0095</th>
                        <td className="px-4 py-3">Cannabis Sativa</td>
                        <td className="px-4 py-3">2.7kg</td>
                        <td className="px-4 py-3">15/04/2025</td>
                        <td className="px-4 py-3">15/04/2026</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                        </td>
                        <td className="px-4 py-3">Armazém A - Prateleira 2</td>
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
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Registrar saída
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Imprimir etiqueta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">EST-0094</th>
                        <td className="px-4 py-3">Cannabis Indica</td>
                        <td className="px-4 py-3">1.8kg</td>
                        <td className="px-4 py-3">10/04/2025</td>
                        <td className="px-4 py-3">10/04/2026</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                        </td>
                        <td className="px-4 py-3">Armazém A - Prateleira 1</td>
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
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Registrar saída
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Imprimir etiqueta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">EST-0093</th>
                        <td className="px-4 py-3">Híbrido - Charlotte's Angel</td>
                        <td className="px-4 py-3">1.5kg</td>
                        <td className="px-4 py-3">05/04/2025</td>
                        <td className="px-4 py-3">05/10/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-amber-100 text-amber-800">Validade próxima</Badge>
                        </td>
                        <td className="px-4 py-3">Armazém B - Prateleira 3</td>
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
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Registrar saída
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Imprimir etiqueta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      
                      <tr className="bg-white">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">EST-0092</th>
                        <td className="px-4 py-3">Cannabis Ruderalis</td>
                        <td className="px-4 py-3">2.5kg</td>
                        <td className="px-4 py-3">28/03/2025</td>
                        <td className="px-4 py-3">28/09/2025</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-amber-100 text-amber-800">Validade próxima</Badge>
                        </td>
                        <td className="px-4 py-3">Armazém B - Prateleira 1</td>
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
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Registrar saída
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Imprimir etiqueta
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
                <div className="text-sm text-gray-500">Exibindo 4 de 8 itens</div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="movimentacoes">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>Registro de todas as entradas e saídas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">ID do Movimento</th>
                        <th scope="col" className="px-4 py-3">Lote</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                        <th scope="col" className="px-4 py-3">Quantidade</th>
                        <th scope="col" className="px-4 py-3">Data</th>
                        <th scope="col" className="px-4 py-3">Responsável</th>
                        <th scope="col" className="px-4 py-3">Destino/Origem</th>
                        <th scope="col" className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">MOV-0120</th>
                        <td className="px-4 py-3">EST-0095</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Entrada</Badge>
                        </td>
                        <td className="px-4 py-3">2.7kg</td>
                        <td className="px-4 py-3">15/04/2025</td>
                        <td className="px-4 py-3">Ana Silva</td>
                        <td className="px-4 py-3">Cultivo - Colheita</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">MOV-0119</th>
                        <td className="px-4 py-3">EST-0094</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">Entrada</Badge>
                        </td>
                        <td className="px-4 py-3">1.8kg</td>
                        <td className="px-4 py-3">10/04/2025</td>
                        <td className="px-4 py-3">Carlos Mendes</td>
                        <td className="px-4 py-3">Cultivo - Colheita</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">MOV-0118</th>
                        <td className="px-4 py-3">EST-0091</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-red-100 text-red-800">Saída</Badge>
                        </td>
                        <td className="px-4 py-3">1.2kg</td>
                        <td className="px-4 py-3">08/04/2025</td>
                        <td className="px-4 py-3">Renata Oliveira</td>
                        <td className="px-4 py-3">Setor de Extração</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Ver</span>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="bg-white">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">MOV-0117</th>
                        <td className="px-4 py-3">EST-0090</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-blue-100 text-blue-800">Ajuste</Badge>
                        </td>
                        <td className="px-4 py-3">-0.2kg</td>
                        <td className="px-4 py-3">05/04/2025</td>
                        <td className="px-4 py-3">Carlos Mendes</td>
                        <td className="px-4 py-3">Inventário</td>
                        <td className="px-4 py-3">
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
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Exibindo 4 de 20 movimentos</div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Anterior</Button>
                  <Button variant="outline" size="sm">Próximo</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Variedade</CardTitle>
                  <CardDescription>Quantidades em estoque por tipo de planta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Cannabis Sativa</span>
                        <span className="text-sm text-gray-500">2.7kg (31.8%)</span>
                      </div>
                      <Progress value={31.8} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Cannabis Indica</span>
                        <span className="text-sm text-gray-500">1.8kg (21.2%)</span>
                      </div>
                      <Progress value={21.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Cannabis Ruderalis</span>
                        <span className="text-sm text-gray-500">2.5kg (29.4%)</span>
                      </div>
                      <Progress value={29.4} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Híbridos</span>
                        <span className="text-sm text-gray-500">1.5kg (17.6%)</span>
                      </div>
                      <Progress value={17.6} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">
                  * Baseado no total de 8.5kg em estoque
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Disponíveis</CardTitle>
                  <CardDescription>Relatórios de estoque para download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">Inventário Completo</p>
                          <p className="text-xs text-gray-500">Todos os itens em estoque com detalhes</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Baixar</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium">Movimentações Mensais</p>
                          <p className="text-xs text-gray-500">Entradas e saídas do último mês</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Baixar</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-amber-500 mr-3" />
                        <div>
                          <p className="font-medium">Itens Próximos à Validade</p>
                          <p className="text-xs text-gray-500">Lotes que expiram nos próximos 90 dias</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Baixar</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="font-medium">Relatório de Rastreabilidade</p>
                          <p className="text-xs text-gray-500">Histórico completo por lote</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Baixar</Button>
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

export default bypassModuleAccess(EstoquePage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});