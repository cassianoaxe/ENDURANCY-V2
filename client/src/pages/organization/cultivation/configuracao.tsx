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
  Settings, Search, Plus, Beaker, Shapes, 
  Save, ArrowLeft, Download, Upload, Trash2, 
  Edit, MoreVertical, BarChart2, CheckCircle2,
  Copy, Play, FilePlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ConfiguracaoPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Configurações de Cultivo</h1>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </div>

        <Tabs defaultValue="strains" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="strains">Strains</TabsTrigger>
            <TabsTrigger value="tipos">Tipos de Plantas</TabsTrigger>
            <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar configurações..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1">
              <Plus className="h-4 w-4" />
              <span>Adicionar Novo</span>
            </Button>
          </div>
          
          <TabsContent value="strains">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Strains</CardTitle>
                <CardDescription>Variedades genéticas cadastradas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>THC (%)</TableHead>
                      <TableHead>CBD (%)</TableHead>
                      <TableHead>Tempo de Floração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Charlotte's Angel</TableCell>
                      <TableCell>Híbrido (Sativa dominante)</TableCell>
                      <TableCell>0.5-1.0</TableCell>
                      <TableCell>10-15</TableCell>
                      <TableCell>9-10 semanas</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Ver desempenho
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Northern Lights</TableCell>
                      <TableCell>Indica</TableCell>
                      <TableCell>16-21</TableCell>
                      <TableCell>0.1-0.2</TableCell>
                      <TableCell>7-8 semanas</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Ver desempenho
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jack Herer</TableCell>
                      <TableCell>Sativa</TableCell>
                      <TableCell>18-24</TableCell>
                      <TableCell>0.2-0.4</TableCell>
                      <TableCell>8-10 semanas</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Ver desempenho
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lifter</TableCell>
                      <TableCell>Industrial (CBD)</TableCell>
                      <TableCell>0.3-0.6</TableCell>
                      <TableCell>14-18</TableCell>
                      <TableCell>8-9 semanas</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Ver desempenho
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Auto Blueberry</TableCell>
                      <TableCell>Ruderalis</TableCell>
                      <TableCell>14-17</TableCell>
                      <TableCell>0.2-0.5</TableCell>
                      <TableCell>6-7 semanas</TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-800">Inativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    <span>Importar</span>
                  </Button>
                </div>
                <div className="text-sm text-gray-500">5 strains cadastrados</div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="tipos">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Plantas</CardTitle>
                <CardDescription>Classificações e categorias de plantas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Cannabis Sativa</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Plantas mais altas, com folhas finas e estrutura mais aberta.
                          Geralmente associadas a efeitos energéticos e criativos.
                        </p>
                        <div className="text-xs text-gray-500">
                          <div>Tempo médio vegetativo: 4-8 semanas</div>
                          <div>Tempo médio floração: 10-16 semanas</div>
                          <div>Altura média: 150-300cm</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Cannabis Indica</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Plantas mais baixas e compactas, com folhas largas e densa folhagem.
                          Geralmente associadas a efeitos relaxantes e sedativos.
                        </p>
                        <div className="text-xs text-gray-500">
                          <div>Tempo médio vegetativo: 3-6 semanas</div>
                          <div>Tempo médio floração: 6-9 semanas</div>
                          <div>Altura média: 60-150cm</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Cannabis Ruderalis</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Plantas autoflorum com ciclo de vida mais curto. Mais resistentes e
                          não dependem de fotoperíodo para floração.
                        </p>
                        <div className="text-xs text-gray-500">
                          <div>Tempo médio vegetativo: 2-3 semanas</div>
                          <div>Tempo médio floração: 5-7 semanas</div>
                          <div>Altura média: 40-80cm</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Híbridos</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Cruzamentos entre sativa, indica e/ou ruderalis, combinando
                          características e benefícios de múltiplas variedades.
                        </p>
                        <div className="text-xs text-gray-500">
                          <div>Tempo médio vegetativo: 3-7 semanas</div>
                          <div>Tempo médio floração: 7-12 semanas</div>
                          <div>Altura média: 80-200cm</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Industrial (CBD)</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Variedades com baixo teor de THC e alto teor de CBD, 
                          cultivadas principalmente para fins medicinais.
                        </p>
                        <div className="text-xs text-gray-500">
                          <div>Tempo médio vegetativo: 3-6 semanas</div>
                          <div>Tempo médio floração: 7-10 semanas</div>
                          <div>Altura média: 100-200cm</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                    <CardContent className="flex flex-col items-center justify-center h-full py-8">
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">Adicionar novo tipo</p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Clique para cadastrar uma nova classificação
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="parametros">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros de Cultivo</CardTitle>
                <CardDescription>Configurações e limites do sistema de cultivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Parâmetros Ambientais</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="temp-vegeta">Temperatura - Vegetativo (°C)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Min</span>
                              <Input id="temp-vegeta-min" type="number" defaultValue="20" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Ideal</span>
                              <Input id="temp-vegeta-ideal" type="number" defaultValue="24" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Max</span>
                              <Input id="temp-vegeta-max" type="number" defaultValue="28" className="text-center" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="temp-flora">Temperatura - Floração (°C)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Min</span>
                              <Input id="temp-flora-min" type="number" defaultValue="18" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Ideal</span>
                              <Input id="temp-flora-ideal" type="number" defaultValue="23" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Max</span>
                              <Input id="temp-flora-max" type="number" defaultValue="26" className="text-center" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="umid-vegeta">Umidade - Vegetativo (%)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Min</span>
                              <Input id="umid-vegeta-min" type="number" defaultValue="60" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Ideal</span>
                              <Input id="umid-vegeta-ideal" type="number" defaultValue="70" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Max</span>
                              <Input id="umid-vegeta-max" type="number" defaultValue="80" className="text-center" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="umid-flora">Umidade - Floração (%)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Min</span>
                              <Input id="umid-flora-min" type="number" defaultValue="50" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Ideal</span>
                              <Input id="umid-flora-ideal" type="number" defaultValue="60" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Max</span>
                              <Input id="umid-flora-max" type="number" defaultValue="70" className="text-center" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Parâmetros de Iluminação</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="luz-vegeta">Fotoperíodo - Vegetativo (horas)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Select defaultValue="18/6">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24/0">24/0 (24h luz)</SelectItem>
                                <SelectItem value="20/4">20/4 (20h luz)</SelectItem>
                                <SelectItem value="18/6">18/6 (18h luz)</SelectItem>
                                <SelectItem value="16/8">16/8 (16h luz)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="luz-flora">Fotoperíodo - Floração (horas)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Select defaultValue="12/12">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="14/10">14/10 (14h luz)</SelectItem>
                                <SelectItem value="13/11">13/11 (13h luz)</SelectItem>
                                <SelectItem value="12/12">12/12 (12h luz)</SelectItem>
                                <SelectItem value="11/13">11/13 (11h luz)</SelectItem>
                                <SelectItem value="10/14">10/14 (10h luz)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="intensidade">Intensidade Luminosa (PPFD)</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Inicial</span>
                              <Input id="luz-inicial" type="number" defaultValue="300" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Vegetativo</span>
                              <Input id="luz-vegeta" type="number" defaultValue="600" className="text-center" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Floração</span>
                              <Input id="luz-flora" type="number" defaultValue="900" className="text-center" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mt-6">Parâmetros de Irrigação</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="irrigacao-freq">Frequência de Irrigação</Label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Inicial</span>
                              <Select defaultValue="1">
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1x ao dia</SelectItem>
                                  <SelectItem value="2">2x ao dia</SelectItem>
                                  <SelectItem value="3">3x ao dia</SelectItem>
                                  <SelectItem value="0.5">A cada 2 dias</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Vegetativo</span>
                              <Select defaultValue="2">
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1x ao dia</SelectItem>
                                  <SelectItem value="2">2x ao dia</SelectItem>
                                  <SelectItem value="3">3x ao dia</SelectItem>
                                  <SelectItem value="4">4x ao dia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Floração</span>
                              <Select defaultValue="3">
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1x ao dia</SelectItem>
                                  <SelectItem value="2">2x ao dia</SelectItem>
                                  <SelectItem value="3">3x ao dia</SelectItem>
                                  <SelectItem value="4">4x ao dia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1">
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                  <Button className="gap-1 bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Cultivo</CardTitle>
                <CardDescription>Modelos pré-definidos para diferentes cenários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Template CBD Medicinal</CardTitle>
                      <CardDescription>Otimizado para produção de CBD</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Strains:</div>
                          <div>Charlotte's Angel, Lifter</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Fases:</div>
                          <div>4 estágios</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Ciclo completo:</div>
                          <div>18-24 semanas</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Parâmetros específicos:</div>
                          <div>Sim (5)</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Play className="h-4 w-4" />
                        <span>Usar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Template Indoor Padrão</CardTitle>
                      <CardDescription>Template balanceado para indoor</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Strains:</div>
                          <div>Qualquer tipo</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Fases:</div>
                          <div>5 estágios</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Ciclo completo:</div>
                          <div>16-20 semanas</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Parâmetros específicos:</div>
                          <div>Sim (8)</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Play className="h-4 w-4" />
                        <span>Usar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Template Auto-Flower</CardTitle>
                      <CardDescription>Para variedades automáticas</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Strains:</div>
                          <div>Variedades Ruderalis</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Fases:</div>
                          <div>3 estágios</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Ciclo completo:</div>
                          <div>10-14 semanas</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Parâmetros específicos:</div>
                          <div>Sim (6)</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Play className="h-4 w-4" />
                        <span>Usar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                    <CardContent className="flex flex-col items-center justify-center h-full py-8">
                      <FilePlus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">Criar Novo Template</p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Defina um modelo customizado para seus processos
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(ConfiguracaoPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});